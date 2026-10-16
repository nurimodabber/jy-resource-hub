// Offline-first Badí' (Bahá'í) Calendar calculation
// Accurate calculation based on astronomical Naw-Rúz / 19-month structure

export interface BadiDate {
  day: number;
  monthIndex: number; // 1 to 19, or 0 for Ayyám-i-Há
  monthName: string;
  monthMeaningDe: string;
  monthMeaningEn: string;
  yearBadi: number;
  formattedDe: string;
  formattedEn: string;
}

const BADI_MONTHS: { name: string; de: string; en: string }[] = [
  { name: 'Bahá', de: 'Herrlichkeit', en: 'Splendour' },       // 1: Mar 21
  { name: 'Jalál', de: 'Ruhm', en: 'Glory' },                 // 2: Apr 9
  { name: 'Jamál', de: 'Schönheit', en: 'Beauty' },           // 3: Apr 28
  { name: '‘Aẓamat', de: 'Größe', en: 'Grandeur' },           // 4: May 17
  { name: 'Núr', de: 'Licht', en: 'Light' },                 // 5: Jun 5
  { name: 'Raḥmat', de: 'Barmherzigkeit', en: 'Mercy' },      // 6: Jun 24
  { name: 'Kalimát', de: 'Worte', en: 'Words' },              // 7: Jul 13
  { name: 'Kamál', de: 'Vollkommenheit', en: 'Perfection' },  // 8: Aug 1
  { name: 'Asmá’', de: 'Namen', en: 'Names' },                // 9: Aug 20
  { name: '‘Izzat', de: 'Macht', en: 'Might' },               // 10: Sep 8
  { name: 'Mas͟híyyat', de: 'Wille', en: 'Will' },             // 11: Sep 27
  { name: '‘Ilm', de: 'Wissen', en: 'Knowledge' },            // 12: Oct 16
  { name: 'Qudrat', de: 'Kraft', en: 'Power' },               // 13: Nov 4
  { name: 'Qawl', de: 'Sprache', en: 'Speech' },              // 14: Nov 23
  { name: 'Masá’il', de: 'Fragen', en: 'Questions' },         // 15: Dec 12
  { name: 'S͟haraf', de: 'Ehre', en: 'Honour' },               // 16: Dec 31
  { name: 'Sulṭán', de: 'Souveränität', en: 'Sovereignty' },  // 17: Jan 19
  { name: 'Mulk', de: 'Herrschaft', en: 'Dominion' },         // 18: Feb 7
  { name: '‘Alá’', de: 'Erhabenheit', en: 'Loftiness' },      // 19: Fasting
];

// Vernal equinox (Naw-Rúz) calendar table for current era
function getNawRuzDate(gregorianYear: number): Date {
  // Naw-Rúz is March 20 or March 21
  // For years 2015-2030, Naw-Rúz dates fixed by Universal House of Justice:
  // 2024: Mar 20, 2025: Mar 20, 2026: Mar 21, 2027: Mar 21, 2028: Mar 20, 2029: Mar 20, 2030: Mar 20
  const marchDay = (gregorianYear === 2026 || gregorianYear === 2027 || gregorianYear === 2023) ? 21 : 20;
  return new Date(Date.UTC(gregorianYear, 2, marchDay));
}

export function getBadiDate(date: Date = new Date()): BadiDate {
  const gYear = date.getFullYear();
  const nawRuzThisYear = getNawRuzDate(gYear);
  
  let badiYear: number;
  let nawRuzStart: Date;

  if (date.getTime() >= nawRuzThisYear.getTime()) {
    badiYear = gYear - 1844 + 1;
    nawRuzStart = nawRuzThisYear;
  } else {
    badiYear = gYear - 1844;
    nawRuzStart = getNawRuzDate(gYear - 1);
  }

  // Calculate day difference from Naw-Rúz
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcNR = Date.UTC(nawRuzStart.getFullYear(), nawRuzStart.getMonth(), nawRuzStart.getDate());
  const daysSinceNawRuz = Math.floor((utcDate - utcNR) / msPerDay); // 0-indexed: 0 = 1st day of Bahá

  // 18 months of 19 days = 342 days
  if (daysSinceNawRuz < 18 * 19) {
    const monthIndex = Math.floor(daysSinceNawRuz / 19) + 1; // 1 to 18
    const day = (daysSinceNawRuz % 19) + 1;
    const m = BADI_MONTHS[monthIndex - 1];
    return {
      day,
      monthIndex,
      monthName: m.name,
      monthMeaningDe: m.de,
      monthMeaningEn: m.en,
      yearBadi: badiYear,
      formattedDe: `${day}. ${m.name} (${m.de}) ${badiYear} B.E.`,
      formattedEn: `${day} ${m.name} (${m.en}) ${badiYear} B.E.`,
    };
  }

  // Next Naw Ruz to determine length of Ayyám-i-Há
  const nextNawRuz = getNawRuzDate(nawRuzStart.getFullYear() + 1);
  const utcNrNext = Date.UTC(nextNawRuz.getFullYear(), nextNawRuz.getMonth(), nextNawRuz.getDate());
  const totalDaysInYear = Math.floor((utcNrNext - utcNR) / msPerDay);
  const ayyamIHaLength = totalDaysInYear - (19 * 19); // 4 or 5 days

  const dayInAyyamIHa = daysSinceNawRuz - (18 * 19);

  if (dayInAyyamIHa < ayyamIHaLength) {
    const day = dayInAyyamIHa + 1;
    return {
      day,
      monthIndex: 0,
      monthName: 'Ayyám-i-Há',
      monthMeaningDe: 'Tage des Há',
      monthMeaningEn: 'Days of Há',
      yearBadi: badiYear,
      formattedDe: `${day}. Ayyám-i-Há ${badiYear} B.E.`,
      formattedEn: `${day} Ayyám-i-Há ${badiYear} B.E.`,
    };
  }

  // 19th Month: ‘Alá’
  const dayInAla = dayInAyyamIHa - ayyamIHaLength;
  const day = dayInAla + 1;
  const m = BADI_MONTHS[18];
  return {
    day,
    monthIndex: 19,
    monthName: m.name,
    monthMeaningDe: m.de,
    monthMeaningEn: m.en,
    yearBadi: badiYear,
    formattedDe: `${day}. ${m.name} (${m.de}) ${badiYear} B.E.`,
    formattedEn: `${day} ${m.name} (${m.en}) ${badiYear} B.E.`,
  };
}
