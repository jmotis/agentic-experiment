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
8. [Remedies and Fumigants](#remedies-and-fumigants)
9. [Fleeing / Flight Status](#fleeing--flight-status)
10. [Family / Life Events](#family--life-events)
11. [Random Event Rolls](#random-event-rolls)
12. [Story / Game State](#story--game-state)
13. [Plague Worker Variables](#plague-worker-variables)
14. [Parish Lookup Tables](#parish-lookup-tables)

---

## Player Character

### `$gender`
- **Type:** String
- **Possible values:** `"male"`, `"female"`
- **Set by:** `random-character` widget via `either("male", "female")`; can also be `"nonbinary"` via the player-choice path (commented-out paths reference it)
- **Used for:** Pronoun selection, name generation, NPC relationship labels, narrative text branching

### `$birthgender`
- **Type:** String (briefly an Array during listbox initialization, then replaced by the selected value)
- **Possible values:** `"son"`, `"daughter"`
- **Set by:** `<<listbox "$birthgender">>` in the `identity` passage (pid 4). The listbox replaces the initial array with the player's selection.
- **Used for:** Determining the player's gender (`"son"` &rarr; male, `"daughter"` &rarr; female) and birth-related child relationship labels in NPC generation

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
  - `0` — **Child:** Player is under 16 (`$agenum lte 15`) and has no independent legal standing. Exception: child servants with a living master/mistress in `$NPCs` receive `$hoh = 3` instead (see below).
  - `1` — **Independent head of household:** Player is 16+ and runs their own household. Conditions:
    - Male, `$agenum gte 16`, no father or step-father in `$NPCs`, and either not a servant (`$socio isnot "servants"`) or a servant whose master/mistress lives in a separate household (`$NPCsMaster`).
    - Female, `$agenum gte 16`, no parent (mother, step-mother, father, step-father) or husband in `$NPCs`, and either not a servant or a servant whose master/mistress lives in a separate household.
  - `2` — **Living with parents:** Player is 16+ and could be legally independent but currently resides in a parental household. Conditions:
    - Male, `$agenum gte 16`, father or step-father present in `$NPCs`.
    - Female, `$agenum gte 16`, any parent (mother, step-mother, father, step-father) present in `$NPCs`.
    - *Note:* For males, only a father/step-father triggers this status because an adult man living with only his widowed mother is typically the head of that household. For females, any surviving parent in the household maintains parental authority.
  - `3` — **Servant in master's household:** Player is a servant (`$socio is "servants"`) living in the same household as their master/mistress (master/mistress NPC is in `$NPCs`). This applies to both adults (`$agenum gte 16`) and children (`$agenum lt 16`) who have a living master/mistress. Conditions:
    - Any gender, any age, master or mistress present and alive in `$NPCs`.
  - `4` — **Married woman (coverture):** Player is a married woman whose legal identity is subsumed under her husband's. Conditions:
    - Female, `$agenum gte 16`, `$relationship is "married"` or husband present in `$NPCs`.
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** Evaluated during character generation (after household NPCs are placed) and reassessed whenever `$socio` or `$relationship` changes, or when a parent NPC in `$NPCs` dies. For children (`$agenum lt 16`), defaults to `0` but overrides to `3` if a living master/mistress is present in `$NPCs`. For adults (`$agenum gte 16`), later values take priority (evaluated in ascending order 1→2→3→4), so coverture (4) overrides servant status (3), which overrides parental household (2), which overrides independent (1).
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
- **Range:** -10000000 to 10000000 (clamped)
- **Initial values by `$socio`:** Starting capital equals one month's income at the character's socio level. Beggars start with `0`.
  - `"beggars"`: `0`
  - `"servants"`: `60` (male adult) or `40` (female adult), `60` (male child/adolescent) or `40` (female child/adolescent)
  - `"day labourers"`: household income (varies by composition)
  - `"artisans"`: `800`
  - `"merchants"`: `4000`
  - `"nobles"`: `17600`
- **Modified by:** `Math.clamp($money + amount, -10000000, 10000000)` or direct arithmetic. Income is added and expenses subtracted each month via the `<<disposable>>` widget.
- **Notes:** All monetary values are in pence (12 pence = 1 shilling, 20 shillings = 1 pound). Displayed to the player using the `<<conversion>>` widget.

### `$income`
- **Type:** Integer (monthly income in pence)
- **Flat rates:** Artisans `800`, merchants `4000`, nobles `17600` — flat regardless of household size or composition.
- **Per-person rates:** Servants: `60` (male adult) or `40` (female adult), `0` for child/adolescent; living-with-master servants only count PC income. Day labourers: `180` (male adult) or `120` (female adult), `10` per child/adolescent. Beggars: `60` per adult, `20` per child/adolescent — no gender distinction.
- **Dependency:** Set based on `$socio`, `$age`, `$gender`, and (for servants/day labourers/beggars) living `$NPCs` ages/genders; changes if the player takes a plague worker role

### `$expenses`
- **Type:** Integer (monthly expenses in pence)
- **Nobles:** `12000` per household + `240` per family member (including PC) + `60` per servant
- **Merchants:** `2800` per household + `90` per family member (including PC) + `40` per servant
- **Artisans:** `560` per household + `60` per family member (including PC) + `40` per servant
- **Servants:** `20` per person in the household. Living-with-master adult servants pay `20` (PC only). Child/adolescent servants living with master pay `0` (master covers expenses).
- **Day labourers:** `60` per household + `20` per person in the household
- **Beggars:** `40` per household + `20` per person in the household
- **Dependency:** Set based on `$socio`, `$age`, `$hoh`, and living members of `$NPCs` and `$NPCsServants`

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

### `$preFireLocation`
- **Type:** String
- **Possible values:** `""` (default — not displaced), or any `$location` value the player had before the Great Fire
- **Set by:** September 1666 passage, when a fire-displaced player's old location is saved before reassignment
- **Used for:** Displayed in sidebar (StoryCaption) when non-empty; used as a flag to detect fire-displaced players (`$preFireLocation neq ""`)

### `$preFireParish`
- **Type:** String
- **Possible values:** `""` (default — not displaced), or any `$parish` value the player had before the Great Fire
- **Set by:** September 1666 passage, when a fire-displaced player's old parish is saved before reassignment
- **Used for:** Displayed in sidebar (StoryCaption) when non-empty

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

### `$pesthouseReparation`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (default), `1` (player has completed pesthouse/banishment reparation choice)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** Set to `1` in `YouPesthouse` (pid 44) or `banished` (pid 43) when the player selects a reparation option after surviving plague in the pesthouse or country estate. Reset to `0` in `Reconnecting` (pid 83) after the reparation branch processes.
- **Used for:** Routes players arriving at `Reconnecting` from pesthouse/banishment through a separate branch that skips quarantine-related checks (infected family, quarantine swap restoration) and instead provides catch-up summaries, funeral choices, and storyline return.
- **Dependencies:** Checked in `Reconnecting` (pid 83). Set in `YouPesthouse` (pid 44) and `banished` (pid 43).

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

### `$caretakerLabel`
- **Type:** String
- **Possible values:** `""` (empty — player is hoh 1, no caretaker), `"husband"`, `"father"`, `"parent"`, `"master"`, `"mistress"`, or any NPC relationship string (e.g., `"step-father"`, `"mother"`, `"uncle"`, `"aunt"`, `"guardian"`)
- **Set by:** The `<<set-caretaker>>` widget (pid 124), based on `$hoh`, `$gender`, `$socio`, `$masterTitle`, and living NPCs
- **Dependency:** Depends on `$hoh`, `$gender`, `$socio`, `$masterTitle`, `$NPCs`
- **Used for:** Display label for the authority figure who stays with a non-head-of-household PC. Used in flight-choice, quarantine/pesthouse, stay, and child-service passages to avoid branching on `$hoh` at every call site.

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

### `$fledBroke`
- **Type:** Boolean
- **Possible values:** `false` (default), `true` (player ran out of money while away)
- **Initial value:** `false` (set in `StoryInit`, pid 10)
- **Set by:** The `fled-broke` widget (pid 90) sets this to `true` immediately before `<<goto>>` redirects the player to the return month passage.
- **Used for:** Displays a "you have run out of money" message at the top of the storyline passage the player is redirected to. The message block resets `$fledBroke` to `false` after display, so it only appears once.
- **Reset by:** The `<<if $fledBroke>>` block at the top of each monthly storyline passage (pids 20, 22, 24--34) sets it back to `false` after displaying the message.

### `$fledFromIndex`
- **Type:** Integer
- **Set by:** `$monthIndex` at the start of the Fled passage (pid 63)
- **Used for:** Records which timeline index the player fled from, so that the Fled passage can hide return options that would send the player backwards in time (preventing time-travel bug)
- **Dependency:** Derived from `$monthIndex`

### `$followedCourt`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (did not follow the court), `1` (following the court)
- **Set by:** `0` in StoryInit; set to `1` in the noble flight choice (pid 64) when the player chooses "Follow the court to the countryside"; reset to `0` by court-return (pid 86) return links and by the `fled-broke` widget (pid 115) when the player runs out of money
- **Used for:** Adds 4,800d per month to noble expenses while following the court (in the `expenses` widget, pid 77). Also branches the `fled-opening` narrative text (pid 115) to reflect the higher cost of following the court versus fleeing to a country estate.
- **Dependency:** Only meaningful when `$socio is "nobles"` and `$fled is 6`. Nobles who choose "Follow the court" are sent directly to the court-return passage (pid 86) and automatically return in February 1666.
- **Notes:** Nobles who choose the country estate option instead go to the Fled passage (pid 63) and choose their own return timing.

### `$fledReturn`
- **Type:** String
- **Possible values:** `"official"`, `"no-plague"`
- **Set by:** Fled passage (pid 63) when player chooses how long to stay away
- **Used in:** official-end passage (pid 87) to branch between the "official Thanksgiving Day" ending and the "no more plague deaths" ending
- **Notes:** Only relevant when the player has fled the city and chosen one of the two longest stay-away options.

### `$getaway`
- **Type:** Array of integers (indices into `$NPCs`)
- **Initial value:** `[]`
- **Set by:** `smuggle-children` widget (pid 114) — populated with indices of healthy children/infants smuggled out of a shut-up house
- **Used for:**
  - Gate-checking the Flight menu link in `storyMenu` (pid 72) — when `$getaway.length gt 0`, the Flight dialog is shown even outside the normal flight time window
  - Fast-path gate in `orphan-check` (pid 104) — when `$getaway.length gt 0`, smuggled children (health `"safe from harm"`) are moved to `$NPCsExtended` before `$NPCs` is wiped during household reassignment
- **Cleared by:** Flight dialog (pid 116) and `return-children` widget (pid 114) when children are brought home
- **Dependency:** Indices correspond to `$NPCs` at the time `smuggle-children` runs. The children themselves are identified by `health is "safe from harm"` for safety.

### `$beggarsluck`
- **Type:** Integer (temporary money-quantity variable)
- **Set by:**
  - `random(6, 10)` in `begging-success` (pid 52) — used as pence earned from roadside begging
  - `random(2, 6)` in `good-neighbors` (pid 53) — used as pence saved through neighbor charity
- **Used for:** Holds a small random pence amount that is immediately added to `$money` and then `<<unset>>`. It is a display variable only (shown in the passage text as the amount earned/saved) and is never checked in a conditional.
- **Dependency:** Only set when `$socio is "beggars"` and the player takes a begging or charity action.

### `$seekingMarriage`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not seeking), `1` (seeking a spouse)
- **Set by:** Set to `1` or `0` by `marriage-market` widget (pid 107) when the player chooses whether to seek a spouse; `<<unset>>` by `wedding` widget (pid 108) when the player marries
- **Used for:** Whether the player is actively looking for a marriage partner
- **Dependency:** Interacts with `$wedding` and `$seekingDecision`

### `$seekingDecision`
- **Type:** Integer
- **Possible values:** `0` (no decision yet), `1` (marriage decision made), `2` (apprenticeship decision made)
- **Set by:** `0` in StoryInit; set to `1` by `marriage-market` widget (pid 107) when the player makes a marriage decision; set to `2` by `apprenticeship-market` widget (pid 107) when the player makes an apprenticeship decision
- **Used for:** Tracks whether the player has already been presented with the marriage or apprenticeship choice, preventing the question from being asked again. Value `2` also gates out the marriage-market widget for characters who chose the apprenticeship path.
- **Dependency:** Checked in January 1665 (pid 9) to determine which widget to show

### `$randomEventCompleted`
- **Type:** Boolean
- **Possible values:** `true`, `false`
- **Set by:** `false` in StoryInit; set to `true` inside `<<storyline-return>>` widget (pid 41) when the time offset is 0 (i.e., the player is returning to the same storyline passage); reset to `false` at the top of `<<random-events>>` widget (pid 113) on reload
- **Used for:** Guards against re-running the entire `<<random-events>>` widget body when a player returns to a storyline passage after completing a random event. When true, random-events skips all logic (pregnancy tracking, NPC death, priority cascade) and sets `_randomEventFired` to false so the passage's monthly narrative renders.
- **Dependency:** Works with `<<storyline-return>>` (pid 41) and `<<random-events>>` (pid 113)

### `$seekingApprenticeship`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not seeking), `1` (seeking an apprenticeship)
- **Set by:** `0` in StoryInit; set to `1` by `apprenticeship-market` widget when the player chooses to seek an apprenticeship; set to `0` when an apprenticeship is accepted via `apprenticeship-offer`
- **Used for:** Whether the player is actively looking for an apprenticeship. Mutually exclusive with `$seekingMarriage` — characters eligible for apprenticeship (single, artisan/merchant, agenum 14–21) are routed to `apprenticeship-market` instead of `marriage-market`.
- **Dependency:** Interacts with `$apprenticeshipOffer`

### `$apprenticeship`
- **Type:** Integer
- **Possible values:** `0` (not apprenticed), `1` through `5` (apprenticeship tier)
- **Set by:** `0` in StoryInit; set to tier number (1–5) by `apprenticeship-offer` widget when the player accepts an apprenticeship
- **Used for:** Tracks the player's apprenticeship status and tier. When > 0, the player's social class is displayed as "apprentice" instead of "servants" in the Household Status screen and final stats. Tiers represent: 1 = Placeholder Trade A (£1 fee, artisan master), 2 = Placeholder Trade B (£5, artisan master), 3 = Placeholder Trade C (£10, merchant master), 4 = Placeholder Trade D (£25, merchant master), 5 = Placeholder Trade E (£50, merchant master).
- **Dependency:** When > 0, gates out `marriage-market` in subsequent months (apprentices do not seek marriage). Also masks `$socio` display in Household Status (pid 74) and `stats-characteristics` (pid 75).

### `$servantPromotion`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not promoted), `1` (promoted to apprentice by master)
- **Set by:** `0` in StoryInit; set to `1` by `promote-servant` widget (pid 92) when the player accepts their master's offer to become an apprentice
- **Used for:** Tracks whether a servant has been promoted to apprentice status through stellar reputation (reaching 10). When `1`, the player cannot break their contract or leave their master/mistress (contract-breaking options are hidden in the flight-choice widget, pid 64). Works in conjunction with `$apprenticeship` (which is also set to `1` to mask the socio display as "apprentice").
- **Dependency:** Requires `$socio is "servants"`, `$apprenticeship is 0`, `$reputation gte 10`, `$relationship is "single" or "betrothed"`, and `$agenum` 14–21 to trigger. Sets `$apprenticeship to 1` on acceptance.

### `$apprenticeshipOffer`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)` each month in `random-events` widget
- **Trigger:** `$apprenticeshipOffer is 1` (10% chance) triggers an apprenticeship offer event
- **Dependency:** Interacts with `$seekingApprenticeship`. Checked before `$wedding` in the random-events priority cascade.

### `$seekingPreferment`
- **Type:** Integer (boolean-like)
- **Possible values:** `0` (not seeking), `1` (seeking preferment at court)
- **Set by:** `0` in StoryInit; set to `1` by `preferment-market` widget (pid 107) when a noble player chooses to seek preferment; set to `0` when the player accepts a court position via `preferment-offer` or declines and stops seeking
- **Used for:** Whether the player is actively seeking preferment at court. Only available to nobles aged 16+. When `1`, adds 2400d/month (£10) to expenses for gift-giving to courtiers. A 1-in-10 monthly random chance triggers a `preferment-offer` event. If the noble fled to the countryside (not following the court), the offer is deferred until February 1666 (`$monthIndex gte 11`) when the court returns, though the monthly gift cost continues.
- **Dependency:** Interacts with `$prefermentOffer`, `$fled`, `$followedCourt`, `$monthIndex`

### `$prefermentOffer`
- **Type:** Integer (random event roll)
- **Set by:** `random(1, 10)` each month in `random-events` widget
- **Trigger:** `$prefermentOffer is 1` (10% chance) triggers a court position offer event for nobles seeking preferment
- **Dependency:** Interacts with `$seekingPreferment`. Gated by countryside/court status: fires only if `$fled isnot 6`, or `$followedCourt is 1`, or `$monthIndex gte 11`. Checked after `$apprenticeshipOffer` and before `$wedding` in the random-events priority cascade.

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
- **Dependency:** Interacts with `$seekingMarriage`

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

### `$childServiceOffered`
- **Type:** Integer (month index)
- **Possible values:** `-1` (never offered), or a valid `$monthIndex` value (0–21)
- **Initial value:** `-1` (set in `StoryInit`, pid 10)
- **Set by:** The `child-service-check` widget (pid 114) sets this to the current `$monthIndex` when the voluntary child-service choice is presented to the player. This prevents the same choice from being offered more than once per month.
- **Used for:** Gate in the `child-service-check` widget — the widget only fires when `$childServiceOffered isnot $monthIndex`, ensuring the player is not repeatedly asked about putting children into service during the same month.
- **Dependencies:** Interacts with `$money` (trigger condition: `$money lte 0`), `$socio` (only fires for `"beggars"`, `"day labourers"`, `"artisans"`, and `"servants"` with `$hoh is 1`), `$monthIndex` (comparison key), and `$NPCs` (checks for eligible child/adolescent NPCs). The `noble-child-service-check` widget uses the same gate for `"merchants"` and `"nobles"`, offering to send the youngest non-infant child/adolescent to be a ward of a relative instead.

### `$inDebtorsPrison`
- **Type:** Integer (flag)
- **Possible values:** `0` (not in prison), `1` (in debtor's prison)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `prison` widget (pid 58) sets this to `1` when the player is committed to the Fleet (debtor's prison). Set in all code paths where the player is actually imprisoned (direct commitment, refusing Navy recruitment, refusing sell option). Reset to `0` by the `debtor-prison-check` widget (pid 58) when the player is released — either because debt improves below the ceiling, or after 3 months via a bequest from a deceased relative (first commitment only). On second+ commitment (`$debtorPrisonCount gte 2`), the player is permanently imprisoned with no release. Also reset to `0` if the player or NPC is impressed into the Navy from prison.
- **Used for:** In `PassageHeader` (pid 11), triggers a 50% infection chance every storyline passage while in prison and calls the `debtor-prison-check` widget to evaluate release conditions. If infected in prison, the player is sent to the pesthouse (`YouPesthouse`) instead of being allowed to quarantine at home.
- **Dependencies:** Interacts with `$plagueInfection`, `$playerPlagueStatus`, `$debtorPrisonInfected`, `$debtorPrisonMonths`, and `$creditorWaitCount`.

### `$debtorPrisonInfected`
- **Type:** Integer (flag)
- **Possible values:** `0` (not infected in prison), `1` (infected while in debtor's prison)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** `PassageHeader` (pid 11) sets this to `1` when a player in debtor's prison (`$inDebtorsPrison is 1`) catches plague via the 50% infection roll.
- **Used for:** In `random-events` widget (pid 113), routes the infected player directly to the pesthouse (`YouPesthouse`) instead of using the normal `sickPC` widget flow which would allow home quarantine. The flag is cleared back to `0` after routing.
- **Dependencies:** Interacts with `$inDebtorsPrison`, `$plagueInfection`, `$plagueRevealed`, `$playerPlagueStatus`, `$reputation`.

### `$debtorPrisonMonths`
- **Type:** Integer (counter)
- **Possible values:** `0` (not in prison or just entered), `1`, `2`, `3` (triggers bequest release on first commitment)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `debtor-prison-check` widget (pid 58) increments this by 1 each month while the player remains in debtor's prison and debt still exceeds the ceiling. Reset to `0` when the player is released (via debt improvement, bequest event, or any other release mechanism). Also set to `0` when the player first enters prison.
- **Used for:** On first commitment (`$debtorPrisonCount is 1`): after 3 months, a distant relative dies and leaves a bequest, triggering automatic release with a &minus;1 reputation penalty. On second+ commitment (`$debtorPrisonCount gte 2`): the counter still increments but no bequest occurs; the player is permanently imprisoned.
- **Dependencies:** Interacts with `$inDebtorsPrison`, `$money`, `$reputation`, `$creditorWaitCount`.

### `$creditorWaitCount`
- **Type:** Integer (counter)
- **Possible values:** `0` (no waits), `1`, `2`, `3`+
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `prison` widget (pid 58) increments this by 1 each time creditors agree to wait due to the player's reputation being &ge; 6. Reset to `0` when debts are cleared (via sell option, Navy, bequest, or debt improvement).
- **Used for:** Provides escalating narrative text each time creditors wait (first time: polite patience; second: growing impatience; third+: final warning). Each wait also costs &minus;1 reputation, creating a natural countdown — a player at reputation 8 gets roughly 3 months of grace before reputation drops below 6 and they face harsher consequences (sell option at rep 4–5, or prison/Navy below rep 4).
- **Dependencies:** Interacts with `$reputation`, `$money`, `$inDebtorsPrison`, `$debtorPrisonMonths`.

### `$debtorPrisonCount`
- **Type:** Integer (counter)
- **Possible values:** `0` (never committed), `1` (committed once), `2`+ (committed multiple times)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** Incremented by 1 each time the player or their HoH NPC is actually committed to debtor's prison (i.e., `$inDebtorsPrison` is set to `1`). This happens across multiple code paths in the `prison`, `debt-navy-option`, and `debt-navy-npc-option` widgets (pid 58).
- **Used for:** Controls two mechanics: (1) The `debt-sell-option` widget uses `$debtSellUsed` (see below) to limit the sell option, while the second-time noble options (sell townhouse / flee London) are gated on `$debtSellUsed gte 1`. (2) The `debtor-prison-check` widget checks `$debtorPrisonCount gte 2` to determine whether the player is permanently imprisoned (no inheritance release on second+ commitment).
- **Dependencies:** Interacts with `$inDebtorsPrison`, `$debtorPrisonMonths`, `$debtSellUsed`.

### `$debtSellUsed`
- **Type:** Integer (flag)
- **Possible values:** `0` (sell option not yet used), `1` (sell option already offered once)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `debt-sell-option` widget (pid 58) sets this to `1` the first time the sell option is presented to the player (regardless of whether they sell or refuse).
- **Used for:** Gates the sell-land/sell-goods option so it is only available once. On subsequent encounters at reputation 4–5, nobles are offered two desperate choices (sell London townhouse for game over, or flee the city via the `go quietly` passage), and non-nobles are offered the choice to face the Fleet or flee the city (game over via the `go quietly` passage).
- **Dependencies:** Interacts with `$socio`, `$reputation`, `$debtFled`.

### `$debtFled`
- **Type:** Integer (flag)
- **Possible values:** `0` (not fleeing debts), `1` (fled London to escape debts)
- **Initial value:** `0` (set in `StoryInit`, pid 10)
- **Set by:** The `debt-sell-option` widget (pid 58) sets this to `1` when a player (noble or non-noble) chooses the "Flee the city" option on their second encounter with the sell-option threshold.
- **Used for:** The `go quietly` passage (pid 47) checks this flag to display debt-fleeing narrative text instead of the default plague-fleeing text. When `$debtFled is 1`, the passage describes the player slipping away from London to escape creditors rather than fleeing plague.
- **Dependencies:** Interacts with `$debtSellUsed`, `$origin`.

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

### `$catchUpSummaries`
- **Type:** Array of strings (22 elements, one per game month)
- **Set by:** `StoryInit` (pid 10)
- **Used for:** Provides brief narrative summaries for each month. Displayed by the `catch-up` widget (pid 106) when the player skips ahead multiple months (e.g., during fled storylines), so they can see what happened in months they missed.

### `$textGroup`
- **Type:** Integer
- **Initial value:** `1`
- **Modified by:** `$textGroup += 1` after each text block during quarantine/sickness passages
- **Used for:** Tracks which text block to show next in multi-part quarantine sequences

### `$args`
- **Type:** Array (SugarCube built-in)
- **Notes:** `$args` is used within widgets to access arguments passed to the widget. For example, `$args[0]` retrieves the first argument. This is a SugarCube framework variable, not a game-specific variable.

### `$type` *(removed — now uses temporary `_type`)*
- **Notes:** Previously used in `navy-volunteer` (pid 102) as a global. Replaced with `_type` (temporary variable) since it is only used within a single passage.

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
