const fs = require('fs');

function encode(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const widgetPlain = `
<<widget "NPC-death">><<nobr>>
/* Only run in non-quarantine, non-active-plague passages */
<<if !tags().includes("quarantine") and $plagueInfection is 0 and _infectedFamily.length lte 0 and _infectedMaster.length lte 0 and _infectedExtended.length lte 0>>
/* Determine year from passage tags */
<<set _deathYear to 0>>
<<if tags().includes("1665")>><<set _deathYear to 1665>><<elseif tags().includes("1666")>><<set _deathYear to 1666>><</if>>
<<if _deathYear gt 0>>
/* Cause-of-death weights by year */
<<if _deathYear is 1665>>
<<set _causeWeights to {fever: 5257, cough: 68, colic: 134, convulsions: 2036, smallpox: 655, "griping in the guts": 1288, measles: 7, rickets: 557, "spotted fever": 1929, "stopping of the stomach": 332, teeth: 2614, vomiting: 51}>>
<<else>>
<<set _causeWeights to {fever: 741, cough: 32, colic: 40, convulsions: 825, smallpox: 38, "griping in the guts": 676, measles: 3, rickets: 171, "spotted fever": 141, "stopping of the stomach": 107, teeth: 715, vomiting: 18}>><</if>>
/* Track contagion per array (empty string = none triggered yet) */
<<set _npcContagion to "">><<set _masterContagion to "">><<set _extendedContagion to "">><<set _servantsContagion to "">>
/* === $NPCs (household) === */
<<for _di = 0; _di lt $NPCs.length; _di++>><<if $NPCs[_di].health is "healthy">><<if $NPCs[_di].age is "infant">>
<<if random(1,1000) lte 56>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCs[_di].health to "deceased">>Your $NPCs[_di].relationship $NPCs[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _npcContagion is "">><<set _npcContagion to _cause>><</if>><</if>>
<<elseif $NPCs[_di].age is "child">>
<<if random(1,1000) is 1>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCs[_di].health to "deceased">>Your $NPCs[_di].relationship $NPCs[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _npcContagion is "">><<set _npcContagion to _cause>><</if>><</if>>
<<elseif $NPCs[_di].age is "elderly adult">>
<<if random(1,100) is 1>><<set $NPCs[_di].health to "deceased">>Your $NPCs[_di].relationship $NPCs[_di].name has died of old age.<br><br><</if>><</if>><</if>><</for>>
/* === $NPCsMaster (master's household) === */
<<for _di = 0; _di lt $NPCsMaster.length; _di++>>
<<if $NPCsMaster[_di].health is "healthy">><<if $NPCsMaster[_di].age is "infant">>
<<if random(1,1000) lte 56>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsMaster[_di].health to "deceased">>The $NPCsMaster[_di].relationship $NPCsMaster[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _masterContagion is "">><<set _masterContagion to _cause>><</if>><</if>>
<<elseif $NPCsMaster[_di].age is "child">>
<<if random(1,1000) is 1>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsMaster[_di].health to "deceased">>The $NPCsMaster[_di].relationship $NPCsMaster[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _masterContagion is "">><<set _masterContagion to _cause>><</if>><</if>>
<<elseif $NPCsMaster[_di].age is "elderly adult">>
<<if random(1,100) is 1>><<set $NPCsMaster[_di].health to "deceased">>The $NPCsMaster[_di].relationship $NPCsMaster[_di].name has died of old age.<br><br><</if>><</if>><</if>>
<</for>>
/* === $NPCsExtended (extended household) === */
<<for _di = 0; _di lt $NPCsExtended.length; _di++>><<if $NPCsExtended[_di].health is "healthy">>
<<if $NPCsExtended[_di].age is "infant">>
<<if random(1,1000) lte 56>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsExtended[_di].health to "deceased">>Your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _extendedContagion is "">><<set _extendedContagion to _cause>><</if>><</if>>
<<elseif $NPCsExtended[_di].age is "child">>
<<if random(1,1000) is 1>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsExtended[_di].health to "deceased">>Your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _extendedContagion is "">><<set _extendedContagion to _cause>><</if>><</if>>
<<elseif $NPCsExtended[_di].age is "elderly adult">>
<<if random(1,100) is 1>><<set $NPCsExtended[_di].health to "deceased">>Your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has died of old age.<br><br><</if>><</if>><</if>>
<</for>>
/* === $NPCsServants (servants) === */
<<for _di = 0; _di lt $NPCsServants.length; _di++>>
<<if $NPCsServants[_di].health is "healthy">><<if $NPCsServants[_di].age is "infant">>
<<if random(1,1000) lte 56>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsServants[_di].health to "deceased">>Your servant $NPCsServants[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _servantsContagion is "">><<set _servantsContagion to _cause>><</if>><</if>>
<<elseif $NPCsServants[_di].age is "child">>
<<if random(1,1000) is 1>>
<<set _cause to weightedEither(_causeWeights)>><<set $NPCsServants[_di].health to "deceased">>Your servant $NPCsServants[_di].name has died of _cause.<br><br>
<<if (_cause is "smallpox" or _cause is "measles") and _servantsContagion is "">><<set _servantsContagion to _cause>><</if>><</if>>
<<elseif $NPCsServants[_di].age is "elderly adult">>
<<if random(1,100) is 1>><<set $NPCsServants[_di].health to "deceased">>Your servant $NPCsServants[_di].name has died of old age.<br><br><</if>><</if>><</if>>
<</for>>
/* === Contagion: $NPCs === */
<<if _npcContagion isnot "">>
<<for _di = 0; _di lt $NPCs.length; _di++>>
<<if $NPCs[_di].health is "healthy" and ($NPCs[_di].age is "adolescent" or $NPCs[_di].age is "young adult" or $NPCs[_di].age is "middle-aged adult" or $NPCs[_di].age is "elderly adult")>>
<<set _cr to random(1,100)>>
<<if _npcContagion is "smallpox">>
<<if _cr lte 30>><<set $NPCs[_di].health to "deceased">>Tragically, your $NPCs[_di].relationship $NPCs[_di].name has also died of smallpox.<br><br>
<<elseif _cr lte 90>>Your $NPCs[_di].relationship $NPCs[_di].name has contracted smallpox but survived.<br><br><</if>>
<<elseif _npcContagion is "measles">>
<<if _cr lte 10>><<set $NPCs[_di].health to "deceased">>Tragically, your $NPCs[_di].relationship $NPCs[_di].name has also died of measles.<br><br>
<<elseif _cr lte 90>>Your $NPCs[_di].relationship $NPCs[_di].name has contracted measles but survived.<br><br><</if>><</if>><</if>><</for>><</if>>
/* === Contagion: $NPCsMaster === */
<<if _masterContagion isnot "">>
<<for _di = 0; _di lt $NPCsMaster.length; _di++>>
<<if $NPCsMaster[_di].health is "healthy" and ($NPCsMaster[_di].age is "adolescent" or $NPCsMaster[_di].age is "young adult" or $NPCsMaster[_di].age is "middle-aged adult" or $NPCsMaster[_di].age is "elderly adult")>>
<<set _cr to random(1,100)>>
<<if _masterContagion is "smallpox">>
<<if _cr lte 30>><<set $NPCsMaster[_di].health to "deceased">>Tragically, the $NPCsMaster[_di].relationship $NPCsMaster[_di].name has also died of smallpox.<br><br>
<<elseif _cr lte 90>>The $NPCsMaster[_di].relationship $NPCsMaster[_di].name has contracted smallpox but survived.<br><br><</if>>
<<elseif _masterContagion is "measles">>
<<if _cr lte 10>><<set $NPCsMaster[_di].health to "deceased">>Tragically, the $NPCsMaster[_di].relationship $NPCsMaster[_di].name has also died of measles.<br><br>
<<elseif _cr lte 90>>The $NPCsMaster[_di].relationship $NPCsMaster[_di].name has contracted measles but survived.<br><br><</if>><</if>><</if>><</for>><</if>>
/* === Contagion: $NPCsExtended === */
<<if _extendedContagion isnot "">>
<<for _di = 0; _di lt $NPCsExtended.length; _di++>>
<<if $NPCsExtended[_di].health is "healthy" and ($NPCsExtended[_di].age is "adolescent" or $NPCsExtended[_di].age is "young adult" or $NPCsExtended[_di].age is "middle-aged adult" or $NPCsExtended[_di].age is "elderly adult")>>
<<set _cr to random(1,100)>>
<<if _extendedContagion is "smallpox">>
<<if _cr lte 30>><<set $NPCsExtended[_di].health to "deceased">>Tragically, your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has also died of smallpox.<br><br>
<<elseif _cr lte 90>>Your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has contracted smallpox but survived.<br><br><</if>>
<<elseif _extendedContagion is "measles">>
<<if _cr lte 10>><<set $NPCsExtended[_di].health to "deceased">>Tragically, your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has also died of measles.<br><br>
<<elseif _cr lte 90>>Your $NPCsExtended[_di].relationship $NPCsExtended[_di].name has contracted measles but survived.<br><br><</if>><</if>><</if>><</for>><</if>>
/* === Contagion: $NPCsServants === */
<<if _servantsContagion isnot "">>
<<for _di = 0; _di lt $NPCsServants.length; _di++>>
<<if $NPCsServants[_di].health is "healthy" and ($NPCsServants[_di].age is "adolescent" or $NPCsServants[_di].age is "young adult" or $NPCsServants[_di].age is "middle-aged adult" or $NPCsServants[_di].age is "elderly adult")>>
<<set _cr to random(1,100)>>
<<if _servantsContagion is "smallpox">>
<<if _cr lte 30>><<set $NPCsServants[_di].health to "deceased">>Tragically, your servant $NPCsServants[_di].name has also died of smallpox.<br><br>
<<elseif _cr lte 90>>Your servant $NPCsServants[_di].name has contracted smallpox but survived.<br><br><</if>>
<<elseif _servantsContagion is "measles">>
<<if _cr lte 10>><<set $NPCsServants[_di].health to "deceased">>Tragically, your servant $NPCsServants[_di].name has also died of measles.<br><br>
<<elseif _cr lte 90>>Your servant $NPCsServants[_di].name has contracted measles but survived.<br><br><</if>><</if>><</if>><</for>><</if>>
<</if>> /* end _deathYear gt 0 */
<</if>> /* end plague/quarantine check */
<</nobr>><</widget>>`;

const widgetEncoded = encode(widgetPlain);

const passages = JSON.parse(fs.readFileSync('passages.json', 'utf8'));

// --- Update Claude-widgets (pid 115) ---
const claudeWidgets = passages.find(p => p.pid === '115');
if (!claudeWidgets) { console.error('Claude-widgets not found!'); process.exit(1); }
claudeWidgets.content += '\n' + widgetEncoded;
console.log('Added NPC-death widget to Claude-widgets (pid 115)');

// --- Update random-events widget (pid 114) ---
const randomEvents = passages.find(p => p.pid === '114');
if (!randomEvents) { console.error('random-events widget not found!'); process.exit(1); }

const insertMarker = '/* Servant dismissal for bad reputation */';
if (!randomEvents.content.includes(insertMarker)) {
  console.error('Could not find insertion point in random-events widget!');
  process.exit(1);
}

randomEvents.content = randomEvents.content.replace(
  insertMarker,
  '/* NPC death from non-plague causes */\n&lt;&lt;NPC-death&gt;&gt;\n\n' + insertMarker
);
console.log('Inserted <<NPC-death>> call into random-events widget (pid 114)');

fs.writeFileSync('passages.json', JSON.stringify(passages, null, 2));
console.log('passages.json updated successfully');
