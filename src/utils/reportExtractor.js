// Lightweight parser for CARFAX-like free text
export const extractReport = (raw) => {
  const result = {
    accidentsMentioned: null,
    branding: [],
    damageRecords: [], // {date?, amount?, details}
    registrations: [],
    odometerEvents: [],
    serviceEvents: [],
    recalls: [],
    otherNotable: [],
    highestOdometer: null,
    theftMentioned: null, // null | false | true
    movedBranding: false,
    recallsOpen: null, // null | false (none) | true (open/mentioned)
    // Additional summary signals
    serviceHistoryCount: null,
    detailedRecordsCount: null,
    lastReportedOdometer: null,
    totalLoss: null, // false = none reported; true = mentioned
    structuralDamage: null,
    airbagDeployment: null,
    odometerRollback: null,
  };

  if (!raw) return result;

  const normalized = raw
    .replace(/[•◆◦·]/g, "\n• ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n");
  const lines = normalized.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const uniqPush = (arr, val) => {
    if (!val) return;
    if (!arr.includes(val)) arr.push(val);
  };

  // Accident/damage detection (negation-aware)
  const accidentNegRe = /no\s+(?:police[- ]reported\s+)?accidents?(?:\s+or\s+damage)?\s+reported/i;
  const accidentPosRe = /\b(accident|collision|damage\s+record|reported\s+damage)\b/i;
  if (lines.some((l) => accidentNegRe.test(l))) {
    result.accidentsMentioned = false;
  } else if (lines.some((l) => accidentPosRe.test(l) && !/^no\b/i.test(l))) {
    result.accidentsMentioned = true;
  }

  // Detect theft mentions with negation sensitivity
  const theftNeg = /(no\s+theft|not\s+(?:actively\s+)?declared\s+stolen|not\s+stolen)/i.test(raw);
  const theftPos = /\b(stolen|theft)\b/i.test(raw);
  if (theftNeg) result.theftMentioned = false;
  else if (theftPos) result.theftMentioned = true;

  // Detect moved branding note
  if (/moved\s+branding/i.test(raw)) {
    result.movedBranding = true;
    uniqPush(result.otherNotable, "Moved branding");
  }

  // Branding statuses: only collect when explicitly tied to the word "branding"
  lines.forEach((line) => {
    if (/branding/i.test(line)) {
      const statuses = line.match(/\b(Normal|Salvage|Rebuilt|Rebuild|Non[- ]repairable)\b/gi);
      if (statuses) statuses.forEach((s) => uniqPush(result.branding, s));
    }
  });

  // Helper to skip generic lines not specific to vehicle events
  const isGeneric = (s) => /vehicle history report|additional history|glossary|help center|about carfax|guaranteed|warranty|follow us|view terms|view cert/i.test(s);

  // High-level counts and statements commonly present in CARFAX summaries
  lines.forEach((line) => {
    // Service history records count
    const svc = line.match(/(\d{1,3})\s+service\s+history\s+records?/i);
    if (svc) {
      result.serviceHistoryCount = parseInt(svc[1], 10);
    }
    // Detailed records available
    const det = line.match(/(\d{1,4})\s+detailed\s+records?\s+available/i);
    if (det) {
      result.detailedRecordsCount = parseInt(det[1], 10);
    }
    // Last reported odometer
    const lastOdo = line.match(/last\s+reported\s+odometer\s+(?:reading\s*)?(\d{1,3}(?:[,\s]\d{3})+|\d{4,})/i);
    if (lastOdo) {
      const n = parseInt(lastOdo[1].replace(/[ ,]/g, ''), 10);
      if (!Number.isNaN(n)) result.lastReportedOdometer = n;
    }

    // Summary negatives
    if (/no\s+total\s+loss\s+reported/i.test(line)) result.totalLoss = false;
    if (/no\s+structural\s+damage\s+reported/i.test(line)) result.structuralDamage = false;
    if (/no\s+airbag\s+deployment\s+reported/i.test(line)) result.airbagDeployment = false;
    if (/no\s+indication\s+of\s+an?\s+odometer\s+rollback/i.test(line)) result.odometerRollback = false;

    // Summary positives (be careful; only set true if not already false)
    if (/total\s+loss/i.test(line) && !/no\s+total\s+loss/i.test(line)) result.totalLoss = result.totalLoss === false ? false : true;
    if (/structural\s+damage/i.test(line) && !/no\s+structural\s+damage/i.test(line)) result.structuralDamage = result.structuralDamage === false ? false : true;
    if (/airbag\s+deployment/i.test(line) && !/no\s+airbag\s+deployment/i.test(line)) result.airbagDeployment = result.airbagDeployment === false ? false : true;
    if (/odometer\s+rollback|not\s+actual\s+mileage|exceeds\s+mechanical\s+limits/i.test(line) && !/no\s+indication\s+of\s+an?\s+odometer\s+rollback/i.test(line)) {
      result.odometerRollback = result.odometerRollback === false ? false : true;
    }
  });

  lines.forEach((line) => {
    if (isGeneric(line)) return;
    if (/registered|registration\s+issued|province of|state of|first owner reported/i.test(line)) {
      // Prefer lines that look like event records (often start with a date)
      if (/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/i.test(line) || /motor vehicle dept|registration/i.test(line)) {
        uniqPush(result.registrations, line);
      }
    }
  });

  const moneyRe = /\$\s?\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?/;
  const dateRe = /\b(\d{4}[-/ ]\d{1,2}[-/ ]\d{1,2}|\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*)\b/i;
  lines.forEach((line) => {
    if (isGeneric(line)) return;
    // Ignore explicit negatives
    if (/no\s+(?:accidents?|damage)\s+reported/i.test(line)) return;
    // Avoid picking up report price lines
    if (/\$\s?\d+\.\d{2}.*vehicle\s+history\s+report/i.test(line)) return;

    if (/(other\s+damage\s+records|damage|glass\s+record|claim|estimate)/i.test(line)) {
      const amount = line.match(moneyRe);
      const date = line.match(dateRe);
      // Keep if there is either a date or an amount to avoid generic sentences
      if (amount || date) {
        result.damageRecords.push({
          date: date ? date[0] : undefined,
          amount: amount ? amount[0] : undefined,
          details: line,
        });
      }
    }
  });

  lines.forEach((line) => {
    if (isGeneric(line)) return;
    if (/odometer\s+reported|odometer\s+reading|\b(km|kilometers|miles|mi)\b/i.test(line)) {
      // Prefer lines with dates or explicit odometer phrases
      if (dateRe.test(line) || /odometer\s+reported/i.test(line)) {
        uniqPush(result.odometerEvents, line);
      }
    }
  });
  const odoNums = [];
  const numberWithUnits = /(\d{1,3}(?:[ ,]\d{3})+|\d{4,})(?=\s?(km|kilometers|miles|mi)\b)/gi;
  let m;
  while ((m = numberWithUnits.exec(normalized)) !== null) {
    const n = parseInt(m[1].replace(/[ ,]/g, ""), 10);
    if (!Number.isNaN(n)) odoNums.push(n);
  }
  if (odoNums.length) {
    result.highestOdometer = Math.max(...odoNums);
  }

  lines.forEach((line) => {
    if (isGeneric(line)) return;
    if (/vehicle\s+serviced|service|serviced|inspection|alignment|oil|tire|tyre|brake|washed|detailed|undercoating|rustproof/i.test(line)) {
      if (dateRe.test(line) || /vehicle\s+serviced/i.test(line)) {
        uniqPush(result.serviceEvents, line);
      }
    }
  });

  lines.forEach((line) => {
    if (isGeneric(line)) return;
    if (/recall/i.test(line)) {
      // Track raw lines
      uniqPush(result.recalls, line);
      // Determine open/none status
      if (/no\s+(?:open\s+)?recalls?\s+reported/i.test(line)) {
        result.recallsOpen = false;
      } else if (/(open\s+recall|recall\s+campaign|manufacturer\s+recall(?!\s+reported))/i.test(line)) {
        // Be conservative: only mark true for explicit open recalls
        if (result.recallsOpen !== false) result.recallsOpen = true;
      }
    }
  });

  lines.forEach((line) => {
    if (/(owner|owners|warranty|theft|stolen|flood|hail)/i.test(line)) {
      uniqPush(result.otherNotable, line);
    }
  });

  return result;
};
