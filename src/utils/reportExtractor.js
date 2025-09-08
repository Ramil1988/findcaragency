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

  if (/(no\s+police[- ]reported\s+accidents|no\s+accidents\s+reported)/i.test(raw)) {
    result.accidentsMentioned = false;
  } else if (/(accident|collision|damage\s+record)/i.test(raw)) {
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

  lines.forEach((line) => {
    if (/registered|registration|province of|state of|following locations/i.test(line)) {
      uniqPush(result.registrations, line);
    }
  });

  const moneyRe = /\$\s?\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?/;
  const dateRe = /\b(\d{4}[-/ ]\d{1,2}[-/ ]\d{1,2}|\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*)\b/i;
  lines.forEach((line) => {
    if (/(other\s+damage\s+records|damage|glass\s+record|claim|estimate)/i.test(line)) {
      const amount = line.match(moneyRe);
      const date = line.match(dateRe);
      result.damageRecords.push({
        date: date ? date[0] : undefined,
        amount: amount ? amount[0] : undefined,
        details: line,
      });
    }
  });

  lines.forEach((line) => {
    if (/odometer|km\b|kilometers|miles|mi\b/i.test(line)) {
      uniqPush(result.odometerEvents, line);
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
    if (/service|serviced|inspection|alignment|oil|tire|tyre|brake|washed|detailed|condition\s+and\s+pressure\s+checked/i.test(line)) {
      uniqPush(result.serviceEvents, line);
    }
  });

  lines.forEach((line) => {
    if (/recall/i.test(line)) {
      uniqPush(result.recalls, line);
    }
  });

  lines.forEach((line) => {
    if (/(owner|owners|warranty|theft|stolen|flood|hail)/i.test(line)) {
      uniqPush(result.otherNotable, line);
    }
  });

  return result;
};
