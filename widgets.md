# Widget Reference

Comprehensive reference for all SugarCube `<<widget>>` macros defined in the game. Widgets are grouped by the passage file that defines them, organized into functional categories.

---

## Character Generation Widgets

**Passage:** `014-char-gen-widgets.txt` (pid 14)

| Widget | Description |
|--------|-------------|
| `setAge` | Converts a random numeric age (drawn from `$minAge`–`$maxAge`) into an age-bracket string (`$NPCAge`: "infant", "child", "adolescent", "young adult", "middle-aged adult", or "elderly adult") and stores the numeric value in `$NPCAgeNum`. |
| `addPartnerNPC` | Generates a spouse NPC for the player (husband if female, wife if male) with an age within ±15 years of the player, and adds them to `$NPCs`. |
| `addNewbornNPC` | Creates a newborn infant NPC (randomly male or female) and appends them to the player's `$NPCs` array. |
| `addChildNPC` | Generates a child NPC (son or daughter) with a random age younger than the player, ensuring no duplicate names among siblings, and adds them to `$NPCs`. |
| `addParentNPC` | Generates mother and/or father NPCs (each with a 75% chance of existing, 1-in-6 chance of being a step-parent), placing them in `$NPCs` if the player is young and single or in `$NPCsExtended` otherwise. Guarantees at least one parent for children aged 15 and under. |
| `addSiblingsNPC` | Generates a sibling NPC (brother or sister) with age constrained by parent ages, placing them in `$NPCs` if the player is young and single or in `$NPCsExtended` otherwise. Ensures no duplicate sibling names. |
| `NPCpronouns` | Iterates through all NPCs in `$NPCs` and `$NPCsExtended` and assigns `heshe`, `hishers`, and `gender` properties based on each NPC's relationship string (e.g., "daughter" → "she"/"her"/"female"). |
| `addServantNPC` | Generates a class-appropriate number of servant NPCs (8–12 for nobles, 1–3 for merchants, 0–1 for artisans, 0 for others) and adds them to `$NPCsServants`. |
| `playerName` | Selects the player's name from historically weighted name pools, boosting origin-appropriate names by 5× for Irish, Scottish, Dutch, French, or other foreign origins. |
| `playerAge` | Converts the player's age bracket string (`$age`) into a random numeric age (`$agenum`) within the appropriate range (e.g., "child" → 5–9, "elderly adult" → 60–76). |
| `parish` | Assigns the player's parish (`$parish`) by drawing from a weighted pool of parishes matching their geographic location within London. |
| `addApprenticeNPC` | Creates a male adolescent apprentice NPC and adds them to `$NPCs`, setting `$apprentice` to 2. |
| `addWorkerKidNPC` | Creates one or two adolescent NPCs (friend's son/daughter) for day labourer or servant players, adding them to `$NPCs` and setting `$worker` to 2. |
| `addWardNPC` | Creates one or two adolescent ward NPCs for noble players, adding them to `$NPCs` and setting `$ward` to 2. |
| `random-character` | Generates a complete random player character by rolling gender, age, relationship status, religion, origin, name, social class, location, and parish from historically weighted distributions. |

---

## Household & NPC Management Widgets

### Head of Household and Caretaker

**Passage:** `124-hoh-caretaker.txt` (pid 124)

| Widget | Description |
|--------|-------------|
| `set-hoh` | Determines and sets the `$hoh` (head-of-household) value for the player by inspecting their age, gender, social class, NPC relationships, and marital status, encoding whether the player is a child dependent (0), independent adult (1), adult living with parents (2), servant under a master (3), or married woman under coverture (4). |
| `set-caretaker` | Sets `$caretakerLabel` to the relationship string of the player's current authority figure (master/mistress title, "husband", or a parent/guardian relationship) based on `$hoh`, used in narrative text to refer to whoever controls the player's household decisions. |

### Authority & Ordering

**Passage:** `084-find-authority-widget.txt` (pid 84)

| Widget | Description |
|--------|-------------|
| `find-authority` | Searches the player's NPC array and sets `_authorityIdx` to the index of the living NPC who holds legal or social authority over the player (parent, master, or husband depending on `$hoh`), or -1 if the player is independent. |

**Passage:** `086-order-NPCs-widget.txt` (pid 86)

| Widget | Description |
|--------|-------------|
| `orderNPCs` | Sorts a given NPC array in-place by household social precedence (landlord/master first, then parents, uncles, aunts, guardians, general household members, servants, and lodgers), with age as a tiebreaker within each rank. |

### Adding Masters

**Passage:** `126-add-master-widgets.txt` (pid 126)

| Widget | Description |
|--------|-------------|
| `addMaster` | Moves the player's existing family to `$NPCsExtended`, generates a new master's household via `addMasterHousehold`, places the player into service as a servant, and recalculates head-of-household status. Used for apprenticeship, forced service, orphan placement, and impressment. |
| `addMasterHousehold` | Generates a complete master's household for the player to serve in: a master (80% male, 20% widowed female) with optional wife, parents, children, and servants, sized by social class (2–4 for artisans, 3–6 for merchants, 5–10 for nobles). Populates `$NPCsMaster`. |

### Moving NPCs Between Households

**Passage:** `085-moving-NPCs-widgets.txt` (pid 85)

| Widget | Description |
|--------|-------------|
| `servant-marriage-moveout` | When a servant gets married, moves the master's household NPCs to extended family, establishes the servant's own independent household with their new spouse, and either congratulates (reputation ≥ 6) or demotes them to day labourer (reputation < 6). |
| `removeServants` | Releases half the servants (rounded up) from a noble, merchant, or artisan household to reduce expenses, removing them in alternating youngest/oldest order and moving them to `$NPCsExtended`. |
| `noble-child-service-check` | For merchants and nobles with `$money ≤ 0`, offers to send the youngest child/adolescent to live as a ward with a relative (or sends the PC themselves if they are a child), building a new guardian household if accepted. Fires once per month. |
| `leave-service` | Handles a servant leaving their master's household: clears `$NPCsMaster`, swaps `$NPCs` with `$NPCsExtended` for single/betrothed servants (returning to their own family), and recalculates pronouns and head-of-household. Does not change `$socio`. |

### Sidebar Display

**Passage:** `125-sidebar-NPCs.txt` (pid 125)

| Widget | Description |
|--------|-------------|
| `ListNPCs` | Renders the sidebar household panel, displaying all NPCs across the player's active household, fled family, extended family, servants, and master's household in sorted order with their age, relationship label, and health status (masking unrevealed plague infections as "healthy"). |

**Passage:** `128-npc-rel-label.txt` (pid 128)

| Widget | Description |
|--------|-------------|
| `npc-rel-label` | Outputs an NPC's relationship label, substituting "fellow servant" for "male servant" or "female servant" when the player is themselves a servant, to avoid awkward self-referential phrasing. |

---

## Financial Widgets

### Income, Expenses, and Money

**Passage:** `077-money-widgets.txt` (pid 77)

| Widget | Description |
|--------|-------------|
| `income` | Calculates the player's monthly income (`$income`) based on social class, gender, age, and the number of living earning household members. Handles halved income when fled and partial income recovery when household is sent away. |
| `expenses` | Calculates the player's monthly expenses (`$expenses`) based on social class, household size (family members + servants), and special costs like seeking preferment. Servants in a master's household pay only their own expenses. |
| `disposable` | Computes disposable income (income minus expenses) and applies it to `$money`, clamped to ±10,000,000. |
| `conversion` | Converts a pence amount (defaults to `$money`) into a formatted pounds/shillings/pence string (e.g., "£1, 5 s., 3 d."). |
| `money` | Adds a specified pence amount to `$money` and updates the on-screen money display via `<<replace>>`. |
| `party-costs` | Calculates class-scaled party/celebration costs (2400d for nobles down to 6d for lower classes), deducting from `$money` unless the master pays for servant players. |
| `quarantine-costs` | Calculates weekly quarantine costs (expenses only for most classes, income minus expenses for nobles) and applies them to `$money`, then checks for quarantine debt. |
| `master-pays` | Deducts a pence amount from `$money` unless the player is a servant living in their master's household (or nursing in the master's household during quarantine), in which case the master absorbs the cost. Sets `_masterPaid` flag. |

### Debt and Prison

**Passage:** `058-debtor-widgets.txt` (pid 58)

| Widget | Description |
|--------|-------------|
| `debtor` | Checks if the player has exceeded their debt ceiling (scaled by social class) and triggers the prison sequence if so. |
| `prison` | The main debtor's prison handler: releases half the servants, triggers forced child service, then processes the debt based on the player's household status — servants may be bailed out or dismissed, dependent players' authority figures may go to prison, and independent players face prison directly. Offers creditor patience (high reputation), asset sales (medium reputation), or Navy recruitment (low reputation) as alternatives. |
| `debt-sell-option` | Offers players with reputation 4–5 a one-time chance to sell assets (land for nobles, household goods for others) to clear debts. On second use, nobles can sell their townhouse or flee; non-nobles face prison or flight. |
| `debt-navy-option` | Offers eligible male PCs (aged 16–59, non-noble) a choice to volunteer for the Royal Navy to escape debtor's prison, with a signing bonus of two months' income. |
| `debt-navy-npc-option` | Searches for an eligible male NPC household member to send to the Navy in exchange for debt forgiveness, or commits the player to prison if none is found. |
| `debt-prison-commit` | Routes the player to the Navy option (if eligible) or the NPC Navy option as a fallback when other debt resolution options are refused. |
| `debtor-prison-check` | Monthly check called while `$inDebtorsPrison` is 1: releases the player if debts improve, or after 3 months via a convenient inheritance from a distant relative. Second+ imprisonments are permanent. |
| `debt-check` | Cancels church service skipping if the player falls into debt, since they can no longer afford recusancy fines. |
| `quarantine-debt-check` | Checks if the player has run out of money during quarantine and offers a choice to break quarantine (risking being caught) or stay put. |
| `pc-prison-impressment` | Commits the player to debtor's prison with a plague infection roll and a 50% chance of Navy impressment for eligible male non-nobles. Optionally strips parish office. |

### Debt Ceiling

**Passage:** `062-death-widget.txt` (pid 62)

| Widget | Description |
|--------|-------------|
| `calculate-ceiling` | Computes the player's debt ceiling (the negative money threshold at which debt is considered excessive) and sets `_debtExceeded` if `$money` falls below that threshold, scaling by social class. |

---

## Plague & Infection Widgets

### Infection Mechanics

**Passage:** `076-infection-widgets.txt` (pid 76)

| Widget | Description |
|--------|-------------|
| `infection-program` | The core plague infection engine: uses parish-level historical mortality data to roll for plague infection for the player and every healthy NPC across all household arrays (`$NPCs`, `$NPCsServants`, `$NPCsMaster`, `$NPCsExtended`), then calls `check-NPCs` to identify the newly infected. |
| `quarantine-reconnect` | Handles the end of quarantine: collects all dead NPCs for a grouped funeral, chains through orphan checks, servant-master death succession, health updates, child returns, catch-up summaries, and storyline advancement, using jQuery `show()`/`hide()` gating to sequence decisions. |
| `plague-risk-check` | Centralizes the player plague infection probability check (previously copy-pasted across 30+ locations). Computes `_riskPct` for display and rolls for infection. Accepts an optional "crowd" argument for a +2% bonus and extra 1-in-50 roll. |
| `check-infected` | Scans one NPC array (passed by variable name string) for members with health "infected" and returns their indices in `_infectedResult`. |

### Sick Family & Quarantine

**Passage:** `040-sick-fam-widget.txt` (pid 40)

| Widget | Description |
|--------|-------------|
| `sickFam` | Displays the plague diagnosis scene when household members are found infected, listing all infected NPCs across family, servants, master's household, and extended family, then presents the player with a choice to quarantine with their household or send the sick to the pesthouse. |
| `check-NPCs` | Scans all four NPC arrays (`$NPCs`, `$NPCsServants`, `$NPCsMaster`, `$NPCsExtended`) for infected members using `check-infected` and sets `_infectedFamily`, `_infectedServants`, `_infectedMaster`, `_infectedExtended`, and `_anyInfected`. |
| `fled-family` | Handles sending the player's household away to safety: moves family and most servants to `$FledFamily`/`$FledServants`, keeps the authority figure (or a stay-behind) with the player, and handles special cases for child PCs and noble servant retention. Blocks if any NPC is infected. |
| `health-update` | Resolves plague outcomes for all infected NPCs: rolls for death or recovery (with remedy effects improving survival odds), updates health statuses across servants, master's household, and extended family, and displays death/recovery announcements. |
| `sickOtherHH` | Handles plague infection in the master's household or extended family (not the player's immediate household), presenting the player with a choice to go nurse the sick (entering quarantine with them) or remain in their own household and pray. |
| `swap-to-other-hh` | Saves the player's current household, then swaps them into either the master's household or extended family array for quarantine nursing, clearing the original arrays and recalculating head-of-household. |

### Player Sickness

**Passage:** `050-sickPC.txt` (pid 50)

| Widget | Description |
|--------|-------------|
| `sickPC` | Marks the player as infected with plague, reveals the infection status, and presents them with a choice to either openly warn their neighbors (maintaining reputation) or attempt to hide their symptoms (significant reputation cost). |

### Smallpox & Measles

**Passage:** `088-smallpox-measles-infection-widget.txt` (pid 88)

| Widget | Description |
|--------|-------------|
| `npc-death-roll` | Processes natural (non-plague) death rolls for one NPC array using historically weighted cause-of-death tables. Infants have a 5.6% monthly death rate, children 0.1%, and elderly adults 1%. Reports deaths and flags contagious diseases (smallpox/measles) for spread. |
| `npc-contagion-spread` | After an initial contagious death (smallpox or measles), spreads the disease to remaining healthy NPCs in the same array: smallpox kills 30% and infects 60%, measles kills 10% and infects 80%. Reports all secondary deaths and survivals. |

---

## Plague Work & Roles

**Passage:** `068-plague-work.txt` (pid 68) — contains `plague-work-choice` and `plague-work`

| Widget | Description |
|--------|-------------|
| `plague-work-choice` | Presents a one-time offer from the parish to take on a plague-work role (corpsebearer, warder, nurse, or searcher, depending on gender and reputation), letting the player accept or refuse and setting `$role` accordingly. |
| `plague-work` | Displays flavor text and an illustration describing the player's current plague-work duties (corpsebearer, searcher, nurse, or warder), narrating what their day-to-day role looks like during the epidemic. |

**Passage:** `091-corpse-work-widget.txt` (pid 91)

| Widget | Description |
|--------|-------------|
| `corpse-work` | Handles the monthly gameplay outcomes for corpsebearers and searchers (paying them per corpse, rolling for plague infection, and recording decisions) and presents nurses and warders with a choice of whether to attend a plague patient or guard a shut-up house, with infection risk and reputation consequences. |

---

## Health & Treatments

### Preventatives & Treatments

**Passage:** `080-preventatives-treatments.txt` (pid 80)

| Widget | Description |
|--------|-------------|
| `preventative` | Presents monthly plague prevention options: going to church to pray (with plague risk and reputation gain), avoiding certain foods, and visiting the apothecary. Also applies any purchased remedies (celestial water or London Treacle). |
| `player-treatments` | Displays treatment options for an infected player character: purgatives, blistering plasters, cordial tinctures, London Treacle possets, suppositories, and anti-diarrheals. Treatments can be purchased or used from inventory. Players without household members pay for a nurse (or the parish pays if broke). |
| `hh-treatments` | Displays treatment options for infected household NPCs, similar to `player-treatments` but scaled by the number of infected family members. Servants in master's households have costs covered by the master. |
| `fumigant-check` | Checks whether the player has any fumigants in stock and sets `_fumes` to 1 or 0. |
| `fumigant` | Consumes one month's supply of the player's best available fumigant (St. Giles Powder, cheap fumigants, incense purse, or incense) and displays flavor text about its use, with special messages for first use and last supply. |

---

## Monthly Events & Random Events

### Random Event Dispatcher

**Passage:** `113-random-events-widget.txt` (pid 113)

| Widget | Description |
|--------|-------------|
| `random-events` | The central monthly event dispatcher that runs at the top of each storyline passage: tracks pregnancy, rolls NPC non-plague deaths, checks for plague infection, and selects exactly one random event to fire (old age, wedding, apprenticeship offer, preferment, birth, miscarriage, fever, and class-specific events) before calling `church-services` if no event consumed the month. |

### Individual Random Events

**Passage:** `099-elderly.txt` (pid 99)

| Widget | Description |
|--------|-------------|
| `elderly` | Triggers the player's death from old age, displaying a short epitaph and routing to the death announcement. Used as a random event for elderly adult players. |

**Passage:** `097-accident.txt` (pid 97)

| Widget | Description |
|--------|-------------|
| `accident` | Rolls a random non-plague accident event that either kills the player outright (1 in 6 chance, with varied fatal accident descriptions) or injures them and costs money, then continues the storyline. |

**Passage:** `100-runover.txt` (pid 100)

| Widget | Description |
|--------|-------------|
| `runover` | Rolls a random cart-accident event (fatal in 1 of 6 cases) for beggars or characters caught in the Great Fire of September 1666, describing being run over and either killing the player or injuring them with reputation-dependent financial consequences. |

**Passage:** `101-fever.txt` (pid 101)

| Widget | Description |
|--------|-------------|
| `fever` | Rolls a random fever event that either kills the player (1 in 11 chance, modified by reputation for care quality) or injures them with a money loss, then continues the storyline. |

**Passage:** `093-steward.txt` (pid 93)

| Widget | Description |
|--------|-------------|
| `steward` | Fires a random event for noble players in which their country estate's steward has died, offering a choice of how fondly to respond (with or without a funeral) and how many months to spend settling the estate's affairs, with reputation and money consequences. |

---

## Life Events

### Pregnancy & Birth

**Passage:** `110-pregnancy-widgets.txt` (pid 110)

| Widget | Description |
|--------|-------------|
| `pregnant` | Announces the player's pregnancy, sets `$pregnant` to 4 (months until birth), and continues the storyline. |
| `miscarriage` | Handles a miscarriage event, clearing pregnancy state and displaying an appropriate message (early loss vs. announced pregnancy loss). |
| `birth` | Resolves a pregnancy: 1-in-30 chance of maternal death, 1-in-4 chance of stillbirth (with burial cost), or successful delivery with a choice between hosting a celebration (with plague risk and class-scaled cost) or a quick baptism. |

### Marriage

**Passage:** `108-wedding.txt` (pid 108)

| Widget | Description |
|--------|-------------|
| `wedding` | Presents a player who has found a match with three wedding format choices (parish church, private license, or Fleet prison elopement), each with different costs, reputation effects, and plague risks, then adds the spouse NPC, updates household structure, and handles servant consequences of marrying without permission. |

### Seeking Markets

**Passage:** `107-seeking-widgets.txt` (pid 107)

| Widget | Description |
|--------|-------------|
| `marriage-market` | Presents unmarried adult players with a one-time decision on whether to actively seek a spouse, setting `$seekingMarriage` accordingly and explaining the social and legal implications of marriage. |
| `preferment-market` | Presents noble players with a one-time decision on whether to invest in seeking royal preferment at court, setting `$seekingPreferment` and explaining costs and potential rewards. |
| `apprenticeship-market` | Presents young players (aged 14–21) with a one-time decision on whether to seek an apprenticeship, setting `$seekingApprenticeship` and explaining the legal, social, and civic benefits. |

### Apprenticeship & Preferment Offers

**Passage:** `122-apprenticeship.txt` (pid 122)

| Widget | Description |
|--------|-------------|
| `apprenticeship-offer` | When a player seeking an apprenticeship rolls a match, presents a tiered list of livery companies (basketmaker through mercer) gated by money and reputation, letting them pay the entry fee and move into a master's household or defer. |

**Passage:** `061-preferment.txt` (pid 61)

| Widget | Description |
|--------|-------------|
| `preferment-offer` | Fires when a noble player seeking preferment rolls a match, presenting a court position offer (clerkship or queen's household role) requiring a £20 payment, with options to accept (gaining reputation), decline and keep searching, or stop seeking. |

### Adding Dependents

**Passage:** `105-add-dependent-widget.txt` (pid 105)

| Widget | Description |
|--------|-------------|
| `worker-kid` | Presents a day labourer or servant player with an offer to take in a friend's child from the countryside, letting them accept (adding the child as an NPC, costing money, gaining reputation) or decline. |
| `apprentice` | Presents an artisan or merchant player with an offer to take in a friend's son as an apprentice, letting them accept (adding the apprentice NPC, costing money, gaining reputation) or decline. |
| `ward` | Presents a noble player with an offer to take in a friend's child as a ward at court, letting them accept (adding the ward NPC, spending a significant sum for court outfitting) or decline. |

---

## Church & Parish

### Church Services

**Passage:** `127-church-services-widget.txt` (pid 127)

| Widget | Description |
|--------|-------------|
| `church-services` | Handles monthly Church of England attendance: Church of England members attend automatically (with plague risk), while dissenters choose to attend, skip (paying a 48d. fine and potentially losing reputation), or commit to always skipping, with special handling for debt-forced attendance and the April 1666 Easter passage. |

### Parish Office

**Passage:** `103-parish-office-widget.txt` (pid 103)

| Widget | Description |
|--------|-------------|
| `hold-office` | Manages parish office eligibility and tenure for male Church of England artisans and merchants aged 30+: removes the player from office if reputation drops too low, and randomly offers eligible players the position of Churchwarden or Overseer of the Poor with a choice to accept (gaining reputation) or decline (paying a fine). |

### Bills of Mortality

**Passage:** `118-bom-widget.txt` (pid 118)

| Widget | Description |
|--------|-------------|
| `bill-subscribe` | Presents players at the start of the plague period with a decision to subscribe to the weekly Bills of Mortality (gaining parish death statistics each month for a small fee), and later revisits the subscription if the player falls into debt. |

---

## Fleeing & Travel

### Flee Choice

**Passage:** `064-flee-choice-widget.txt` (pid 64)

| Widget | Description |
|--------|-------------|
| `flee-choice` | The master flee/stay decision handler, branching by social class: servants follow or defy their master's decision, beggars and day labourers choose based on origin, artisans are gated by reputation, and merchants/nobles choose freely. Supports both initial and late-game flee contexts. |
| `decision-time` | Presents the common flee decision menu: remain with entire household, send household away but stay, flee with entire household, or (nobles only) follow the Court. Handles cost deductions and recording. |

### Fled Mechanics

**Passage:** `090-fled-widgets.txt` (pid 90)

| Widget | Description |
|--------|-------------|
| `flee-blocked` | Handles the scenario where a player or household member attempting to flee is prevented because they (or an NPC) are infected with plague, displaying the sickness narrative instead. |
| `fled-cost` | Calculates the player's income and expenses for a month spent fled from London, applying a bonus to income and a surcharge to expenses if the player is following the royal court. |
| `fled-broke` | Checks if the player has run out of money while fled from London, and if so, cancels court-following status, sets a broke flag, and redirects them to the specified passage. |

### Naval Experience

**Passage:** `111-naval-experience.txt` (pid 111)

| Widget | Description |
|--------|-------------|
| `naval-experience` | Resolves the outcome of a player's time serving in the Royal Navy with a random roll that can result in death in battle, capture as a prisoner of war, a serious disabling wound causing discharge, or safe return after the war ends. |

---

## Beggar-Specific Widgets

**Passage:** `051-beggar-choice-widgets.txt` (pid 51)

| Widget | Description |
|--------|-------------|
| `beggar-choice` | Presents beggar players with their monthly survival options: illegal highway begging (with arrest risk), gender-specific options like taking in laundry or washing church linens, joining the Navy, or simply trying to survive on existing resources. |

**Passage:** `054-beggar-roles.txt` (pid 54)

| Widget | Description |
|--------|-------------|
| `beggar-roles` | For beggars who remain in the city during the plague, assigns them a parish plague-work role (searcher, warder, nurse, or corpsebearer based on gender and reputation) and presents the choice to stay in London or flee back to their place of origin. |

---

## Servant-Specific Widgets

**Passage:** `092-servant-rep-widgets.txt` (pid 92)

| Widget | Description |
|--------|-------------|
| `dismiss-servant` | Randomly fires a dismissal event for servants with very low reputation (2 or below), converting them from servant to day labourer status if their employer decides to let them go. |
| `promote-servant` | Presents an apprenticeship offer to servants with perfect reputation (10) who are single and of apprenticeable age, allowing them to accept and transition to apprentice status or decline. |

---

## Death & Funerals

### Death

**Passage:** `062-death-widget.txt` (pid 62)

| Widget | Description |
|--------|-------------|
| `death-announcement` | Displays a personalized death epilogue for the player character, describing how they were buried (varying by reputation and social class) and offering a final religious reflection before linking to the end-game statistics passage. |

### NPC Death

**Passage:** `109-NPC-death-widget.txt` (pid 109)

| Widget | Description |
|--------|-------------|
| `NPC-death` | Manages monthly non-plague NPC deaths: rolls cause-of-death using historically weighted tables (by year), processes death rolls for all NPC arrays, handles contagion spread for smallpox/measles, triggers servant-master death succession and widow checks, and presents a combined funeral choice for all deaths that month. Only runs outside quarantine when no active plague infections exist. |
| `group-mortality-line` | Outputs one `<li>` element summarizing mortality for a named NPC group (e.g., "Your immediate family"), showing counts of survived, plague deaths, and other deaths. Used in the final statistics display. |

### Funerals

**Passage:** `013-NPC-funeral-widget.txt` (pid 13)

| Widget | Description |
|--------|-------------|
| `funeral-choice` | Presents the player with a choice between a quick burial (low cost) and a proper funeral (class-scaled cost with plague infection risk from the crowd) for one or more dead NPCs, recording the decision and either advancing the storyline or revealing a hidden continuation element (when called inline via sub-pattern C). |

### Widowed Check

**Passage:** `036-widow-widget.txt` (pid 36)

| Widget | Description |
|--------|-------------|
| `check-widowed` | Scans the player's active household and fled family arrays for a deceased spouse, updates `$relationship` to "widowed" if one is found, and recalculates head-of-household via `set-hoh`. |

### Servant-Master Death

**Passage:** `035-master-death-widget.txt` (pid 35)

| Widget | Description |
|--------|-------------|
| `servant-master-death` | Handles household succession when a servant player's master or mistress dies: promotes the master's father, mother, or oldest adult son to head of household in priority order, or dissolves the household and finds the servant a new employer if no qualifying relatives survive. |

### Orphan Check

**Passage:** `104-orphan-widget.txt` (pid 104)

| Widget | Description |
|--------|-------------|
| `orphan-check` | Detects when a child or adolescent player has lost all living adult household members, then rebuilds their household appropriately — finding a new master for servants, placing beggars and day labourers with a new employer, or moving upper-class children in with a guardian or relative. |

---

## Child-Related Widgets

### Child Smuggling

**Passage:** `119-child-smuggling-widgets.txt` (pid 119)

| Widget | Description |
|--------|-------------|
| `smuggle-children` | During quarantine, offers high-reputation independent players the chance to smuggle healthy children out of the shut-up house to safety in the countryside, using jQuery `show()`/`hide()` gating (sub-pattern C) to sequence the decision before the continuation content. |
| `return-children` | After quarantine ends, offers to bring back children who were smuggled to safety, restoring their health to "healthy" and location to the player's current location, using jQuery `show()`/`hide()` gating. |

### Child Service

**Passage:** `121-child-service-widgets.txt` (pid 121)

| Widget | Description |
|--------|-------------|
| `child-service-check` | Voluntary child service widget: when `$money ≤ 0` for beggars, day labourers, or artisans, offers to put the eldest child/adolescent into service, or the PC themselves if they are a child. Fires once per month. |
| `forced-child-service` | Called from the prison widget when the debt ceiling is exceeded: forcibly removes all children, adolescents, and young adults (age ≤ 21) from the household and puts them into parish service. Infants are exempt. May also bind the PC into service if eligible. |

---

## Lodger Widgets

**Passage:** `120-lodger-widgets.txt` (pid 120)

| Widget | Description |
|--------|-------------|
| `add-lodgers` | Generates a random lodger household (single adult, widowed parent with children, couple, or family) scaled by social class capacity (1 slot for servants/day labourers up to 5 for merchants) and adds them to `$NPCs`. |
| `lodger-choice` | After the Great Fire, presents the player with a choice to accept lodgers at high rent (reputation penalty), low rent, or decline, using head-of-household-aware decision text. |

---

## Storyline Progression

### Storyline Return

**Passage:** `041-storyline-return-widget.txt` (pid 41)

| Widget | Description |
|--------|-------------|
| `storyline-return` | Renders a clickable link that advances the player to the next passage on the timeline (by a configurable number of months), while optionally applying money, reputation, and plague infection changes on click. Handles pregnancy advancement for skipped months and marks random events as completed. |

### Pre-Plague Narrative

**Passage:** `066-no-plague-yet.txt` (pid 66)

| Widget | Description |
|--------|-------------|
| `no-plague-yet` | Displays class-specific narrative snippets for months when plague has not yet reached the player's parish, offering beggars a survival choice, day labourers an extra-work opportunity, and delivering contextual flavor text to other classes about the approaching threat. |

### Catch-Up

**Passage:** `106-catch-up-widget.txt` (pid 106)

| Widget | Description |
|--------|-------------|
| `catch-up` | When the player returns from a multi-month absence, displays a summary of the months they missed by iterating through `$catchUpSummaries` and appending parish burial data for each skipped month. |

---

## Monthly Helper Widgets (Narrative)

These widgets deliver month-specific narrative content with historical context, images, and player decisions.

| Widget | Passage | Description |
|--------|---------|-------------|
| `december-1664-helper` | `012` (pid 12) | Delivers the December 1664 Christmas narrative and presents the player with a choice of whether to celebrate with a feast or save money, ending with the Christmas Eve comet sighting. |
| `june-1665-helper` | `115` (pid 115) | Delivers the June 1665 narrative (the King and court fleeing London) and branches by location and social class to present flee/stay decisions or plague-work scenarios. |
| `july-1665-helper` | `007` (pid 7) | Delivers the July 1665 narrative of overflowing graveyards and constant church bells, then branches by plague-work role to present a morally weighted bribe decision unique to each role. |
| `august-1665-helper` | `008` (pid 8) | Delivers the August 1665 narrative of public fasts and the King's further retreat to Salisbury, offers Presbyterian players a risky conventicle choice, and provides plague preventative options. |
| `sep-1665-helper` | `095` (pid 95) | Displays the September 1665 narrative (the Lord Mayor ordering fires lit to purge miasmas), presents plague preventative options, and links to October 1665. |
| `march-1666-helper` | `094` (pid 94) | Delivers the March 1666 narrative describing renewed plague fears and the court's move to Audley End, then links to April 1666 without a player decision. |
| `june-1666-helper` | `096` (pid 96) | Provides June 1666 context noting rising plague numbers and displaying a painting of the Four Days Battle at sea, then links to July 1666. |

---

## Decision Recording

**Passage:** `065-record-decision-widget.txt` (pid 65)

| Widget | Description |
|--------|-------------|
| `record-decision` | Records a player decision to the `$decisions` log by capturing the pre-mutation reputation value, applying a clamped reputation change, and pushing a complete decision record (including text, money, true `repBefore`, actual `repDelta`, and optional infection percentage). |

---

## End-Game Statistics

**Passage:** `075-final-stats-widgets.txt` (pid 75)

| Widget | Description |
|--------|-------------|
| `stats-historical-totals` | Displays a table of London-wide historical burial data (1664–1666) and a breakdown of top non-plague causes of death during the plague year, providing context for the player's experience. |
| `stats-parish-risk` | Computes and displays parish-specific plague statistics for the player's parish: recorded plague deaths, cumulative infection chance, most dangerous month, and peak monthly infection rate. |
| `stats-household-mortality` | Tallies deaths and survivals across all NPC arrays (household, servants, master's household, extended family, fled family) and displays a summary table with per-group mortality breakdown and historical comparison. |
| `stats-cumulative-risk` | Computes the player's cumulative plague risk over the entire game, accounting for parish baseline risk, decision-based exposures, fled months, and impressed/navy months, and displays the total additional risk from player choices. |
| `risk-visualization` | Renders an interactive stacked bar chart showing monthly plague risk broken down by parish baseline, plague-work role, and player decisions, plus a cumulative risk pie chart with a comparison to the average parish resident's risk. |

---

## Landlord Household

**Passage:** `123-landlord-widget.txt` (pid 123)

| Widget | Description |
|--------|-------------|
| `generate-landlord-household` | Generates a landlord household (head, optional wife, 0–2 children, and usually a mother) for fire-displaced beggars and day labourers who need new housing after the Great Fire, then sorts the combined player + landlord NPC array by household precedence. |

---

## Data Initialization

**Passage:** `073-data-widgets.txt` (pid 73)

| Widget | Description |
|--------|-------------|
| `initDeathData` | Initializes three large lookup tables (`$parishRate`, `$corpseBuried`, `$corpsePlague`) with historically derived parish-by-parish weekly death data for all London parishes, used throughout the game to simulate realistic plague mortality. |

---

## Claude-Added Widgets

**Passage:** `114-Claude-widgets.txt` (pid 114)

| Widget | Description |
|--------|-------------|
| `household-marriage-moveout` | When a player living with parents gets married, moves the original household NPCs (parents, siblings, etc.) to the extended family array, leaving only the new spouse in the active household, and splits servants evenly between the new and original households. |

---

## Glossary Definition Widgets

**Passage:** `081-glossary-widgets.txt` (pid 81)

These widgets wrap a term in a `<span class="def">` tooltip element. Each `def*` widget takes one argument (`$args[0]`) — the display text — and attaches a historical definition as a `data-def` attribute. They are maintained in alphabetical order by widget name (ignoring the `def` prefix).

**Count:** 65+ definition widgets (e.g., `defApothecary`, `defBillsOfMortality`, `defChurchOfEngland`, `defPlague`, etc.)

**Dispatcher widgets** (at the end of the file):

| Widget | Description |
|--------|-------------|
| `defVarReligion` | Dispatches to the appropriate religion definition widget based on the player's `$religion` value. |
| `defVarSocio` | Dispatches to the appropriate social class definition widget based on the player's `$socio` value. |
| `defVarRelationship` | Dispatches to the appropriate relationship definition widget based on the player's `$relationship` value (betrothed or widowed). |
