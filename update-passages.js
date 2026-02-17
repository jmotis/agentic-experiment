#!/usr/bin/env node
"use strict";

// Helper: HTML-entity-encode a raw SugarCube string for storage in passages.json
function encode(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const fs = require("fs");
const jsonPath = require("path").resolve(__dirname, "passages.json");
const passages = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

function getPassage(name) {
  return passages.find(p => p.name === name);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Claude-widgets (pid 115): add <<orphan-check>> widget
// ─────────────────────────────────────────────────────────────────────────────
const claudeWidgets = getPassage("Claude-widgets");

const orphanCheckWidget = `/* all widgets generated via Claude should be temporarily placed here then manually moved to new locations as needed */

/* Orphan-check widget: called at the end of plague/sickness/quarantine sequences.
   If the player is a child or adolescent and no living adult (young adult,
   middle-aged adult, or elderly adult) remains in $NPCs, regenerate their
   household according to their socio status. */
<<widget "orphan-check">><<nobr>>
<<if $age is "child" or $age is "adolescent">>
  <<set _hasLivingAdult to false>>
  <<for _oi = 0; _oi < $NPCs.length; _oi++>>
    <<if ($NPCs[_oi].age is "young adult" or $NPCs[_oi].age is "middle-aged adult" or $NPCs[_oi].age is "elderly adult") and $NPCs[_oi].health isnot "deceased">>
      <<set _hasLivingAdult to true>>
    <</if>>
  <</for>>
  <<if not _hasLivingAdult>>
    <<if $socio is "servants">>
      /* Servant: find a new master's household */
      <<set $NPCs to []>>
      <<set $NPCsMaster to []>>
      <<addMasterHousehold>>
      <<set $NPCs to $NPCsMaster.slice()>>
      <<set $NPCsMaster to []>>
      <<NPCpronouns>>
      <br><br>Because your master died, you have found a new position in another household.<br><br>
    <<elseif $socio is "beggars" or $socio is "day labourers">>
      /* Beggar/Day Labourer: become a servant in an artisan household */
      /* Move surviving child/adolescent NPCs to extended family */
      <<set _survivingKids to []>>
      <<for _oi = 0; _oi < $NPCs.length; _oi++>>
        <<if ($NPCs[_oi].age is "child" or $NPCs[_oi].age is "adolescent") and $NPCs[_oi].health isnot "deceased">>
          <<set _survivingKids.push($NPCs[_oi])>>
        <</if>>
      <</for>>
      <<set $NPCsExtended to $NPCsExtended.concat(_survivingKids)>>
      <<set $socio to "servants">>
      <<set $masterStatus to "artisans">>
      <<set $NPCs to []>>
      <<set $NPCsMaster to []>>
      <<set _artisanHHSize to random(2,4)>>
      <<for _m to 0; _m lt _artisanHHSize; _m++>>
        <<if random(1,2) eq 1>>
          <<set $NPCsMaster.push({name: weightedEither($fNames), age: either("child", "adolescent", "young adult", "middle-aged adult", "elderly adult"), relationship: either("master's wife", "master's daughter", "master's mother"), health: "healthy", location: $location})>>
        <<else>>
          <<set $NPCsMaster.push({name: weightedEither($mNames), age: either("child", "adolescent", "young adult", "middle-aged adult", "elderly adult"), relationship: either("master", "master's son", "master's father"), health: "healthy", location: $location})>>
        <</if>>
      <</for>>
      <<set $NPCs to $NPCsMaster.slice()>>
      <<set $NPCsMaster to []>>
      <<NPCpronouns>>
      <br><br>Because you have been orphaned, your Parish Overseers of the Poor have found you a position as a servant in a local household.<br><br>
    <<else>>
      /* Artisan/Merchant/Noble: move to new household of same socio status */
      <<set _newGuardian to either("uncle", "widowed aunt", "cousin", "family friend")>>
      /* Collect surviving child/adolescent NPCs from original household */
      <<set _survivingKids to []>>
      <<for _oi = 0; _oi < $NPCs.length; _oi++>>
        <<if ($NPCs[_oi].age is "child" or $NPCs[_oi].age is "adolescent") and $NPCs[_oi].health isnot "deceased">>
          <<set _survivingKids.push($NPCs[_oi])>>
        <</if>>
      <</for>>
      <<set $NPCs to []>>
      /* Build the new household starting with the guardian and their family */
      <<if _newGuardian is "uncle">>
        <<set $NPCs.push({name: weightedEither($mNames), age: either("young adult", "middle-aged adult"), relationship: "uncle", health: "healthy", location: $location})>>
        <<if random(1,2) is 1>>
          <<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "uncle's wife", health: "healthy", location: $location})>>
        <</if>>
        <<if $socio is "artisans">><<set _newHHKids to random(1,2)>><<elseif $socio is "merchants">><<set _newHHKids to random(1,4)>><<else>><<set _newHHKids to random(2,6)>><</if>>
        <<for _k to 0; _k lt _newHHKids; _k++>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><</if>>
        <</for>>
      <<elseif _newGuardian is "widowed aunt">>
        <<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "aunt", health: "healthy", location: $location})>>
        <<if $socio is "artisans">><<set _newHHKids to random(1,2)>><<elseif $socio is "merchants">><<set _newHHKids to random(1,4)>><<else>><<set _newHHKids to random(2,6)>><</if>>
        <<for _k to 0; _k lt _newHHKids; _k++>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><</if>>
        <</for>>
      <<elseif _newGuardian is "cousin">>
        <<if random(1,2) is 1>>
          <<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "cousin", health: "healthy", location: $location})>>
        <<else>>
          <<set $NPCs.push({name: weightedEither($mNames), age: either("young adult", "middle-aged adult"), relationship: "cousin", health: "healthy", location: $location})>>
        <</if>>
        <<if random(1,2) is 1>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "cousin's wife", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("young adult", "middle-aged adult"), relationship: "cousin's husband", health: "healthy", location: $location})>><</if>>
        <</if>>
        <<if $socio is "artisans">><<set _newHHKids to random(1,2)>><<elseif $socio is "merchants">><<set _newHHKids to random(1,4)>><<else>><<set _newHHKids to random(2,6)>><</if>>
        <<for _k to 0; _k lt _newHHKids; _k++>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("child", "adolescent"), relationship: "cousin", health: "healthy", location: $location})>><</if>>
        <</for>>
      <<else>>
        /* family friend */
        <<if random(1,2) is 1>>
          <<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "family friend", health: "healthy", location: $location})>>
        <<else>>
          <<set $NPCs.push({name: weightedEither($mNames), age: either("young adult", "middle-aged adult"), relationship: "family friend", health: "healthy", location: $location})>>
        <</if>>
        <<if random(1,2) is 1>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("young adult", "middle-aged adult"), relationship: "friend's wife", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("young adult", "middle-aged adult"), relationship: "friend's husband", health: "healthy", location: $location})>><</if>>
        <</if>>
        <<if $socio is "artisans">><<set _newHHKids to random(1,2)>><<elseif $socio is "merchants">><<set _newHHKids to random(1,4)>><<else>><<set _newHHKids to random(2,6)>><</if>>
        <<for _k to 0; _k lt _newHHKids; _k++>>
          <<if random(1,2) is 1>><<set $NPCs.push({name: weightedEither($fNames), age: either("child", "adolescent"), relationship: "friend's daughter", health: "healthy", location: $location})>><<else>><<set $NPCs.push({name: weightedEither($mNames), age: either("child", "adolescent"), relationship: "friend's son", health: "healthy", location: $location})>><</if>>
        <</for>>
      <</if>>
      /* Move surviving child/adolescent NPCs from original household into new household */
      <<set $NPCs to $NPCs.concat(_survivingKids)>>
      <<NPCpronouns>>
      <br><br>Because you have been orphaned, you have moved in with <<if _newGuardian is "family friend">>a family friend<<else>>your _newGuardian<</if>>.<br><br>
    <</if>>
  <</if>>
<</if>>
<</nobr>><</widget>>`;

claudeWidgets.content = encode(orphanCheckWidget);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Reconnecting (pid 83): insert <<orphan-check>> before <<storyline-return>>
// ─────────────────────────────────────────────────────────────────────────────
const reconnecting = getPassage("Reconnecting");
// Replace the NTS comment placeholder and the <<storyline-return>> call
const reconnectingRaw = `<<nobr>>
/*<<check-NPCs>>
<<if _infectedFamily.length gt 0>>Unfortunately, you're going to be here a while longer. Your
              <<for _z, _y range _infectedFamily>>
                <<if _infectedFamily.length eq 1>>$NPCs[_y].relationship, $NPCs[_y].name has also fallen ill.<br>
                <<elseif _z < _infectedFamily.length - 1>>$NPCs[_y].relationship $NPCs[_y].name, <<else>>and $NPCs[_y].relationship $NPCs[_y].name have also fallen ill.
                <</if>>
            <</for>>
<<else>> */
Lord be praised, your <<defHousehold "household">> has survived the <<defPlague "plague">>. You still need to finish  <<defQuarantine "quarantine">>, but begin reconnecting with the outside world.

In the time you were away.... /* nts: add updates based on what big events have happened */

<<orphan-check>>

<<storyline-return>>
/*<<health-update>>*/
/* <<</if>> */
<<</nobr>>
`;
reconnecting.content = encode(reconnectingRaw);

// ─────────────────────────────────────────────────────────────────────────────
// 3. FamPesthouse (pid 39): insert <<orphan-check>> before <<storyline-return>>
// ─────────────────────────────────────────────────────────────────────────────
const famPesthouse = getPassage("FamPesthouse");
const famPesthouseRaw = `<<nobr>>
It is a difficult decision, but your family decide it's for the best to send your sick to the <span class="def" data-def="A hospital used for the treatment and isolation of people infected with Bubonic plague or other infectious diseases">pesthouse</span>.
<br><br>
<<if $reputation lte 3>>To your horror, rumors swirl that your family have actually murdered a member of your household and hidden the body! <<if $murder gte 1>> Remembering the rumors of murder that circulated last time  your family sent someone to the household, you <</if>><<if $murder lte 1>>You<</if>> send to the master of the pesthouse to produce a certificate for you that proves the rumor is a lie.
<<set $reputation -=2>><<set $murder =1>>
<</if>>
<<set $money -= 5>>

<br>
Family status after quarantine:
<<for _z, _idx range $NPCs>>
$NPCs[_z].relationship, $NPCs[_z].name, $NPCs[_z].health
<</for>>
<<silently>><<if random(1,2) eq 1>><<set $plagueInfection to 1>><</if>><</silently>>
<br><br>
<<orphan-check>>
<<storyline-return>>
<</nobr>>
<img src="https://upload.wikimedia.org/wikipedia/commons/5/58/The_pest_house_and_plague_pit%2C_Moorfields%2C_London._Wellcome_V0013229.jpg" width="100%">
<br>
//The pest house and plague pit, Moorfields, London. Wood engraving. Wellcome Images.//
`;
famPesthouse.content = encode(famPesthouseRaw);

// ─────────────────────────────────────────────────────────────────────────────
// 4. YouPesthouse (pid 44): insert <<orphan-check>> before the penance choice
// ─────────────────────────────────────────────────────────────────────────────
const youPesthouse = getPassage("YouPesthouse");
const youPesthouseRaw = `<<silently>><<set $plagueInfection to 2>><</silently>>
<<nobr>>
The pesthouse is a terrible place to be confined, with countless sick people all crammed in close together so you can hear their every moan. They die terrifyingly fast and their cots refill just as quickly. You toss and turn in your dirty, sweat-soaked sheets, as your fever spikes and you fear for your life.
<br><br>
<<if $socio is "merchants">>It occurs to you that perhaps you ought to have written your will, but your reputation is so poor and the pesthouse is so terrifying that no one can be convinced to bring you the writing materials you need.<br><<elseif $socio is "artisans">>It occurs to you that perhaps you ought to have written your will, but your reputation is so poor and the pesthouse is so terrifying that you can't convince a <<defScrivener "scrivener">> to come help you.<br><br><</if>>
<<if random(1,2) is 1>>Luckily, you will grow too delirious to notice how miserable you are in the hours before your [[death]].<<else>>You spend all your remaining energy in prayer that God will spare you from death. Despite the neglect of the overworked pesthouse staff, after a few days you feel your fever break and your <<defBuboes "buboes">> begin to go down. Thanks be to God, you have survived the plague.
<br><br>
<img src="https://upload.wikimedia.org/wikipedia/commons/5/58/The_pest_house_and_plague_pit%2C_Moorfields%2C_London._Wellcome_V0013229.jpg" width="100%">
<br>
//The pest house and plague pit, Moorfields, London. Wood engraving. Wellcome Images.//
<br><br>
<<orphan-check>>
Now you just have to figure out how to overcome your disgrace when you return home to your neighborhood. You decide to start by:<br>
<<if $money gte 2>>
<<linkreplace "giving all your money to the poor">><<set $money to 0>><<set $decisions.push("Gave all money to the poor as penance")>>
<<storyline-return>>
<br>
<</linkreplace>>
<<linkreplace "giving all your money to the poor //and// performing public penance in church">><<set $decisions.push("Gave all money and performed public penance")>>
<<set $money to 0>>
<<set $reputation +=1>>
<<storyline-return>>
<</linkreplace>>
<<else>>
<<linkreplace "performing public penance in church">><<set $decisions.push("Performed public penance in church")>>
<<set $reputation +=1>>
<<storyline-return>>
<</linkreplace>>
<</if>>
<</if>>
<</nobr>>`;
youPesthouse.content = encode(youPesthouseRaw);

// ─────────────────────────────────────────────────────────────────────────────
// Write updated passages.json
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(jsonPath, JSON.stringify(passages, null, 2), "utf-8");
console.log("Updated passages: Claude-widgets (115), Reconnecting (83), FamPesthouse (39), YouPesthouse (44)");
