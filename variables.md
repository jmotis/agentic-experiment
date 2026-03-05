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
- **Can change to:** `"married"` (via wedding event), `"widowed"` (if spouse NPC dies, via `check-widowed` widget)
- **Dependency:** `$age` determines which weight table is used

### `$religion`
- **Type:** String
- **Possible values:** `"member of the Church of England"`, `"member of a dissident Protestant church"`, `"Presbyterian"`, `"Baptist"`, `"Quaker"`, `"Catholic"`
- **Set by:** `random-character` widget via `weightedEither({"member of the Church of England": 9209, "member of a dissident Protestant church": 758, "Catholic": 33})`. If assigned `"member of a dissident Protestant church"`, a second roll picks: `either("Presbyterian", "Baptist", "Quaker")`
- **Notes:** `"Catholic"` and `"Quaker"` trigger special narrative branches

### `$origin`
- **Type:** String
- **Possible values (at character creation):** `"London"`, `"the English countryside"`, `"another English town or city"`, `"Scotland"`, `"Ireland"`, `"the Dutch Republic"`, `"France"`, `"somewhere else"`
- **Possible values (during gameplay, after bio passage):** All of the above except `"somewhere else"`, which is immediately refined in `bio.txt` (pid 1) to one of: `"the Holy Roman Empire"`, `"Italy"`, `"Spain"`, `"the Americas"`. After character creation, `$origin` is **never** `"somewhere else"` during gameplay.
- **Set by:** `random-character` widget via `weightedEither` with weights: London (30), English countryside (200), another English town or city (20), Scotland (20), Ireland (20), Dutch Republic (5), France (4), somewhere else (1)
- **Used for:** Name pool weighting (certain names get boosted 5x based on origin — the boost for `"somewhere else"` fires via `<<playerName>>` before bio.txt refines the value), flee destination text, narrative branches
- **Note:** All conditional checks consistently use `"the Dutch Republic"` (uppercase "R").

### `$socio`
- **Type:** String (social class)
- **Possible values:** `"beggars"`, `"day labourers"`, `"servants"`, `"artisans"`, `"merchants"`, `"nobles"`
- **Set by:** `random-character` widget via `weightedEither({"day labourers": 1820, "servants": 1820, "artisans": 600, "merchants": 80, "nobles": 8, "beggars": 4000})`
- **Can change to:** `"beggars"` (if a servant breaks their contract)
- **Used for:** Income/expense levels, household size, flee options, NPC generation, narrative branching. This is one of the most heavily used variables in the game.

### `$role`
- **Type:** String
- **Possible values:** `"0"` (none/default), `"searcher"`, `"nurse"`, `"corpsebearer"`, `"warder"`, `"mercer"`, `"draper"`, `"ironmonger"`, `"goldsmith"`
- **Set by:** Initially `"0"` for most social classes. **Exception:** `$socio is "merchants"` — `$role` is set during character creation to `either($trades)`, which picks randomly from `["mercer", "draper", "ironmonger", "goldsmith"]`. Changes to a plague worker role when the player takes a plague job. Male/nonbinary Church of England members have a 50/50 chance of being assigned `"corpsebearer"` or `"warder"`.
- **Dependency:** `$socio` determines which roles are available. `$role` affects income and narrative options.
- **Notes on plague worker roles:** Only `"searcher"`, `"nurse"`, `"corpsebearer"`, and `"warder"` activate plague-work narrative content and infection risk logic. Merchant trade roles (`"mercer"` etc.) are display-only — no plague work content is implemented for merchants.
- **Notes on warder role:** Warders stand guard outside quarantined houses to prevent escape. They earn a flat 48d. per month (not per-corpse), their monthly plague risk is doubled compared to other plague workers, and they take a −1 reputation hit upon accepting the job.

### `$hoh`
- **Type:** Integer (head-of-household status flag)
- **Possible values:** `0`, `1`, `2`, `3`, `4`
  - `0` — **Child:** Player is under 16 (`$agenum lte 15`) and has no independent legal standing.
  - `1` — **Independent head of household:** Player is 16+ and runs their own household. Conditions:
    - Male, `$agenum gte 16`, no father or step-father in `$NPCs`, and either not a servant (`$socio isnot "servants"`) or a servant whose master/mistress lives in a separate household (`$NPCsMaster`).
    - Female, `$agenum gte 16`, no parent (mother, step-mother, father, step-father) or husband in `$NPCs`, and either not a servant or a servant whose master/mistress lives in a separate household.
  - `2` — **Living with parents:** Player is 16+ and could be legally independent but currently resides in a parental household. Conditions:
    - Male, `$agenum gte 16`, father or step-father present in `$NPCs`.
    - Female, `$agenum gte 16`, any parent (mother, step-mother, father, step-father) present in `$NPCs`.
    - *Note:* For males, only a father/step-father triggers this status because an adult man living with only his widowed mother is typically the head of that household. For females, any surviving parent in the household maintains parental authority.
  - `3` — **Servant in master's household:** Player is 16+, `$socio is "servants"`, and lives in the same household as their master/mistress (master/mistress NPC is in `$NPCs`). Conditions:
    - Male, `$agenum gte 16`, master or mistress present in `$NPCs`.
    - Female, `$agenum gte 16`, master or mistress present in `$NPCs`.
  - `4` — **Married woman (coverture):** Player is a married woman whose legal identity is subsumed under her husband's. Conditions:
    - Female, `$agenum gte 16`, `$relationship is "married"` or husband present in `$NPCs`.
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** Evaluated during character generation (after household NPCs are placed) and reassessed whenever `$socio` or `$relationship` changes, or when a parent NPC in `$NPCs` dies. When multiple conditions overlap, later values take priority (evaluated in ascending order 1→2→3→4), so coverture (4) overrides servant status (3), which overrides parental household (2), which overrides independent (1).
- **Used for:** Determines whether the player makes household decisions independently or must convince family members. Also affects flee options, will-writing, and other household-level choices.
- **Dependencies:** `$agenum`, `$gender`, `$socio`, `$relationship`, `$NPCs` (specifically the `relationship` field of NPC objects — checks for `"father"`, `"step-father"`, `"mother"`, `"step-mother"`, `"husband"`, `"master"`, `"mistress"`), `$NPCsMaster`

### `$disability`
- **Type:** Integer or String
- **Possible values:** `0` (no disability), `"hard of hearing"`, `"crooked back"`, `"weak legs"`, `"speech impediment"`, `"asthma"`, `"epilepsy"`, `"poor eyesight"`
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** Character generation in the `bio` passage (pid 1). Elderly adults (`$age is "elderly adult"`) have a 1-in-3 chance of receiving `"hard of hearing"`. All other characters (and non-hard-of-hearing elderly adults) have a 1-in-10 chance of receiving one of the six general disabilities chosen at random via `either()`.
- **Used for:** Bio text variants (disabled beggars get a pity-themed intro; disabled merchants/artisans get a "despite your disability" clause). Disabled beggars receive 2× alms from all beggar-choice widget options. Also checked in `beggar-roles` (pid 54) and `navy-volunteer` (pid 102).
- **Dependencies:** `$age` (determines eligibility for `"hard of hearing"`), `$socio` (determines bio text variant and alms doubling for beggars)

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
- **Base values by `$socio`:** beggars `120`, day labourers `300`, servants `300` (child `40`, adolescent `80`), artisans `800`, merchants `4000`, nobles `17600`
- **Gender scaling:** Day labourers, artisans, merchants, servants: adult male = base rate, adult female = 0.8 × base rate (applies to player and NPC adults). Beggars: inverted gender (female = base, male = 0.8 × base) for every NPC regardless of age.
- **Household scaling:** Day labourers/artisans: NPC adults contribute at gender-based rate, children +40d, adolescents +80d. Servants: NPC adults contribute at gender-based rate, NPC children/adolescents contribute nothing. Merchants: NPC adults contribute at gender-based rate, children/adolescents contribute nothing. Beggars: every NPC contributes at inverted-gender rate. Nobles: flat income.
- **Dependency:** Set based on `$socio`, `$age`, `$gender`, `$role`, and living `$NPCs` ages/genders; changes if the player takes a plague worker role

### `$expenses`
- **Type:** Integer (monthly expenses in pence)
- **Base values by `$socio`:** beggars `114`, day labourers `240`, servants `220` (child/adolescent `20`), artisans `560`, merchants `2800`, nobles `12800`
- **Household scaling:** Base is multiplied by total household weight: player = 1.0, plus each living NPC in `$NPCs` and `$NPCsServants` weighted by age (infant 0.2, child 0.4, adolescent 0.6, young adult 0.8, middle-aged adult 1.0, elderly adult 0.8). Servant child/adolescent players have flat 20d expenses (no scaling).
- **Dependency:** Set based on `$socio`, `$age`, and living members of `$NPCs` and `$NPCsServants`

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

### `$masterGender`
- **Type:** String
- **Possible values:** `""` (empty/not applicable), `"male"`, `"female"`
- **Set by:** `weightedEither({"male": 4, "female": 1})` inside the `addMasterHousehold` widget (~80% male, ~20% female)
- **Dependency:** Only meaningful when `$socio is "servants"`
- **Used for:** Determines the master NPC's name pool (male or female names) and pronoun selection in narrative text. A female master is implicitly widowed (running the household after her husband's death).

### `$masterTitle`
- **Type:** String
- **Possible values:** `""` (empty/not applicable), `"master"`, `"mistress"`
- **Set by:** Derived from `$masterGender` inside the `addMasterHousehold` widget — `"mistress"` when female, `"master"` when male
- **Dependency:** Depends on `$masterGender`; only meaningful when `$socio is "servants"`
- **Used for:** Display term used in all narrative text that references the player's master/mistress (e.g., "Your $masterTitle decides to flee"). The NPC's `relationship` field remains `"master"` regardless of gender for code compatibility.

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

### `$fledFromIndex`
- **Type:** Integer
- **Set by:** `$monthIndex` at the start of the Fled passage (pid 63)
- **Used for:** Records which timeline index the player fled from, so that the Fled passage can hide return options that would send the player backwards in time (preventing time-travel bug)
- **Dependency:** Derived from `$monthIndex`

### `$fledReturn`
- **Type:** String
- **Possible values:** `"official"`, `"no-plague"`
- **Set by:** Fled passage (pid 63) when player chooses how long to stay away
- **Used in:** official-end passage (pid 87) to branch between the "official Thanksgiving Day" ending and the "no more plague deaths" ending
- **Notes:** Only relevant when the player has fled the city and chosen one of the two longest stay-away options.

### `$getaway`
- **Type:** Array of objects
- **Used for:** Tracks NPCs who successfully escape during flight events. Objects are pushed into the array and its length is checked.
- **Dependency:** Populated during the "Fled" passage

### `$beggarsluck`
- **Type:** Integer (temporary money-quantity variable)
- **Set by:**
  - `random(6, 10)` in `begging-success` (pid 52) — used as pence earned from roadside begging
  - `random(2, 6)` in `good-neighbors` (pid 53) — used as pence saved through neighbor charity
- **Used for:** Holds a small random pence amount that is immediately added to `$money` and then `<<unset>>`. It is a display variable only (shown in the passage text as the amount earned/saved) and is never checked in a conditional.
- **Dependency:** Only set when `$socio is "beggars"` and the player takes a begging or charity action.

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
- **Set by:** `random(1, 100)`
- **Trigger:** `$miscarriage lte _miscarriageThreshold` causes a miscarriage. Threshold scales with `$agenum`: 10% (age ≤ 25), 15% (age 26–35), 20% (age 36), 25% (age 37), 30% (age 38), 35% (age 39), 40% (age 40).
- **Dependency:** Only checked during pregnancy. Can now fire at any pregnancy stage (including pre-notification stages 2–3). At stages ≤ 3 the player sees a softer message ("thought you might be pregnant"); at stages 5+ the standard miscarriage message is shown.

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

### `$lodger`
- **Type:** Integer
- **Possible values:** `0` (no lodgers), `1` (lodgers accepted)
- **Set by:** `0` in StoryInit; set to `1` by `<<lodger-choice>>` widget when the player accepts lodgers
- **Used for:** Tracks whether the player has taken in lodgers. When `1`, lodger rent is added to monthly income via the `<<income>>` widget.
- **Dependency:** Only offered in October 1666 to players in non-fire parishes whose `$socio` is not `"nobles"` or `"beggars"`

### `$lodgerRent`
- **Type:** Integer (pence per month)
- **Possible values:** `0` (default), `10`, `20`, `40` (low rent), `20`, `40`, `80` (high rent)
- **Set by:** `0` in StoryInit; set by `<<lodger-choice>>` widget based on `$socio` and the player's rent choice (low = base rate, high = 2x base rate)
- **Used for:** Added to `$income` each month when `$lodger is 1`. Base rent by class: day labourers/servants 10d., artisans 20d., merchants 40d.
- **Dependency:** Requires `$lodger is 1` to have any effect

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
- **Possible values:** `0` (no murder accusation), `1` (accused of murder)
- **Set by:** `$murder = 0` or `$murder = 1`
- **Checked with:** `$murder gte 1`, `$murder lte 1`
- **Used for:** Tracks whether the player was accused of murder by sending people to the pesthouse

### `$runover`
- **Type:** Integer (random event roll)
- **Set by:** `random(0, 5)` or `random(1, 30)`
- **Trigger:** `$runover is 1` triggers a run-over-by-cart event

### `$discovery`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)`
- **Trigger:** `$discovery is 1` (10% chance) triggers a discovery event
- **Used for:** Tracks whether the player was discovered attempting to join the Navy when ineligible

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
  - `"beggars"`: `4`
  - `"day labourers"`: `6`
  - `"servants"`: `6`
  - `"artisans"`: `6` (default; no per-socio override)
  - `"merchants"`: `6` (default; no per-socio override)
  - `"nobles"`: `8`
- **Modified by:** Various increments/decrements (`+= 1`, `-= 1`, `+= 2`, `-= 2`, `+= 3`, `-= 3`, or `-3` for noble end-game/fled too late). Always clamped to 0--10.
- **Used for:** Affects flee success (artisans with reputation <= 5 may fail to flee), available choices, narrative outcomes, and church office eligibility

### `$office`
- **Type:** String
- **Possible values:** `""` (no office), `"Churchwarden"`, `"Overseer of the Poor"`
- **Initial value:** `""` (set in `char-gen-widgets`, pid 14)
- **Set by:** The `hold-office` widget (pid 114) when an eligible player accepts a church office position.
- **Eligibility:** `$socio` is `"artisans"` or `"merchants"`, `$religion` is `"member of the Church of England"`, `$gender` is `"male"`, `$agenum gte 30`, `$reputation gte 8`, and `$office` is `""`. If eligible, there is a 25% chance per month of being offered an office, with equal odds of Churchwarden or Overseer of the Poor.
- **Removal conditions:** Removed (reset to `""`) with &minus;1 reputation if `$reputation lte 4`, or if the player flees (enters the Fled passage, pid 63).
- **Displayed in:** Household Status (pid 74) as "Office: $office" beneath "Social class" when not empty.
- **Dependencies:** Interacts with `$reputation` (eligibility threshold, removal threshold, +1 on acceptance, &minus;1 on removal).

### `$skipServices`
- **Type:** Integer
- **Possible values:** `0` (attend services / ask each month), `1` (always skip)
- **Initial value:** `0`
- **Set by:** `random-character` widget (pid 14) initializes to `0`. Set to `1` when the player chooses "Always avoid Church of England services" in the `church-services` widget.
- **Used for:** Controls whether non-Church of England characters skip weekly parish church services. When `1`, the 48d. fine is applied automatically each month without prompting the player. The &minus;1 reputation penalty only fires on the first skip (tracked by `$churchSkipRepPenalty`). Only available to characters not in debt (`$money gte 0`). Does not apply in April 1666 (Easter has its own service code).
- **Dependency:** Only meaningful when `$religion isnot "member of the Church of England"`. Interacts with `$money` (fine) and `$reputation` (penalty). Reset to `0` by the `debt-check` widget when the player enters debt, which also sets `$debtForcedAttend` to `1`.

### `$churchSkipRepPenalty`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (reputation penalty not yet applied), `1` (reputation penalty already applied)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `church-services` widget (pid 115) sets this to `1` the first time a non-Church of England character skips church services.
- **Used for:** Ensures the &minus;1 reputation penalty for skipping Church of England services only fires once (on the first skip). The 48d. monetary fine continues to apply every month the player skips.
- **Dependencies:** Interacts with `$reputation`, `$skipServices`, and `$religion`.

### `$billSubscribed`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not subscribed), `1` (subscribed to Bills of Mortality)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `bill-subscribe` widget (pid 114) when the player accepts the subscription offer in May 1665. Set to `1` on acceptance.
- **Used for:** Controls whether the player receives monthly Bills of Mortality reports showing total burials and plague deaths in their parish. When `1`, the `corpse-work` widget (pid 114) deducts 4d. per month and displays a burial report at the top of each month passage.
- **Suppression:** Reports are suppressed when `$role is "searcher"` or `$role is "corpsebearer"`, since those roles already receive equivalent information through their plague work duties.
- **Dependencies:** Interacts with `$money` (4d. monthly charge), `$corpseBuried` and `$corpsePlague` (data source), `$parish` and `$monthIndex` (data lookup), `$role` (suppression logic). Reset to `0` by the `debt-check` widget when the player enters debt.

### `$debtWarned`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not yet warned), `1` (debt warning has fired)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `debt-check` widget (pid 114) sets this to `1` the first time `$money` falls below 0 after a monthly disposable-income calculation. Once set to `1`, it is never reset.
- **Used for:** Prevents the debt warning message and recurring-cost cancellation logic from firing more than once. When the player first enters debt, the `debt-check` widget cancels `$billSubscribed` and `$skipServices` (if active) and displays a one-time notification.
- **Dependencies:** Checked alongside `$money` in the `debt-check` widget. Interacts with `$billSubscribed`, `$skipServices`, and `$debtForcedAttend`.

### `$debtForcedAttend`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not applicable), `1` (player was forced back to attending Church of England services due to debt)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `debt-check` widget (pid 114) sets this to `1` when `$skipServices` is reset from `1` to `0` due to the player entering debt.
- **Used for:** In the `church-services` widget (pid 115), when `$debtForcedAttend is 1` and `$money lt 0`, the player is automatically enrolled in Church of England services (2% plague infection risk) with a message explaining they cannot afford the fine for non-attendance. Once `$money` recovers to &ge; 0, the normal three-way choice (always skip / skip this month / attend) is presented again.
- **Dependencies:** Interacts with `$skipServices`, `$money`, `$religion`, and `$plagueInfection`.

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

### `$fireParishes`
- **Type:** Array of strings
- **Set by:** `StoryInit` (pid 10)
- **Contains:** ~80 parish names that were destroyed by the Great Fire of London (September 1666). All entries are parishes within the City walls.
- **Used by:** `September 1666` (pid 31), `October 1666` (pid 32), and `official-end` (pid 87) via `$fireParishes.includes($parish)` to determine whether the player's parish was in the path of the fire.

### `$parishRate`
- **Type:** Object (`{parishName: [Integer x 22]}`)
- **Set by:** `StoryInit` (pid 10)
- **Contains:** Parish names mapped to an array of 22 integers (one per month in `$timeline`), representing the plague infection rate denominator for that parish in that month. A higher number means lower risk (the game rolls `random(1, rate) eq 1`).
- **Used by:** Infection probability calculations in multiple month passages (e.g., July 1665, October 1665, September 1665) and `final-stats-widgets` (pid 75). Accessed as `$parishRate[$parish][$monthIndex]`.

---

## Bills of Mortality Data (Corpse Interactions)

These lookup tables provide historical Bills of Mortality burial counts per parish per game month. They are used by the `<<corpse-work>>` widget to generate monthly notifications for corpsebearer and searcher roles.

### `$corpseBuried`
- **Type:** Object (`{parishName: [Integer x 22]}`)
- **Contains:** 127 parishes, each mapped to an array of 22 integers (one per month in `$timeline`)
- **Values:** Total burials recorded in the Bills of Mortality for that parish in that month
- **Set by:** `StoryInit` (pid 10)
- **Used by:** `<<corpse-work>>` widget. Accessed as `$corpseBuried[$parish][$monthIndex]`
- **Source data:** `supporting-data/1665-1666-combined-BOM-data.csv` (weekly data aggregated to monthly totals)

### `$corpsePlague`
- **Type:** Object (`{parishName: [Integer x 22]}`)
- **Contains:** 127 parishes, each mapped to an array of 22 integers (one per month in `$timeline`)
- **Values:** Plague-attributed burials recorded in the Bills of Mortality for that parish in that month
- **Set by:** `StoryInit` (pid 10)
- **Used by:** `<<corpse-work>>` widget. Accessed as `$corpsePlague[$parish][$monthIndex]`. Also used to determine searcher plague infection risk (y in 100 chance, where y = plague burials)
- **Source data:** `supporting-data/1665-1666-combined-BOM-data.csv` (weekly data aggregated to monthly totals)

---

## Variables Used in Commented-Out / Unused Code

### `$shop`
- **Type:** Used in a commented-out shop widget
- **Notes:** Part of a `<<shop $player _item 1>>` call in commented-out code. Not active in the current game.

### `$player`
- **Type:** Used in a commented-out shop widget
- **Notes:** Referenced alongside `$shop`. Not active in the current game.

### `$trades`
- **Type:** Array of strings
- **Value:** `["mercer", "draper", "ironmonger", "goldsmith"]`
- **Set by:** `StoryInit` (pid 10)
- **Used for:** Assigns a specific merchant trade to `$role` during character creation (`bio.txt`, pid 1) when `$socio is "merchants"` via `either($trades)`. The selected trade is displayed on the stats page.
- **Note:** Despite appearing in the "unused code" section historically, this variable is actively used in the current game.

### `$food`
- **Type:** String (player selection)
- **Set by:** Listbox selection from local array `_food = ["minced pie", "sweetmeats", "currant cake", "syllabub", "tansy"]`
- **Used for:** Christmas feast flavor text in December 1664
