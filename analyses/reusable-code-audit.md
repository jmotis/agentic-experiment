# Reusable Code Audit: Gaming the Great Plague

**Date:** 2026-03-05
**Purpose:** Identify code and game elements that could be extracted and reused for similar historical daily-life interactive fiction games (e.g., 19th-century London, 17th-century Virginia).

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Reusable Systems Overview](#reusable-systems-overview)
3. [Category 1: Character Generation System](#category-1-character-generation-system)
4. [Category 2: NPC & Household Management](#category-2-npc--household-management)
5. [Category 3: Economy & Money System](#category-3-economy--money-system)
6. [Category 4: Reputation System](#category-4-reputation-system)
7. [Category 5: Health, Disease & Death System](#category-5-health-disease--death-system)
8. [Category 6: Life Events System](#category-6-life-events-system)
9. [Category 7: Timeline & Storyline Architecture](#category-7-timeline--storyline-architecture)
10. [Category 8: UI Framework & Sidebar System](#category-8-ui-framework--sidebar-system)
11. [Category 9: Glossary / Tooltip System](#category-9-glossary--tooltip-system)
12. [Category 10: Decision Tracking & End-of-Game Stats](#category-10-decision-tracking--end-of-game-stats)
13. [Category 11: Weighted Random Selection Infrastructure](#category-11-weighted-random-selection-infrastructure)
14. [Category 12: Historical Data Architecture](#category-12-historical-data-architecture)
15. [Dependency Map](#dependency-map)
16. [Documentation Requirements](#documentation-requirements)

---

## Executive Summary

The game contains approximately **12 distinct reusable systems** that could serve as the foundation for similar historical interactive fiction. The systems range from nearly drop-in reusable (the economy/money widgets, UI framework) to requiring significant adaptation (the disease model, historical data tables). The game's architecture is a good model for any SugarCube 2 historical simulation game, but the code is deeply intertwined in several places — particularly between the NPC system, health system, and household management — which means some systems cannot be extracted independently.

**Overall assessment:** The codebase is well-suited for reuse, but the extraction effort is moderate to high because (a) there is no module system in SugarCube (everything is global widgets and variables), (b) systems communicate through shared global state rather than interfaces, and (c) period-specific content (names, parishes, disease data) is woven into the logic rather than externalized as configuration.

---

## Reusable Systems Overview

| # | System | Extraction Difficulty | Reuse Value | Key Dependencies |
|---|--------|----------------------|-------------|-----------------|
| 1 | Character Generation | Medium | Very High | Name pools, weighted random, NPC system |
| 2 | NPC & Household Management | Hard | Very High | Character gen, health, pronouns |
| 3 | Economy & Money | Easy | Very High | Social class variable only |
| 4 | Reputation System | Easy | High | None (standalone) |
| 5 | Health, Disease & Death | Hard | High | NPC system, historical data, household mgmt |
| 6 | Life Events | Medium | High | NPC system, economy, reputation |
| 7 | Timeline & Storyline Architecture | Medium | Very High | Tag system, passage naming convention |
| 8 | UI Framework & Sidebar | Easy | Very High | SugarCube special passages |
| 9 | Glossary / Tooltip System | Easy | Very High | CSS class `.def` only |
| 10 | Decision Tracking & Stats | Easy | High | `$decisions` array |
| 11 | Weighted Random Selection | Easy | Very High | `weightedEither()` (SugarCube built-in) |
| 12 | Historical Data Architecture | Medium | High | Parish/timeline arrays |

---

## Category 1: Character Generation System

### Source Files
- `passages/014-char-gen-widgets.txt` (pid 14) — ~32 KB, the largest widget file
- `passages/001-bio.txt` (pid 1) — character assembly and household generation
- `passages/004-identity.txt` (pid 4) — player-choice character creation UI

### What It Does
Generates a complete player character with: gender, age (with numeric age and category), name (weighted by historical frequency), religion, origin, social class (`$socio`), geographic location, marital status, and disability. Also generates an entire household of NPCs appropriate to the character's circumstances.

### Reusable Elements

**1a. `random-character` widget** — Generates all core PC attributes using weighted random distributions.
- **Reuse difficulty: Low**
- **What to change:** Replace the weighted probability objects with values appropriate to the new setting. The *structure* (weighted selection from categories) is perfectly reusable.
- **Dependencies:** `weightedEither()` (SugarCube built-in)

**1b. `playerName` widget** — Selects a name from weighted frequency tables, with origin-based boosts (e.g., Irish names are 5x more likely for Irish-origin characters).
- **Reuse difficulty: Low-Medium**
- **What to change:** Replace `$fNames` and `$mNames` weighted objects with period-appropriate names. The origin-boost mechanism (`*= 5`) is clever and reusable as-is for any setting with regional naming patterns.
- **Dependencies:** `$fNames`, `$mNames`, `$origin`, `$gender`

**1c. `playerAge` widget** — Converts age category string to numeric age.
- **Reuse difficulty: Very Low** — completely generic
- **Dependencies:** None

**1d. `setAge` widget** — Generates a random age within bounds and assigns age category.
- **Reuse difficulty: Very Low** — completely generic
- **Dependencies:** `$minAge`, `$maxAge` (set by caller)

**1e. `parish` widget** — Assigns a geographic sub-location based on the player's broader location, using weighted selection from historically-sized parish populations.
- **Reuse difficulty: Low**
- **What to change:** Replace parish lookup tables with appropriate geographic units (e.g., neighborhoods, plantations, wards). The pattern of nested weighted selection (region → sub-location) is reusable.
- **Dependencies:** `$wallParishes`, `$eParishes`, etc. lookup tables

**1f. Player-choice character creation** (pid 4, `identity`) — Multi-step form using SugarCube `<<listbox>>` macros and a `<<chunkText>>` widget that reveals choices one at a time.
- **Reuse difficulty: Very Low** — the UI pattern is directly reusable
- **Dependencies:** `<<chunkText>>` / `<<next>>` widgets (from pid 73 `empty`)

### Documentation Requirements
- List of all character attributes and their valid values
- Format specification for weighted name pools (object with `name: weight` pairs)
- Explanation of the origin-boost naming mechanism
- Guide to adapting the social class categories and their probability weights
- Map of age categories to numeric age ranges

---

## Category 2: NPC & Household Management

### Source Files
- `passages/014-char-gen-widgets.txt` (pid 14) — NPC creation widgets
- `passages/001-bio.txt` (pid 1) — household assembly logic
- `passages/104-orphan-widget.txt` (pid 104) — orphan rehoming system
- `passages/105-add-dependent-widget.txt` (pid 105) — adding dependents mid-game
- `passages/035-master-death-widget.txt` (pid 35) — master/employer succession
- `passages/036-widow-widget.txt` (pid 36) — widowing logic
- `passages/114-Claude-widgets.txt` (pid 114) — `set-hoh`, `set-caretaker`, lodger system

### What It Does
Manages multiple NPC arrays representing distinct household tiers:
- `$NPCs` — immediate household (family, or master's household for single servants)
- `$NPCsExtended` — extended family living elsewhere in London
- `$NPCsServants` — household servants
- `$NPCsMaster` — employer's household (for servants)
- `$FledFamily` / `$FledServants` — NPCs who have left the city

Each NPC is an object with properties: `name`, `agenum`, `age`, `relationship`, `health`, `location`, `heshe`, `hishers`.

### Reusable Elements

**2a. NPC data structure** — The `{name, agenum, age, relationship, health, location, heshe, hishers}` object pattern is excellent for any historical simulation.
- **Reuse difficulty: Very Low**
- **What to change:** Possibly add fields (e.g., `occupation`, `race` for colonial settings). The health states (`healthy`, `infected`, `recovered`, `deceased`, `safe from harm`) can be adapted.

**2b. Multi-tier household model** — The 5-array system (`$NPCs`, `$NPCsExtended`, `$NPCsServants`, `$NPCsMaster`, `$FledFamily`) models the complexity of pre-modern households.
- **Reuse difficulty: Medium** — the *concept* is very reusable but array names and tier definitions are hardcoded everywhere
- **What to change:** For Virginia, might need `$NPCsEnslaved` tier. For 19th-century London, might simplify to 3 tiers.

**2c. Family generation widgets** — `addPartnerNPC`, `addChildNPC`, `addParentNPC`, `addSiblingsNPC`, `addNewbornNPC`
- **Reuse difficulty: Low** — the logic of generating age-appropriate family members with duplicate-name prevention is universal
- **What to change:** Replace name pools; adjust age ranges if life expectancy differs; modify family size distributions per social class

**2d. Servant/master household generation** — `addServantNPC`, `addMasterHousehold`
- **Reuse difficulty: Medium** — useful for any setting with employer-employee cohabitation (servants, apprentices, enslaved persons)
- **What to change:** Relationship strings, household size ranges, succession rules

**2e. `NPCpronouns` widget** — Assigns `heshe`/`hishers` pronouns based on relationship string.
- **Reuse difficulty: Low-Medium** — the *approach* is reusable but the implementation is a massive if/elseif chain of relationship strings. Would benefit from refactoring to use a gender lookup rather than relationship matching.
- **Dependencies:** All relationship strings in the game

**2f. `ListNPCs` widget** — Renders household status in the sidebar.
- **Reuse difficulty: Low** — UI pattern is reusable; just update relationship labels

**2g. `set-hoh` widget** — Determines head-of-household status based on age, gender, relationships.
- **Reuse difficulty: Medium** — the logic of determining who has authority in a household is reusable for any patriarchal historical setting
- **What to change:** The specific rules (coverture for married women, paternal authority) vary by period and jurisdiction

**2h. `orphan-check` widget** — Rehomes orphaned children into new households.
- **Reuse difficulty: Medium** — excellent for any setting where death can leave children without guardians
- **What to change:** The types of new guardians available and the mechanism of rehoming (parish system vs. other)

**2i. `servant-master-death` widget** — Succession logic when an employer dies.
- **Reuse difficulty: Medium-Hard** — complex but valuable; models what happens to dependents when their authority figure dies
- **What to change:** Succession rules vary by setting (primogeniture, other inheritance patterns)

### Documentation Requirements
- Complete NPC object schema with all valid property values
- Diagram of the 5-array household tier system and when NPCs move between tiers
- List of all valid relationship strings and their gender associations
- Head-of-household determination rules (`$hoh` values 0-4)
- Succession rules for master/employer death
- Orphan rehoming flowchart

---

## Category 3: Economy & Money System

### Source Files
- `passages/077-money-widgets.txt` (pid 77) — core economy widgets
- `passages/114-Claude-widgets.txt` (pid 114) — `debt-check`, `quarantine-costs`, `quarantine-debt-check`
- `passages/058-debtor-widgets.txt` (pid 58) — debt consequences

### What It Does
Models a simple monthly income/expense economy denominated in **pence** (d.), with conversion to pounds/shillings/pence for display. Income and expenses are determined by social class. Players can go into debt, which triggers consequences.

### Reusable Elements

**3a. `income` / `expenses` / `disposable` widgets** — Calculate monthly cash flow based on `$socio`.
- **Reuse difficulty: Very Low** — just change the amounts per social class
- **What to change:** Income/expense values, social class names, any additional income sources

**3b. `conversion` widget** — Converts pence to `£X, Y s., Z d.` display format.
- **Reuse difficulty: Very Low** for any pre-decimal English currency setting (pre-1971); directly applicable to 17th-century Virginia or 19th-century London
- **What to change:** Nothing, if the setting uses pounds/shillings/pence. For other currency systems, adapt the conversion math.

**3c. `money` widget** — Modifies `$money` and live-updates a DOM element.
- **Reuse difficulty: Very Low** — generic

**3d. `debt-check` / `quarantine-debt-check` widgets** — Trigger consequences when money falls below zero, including cancellation of subscriptions and forced behavior changes.
- **Reuse difficulty: Low** — the pattern of cascading debt consequences is reusable
- **What to change:** The specific subscriptions and behaviors that get cancelled

**3e. `party-costs` widget** — Scales event costs by social class.
- **Reuse difficulty: Very Low** — the pattern of class-scaled costs is reusable for any social gathering

### Documentation Requirements
- Currency denomination and base unit explanation
- Income/expense table by social class
- Debt threshold and consequence rules
- Guide to adding new purchasable items/services

---

## Category 4: Reputation System

### Source Files
- `passages/056-StoryCaption.txt` (pid 56) — sidebar reputation display
- `passages/072-storyMenu.txt` (pid 72) — menu reputation display
- `passages/092-servant-rep-widgets.txt` (pid 92) — servant-specific reputation effects
- Various storyline passages — reputation changes from decisions

### What It Does
A simple integer (`$reputation`, 0-10) that tracks the player's standing in their community. Affects available options, NPC behavior, death narrative, and some game mechanics (e.g., ability to smuggle children out of quarantine requires rep ≥ 6).

### Reusable Elements

**4a. `$reputation` variable and display logic** — Tiered reputation labels (0-2: "worthless rogue", 3-5: "bad credit", 6-8: "good credit", 9-10: "worthy soul").
- **Reuse difficulty: Very Low** — completely generic
- **What to change:** Label text, tier boundaries, starting value per social class

**4b. Reputation as a gate for player options** — Pattern of `<<if $reputation gte X>>` to unlock/lock choices.
- **Reuse difficulty: Very Low** — a design pattern, not specific code

**4c. `Math.clamp($reputation + N, 0, 10)` pattern** — Bounded reputation changes.
- **Reuse difficulty: Very Low** — generic

### Documentation Requirements
- Reputation scale, tiers, and labels
- Starting reputation by social class
- List of all actions that modify reputation and by how much
- List of all reputation gates (minimum reputation required for specific options)

---

## Category 5: Health, Disease & Death System

### Source Files
- `passages/076-infection-widgets.txt` (pid 76) — `infection-program` widget
- `passages/073-empty.txt` (pid 73) — `initDeathData` widget with parish mortality data
- `passages/040-sick-fam-widget.txt` (pid 40) — family sickness, quarantine choices, health updates
- `passages/109-NPC-death-widget.txt` (pid 109) — non-plague NPC death (contagious diseases, old age)
- `passages/062-death-widget.txt` (pid 62) — player death announcement
- `passages/050-sickPC.txt` (pid 50) — player character plague infection
- `passages/006-Sickness.txt` (pid 6) — plague sickness narrative
- `passages/005-death.txt` (pid 5) — player death
- `passages/080-preventatives-treatments.txt` (pid 80) — remedies and fumigants

### What It Does
A multi-layered health simulation:
1. **Monthly infection check** — each NPC rolls against parish-specific historical infection rate
2. **Disease progression** — infected NPCs either die (50%, or 33% with plaster) or recover
3. **Non-plague death** — infants (5.6%/month), children (0.1%/month), elderly (1%/month) from weighted causes of death
4. **Contagion** — smallpox and measles can spread to other household members
5. **Player plague** — triggers quarantine narrative branch
6. **Treatment system** — fumigants reduce infection chance; plaster improves survival odds

### Reusable Elements

**5a. `infection-program` widget** — Monthly disease check against per-location rates for all NPC arrays.
- **Reuse difficulty: Medium** — the *pattern* of rolling against location-specific rates is excellent and applicable to any epidemic game (cholera in 19th-century London, malaria in Virginia, etc.)
- **What to change:** Replace `$parishRate` with equivalent data; adjust the rate interpretation (currently `random(1, rate) eq 1`)
- **Dependencies:** `$parishRate` data table, all NPC arrays, `$monthIndex`

**5b. `health-update` widget** — Resolves infected NPCs to dead/recovered with remedy modifiers.
- **Reuse difficulty: Low-Medium** — the survive/die roll pattern is generic
- **What to change:** Base survival probability, remedy effects, specific diseases

**5c. `NPC-death` widget** — Background non-epidemic mortality using weighted cause-of-death tables.
- **Reuse difficulty: Medium** — very valuable for any historical game; models infant mortality, childhood death, elderly death, and contagion (smallpox/measles spreading within households)
- **What to change:** Replace `_causeWeights` objects with period-appropriate data; adjust mortality rates per age group
- **Dependencies:** All 4 NPC arrays, `weightedEither()`, `funeral-choice` widget

**5d. Fumigant/preventative system** — Items that modify infection probability.
- **Reuse difficulty: Low** — the pattern of consumable items that modify disease rolls is reusable
- **What to change:** Item names, costs, effects

**5e. Treatment system** (`player-treatments`, `hh-treatments`) — Player choices that affect survival probability.
- **Reuse difficulty: Low-Medium** — the pattern of treatment choices affecting outcome is reusable
- **What to change:** Treatment names, costs, effects; period-appropriate medical options

**5f. `death-announcement` widget** — Final narrative based on reputation and social class.
- **Reuse difficulty: Low** — the pattern of varying death narrative by character traits is reusable
- **What to change:** All narrative text; burial customs for the new period

### Documentation Requirements
- Health state machine diagram (healthy → infected → deceased/recovered)
- Infection probability formula and how location-based rates work
- Mortality rates by age group and cause-of-death weights
- Treatment/remedy effects on survival probability
- Guide to building location-specific mortality data tables
- Contagion rules for diseases that spread within households

---

## Category 6: Life Events System

### Source Files
- `passages/113-random-events-widget.txt` (pid 113) — main event dispatcher
- `passages/107-marriage-market.txt` (pid 107) — marriage seeking
- `passages/108-wedding.txt` (pid 108) — wedding ceremony choices
- `passages/110-pregnant.txt` (pid 110) — pregnancy
- `passages/111-birth.txt` (pid 111) — childbirth
- `passages/112-miscarriage.txt` (pid 112) — miscarriage
- `passages/097-accident.txt` (pid 97) — workplace accidents
- `passages/099-elderly.txt` (pid 99) — elderly death
- `passages/101-fever.txt` (pid 101) — random fever
- `passages/100-runover.txt` (pid 100) — street accidents (beggars)
- `passages/093-steward.txt` (pid 93) — steward event (nobles)
- `passages/114-Claude-widgets.txt` (pid 114) — church office, lodger choice

### What It Does
A priority-cascade event system that fires one event per month. Events are selected based on character state (social class, age, marital status, pregnancy) and random rolls. The cascade ensures plague always takes priority, followed by life events, then class-specific events.

### Reusable Elements

**6a. `random-events` widget** — The priority-cascade event dispatcher pattern.
- **Reuse difficulty: Medium** — the *architecture* is highly reusable: check for crisis events first, then life events, then class-specific events, then fallback
- **What to change:** The specific events in each tier; the random roll thresholds
- **Dependencies:** Nearly everything — NPC system, health system, economy, reputation

**6b. Pregnancy/birth/miscarriage system** — Tracks pregnancy over multiple months with age-dependent miscarriage risk.
- **Reuse difficulty: Low** — nearly universal for historical settings
- **What to change:** Pregnancy duration (already 9 months), miscarriage rates, maternal mortality rate (currently 1/30), stillbirth rate (1/4), celebration costs

**6c. Marriage system** (`marriage-market`, `wedding`) — Seeking, courtship, and wedding with multiple ceremony options affecting cost, reputation, and infection risk.
- **Reuse difficulty: Low** — the pattern of marriage options with different costs/reputation effects is reusable
- **What to change:** Ceremony types, costs, reputation effects, narrative text

**6d. Accident system** — Random workplace accidents with survive/die outcomes.
- **Reuse difficulty: Low** — generic pattern; just change the accident types and narrative
- **What to change:** Accident descriptions, class-specific risks

**6e. Church office system** (`hold-office`) — Election to parish positions based on eligibility criteria.
- **Reuse difficulty: Low-Medium** — the pattern of being offered a position based on reputation/class/demographics is reusable for any community role system
- **What to change:** Office types, eligibility criteria, consequences of accepting/declining

**6f. Lodger system** (`add-lodgers`, `lodger-choice`) — Taking in lodgers for income, with various lodger family configurations.
- **Reuse difficulty: Low** — useful for any setting where housing others is an option
- **What to change:** Lodger types, rent amounts, capacity by class

### Documentation Requirements
- Event priority cascade diagram
- List of all events, their triggers, and their effects
- Pregnancy timeline and risk table
- Marriage option comparison table (cost, reputation, infection risk)
- Guide to adding new event types to the cascade

---

## Category 7: Timeline & Storyline Architecture

### Source Files
- `passages/010-StoryInit.txt` (pid 10) — `$timeline` array and `$catchUpSummaries`
- `passages/011-PassageHeader.txt` (pid 11) — per-passage setup logic
- `passages/041-storyline-return-widget.txt` (pid 41) — `storyline-return` navigation widget
- Monthly storyline passages (pids 2, 9, 16-34) — tagged with `storyline` and year

### What It Does
The game advances through a fixed timeline (`$timeline` array of month names). Each month is a Twine passage tagged with `storyline` and a year tag (`1665` or `1666`). The `PassageHeader` runs infection checks, income/expense calculations, and debt checks before each storyline passage. A `$monthIndex` variable tracks position in the timeline. The `catch-up` widget summarizes skipped months.

### Reusable Elements

**7a. `$timeline` array + `$monthIndex` tracking** — Fixed sequence of time periods the game progresses through.
- **Reuse difficulty: Very Low** — just replace the month/year labels
- **What to change:** Timeline entries; could be months, seasons, or years

**7b. `PassageHeader` pattern** — Automatic per-passage setup that runs infection, income, and other systems.
- **Reuse difficulty: Low** — the pattern of using `PassageHeader` (a SugarCube special passage) as an automatic system-tick is highly reusable
- **What to change:** Which systems run each tick

**7c. Tag-based passage routing** — Using `tags().includes("storyline")` to identify passage types and trigger appropriate behavior.
- **Reuse difficulty: Very Low** — standard SugarCube pattern

**7d. `catch-up` widget** — Summarizes skipped time periods when the player re-enters the main timeline.
- **Reuse difficulty: Low** — useful for any game where the player can miss months (e.g., due to imprisonment, illness, travel)
- **What to change:** `$catchUpSummaries` array content

**7e. `storyline-return` widget** — Navigates back to the current month's passage after an event.
- **Reuse difficulty: Very Low** — generic navigation pattern

### Documentation Requirements
- Timeline array format and how `$monthIndex` is maintained
- Passage naming and tagging conventions
- PassageHeader execution flow diagram
- Guide to adding new time periods to the timeline

---

## Category 8: UI Framework & Sidebar System

### Source Files
- `passages/067-StoryInterface.txt` (pid 67) — HTML layout with sidebar
- `passages/056-StoryCaption.txt` (pid 56) — sidebar status display
- `passages/072-storyMenu.txt` (pid 72) — sidebar menu with dialog popups
- `passages/069-storyLogo.txt` (pid 69), `passages/070-gameTitle.txt` (pid 70), `passages/071-storyAuthor.txt` (pid 71) — sidebar branding

### What It Does
A custom sidebar layout with: game title, logo, author, history navigation buttons (back/forward), save/load/settings buttons, and contextual menu items (Apothecary, Inventory, Household Status, Flight) that open as dialog popups.

### Reusable Elements

**8a. `StoryInterface` HTML template** — Complete sidebar layout with toggle, history nav, save/load/settings, and menu.
- **Reuse difficulty: Very Low** — drop-in reusable; just change branding
- **What to change:** Logo, title, author, icon library references

**8b. Dialog popup pattern** — `<<run Dialog.setup("Title", "class"); Dialog.wiki(Story.get("Passage").text); Dialog.open()>>`
- **Reuse difficulty: Very Low** — standard SugarCube pattern for modal dialogs
- **What to change:** Dialog content passages

**8c. Conditional menu items** — Menu items that appear/disappear based on game state.
- **Reuse difficulty: Very Low** — just change the conditions

### Documentation Requirements
- StoryInterface HTML structure explanation
- How to add/remove sidebar menu items
- Dialog popup usage pattern
- CSS classes used and their purposes

---

## Category 9: Glossary / Tooltip System

### Source Files
- `passages/081-glossary-widgets.txt` (pid 81) — ~29 KB of `def*` widgets

### What It Does
Over 80 widgets named `def<Term>` (e.g., `defPlague`, `defParish`, `defApothecary`) that wrap inline text in a `<span class="def" data-def="...">` element, creating hover tooltips with historical definitions.

### Reusable Elements

**9a. The glossary widget pattern** — `<<widget "defTerm">><<nobr>><span class="def" data-def="Definition text.">$args[0]</span><</nobr>><</widget>>`
- **Reuse difficulty: Very Low** — the pattern is perfectly generic
- **What to change:** All term definitions; replace with period-appropriate glossary entries

**9b. Dynamic glossary widgets** — `defVarReligion`, `defVarSocio`, `defVarRelationship` route to the correct definition based on the player's current attribute value.
- **Reuse difficulty: Very Low** — clever pattern for variables that can take different values

### Documentation Requirements
- Widget naming convention (`def` + PascalCase term)
- CSS required for `.def` class (hover tooltip styling)
- Template for adding new glossary entries
- Guide to creating dynamic/variable-dependent glossary widgets

---

## Category 10: Decision Tracking & End-of-Game Stats

### Source Files
- `passages/075-final-stats-widgets.txt` (pid 75) — ~19 KB of stats widgets
- `passages/048-stats.txt` (pid 48) — stats display passage

### What It Does
Every player decision is logged to `$decisions` array as an object: `{text, money, repDelta, repBefore, infectPct}`. At game end, widgets analyze this data to produce: household mortality stats, parish risk analysis, character trait effects, plague exposure summary, historical death comparisons, and a plague timeline.

### Reusable Elements

**10a. `$decisions` tracking array** — Pattern of logging every decision with its mechanical effects.
- **Reuse difficulty: Very Low** — generic data logging pattern
- **What to change:** Add/remove tracked fields as needed for the new game's mechanics

**10b. `stats-household-mortality` widget** — Counts deaths across all NPC arrays.
- **Reuse difficulty: Low** — the pattern of iterating NPC arrays and tallying health states is reusable
- **What to change:** Health state strings, historical comparison text

**10c. `stats-parish-risk` widget** — Calculates cumulative infection probability from rate data.
- **Reuse difficulty: Medium** — the math is correct and reusable for any location-based risk model
- **What to change:** Data source, risk display format

**10d. `stats-cumulative-risk` widget** — Calculates combined risk from all player decisions.
- **Reuse difficulty: Low** — generic cumulative probability calculation

**10e. `stats-characteristics` widget** — Explains how each character trait affected survival.
- **Reuse difficulty: Low** — the pattern of trait-based narrative explanation is reusable
- **What to change:** All narrative text, trait categories

**10f. `stats-non-plague-deaths` / `stats-timeline` widgets** — Historical data presentation.
- **Reuse difficulty: Low** — the pattern of presenting historical context at game end is reusable
- **What to change:** All data and narrative text

### Documentation Requirements
- `$decisions` object schema
- Guide to adding new tracked metrics
- How cumulative probability is calculated
- Template for creating new stats widgets

---

## Category 11: Weighted Random Selection Infrastructure

### Source Files
- `passages/010-StoryInit.txt` (pid 10) — `$fNames`, `$mNames`, parish tables, social class weights

### What It Does
The game makes extensive use of SugarCube's `weightedEither()` function with large objects where keys are options and values are relative weights. This powers: name selection, parish assignment, social class distribution, character attribute generation, cause-of-death selection, and more.

### Reusable Elements

**11a. Weighted name pool pattern** — `{name: frequency, ...}` objects for historically-accurate name generation.
- **Reuse difficulty: Very Low** — the data structure is generic; just replace with period-appropriate names and frequencies
- **What to change:** All names and weights

**11b. Weighted geography pattern** — `{location: population, ...}` objects for realistic geographic distribution.
- **Reuse difficulty: Very Low** — replace with appropriate locations
- **What to change:** Location names and populations

**11c. Weighted attribute generation** — `weightedEither({option: weight, ...})` for any attribute where historical distribution matters.
- **Reuse difficulty: Very Low** — completely generic

### Documentation Requirements
- Format specification for weighted objects
- How to derive weights from historical sources
- Example of converting census/parish register data to weight objects

---

## Category 12: Historical Data Architecture

### Source Files
- `passages/073-empty.txt` (pid 73) — `$parishRate`, `$corpseBuried`, `$corpsePlague` (~36 KB)
- `passages/010-StoryInit.txt` (pid 10) — parish population tables, `$fireParishes`

### What It Does
Three massive data structures drive the game's historical accuracy:
1. `$parishRate` — per-parish, per-month infection probability (1-in-N chance)
2. `$corpseBuried` — per-parish, per-month total burials
3. `$corpsePlague` — per-parish, per-month plague-attributed burials

These are indexed by parish name (string key) and month index (array position matching `$timeline`).

### Reusable Elements

**12a. The data architecture pattern** — `{location: [month0, month1, ...month21]}` indexed by place and time.
- **Reuse difficulty: Very Low** — the *pattern* is trivially reusable
- **What to change:** All data; the research effort to compile equivalent data for another period is the real cost

**12b. `initDeathData` widget** — Initializes all data tables in one call.
- **Reuse difficulty: Very Low** — just a wrapper widget

**12c. Rate-to-probability conversion** — `random(1, rate) eq 1` for infection checks; rates derived from historical burial data.
- **Reuse difficulty: Low** — the methodology of converting historical death records to per-person-per-month probabilities is reusable
- **What to change:** The derivation formula will depend on available historical sources

### Documentation Requirements
- Data table format specification
- How to derive infection rates from historical burial records
- Methodology for converting raw death counts to per-capita probabilities
- Guide to compiling equivalent data from Bills of Mortality, parish registers, or census data

---

## Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    STANDALONE SYSTEMS                           │
│  (can be extracted independently)                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Economy/Money │  │ Reputation   │  │ Glossary/    │         │
│  │   System     │  │   System     │  │  Tooltips    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ UI/Sidebar   │  │ Weighted     │  │ Decision     │         │
│  │  Framework   │  │  Random      │  │  Tracking    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                INTERCONNECTED CORE                              │
│  (must be extracted together or carefully decoupled)            │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ Character Gen    │◄────── Name Pools, Weighted Random       │
│  └────────┬─────────┘                                          │
│           │ creates                                             │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ NPC & Household  │◄────── Pronouns, Relationship Strings   │
│  │   Management     │                                          │
│  └────┬───────┬─────┘                                          │
│       │       │                                                 │
│       │       ▼                                                 │
│       │  ┌──────────────────┐                                  │
│       │  │ Health/Disease/  │◄────── Historical Data Tables    │
│       │  │    Death         │                                  │
│       │  └────────┬─────────┘                                  │
│       │           │                                             │
│       ▼           ▼                                             │
│  ┌──────────────────┐                                          │
│  │   Life Events    │◄────── Economy, Reputation               │
│  └──────────────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Timeline/        │◄────── PassageHeader, Tags               │
│  │ Storyline Arch   │                                          │
│  └──────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Dependency Chains

1. **Character Gen → NPC System → Health System → Life Events**: These four form the core simulation loop. Extracting any one requires understanding how it interfaces with the others.

2. **Historical Data → Health System → Life Events**: The disease model is driven by parish-level data. A new game needs equivalent data compiled from historical sources.

3. **NPC System → all combat/event widgets**: Nearly every widget operates on the 5 NPC arrays. Changing the array structure requires updating dozens of widgets.

4. **`$socio` (social class) → Economy, Character Gen, Life Events, Narrative**: Social class is the single most cross-cutting variable, affecting income, expenses, household size, available events, narrative text, and more.

---

## Documentation Requirements

### For Each Reusable System, Document:

1. **Interface specification**
   - What global variables does it read?
   - What global variables does it write/modify?
   - What widgets does it call?
   - What widgets call it?

2. **Configuration points**
   - What values need to change for a new setting?
   - What is hardcoded vs. data-driven?
   - What are the valid value ranges?

3. **Data format specifications**
   - Schema for NPC objects
   - Schema for `$decisions` objects
   - Format for weighted selection objects
   - Format for historical data tables

4. **Adaptation guide**
   - Step-by-step instructions for adapting each system to a new period
   - List of all narrative text that needs replacement
   - List of all relationship strings and where they're referenced
   - List of all historical data that needs replacement

### Recommended Documentation Deliverables

| Document | Description | Priority |
|----------|-------------|----------|
| **System Architecture Guide** | Overview of all systems, how they interact, and the execution flow of a typical game month | Critical |
| **Variable Reference** | Complete list of all global variables (exists as `variables.md` but would need expansion) | Critical |
| **NPC Object Schema** | Formal specification of the NPC data structure and all valid property values | Critical |
| **Widget Dependency Graph** | Which widgets call which other widgets | High |
| **Data Format Guide** | How to structure name pools, parish data, mortality rates for a new setting | High |
| **Adaptation Checklist** | Step-by-step checklist for creating a new game from this codebase | High |
| **Narrative Text Inventory** | Complete list of all hardcoded narrative text that needs replacement | Medium |
| **Historical Research Guide** | What historical data sources are needed and how to convert them to game data | Medium |
| **CSS/Styling Guide** | How the visual design works and what CSS classes are used | Low |
| **SugarCube Patterns Guide** | Explanation of SugarCube-specific patterns used (special passages, macros, etc.) | Low |

---

## Summary of Extraction Effort Estimates

| System | Lines of Code | Extraction Effort | Adaptation Effort | Total Effort |
|--------|--------------|-------------------|-------------------|--------------|
| Character Generation | ~500 | 2-3 hours | 4-8 hours (new name pools, attributes) | 6-11 hours |
| NPC & Household | ~800 | 4-6 hours | 8-16 hours (new relationships, rules) | 12-22 hours |
| Economy & Money | ~120 | 1 hour | 2-4 hours (new income/expense values) | 3-5 hours |
| Reputation | ~50 | 30 min | 1-2 hours (new labels, thresholds) | 1.5-2.5 hours |
| Health/Disease/Death | ~600 | 4-6 hours | 16-40 hours (new disease model, data) | 20-46 hours |
| Life Events | ~400 | 3-4 hours | 8-16 hours (new events, narrative) | 11-20 hours |
| Timeline Architecture | ~100 | 1-2 hours | 2-4 hours (new timeline, summaries) | 3-6 hours |
| UI Framework | ~100 | 1 hour | 1-2 hours (new branding) | 2-3 hours |
| Glossary/Tooltips | ~600 | 1 hour | 8-16 hours (new glossary entries) | 9-17 hours |
| Decision Tracking & Stats | ~400 | 2-3 hours | 8-16 hours (new stats, historical context) | 10-19 hours |
| Weighted Random Infrastructure | ~50 | 30 min | Variable (depends on data compilation) | Variable |
| Historical Data Architecture | ~200 | 1-2 hours | 20-80 hours (historical research) | 21-82 hours |

**Total estimated effort for full extraction and documentation:** 40-60 hours
**Total estimated effort for full adaptation to a new setting:** 80-200+ hours (dominated by historical research for data tables and narrative writing)
