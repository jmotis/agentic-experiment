# Global Variables Reference

This document lists all global (story) variables used in **Gaming the Great Plague**. Global variables use the `$` prefix in SugarCube 2. Temporary (passage-scoped) variables use the `_` prefix and are not listed here.

**Maintenance rule:** If a future update creates a new global variable or changes how an existing variable is used, this file must be updated along with the game.

---

## Table of Contents

1. [Player Character](#player-character)
2. [Economy / Money](#economy--money)
3. [Location / Geography](#location--geography)
4. [Plague / Health](#plague--health)
5. [Household NPCs](#household-npcs)
6. [NPC Name Pools](#npc-name-pools)
7. [NPC Generation Helpers](#npc-generation-helpers)
8. [Pronoun / Grammar Arrays](#pronoun--grammar-arrays)
9. [Remedies and Fumigants](#remedies-and-fumigants)
10. [Fleeing / Flight Status](#fleeing--flight-status)
11. [Family / Life Events](#family--life-events)
12. [Random Event Rolls](#random-event-rolls)
13. [Story / Game State](#story--game-state)
14. [Plague Worker Variables](#plague-worker-variables)
15. [Parish Lookup Tables](#parish-lookup-tables)

---

## Player Character

### `$gender`
- **Type:** String
- **Possible values:** `"male"`, `"female"`
- **Set by:** `random-character` widget via `either("male", "female")`; can also be `"nonbinary"` via the player-choice path (commented-out paths reference it)
- **Used for:** Pronoun selection, name generation, NPC relationship labels, narrative text branching

### `$birthgender`
- **Type:** Array (referenced as an array with values like `"son"`, `"daughter"`)
- **Possible values:** `["daughter", ...]` or checked as `$birthgender is "son"`
- **Dependency:** Derived from `$gender` during NPC child generation
- **Used for:** Determining birth-related child relationship labels in NPC generation

### `$age`
- **Type:** String
- **Possible values:** `"child"`, `"adolescent"`, `"young adult"`, `"middle-aged adult"`, `"elderly adult"`
- **Set by:** `random-character` widget via `weightedEither` with weights: child (14), adolescent (16), young adult (25), middle-aged adult (35), elderly adult (10)
- **Dependency:** Determines `$agenum` range and `$hoh` status via the `playerAge` widget

### `$agenum`
- **Type:** Integer
- **Range:** 5 -- 76
- **Set by:** `playerAge` widget based on `$age`:
  - `"child"` &rarr; `random(5, 9)`
  - `"adolescent"` &rarr; `random(10, 15)`
  - `"young adult"` &rarr; `random(16, 29)`
  - `"middle-aged adult"` &rarr; `random(30, 59)`
  - `"elderly adult"` &rarr; `random(60, 76)`
- **Dependency:** Derived from `$age`. Also used as a base to compute `$minAge`/`$maxAge` for NPC generation.

### `$name`
- **Type:** String
- **Set by:** `weightedEither($fNames)` if female, `weightedEither($mNames)` if male; player can choose from a listbox if nonbinary
- **Dependency:** Depends on `$gender`, `$fNames`, `$mNames`
- **Example values:** "Elizabeth", "John", "Mary", "Thomas"

### `$relationship`
- **Type:** String
- **Possible values:** `"single"`, `"married"`, `"widowed"`, `"betrothed"`
- **Set by:** `random-character` widget. Children/adolescents: `weightedEither({"single": 95, "betrothed": 5})`. Adults: `weightedEither({"single": 17, "married": 32, "widowed": 9})`
- **Can change to:** `"married"` (via wedding event), `"single"` (if spouse dies)
- **Dependency:** `$age` determines which weight table is used

### `$religion`
- **Type:** String
- **Possible values:** `"member of the Church of England"`, `"member of a dissident Protestant church"`, `"Presbyterian"`, `"Baptist"`, `"Quaker"`, `"Catholic"`
- **Set by:** `random-character` widget via `weightedEither({"member of the Church of England": 9209, "member of a dissident Protestant church": 758, "Catholic": 33})`. If assigned `"member of a dissident Protestant church"`, a second roll picks: `either("Presbyterian", "Baptist", "Quaker")`
- **Notes:** `"Catholic"` and `"Quaker"` trigger special narrative branches

### `$origin`
- **Type:** String
- **Possible values:** `"London"`, `"the English countryside"`, `"another English town or city"`, `"Scotland"`, `"Ireland"`, `"the Dutch Republic"`, `"France"`, `"somewhere else"`
- **Set by:** `random-character` widget via `weightedEither` with weights: London (30), English countryside (200), another English town or city (20), Scotland (20), Ireland (20), Dutch Republic (5), France (4), somewhere else (1)
- **Used for:** Name pool weighting (certain names get boosted 5x based on origin), flee destination text, narrative branches
- **Note:** Some passages compare against `"the Dutch republic"` (lowercase "r") as well as `"the Dutch Republic"` (uppercase "R")

### `$socio`
- **Type:** String (social class)
- **Possible values:** `"beggars"`, `"day labourers"`, `"servants"`, `"artisans"`, `"merchants"`, `"nobles"`
- **Set by:** `random-character` widget via `weightedEither({"day labourers": 1820, "servants": 1820, "artisans": 600, "merchants": 80, "nobles": 8, "beggars": 4000})`
- **Can change to:** `"beggars"` (if a servant breaks their contract)
- **Used for:** Income/expense levels, household size, flee options, NPC generation, narrative branching. This is one of the most heavily used variables in the game.

### `$role`
- **Type:** String
- **Possible values:** `"0"` (none/default), `"searcher"`, `"nurse"`, `"corpsebearer"`, `"unemployed"`
- **Set by:** Initially `"0"`. Changes to a plague worker role when the player takes a plague job, or `"unemployed"` when a servant breaks their contract.
- **Dependency:** `$socio` determines which roles are available. `$role` affects income and narrative options.

### `$hoh`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not head of household), `1` (head of household)
- **Set by:** `playerAge` widget sets to `1` for young adults, middle-aged adults, and elderly adults. Set to `0` for children/adolescents. Also set to `1` if the player lives alone.
- **Used for:** Determines whether the player makes household decisions or must convince family

### `$disability`
- **Type:** Integer
- **Possible values:** `0` (no disability), `1`, `2`, `3`, `4`, `5`
- **Set by:** `random(1, 5)` for random assignment; `0` for no disability
- **Notes:** Each numeric value corresponds to a different disability condition. Checked with `$disability is 1`, `$disability is 2`, etc.

---

## Economy / Money

### `$money`
- **Type:** Integer (in pence)
- **Range:** 0 -- effectively unbounded (clamped at 0 on the low end)
- **Initial values by `$socio`:**
  - `"beggars"` / `"day labourers"`: `0`
  - `"servants"`: `0`
  - `"artisans"`: `10000`
  - `"merchants"`: varies (higher)
  - `"nobles"`: varies (highest)
- **Modified by:** `Math.clamp($money + amount, 0, Infinity)` or direct arithmetic. Income is added and expenses subtracted each month.
- **Notes:** All monetary values are in pence (12 pence = 1 shilling, 20 shillings = 1 pound). Displayed to the player using `$pounds`, `$shillings`, `$pence`.

### `$income`
- **Type:** Integer (monthly income in pence)
- **Possible values:** `0`, `120`, `300`, `800`, `4000`, `17600`
- **Dependency:** Set based on `$socio`; changes if the player takes a plague worker role

### `$expenses`
- **Type:** Integer (monthly expenses in pence)
- **Possible values:** `0`, `120`, `220`, `240`, `560`, `2800`, `12800`
- **Dependency:** Set based on `$socio` and household size

### `$pounds`
- **Type:** Integer (derived display variable)
- **Set by:** `Math.floor(_shillings / 20)` where `_shillings = Math.floor($money / 12)`
- **Dependency:** Derived from `$money`

### `$shillings`
- **Type:** Integer (derived display variable)
- **Set by:** `_shillings - Math.floor($pounds * 20)`
- **Dependency:** Derived from `$money` and `$pounds`

### `$pence`
- **Type:** Integer (derived display variable)
- **Set by:** `$money - (_shillings * 12)`
- **Dependency:** Derived from `$money`

---

## Location / Geography

### `$location`
- **Type:** String
- **Possible values:**
  - `"inside the City walls"`
  - `"in the western suburbs, specifically Westminster"`
  - `"in another part of the western suburbs"`
  - `"in the northern suburbs"`
  - `"in the eastern suburbs"`
  - `"across the river in the southern suburbs"`
  - `0` (reset value, used during game re-initialization)
- **Set by:** `random-character` widget via `weightedEither` with weights: inside City walls (3458), Westminster (2796), other western suburbs (2405), northern suburbs (4810), eastern suburbs (3140), southern suburbs (2563)
- **Dependency:** Determines `$parish` via the `parish` widget. Also determines when plague first reaches the player's area (different months for different locations).

### `$parish`
- **Type:** String (parish name)
- **Set by:** `parish` widget, which calls `weightedEither()` on the appropriate parish lookup table based on `$location`:
  - `"inside the City walls"` &rarr; `$wallParishes`
  - `"in the eastern suburbs"` &rarr; `$eParishes`
  - `"in the northern suburbs"` &rarr; `$nParishes`
  - `"across the river in the southern suburbs"` &rarr; `$sParishes`
  - `"in another part of the western suburbs"` &rarr; `$wParishes`
  - `"in the western suburbs, specifically Westminster"` &rarr; `$WestmParishes`
- **Dependency:** Entirely determined by `$location`
- **Example values:** "St Giles Cripplegate", "St Martin in the Fields", "St Olave Southwark"

### `$hhlocation`
- **Type:** String
- **Possible values:** Set to `$origin` (player's place of origin) or `"in the countryside"`
- **Used for:** Describes where fled family members have gone
- **Dependency:** Depends on `$origin`

---

## Plague / Health

### `$plagueInfection`
- **Type:** Integer
- **Possible values:** `0`, `1`, `2`, and values from various `random()` ranges
- **Key states:**
  - `0` = no active plague infection roll / safe
  - `1` = plague infection triggered (checked with `$plagueInfection eq 1` or `$plagueInfection is 1`)
  - `2` = alternate infection state
  - Other values from `random(1, N)` where only value `1` typically triggers infection
- **Set by:** Various `random()` calls with different ranges depending on game month and circumstances (e.g., `random(1, 100)` early in the plague, `random(1, 5)` at peak). Also set to `0` when family flees.
- **Notes:** The variable is re-rolled frequently. The probability of infection increases as the plague worsens (smaller random ranges = higher chance of rolling 1).

### `$playerPlagueStatus`
- **Type:** String
- **Possible values:** `"healthy"`, `"infected"`, `"recovered"`
- **Initial value:** `"healthy"`
- **Used for:** Displayed on the stats page. Determines narrative branches for sickness, quarantine, and recovery.

### `$plagueRevealed`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (plague not yet revealed/acknowledged), `1` (plague revealed)
- **Initial value:** `0`
- **Used for:** Controls whether infected NPC health is displayed as "healthy" (hidden) or "infected" (revealed) in the sidebar

### `$quarantine`
- **Type:** Integer
- **Range:** 0 -- 6
- **Possible values:** `0` through `6`
- **Key states:**
  - `0` = not in quarantine
  - `1` through `4` = weeks of quarantine (progressive states)
  - `5`, `6` = later quarantine stages
- **Notes:** Incremented with `$quarantine += 1`. Quarantine passages check specific values to determine narrative progression.

### `$quarantineSwapped`
- **Type:** String
- **Possible values:** `""` (empty, default), `"master"`, `"extended"`
- **Used for:** Tracks which other household the player has swapped into during quarantine (master's household or extended family)

### `$searcherbribe`
- **Type:** String or Integer
- **Possible values:** `1` (bribed), `"no"` (did not bribe)
- **Used for:** Tracks whether the player bribed the searcher of the dead

### `$plagueclothes`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (no plague clothes), `1` (has plague clothes)
- **Used for:** Whether the player purchased or obtained plague-protective clothing

### `$apothecary`
- **Type:** Integer
- **Possible values:** `1`
- **Used for:** Flags that the player has visited the apothecary

### `$fever`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 20)`
- **Trigger:** `$fever is 1` (5% chance)
- **Used for:** Random non-plague fever event

---

## Household NPCs

### `$NPCs`
- **Type:** Array of objects
- **Object properties:** `{ name, agenum, age, relationship, health, location }`
  - `health` values: `"healthy"`, `"infected"`, `"deceased"`, `"recovered"`
  - `relationship` values include: `"husband"`, `"wife"`, `"son"`, `"daughter"`, `"child"`, `"mother"`, `"father"`, `"brother"`, `"sister"`, `"apprentice"`, `"ward"`, `"friend's son"`, `"friend's daughter"`, `"friend's child"`, `"niece"`, `"nephew"`, `"cousin"`, etc.
- **Used for:** The player's immediate household members. Sorted by agenum (descending) for display. Members can die, recover, or be moved to other arrays.

### `$NPCsMaster`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Used for:** Members of the player's master's household (only populated when `$socio` is `"servants"`)
- **Dependency:** `$socio is "servants"` and `$masterStatus`

### `$NPCsExtended`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Used for:** Extended family members (aunts, uncles, cousins, etc.) who live elsewhere in London

### `$NPCsServants`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Used for:** Household servants (only populated when `$socio` is `"nobles"` or `"merchants"`)

### `$FledFamily`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Initial value:** `[]`
- **Used for:** Household members who have fled the city. Populated from `$NPCs` when the player sends family away.
- **Dependency:** `$fled` value of `5` triggers display of this array instead of `$NPCs`

### `$FledServants`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Initial value:** `[]`
- **Used for:** Servants who have fled the city

### `$SavedNPCs`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Initial value:** `[]`
- **Used for:** Temporarily stores the player's original household NPCs when they swap to quarantine with another household (master's or extended family)
- **Dependency:** Used by `swap-to-other-hh` widget

### `$SavedServants`
- **Type:** Array of objects (same structure as `$NPCs`)
- **Initial value:** `[]`
- **Used for:** Temporarily stores servants when swapping households for quarantine

### `$masterStatus`
- **Type:** String
- **Possible values:** `""` (empty/not applicable), `"artisans"`, `"merchants"`, `"nobles"`
- **Set by:** `either("artisans", "merchants", "nobles")` when `$socio` is `"servants"`
- **Dependency:** Only meaningful when `$socio is "servants"`
- **Used for:** Determines master's household size and composition

---

## NPC Name Pools

### `$fNames`
- **Type:** Object (weighted map of `{name: weight}`)
- **Used for:** Pool of female first names for NPC generation via `weightedEither($fNames)`
- **Contains:** 86 names with weights. Common names (Elizabeth: 400, Anne: 370, Mary: 300) are heavily weighted; rare names have weight 10.
- **Modified by:** Origin-based multipliers (e.g., Irish origin boosts Bridget, Honora, etc. by 5x)
- **Dependency:** Modified based on `$origin`

### `$mNames`
- **Type:** Object (weighted map of `{name: weight}`)
- **Used for:** Pool of male first names for NPC generation via `weightedEither($mNames)`
- **Contains:** 113 names with weights. Common names (John: 1500, Thomas: 1300, William: 1300) are heavily weighted; rare names have weight 10.
- **Modified by:** Origin-based multipliers (same as `$fNames`)
- **Dependency:** Modified based on `$origin`

### `$nbNames`
- **Type:** Array of strings
- **Value:** `["Thomas", "Thomasina", "Charlotte", "Charles", "Philippa", "Phillip", "John", "Joan"]`
- **Used for:** Name pool for nonbinary NPCs. Uses `.pluck()` (SugarCube method that removes and returns a random element).

---

## NPC Generation Helpers

### `$NPCAge`
- **Type:** String
- **Possible values:** `"infant"`, `"child"`, `"adolescent"`, `"young adult"`, `"middle-aged adult"`, `"elderly adult"`
- **Set by:** `setAge` widget based on `$NPCAgeNum`:
  - &ge; 60 &rarr; `"elderly adult"`
  - &ge; 30 &rarr; `"middle-aged adult"`
  - &ge; 16 &rarr; `"young adult"`
  - &ge; 10 &rarr; `"adolescent"`
  - &ge; 5 &rarr; `"child"`
  - < 5 &rarr; `"infant"`
- **Dependency:** Derived from `$NPCAgeNum`

### `$NPCAgeNum`
- **Type:** Integer
- **Set by:** `random($minAge, $maxAge)` in the `setAge` widget
- **Dependency:** Derived from `$minAge` and `$maxAge`

### `$minAge` / `$maxAge`
- **Type:** Integer
- **Used for:** Temporary bounds for NPC age generation. Set before calling `setAge` widget.
- **Dependency:** Computed from player's `$agenum`, parent ages (`$FatherAge`, `$MotherAge`), or other NPC ages

### `$FatherAge` / `$MotherAge`
- **Type:** Integer
- **Set by:** `$FatherAge to $NPCAgeNum` / `$MotherAge to $NPCAgeNum` when generating parent NPCs
- **Used for:** Computing age ranges for siblings and other family members
- **Dependency:** Set from `$NPCAgeNum` during parent NPC generation

### `$hasFather` / `$hasMother`
- **Type:** Boolean
- **Possible values:** `true`, `false`
- **Used for:** Tracks whether the player has a living father/mother NPC in the household

### `$fkidRel` / `$mkidRel`
- **Type:** String
- **Possible values for `$fkidRel`:** `"friend's daughter"`, `"cousin's daughter"`, `"cousin"`
- **Possible values for `$mkidRel`:** `"friend's son"`, `"cousin's son"`, `"cousin"`
- **Used for:** Relationship labels for children of a new guardian when the player is orphaned
- **Dependency:** Determined by the type of new guardian (family friend, cousin, or other)

### `$fRelationships`
- **Type:** Object (weighted map)
- **Used for:** Weighted relationship labels for female NPC generation in plague worker (nurse/searcher/corpsebearer) contexts. Called via `weightedEither($fRelationships)`.
- **Notes:** Initialized and used only in the plague worker NPC generation path

---

## Pronoun / Grammar Arrays

### `$childRole`
- **Type:** Array of strings
- **Value:** `["son", "daughter", "child"]`
- **Used for:** Indexed by gender for child NPC relationship labels

### `$article`
- **Type:** Array of strings
- **Value:** `["a", "an"]`
- **Used for:** Grammar helper indexed by context

### `$heshe`
- **Type:** Array of strings
- **Value:** `["he", "she", "they"]`
- **Used for:** Subject pronoun selection based on gender index

### `$hishers`
- **Type:** Array of strings
- **Value:** `["his", "hers", "theirs"]`
- **Used for:** Possessive pronoun selection based on gender index

---

## Remedies and Fumigants

### `$fumes`
- **Type:** Object with named sub-objects
- **Structure:** Each key maps to `{ name: String, quantity: Integer, cost: Integer }`
- **Keys and costs (in pence):**
  - `Incense` &mdash; "incense to burn in your home to prevent plague and clear out rooms after infection" (cost: 36)
  - `Purse` &mdash; "a purse of incense" (cost: 60)
  - `Fancy` &mdash; "St. Giles Powder" (cost: 192)
  - `Generic` &mdash; "brimstone and saltpeter with a little myrrh" (cost: 24)
- **Used for:** Purchased plague prevention items. Quantity tracks how many the player owns.

### `$remedies`
- **Type:** Object with named sub-objects
- **Structure:** Each key maps to `{ name: String, quantity: Integer, cost: Integer }`
- **Keys and costs (in pence):**
  - `Plaster` &mdash; "a blistering plaster to break the buboes and draw out malignity" (cost: 21)
  - `Celestial` &mdash; "celestial water" (cost: 36)
  - `Treacle` &mdash; "a posset of London Treacle" (cost: 36)
  - `Suppository` &mdash; "a suppository of a fig filled with salt" (no cost listed)
  - `Cordial` &mdash; "a cordial tincture to be drunk for two days after infection" (cost: 12)
  - `Immodium` &mdash; "an anti-diarrheal posset made of plantain, sorrel, or knot grass" (cost: 0)
- **Used for:** Purchased plague treatment items. Quantity tracks how many the player owns.

---

## Fleeing / Flight Status

### `$fled`
- **Type:** Integer
- **Range:** 0 -- 7
- **Possible values and meanings:**
  - `0` &mdash; Stayed in the city with master (servants who stayed)
  - `1` &mdash; Followed master and fled the city (servants who fled with master)
  - `2` &mdash; Broke contract and fled the city (servants; socio changes to "beggars")
  - `3` &mdash; Broke contract and stayed in the city (servants; socio changes to "beggars")
  - `4` &mdash; Remained in the city with entire household (non-servants who stayed)
  - `5` &mdash; Sent household away but stayed in the city (family fled, player remained)
  - `6` &mdash; Fled the city with household (fully fled)
  - `7` &mdash; Failed flight attempt (artisans with low reputation; tried to flee but were turned away)
- **Notes:** Values 0--3 are primarily for servants. Values 4--7 are for other social classes. A value of `5` triggers display of `$FledFamily` instead of `$NPCs` in the sidebar. `$fled` can change over time as the player gets additional flee opportunities.

### `$getaway`
- **Type:** Array of objects
- **Used for:** Tracks NPCs who successfully escape during flight events. Objects are pushed into the array and its length is checked.
- **Dependency:** Populated during the "Fled" passage

### `$beggarsluck`
- **Type:** Integer
- **Set by:** `random(0, 5)`
- **Trigger:** `$beggarsluck eq 0` triggers a lucky event for beggars
- **Dependency:** Only rolled when `$socio is "beggars"`

### `$seeking`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not seeking), `1` (seeking a spouse)
- **Used for:** Whether the player is actively looking for a marriage partner
- **Dependency:** Interacts with `$wedding`

---

## Family / Life Events

### `$pregnant`
- **Type:** Integer
- **Possible values:** `0` (not pregnant), `1` through `9` (months of pregnancy counter)
- **Set by:** `0` initially; set to `1` to begin pregnancy; set to `4` in some paths; incremented with `$pregnant += 1` each month
- **Trigger:** `$pregnant is 9` triggers birth. `$pregnant is 4` is an intermediate milestone.
- **Dependency:** Only applicable when `$gender is "female"` and `$relationship is "married"`

### `$miscarriage`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)`
- **Trigger:** `$miscarriage is 1` (10% chance) causes a miscarriage
- **Dependency:** Only checked during pregnancy

### `$wedding`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)`
- **Trigger:** `$wedding is 1` (10% chance) triggers a wedding event
- **Dependency:** Interacts with `$seeking`

### `$elderly`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 30)`
- **Trigger:** `$elderly is 1` (3.3% chance) triggers an elderly death event
- **Dependency:** Only checked for elderly NPCs

---

## Random Event Rolls

### `$accident`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 5)`, `random(0, 5)`, or `random(1, 20)` depending on context
- **Trigger values:** `$accident is 1` through `$accident is 4` trigger different accident types
- **Used for:** Random accident events that affect NPCs or the player

### `$death`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 5)` or `random(1, 10)`
- **Trigger values:**
  - `1` = death outcome
  - `2` = different death outcome
  - `3` or `4` = alternate outcomes
- **Used for:** Determines whether an NPC or player dies from non-plague causes

### `$murder`
- **Type:** Integer
- **Possible values:** `0` (no murder), `1` (murder occurred)
- **Set by:** `$murder = 0` or `$murder = 1`
- **Checked with:** `$murder gte 1`, `$murder lte 1`
- **Used for:** Tracks whether a murder event has occurred

### `$runover`
- **Type:** Integer (random event roll)
- **Set by:** `random(0, 5)` or `random(1, 30)`
- **Trigger:** `$runover is 1` triggers a run-over-by-cart event

### `$discovery`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)`
- **Trigger:** `$discovery is 1` (10% chance) triggers a discovery event

### `$gossip`
- **Type:** Integer
- **Possible values:** `3`
- **Set by:** `$gossip to 3`
- **Used for:** A gossip event counter or flag

### `$investigate`
- **Type:** Integer
- **Possible values:** `0`
- **Set by:** `$investigate to 0`
- **Used for:** Resets an investigation state

### `$impressed`
- **Type:** Integer
- **Range:** 0+
- **Initial value:** `0`
- **Modified by:** `$impressed += 1` (incremented by player choices)
- **Trigger:** `$impressed gte 2` triggers a special outcome (e.g., being impressed into service)

---

## Story / Game State

### `$decisions`
- **Type:** Array of objects
- **Object structure:** `{ text: String, money: Integer, repDelta: Integer, repBefore: Integer, infectPct: Number|null }`
  - `text` &mdash; Description of the decision (e.g., "Dec 1664: Celebrated Christmas with a feast")
  - `money` &mdash; Money gained or lost from this decision
  - `repDelta` &mdash; Change in reputation from this decision
  - `repBefore` &mdash; Reputation before the decision
  - `infectPct` &mdash; Infection probability percentage associated with this decision, or `null`
- **Initial value:** `[]`
- **Used for:** Tracks all major player decisions throughout the game. Displayed at the end of the game as a summary.

### `$reputation`
- **Type:** Integer
- **Range:** 0 -- 10 (clamped via `Math.clamp($reputation + N, 0, 10)`)
- **Initial values by `$socio`:**
  - `"beggars"`: `0`
  - `"day labourers"`: `6`
  - `"servants"`: `6`
  - `"artisans"`: `8`
  - `"merchants"`: `8`
  - `"nobles"`: `10`
- **Modified by:** Various increments/decrements (`+= 1`, `-= 1`, `+= 2`, `-= 2`, `+= 3`, `-= 3`, or set to `0` for contract-breaking). Always clamped to 0--10.
- **Used for:** Affects flee success (artisans with reputation <= 5 may fail to flee), available choices, and narrative outcomes

### `$timeline`
- **Type:** Array of strings
- **Value:** `["December 1664", "January 1665", "May 1665", "June 1665", "July 1665", "August 1665", "September 1665", "October 1665", "November 1665", "December 1665", "January 1666", "February 1666", "March 1666", "April 1666", "May 1666", "June 1666", "July 1666", "August 1666", "September 1666", "October 1666", "November 1666", "December 1666"]`
- **Used for:** Ordered list of game months. Used with `$monthIndex` for time-based navigation.
- **Note:** February through April 1665 are deliberately omitted (the plague had not yet reached London)

### `$monthIndex`
- **Type:** Integer
- **Set by:** `$timeline.indexOf(passage())` &mdash; index of the current passage name in the timeline array
- **Used for:** Time offset calculations (e.g., `$monthIndex + _timeOffset`)
- **Dependency:** Derived from `$timeline` and the current passage name

### `$textGroup`
- **Type:** Integer
- **Initial value:** `1`
- **Modified by:** `$textGroup += 1` after each text block during quarantine/sickness passages
- **Used for:** Tracks which text block to show next in multi-part quarantine sequences

### `$return`
- **Type:** Used internally by SugarCube
- **Notes:** Part of the `<<return>>` macro for navigation back to the previous passage

### `$args`
- **Type:** Array (SugarCube built-in)
- **Notes:** `$args` is used within widgets to access arguments passed to the widget. For example, `$args[0]` retrieves the first argument. This is a SugarCube framework variable, not a game-specific variable.

### `$type`
- **Type:** Integer (random event type selector)
- **Set by:** `random(1, 5)`
- **Possible values:** `1`, `2`, `3`, `4`, `5`
- **Used for:** Selects which variant of an event to display

---

## Plague Worker Variables

### `$apprentice`
- **Type:** Integer
- **Possible values:** `0` (no apprentice), `1` (eligible for apprentice event), `2` (apprentice NPC added)
- **Set by:** `0` initially; `random(1, 10)` to check eligibility; `2` after adding an apprentice NPC
- **Trigger:** `$apprentice is 1 and hasVisited(...)` triggers the add-apprentice event

### `$worker`
- **Type:** Integer
- **Possible values:** `0` (no worker kid), `1` (eligible), `2` (worker kid NPC added)
- **Set by:** Same pattern as `$apprentice`
- **Trigger:** `$worker is 1 and hasVisited(...)` triggers the add-worker-kid event

### `$ward`
- **Type:** Integer
- **Possible values:** `0` (no ward), `1` (eligible), `2` (ward NPC added)
- **Set by:** `0` or `random(1, 10)` initially; `2` after adding a ward NPC
- **Trigger:** `$ward is 1 and hasVisited(...)` triggers the add-ward event

### `$steward`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 40)`
- **Trigger:** `$steward is 1` (2.5% chance) triggers a steward event

### `$servants`
- **Type:** Integer (count of servants)
- **Set by:** `random(1, 3)` for merchants/artisans; `random(8, 12)` for nobles
- **Used for:** Initial number of servant NPCs to generate for the household

---

## Parish Lookup Tables

These are weighted objects mapping parish names to their relative population weights (based on historical plague death counts). Used by the `parish` widget to randomly assign `$parish` based on `$location`.

### `$wallParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 97 parishes inside the City walls
- **Example entries:** "Christ Church" (140), "St Gregory by St Paul's" (118), "St Stephen Coleman Street" (133)

### `$WestmParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 5 Westminster parishes
- **Entries:** "St Clement Danes" (534), "St Paul Covent Garden" (133), "St Martin in the Fields" (1242), "St Mary Savoy" (80), "St Margaret Westminster" (807)

### `$eParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 6 eastern suburb parishes
- **Entries:** "Holy Trinity Minories" (12), "St Katharine Tower" (200), "St Mary Whitechapel" (671), "St Dunstan Stepney" (1392), "St Botolph Aldgate" (785), "St John at Hackney" (80)

### `$wParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 5 western suburb parishes
- **Entries:** "St Andrew Holbom" (843), "Bridewell Precinct" (34), "St Bride" (412), "St Dunstan West" (265), "St Sepulchre" (851)

### `$nParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 11 northern suburb parishes
- **Entries include:** "St Giles Cripplegate" (1353), "St Giles in the Field" (931), "St Botolph Bishopsgate" (545)

### `$sParishes`
- **Type:** Object (`{parishName: weight}`)
- **Contains:** 8 southern suburb parishes
- **Entries include:** "St Olave Southwark" (829), "St Saviour Southwark" (605), "St Mary Magdalen Bermondsey" (305)

---

## Variables Used in Commented-Out / Unused Code

### `$shop`
- **Type:** Used in a commented-out shop widget
- **Notes:** Part of a `<<shop $player _item 1>>` call in commented-out code. Not active in the current game.

### `$player`
- **Type:** Used in a commented-out shop widget
- **Notes:** Referenced alongside `$shop`. Not active in the current game.

### `$trades`
- **Type:** Referenced via `weightedEither($trades)` during character generation for artisans
- **Notes:** Used to assign a trade to the player, but the initialization and specific trade values are not visible in the current passage data.

### `$food`
- **Type:** String (player selection)
- **Set by:** Listbox selection from local array `_food = ["minced pie", "sweetmeats", "currant cake", "syllabub", "tansy"]`
- **Used for:** Christmas feast flavor text in December 1664
