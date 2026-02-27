/**
 * compute-rates.js
 *
 * Reads the weekly Bills of Mortality CSV (1665-1666-combined-BOM-data.csv),
 * computes per-parish, per-game-month infection-rate denominators (N values
 * for `random(1, N)`), and writes the result to parish-rates-output.json.
 *
 * Usage:  node compute-rates.js
 *
 * The output is a JSON object mapping game parish names to 22-element arrays,
 * one N value per entry in the game's $timeline.
 */

const fs = require('fs');

// ── Game timeline (indices 0-21) ──────────────────────────────────────────
const TIMELINE = [
  "December 1664", "January 1665", "May 1665", "June 1665",
  "July 1665", "August 1665", "September 1665", "October 1665",
  "November 1665", "December 1665", "January 1666", "February 1666",
  "March 1666", "April 1666", "May 1666", "June 1666",
  "July 1666", "August 1666", "September 1666", "October 1666",
  "November 1666", "December 1666"
];

// Build a lookup: "Month Year" → timeline index
const monthYearToIndex = {};
for (let i = 0; i < TIMELINE.length; i++) {
  monthYearToIndex[TIMELINE[i]] = i;
}

// ── CSV plague-column name → game parish name ─────────────────────────────
const CSV_TO_GAME = {
  // 16 wall parishes listed first in the weekly CSV
  "Alhallows Barking - Plague": "All Hallows Barking",
  "Alhallows Stayning - Plague": "All Hallows Staining",
  "Alhallows the Wall - Plague": "All Hallows London Wall",
  "St Alphage - Plague": "St Alphage",
  "St Andrew Undershaft - Plague": "St Andrew Undershaft",
  "St Ethelborough - Plague": "St Ethelburga",
  "St Hellen - Plague": "St Helen",
  "St James Dukes place - Plague": "St James Duke's Place",
  "St Katharine Coleman - Plague": "St Katherine Coleman",
  "St Katharine Creechurch - Plague": "St Katherine Creechurch",
  "St Magnus Parish - Plague": "St Magnus",
  "St Martin Outwich - Plague": "St Martin Outwich",
  "St Olave Hartstreet - Plague": "St Olave Hart Street",
  "St Peter Cornhil - Plague": "St Peter Cornhill",
  "St Peter Poor - Plague": "St Peter Poor",
  "St Steven Colemanstreet - Plague": "St Stephen Coleman Street",

  // 16 parishes without the walls (includes some that straddle location groups)
  "St Andrew Holborn - Plague": "St Andrew Holbom",
  "St Bartholomew Great - Plague": "St Bartholomew Great",
  "St Bartholomew Less - Plague": "St Bartholomew Less",
  "St Botolph Aldersgate - Plague": "St Botolph Aldersgate",
  "St Botolph Aldgate - Plague": "St Botolph Aldgate",
  "St Botolph Bishopsgate - Plague": "St Botolph Bishopsgate",
  "St Dunstan West - Plague": "St Dunstan West",
  "St George Southwark - Plague": "St George Southwark",
  "St Giles Cripplegate - Plague": "St Giles Cripplegate",
  "St Olave Southwark - Plague": "St Olave Southwark",
  "Saviours Southwark - Plague": "St Saviour Southwark",
  "S Sepulchres Parish - Plague": "St Sepulchre",
  "St Thomas Southwark - Plague": "St Thomas Southwark",
  "Trinity Minories - Plague": "Holy Trinity Minories",

  // Out-parishes in Middlesex and Surrey
  "St Giles in the Field - Plague": "St Giles in the Field",
  "Hackney Parish - Plague": "St John at Hackney",
  "St James Clerkenwel - Plague": "St James Clerkenwell",
  "St Katharine Tower - Plague": "St Katharine Tower",
  "Lambeth Parish - Plague": "St Mary Lambeth",
  "St Leonard Shoreditch - Plague": "St Leonard Shoreditch",
  "St Magdalen Bermondsey - Plague": "St Mary Magdalen Bermondsey",
  "St Mary Islington - Plague": "St Mary Islington",
  "St Mary Newington - Plague": "St Mary Newington",
  "St Mary Whitechappel - Plague": "St Mary Whitechapel",
  "Rothorith Parish - Plague": "St Mary Rotherhithe",
  "Stepney Parish - Plague": "St Dunstan Stepney",

  // Westminster parishes
  "St Clement Danes - Plague": "St Clement Danes",
  "St Paul Covent Garden - Plague": "St Paul Covent Garden",
  "St Martin in the fields - Plague": "St Martin in the Fields",
  "St Mary Savoy - Plague": "St Mary Savoy",
  "St Margaret Westminster - Plague": "St Margaret Westminster",

  // 83 "demolished parishes" (remaining wall parishes in weekly CSV)
  "St Alban Woodstreet - Plague": "St Alban Wood Street",
  "Alhallows Breadstreet - Plague": "All Hallows Bread Street",
  "Alhallows Great - Plague": "All Hallows the Great",
  "Alhallows Honylane - Plague": "All Hallows Honey Lane",
  "Alhallows Lesse - Plague": "All Hallows the Less",
  "Alhallows Lumbardstreet - Plague": "All Hallows Lombard Street",
  "St Andrew Hubbard - Plague": "St Andrew Hubbard",
  "St Andrew Wardrobe - Plague": "St Andrew Wardrobe",
  "St Ann Aldersgate - Plague": "St Anne Aldersgate",
  "St Ann Blackfryers - Plague": "St Ann Blackfriars",
  "St Antholins Parish - Plague": "St Antholin",
  "St Austins Parish - Plague": "St Austin",
  "St Bartholomew Exchange - Plague": "St Bartholomew Exchange",
  "St Bennet Fynck - Plague": "St Benet Fink",
  "St Bennet Gracechurch - Plague": "St Benet Gracechurch",
  "St Bennet Paulswharf - Plague": "St Benet Paul's Wharf",
  "St Bennet Sherehog - Plague": "St Benet Sherehog",
  "St Botolph Billingsgate - Plague": "St Botolph Billingsgate",
  "Christ Church - Plague": "Christ Church",
  "St Christophers - Plague": "St Christopher",
  "St Clement Eastcheap - Plague": "St Clement Eastcheap",
  "St Dionis Backchurch - Plague": "St Dionis Backchurch",
  "St Dunstan East - Plague": "St Dunstan East",
  "St Edmund Lumbardstr. - Plague": "St Edmund the King",
  "St Faith - Plague": "St Faith under St Paul's",
  "St Foster - Plague": "St Vedast alias Foster",
  "St Gabriel Fenchurch - Plague": "St Gabriel Fenchurch",
  "St George Botolphlane - Plague": "St George Botolph Lane",
  "St Gregory by St Pauls - Plague": "St Gregory by St Paul's",
  "St James Garlickhithe - Plague": "St James Garlickhithe",
  "St John Baptist - Plague": "St John Baptist",
  "St John Evangelist - Plague": "St John Evangelist",
  "St John Zachary - Plague": "St John Zachary",
  "St Lawrence Jewry - Plague": "St Lawrence Jewry",
  "St Lawrence Pountney - Plague": "St Lawrence Pountney",
  "St Leonard Eastcheap - Plague": "St Leonard Eastcheap",
  "St Leonard Fosterlane - Plague": "St Leonard Foster Lane",
  "St Margaret Lothbury - Plague": "St Margaret Lothbury",
  "St Margaret Moses - Plague": "St Margaret Moses",
  "St Margaret Newfishstreet - Plague": "St Margaret New Fish Street",
  "St Margaret Pattons - Plague": "St Margaret Pattens",
  "St Mary Abchurch - Plague": "St Mary Abchurch",
  "St Mary Aldermanbury - Plague": "St Mary Aldermanbury",
  "St Mary Aldermary - Plague": "St Mary Aldermay",
  "St Mary le Bow - Plague": "St Mary le Bow",
  "St Mary Bothaw - Plague": "St Mary Bothaw",
  "St Mary Colechurch - Plague": "St Mary Colechurch",
  "St Mary Hill - Plague": "St Mary Hill",
  "St Mary Mounthaw - Plague": "St Mary Mounthaw",
  "St Mary Sommerset - Plague": "St Mary Somerset",
  "St Mary Stayning - Plague": "St Mary Staining",
  "St Mary Woolchurch - Plague": "St Mary Woolchurch",
  "St Mary Woolnoth - Plague": "St Mary Woolnoth",
  "St Martin Iremongerlane - Plague": "St Martin Ironmonger Lane",
  "St Martin Ludgate - Plague": "St Martin Ludgate",
  "St Martin Orgars - Plague": "St Martin Orgar",
  "St Martin Vintrey - Plague": "St Martin Vintry",
  "St Matthew Fridaystreet - Plague": "St Matthew Friday Street",
  "St Maudlin Milkstreet - Plague": "St Mary Magdalen Milk Street",
  "St Maudlin Oldfishstreet - Plague": "St Mary Magdalen Old Fish Street",
  "St Michael Bassishaw - Plague": "St Michael Bassishaw",
  "St Michael Cornhil - Plague": "St Michael Cornhill",
  "St Michael Crookedlane - Plague": "St Michael Crooked Lane",
  "St Michael Queenhithe - Plague": "St Michael Queenhithe",
  "St Michael Quern - Plague": "St Michael Quern",
  "St Michael Royal - Plague": "St Michael Royal",
  "St Michael Woodstreet - Plague": "St Michael Wood Street",
  "St Mildred Breadstreet - Plague": "St Mildred Bread Street",
  "St Mildred Poultrey - Plague": "St Mildred Poultrey",
  "St Nicholas Acons - Plague": "St Nicholas Acons",
  "St Nicholas Coleabby - Plague": "St Nicholas Cole Abbey",
  "St Nicholas Olaves - Plague": "St Nicholas Olave",
  "St Olave Jewry - Plague": "St Olave Jewry",
  "St Olave Silverstreet - Plague": "St Olave Silver Street",
  "St Pancras Soperlane - Plague": "St Pancras Soper Lane",
  "St Peter Cheap - Plague": "St Peter Cheap",
  "St Peter Paulswharf - Plague": "St Peter Paul's Wharf",
  "St Steven Walbrook - Plague": "St Stephen Walbrook",
  "St Swithin - Plague": "St Swithin",
  "St Thomas Apostles - Plague": "St Thomas Apostle",
  "Trinity Parish - Plague": "Trinity",
  "St Bridget - Plague": "St Bride",
  "Bridewel Precinct - Plague": "Bridewell Precinct",
};

// ── Parish weights from StoryInit (1664 annual burial counts) ─────────────
// Used to estimate pre-plague parish populations proportionally out of 400,000.
const PARISH_WEIGHTS = {
  // Wall parishes (97)
  "St Alban Wood Street": 46, "All Hallows Barking": 86,
  "All Hallows Bread Street": 20, "All Hallows the Great": 90,
  "All Hallows Honey Lane": 9, "All Hallows the Less": 43,
  "All Hallows Lombard Street": 18, "All Hallows Staining": 38,
  "All Hallows London Wall": 93, "St Alphage": 51,
  "St Andrew Hubbard": 27, "St Andrew Undershaft": 56,
  "St Andrew Wardrobe": 81, "St Anne Aldersgate": 42,
  "St Ann Blackfriars": 97, "St Antholin": 13,
  "St Austin": 13, "St Bartholomew Exchange": 22,
  "St Benet Fink": 29, "St Benet Gracechurch": 13,
  "St Benet Paul's Wharf": 70, "St Benet Sherehog": 13,
  "St Botolph Billingsgate": 23, "Christ Church": 140,
  "St Christopher": 16, "St Clement Eastcheap": 15,
  "St Dionis Backchurch": 31, "St Dunstan East": 102,
  "St Edmund the King": 20, "St Ethelburga": 23,
  "St Faith under St Paul's": 30, "St Vedast alias Foster": 25,
  "St Gabriel Fenchurch": 18, "St George Botolph Lane": 13,
  "St Gregory by St Paul's": 118, "St Helen": 25,
  "St James Duke's Place": 41, "St James Garlickhithe": 40,
  "St John Baptist": 31, "St John Evangelist": 5,
  "St John Zachary": 23, "St Katherine Coleman": 44,
  "St Katherine Creechurch": 87, "St Lawrence Jewry": 45,
  "St Lawrence Pountney": 38, "St Leonard Eastcheap": 14,
  "St Leonard Foster Lane": 37, "St Magnus": 36,
  "St Margaret Lothbury": 33, "St Margaret Moses": 14,
  "St Margaret New Fish Street": 26, "St Margaret Pattens": 17,
  "St Mary Abchurch": 30, "St Mary Aldermanbury": 46,
  "St Mary Aldermay": 20, "St Mary le Bow": 21,
  "St Mary Bothaw": 22, "St Mary Colechurch": 5,
  "St Mary Hill": 23, "St Mary Mounthaw": 12,
  "St Mary Somerset": 73, "St Mary Staining": 7,
  "St Mary Woolchurch": 22, "St Mary Woolnoth": 21,
  "St Martin Ironmonger Lane": 11, "St Martin Ludgate": 51,
  "St Martin Orgar": 25, "St Martin Outwich": 17,
  "St Martin Vintry": 76, "St Matthew Friday Street": 9,
  "St Mary Magdalen Milk Street": 19,
  "St Mary Magdalen Old Fish Street": 42,
  "St Michael Bassishaw": 38, "St Michael Cornhill": 36,
  "St Michael Crooked Lane": 46, "St Michael Queenhithe": 47,
  "St Michael Quern": 17, "St Michael Royal": 22,
  "St Michael Wood Street": 24, "St Mildred Bread Street": 12,
  "St Mildred Poultrey": 24, "St Nicholas Acons": 14,
  "St Nicholas Cole Abbey": 31, "St Nicholas Olave": 18,
  "St Olave Hart Street": 37, "St Olave Jewry": 29,
  "St Olave Silver Street": 42, "St Pancras Soper Lane": 12,
  "St Peter Ad Vincula": 10, "St Peter Cheap": 13,
  "St Peter Cornhill": 36, "St Peter Paul's Wharf": 23,
  "St Peter Poor": 22, "St Stephen Coleman Street": 133,
  "St Stephen Walbrook": 19, "St Swithin": 41,
  "St Thomas Apostle": 29, "Trinity": 31,

  // Westminster parishes (5)
  "St Clement Danes": 534, "St Paul Covent Garden": 133,
  "St Martin in the Fields": 1242, "St Mary Savoy": 80,
  "St Margaret Westminster": 807,

  // Eastern parishes (6) — St Botolph Aldgate & St John at Hackney also in north
  "Holy Trinity Minories": 12, "St Katharine Tower": 200,
  "St Mary Whitechapel": 671, "St Dunstan Stepney": 1392,
  "St Botolph Aldgate": 785, "St John at Hackney": 80,

  // Western suburbs (5)
  "St Andrew Holbom": 843, "Bridewell Precinct": 34,
  "St Bride": 412, "St Dunstan West": 265, "St Sepulchre": 851,

  // Northern parishes (unique ones not already listed above)
  "St Bartholomew Great": 90, "St Bartholomew Less": 44,
  "St Botolph Aldersgate": 187, "St Botolph Bishopsgate": 545,
  "St Giles Cripplegate": 1353, "St Giles in the Field": 931,
  "St James Clerkenwell": 313, "St Leonard Shoreditch": 424,
  "St Mary Islington": 58,

  // Southern parishes (8)
  "St George Southwark": 259, "St Olave Southwark": 829,
  "St Saviour Southwark": 605, "St Thomas Southwark": 54,
  "St Mary Lambeth": 236, "St Mary Magdalen Bermondsey": 305,
  "St Mary Newington": 235, "St Mary Rotherhithe": 40,
};

// ── Derived constants ─────────────────────────────────────────────────────
const TOTAL_WEIGHT = Object.values(PARISH_WEIGHTS).reduce((a, b) => a + b, 0);
const TOTAL_POP = 400000;

// Estimate parish population from its burial weight
function parishPop(gameName) {
  const w = PARISH_WEIGHTS[gameName];
  if (!w) return 0;
  return (w / TOTAL_WEIGHT) * TOTAL_POP;
}

// ── Parse CSV ─────────────────────────────────────────────────────────────
const csv = fs.readFileSync('1665-1666-combined-BOM-data.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim());
const header = lines[0].split(',');

// Find the column indices for each plague column we care about
const plagueColIndices = {};  // csvColName → column index
for (let i = 0; i < header.length; i++) {
  if (header[i].endsWith(' - Plague') && CSV_TO_GAME[header[i]]) {
    plagueColIndices[header[i]] = i;
  }
}

// Verify we found all expected columns
const foundGameParishes = new Set(Object.values(plagueColIndices).map(i => CSV_TO_GAME[header[i]]));
const allGameParishes = Object.keys(PARISH_WEIGHTS);
const missing = allGameParishes.filter(p => !foundGameParishes.has(p) && p !== 'St Peter Ad Vincula');
if (missing.length > 0) {
  console.warn('WARNING: No CSV plague column found for:', missing);
}

// Find the Start Month column index
const startMonthIdx = header.indexOf('Start Month');
if (startMonthIdx < 0) {
  console.error('ERROR: Cannot find "Start Month" column');
  process.exit(1);
}

// ── Accumulate monthly plague deaths per parish ───────────────────────────
// monthlyDeaths[gameName][timelineIndex] = total plague deaths
const monthlyDeaths = {};
for (const gameName of allGameParishes) {
  monthlyDeaths[gameName] = new Array(TIMELINE.length).fill(0);
}

// Track actual calendar year by detecting month transitions
let actualYear = 1665;
let prevStartMonth = null;

for (let row = 1; row < lines.length; row++) {
  const cols = lines[row].split(',');
  const startMonth = cols[startMonthIdx].trim();

  // Detect year rollover: when Start Month transitions from December to January
  if (prevStartMonth === 'December' && startMonth === 'January') {
    actualYear++;
  }
  prevStartMonth = startMonth;

  // Build the game month key
  const gameMonthKey = `${startMonth} ${actualYear}`;
  const timelineIdx = monthYearToIndex[gameMonthKey];

  // Skip rows before May 1665 (per user instruction)
  if (timelineIdx === undefined) continue;
  if (actualYear === 1665 && ['March', 'April'].includes(startMonth)) continue;

  // Sum plague deaths for each parish
  for (const [csvCol, colIdx] of Object.entries(plagueColIndices)) {
    const gameName = CSV_TO_GAME[csvCol];
    const val = parseInt(cols[colIdx], 10);
    if (!isNaN(val) && val > 0) {
      monthlyDeaths[gameName][timelineIdx] += val;
    }
  }
}

// ── Compute N values ──────────────────────────────────────────────────────
// N = round(parishPop / monthlyPlagueDeaths), clamped to [2, 1000]
// For months with 0 deaths → N = 1000
const parishRate = {};

for (const gameName of allGameParishes) {
  const pop = parishPop(gameName);
  const rates = new Array(TIMELINE.length).fill(1000);

  for (let i = 0; i < TIMELINE.length; i++) {
    const deaths = monthlyDeaths[gameName][i];
    if (deaths > 0 && pop > 0) {
      const n = Math.round(pop / deaths);
      rates[i] = Math.max(2, Math.min(1000, n));
    }
  }

  parishRate[gameName] = rates;
}

// ── Output ────────────────────────────────────────────────────────────────
fs.writeFileSync('parish-rates-output.json', JSON.stringify(parishRate, null, 2));

console.log(`Total weight: ${TOTAL_WEIGHT}`);
console.log(`Parishes processed: ${Object.keys(parishRate).length}`);
console.log(`Timeline months: ${TIMELINE.length}`);
console.log('\nSample rates (St Martin in the Fields):');
console.log(TIMELINE.map((m, i) => `  ${m}: N=${parishRate["St Martin in the Fields"][i]}`).join('\n'));
console.log('\nSample rates (St Giles Cripplegate):');
console.log(TIMELINE.map((m, i) => `  ${m}: N=${parishRate["St Giles Cripplegate"][i]}`).join('\n'));
console.log('\nSample rates (All Hallows Barking - small wall parish):');
console.log(TIMELINE.map((m, i) => `  ${m}: N=${parishRate["All Hallows Barking"][i]}`).join('\n'));
console.log('\nOutput written to parish-rates-output.json');
