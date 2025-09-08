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
    // Event summaries
    registrationSummaries: [], // [{date, summary}]
    serviceSummaries: [], // [{date, summary}]
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

  // Accident/damage detection (stricter, negation-aware)
  const accidentNegRe = /no\s+(?:police[- ]reported\s+)?accidents?(?:\s+or\s+damage)?\s+reported/i;
  const accidentPosRe = /(accident\s+reported|collision\s+reported|damage\s+reported|other\s+damage\s+records)/i;
  if (lines.some((l) => accidentNegRe.test(l))) {
    result.accidentsMentioned = false;
  } else if (lines.some((l) => accidentPosRe.test(l))) {
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
    // Try to capture last reported odometer when number appears after the phrase
    let candidates = [];
    let m;
    const afterRe = /last\s+reported\s+odometer\s+(?:reading\s*)?(?:[: ]+)?(\d{1,3}(?:[,\s]\d{3})+|\d{5,})/gi;
    while ((m = afterRe.exec(line)) !== null) {
      const n = parseInt(m[1].replace(/[ ,]/g, ''), 10);
      if (!Number.isNaN(n)) candidates.push(n);
    }
    // Also handle when number precedes the phrase (common in some extractions)
    const beforeRe = /(\d{1,3}(?:[,\s]\d{3})+|\d{5,})\s+last\s+reported\s+odometer\s+(?:reading)?/gi;
    while ((m = beforeRe.exec(line)) !== null) {
      const n = parseInt(m[1].replace(/[ ,]/g, ''), 10);
      if (!Number.isNaN(n)) candidates.push(n);
    }
    if (candidates.length) {
      const max = Math.max(...candidates);
      if (!result.lastReportedOdometer || max > result.lastReportedOdometer) {
        result.lastReportedOdometer = max;
      }
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

  const dateToken = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/;
  const extractDate = (s) => {
    const dm = s.match(dateToken);
    return dm ? dm[1] : null;
  };
  const regPhrases = [
    /registration\s+issued|registration\s+renewed|registration\s+issued\s+or\s+renewed/i,
    /new\s+owner\s+reported/i,
    /first\s+owner\s+reported/i,
    /registered\s+as\s+personal\s+vehicle/i,
    /motor\s+vehicle\s+dept/i,
  ];
  const svcPhrases = [
    /vehicle\s+serviced/i,
    /alignment\s+checked|alignment\s+performed/i,
    /emissions|safety\s+inspection\s+performed|inspection\s+performed/i,
    /oil\s+(?:and\s+filter\s+)?changed/i,
    /tire[s]?\s+(?:mounted|rotated|condition|pressure\s+checked)/i,
    /undercoating|rustproof/i,
    /washed|detailed|interior\s+cleaned|fabric\s+protection/i,
    /brake[s]?\s+checked/i,
  ];

  const summarize = (s, phrases) => {
    const hits = [];
    for (const re of phrases) {
      const m2 = s.match(re);
      if (m2) {
        hits.push(m2[0]
          .replace(/\s+/g, ' ')
          .replace(/\bregistration\b/gi, 'Registration')
          .replace(/\bissued\b/gi, 'issued')
          .replace(/\brenewed\b/gi, 'renewed')
          .replace(/\bperformed\b/gi, 'performed'));
      }
    }
    // Deduplicate small list and cap length
    return Array.from(new Set(hits)).slice(0, 4).join(' · ');
  };

  const pushEvent = (arr, date, summary) => {
    if (!summary) return;
    const key = `${date || ''}|${summary}`;
    if (!arr.some((it) => `${it.date || ''}|${it.summary}` === key)) {
      arr.push({ date, summary });
    }
  };

  lines.forEach((line) => {
    if (isGeneric(line)) return;
    const date = extractDate(line);
    const regSummary = summarize(line, regPhrases);
    if (regSummary) {
      pushEvent(result.registrationSummaries, date, regSummary);
    }
    const svcSummary = summarize(line, svcPhrases);
    if (svcSummary) {
      pushEvent(result.serviceSummaries, date, svcSummary);
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
