# Narrative Agency Analysis: Gaming the Great Plague

This report analyzes where and how player identity and choices shape the narrative in *Gaming the Great Plague*. The game spans December 1664 through December 1666, progressing month by month through the Great Plague of London and the Great Fire.

---

## Table of Contents

1. [Character Creation: What Players Choose vs. What's Randomized](#1-character-creation)
2. [Monthly Storyline Decision Map](#2-monthly-storyline-decisions)
3. [Major Branching Pathways](#3-major-branching-pathways)
4. [Random Events and Life Milestones](#4-random-events)
5. [Economic and Social Systems](#5-economic-systems)
6. [How Identity Variables Gate Choices](#6-identity-gating)
7. [Agency Spectrum by Social Class](#7-agency-by-class)
8. [Summary Findings](#8-summary)

---

## 1. Character Creation: What Players Choose vs. What's Randomized {#1-character-creation}

The identity passage (pid 4) presents six listbox selections. A "random character" button bypasses all choices with weighted randomization.

| Aspect | Agency Level | Player Selects | Game Randomizes |
|--------|-------------|----------------|-----------------|
| **Gender** | Full choice | "daughter" / "son" | — |
| **Age** | Category choice | child / adolescent / young adult / middle-aged / elderly | Exact age within range (e.g., young adult → random 16–29) |
| **Relationship** | Conditional choice | single, married, widowed (adults); single, betrothed (children) | Weighted random if using random char (~50% married, ~33% single, ~14% widowed) |
| **Religion** | Full choice | Church of England / dissident Protestant / Catholic | Dissident sub-type (Presbyterian, Baptist, Quaker) |
| **Origin** | Full choice | London / English countryside / another English town / Scotland / Ireland / Dutch Republic / France / somewhere else | "Somewhere else" expands to Holy Roman Empire, Italy, Spain, or the Americas |
| **Social class** | Full choice | day labourers / servants / artisans / merchants / nobles / beggars | — |
| **Location** | Region choice | Inside walls / Westminster / western suburbs / northern / eastern / southern suburbs | Specific parish within region (weighted by historical population) |
| **Name** | None | — | Weighted random from 95 female / 170 male names; origin boosts culturally appropriate names 5× |
| **Family** | None | — | Parents, spouse, children, siblings, niblings generated from age + relationship + class |
| **Disability** | None | — | 1-in-10 chance (elderly: 1-in-3 for hearing loss, then 1-in-10 for others) |

### Key Dependencies Between Choices

- **Age → Relationship**: Under 16 can only be single or betrothed (no marriage)
- **Relationship → Family**: Married/widowed generate children (0–6 by class); single ≥30 may get a niece/nephew
- **Class → Household size**: Nobles get 8–12 servants; merchants 1–3; artisans 0–1; lower classes 0
- **Class → Family size**: Nobles 2–6 children; merchants 1–4; artisans 1–3; day labourers 0–2; beggars 0–1
- **Class = servants → Master household**: Entire master/mistress household generated; player's family moves to "extended" household
- **Origin → Name pool**: Irish, Scottish, Dutch, French origins boost culture-specific names

### Random Character Weights (reflecting historical London demographics)

| Class | Weight | Approx % |
|-------|--------|----------|
| Day labourers | 1820 | 35.5% |
| Servants | 1820 | 35.5% |
| Artisans | 600 | 11.7% |
| Beggars | 400 | 7.8% |
| Merchants | 80 | 1.6% |
| Nobles | 8 | 0.16% |

| Religion | Weight | Approx % |
|----------|--------|----------|
| Church of England | 9209 | 92.1% |
| Dissident Protestant | 758 | 7.6% |
| Catholic | 33 | 0.3% |

---

## 2. Monthly Storyline Decision Map {#2-monthly-storyline-decisions}

Each month presents narrative text and typically one or two explicit player choices. Nearly every choice is **conditionally gated** by identity variables. Below is every decision point in chronological order.

### December 1664
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Volunteer for the Navy | Male beggars, non-Quaker | Yes / No | Enlist on HMS Royal Sovereign or continue |
| Volunteer (disguised) | Female beggars, non-Quaker | Disguise as man / No | Same, with gender-disguise narrative |

**Conditional narrative**: Dutch-origin characters see text about fearing neighbors. Children ≤12 see modified text about not remembering pre-Restoration life.

**Helper widget (seasonal gating)**: Christmas feast choice + religion-branched church attendance:
- Church of England → parish church celebration
- Catholic → Somerset House chapel gathering
- Dissident Protestant → private home celebration

### January 1665
Every social class gets a **different decision entirely**:

| Class | Decision | Options | Consequences |
|-------|----------|---------|--------------|
| Day labourers (F) | Use extra laundry earnings | Save / Donate to poor (+1 rep) / Theatre (-1 rep) | ±120 coins, ±1 reputation |
| Day labourers (M) | Haul goods for Navy at double wages | Accept (50% impressed) / Decline | +480 coins or impressment |
| Servants (M) | Heed master's impressment warning | Heed / Ignore (50% impressed, -1 rep) | Risk of impressment |
| Servants (F) | Respond to harassment warning | Agree (+1 rep) / Reject (-1 rep) | ±1 reputation |
| Artisans | Use business profits | Donate (+1 rep) / Save / Theatre (-1 rep) | ±560 coins, ±1 reputation |
| Merchants | Use business profits | Donate (+1 rep) / Save / Fox hunting (-1 rep) | ±2800 coins, ±1 reputation |
| Nobles | Support war effort | Help (+1 rep, -10000 coins) / Abstain (-1 rep) | Major financial/reputation tradeoff |

**Additional conditional events**: Married/betrothed women age 16–40 have 10% pregnancy chance. Single characters 14–21 may enter apprenticeship market. Catholic nobles see text about Queen Catherine.

### May 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Investigate plague rumors | All players | Investigate / Take their word for it | Infection risk vs. safety |

**Location gating**: Western suburbs characters see first plague case. Non-beggar characters proceed to June; beggars get "First Plague Day" content with plague work assignment.

### June 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Seek war news | All players | Yes / No | Learn of naval battle |
| Volunteer for Navy | Non-female only | Volunteer / Stay out | Enlist or continue |

**Conditional narrative**: Dutch-origin characters "keep head down and hide."

### July 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Volunteer for Navy | Males ≥16, non-Quaker | Volunteer / Stay out | Enlist or continue |
| Seek war information | Those who stayed | Yes / No | Learn of fleet victories |

**Conditional narrative**: French and Dutch-origin characters see loyalty-affirming text.

### August 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Steal clothing from corpses | Plague workers only (corpsebearer/searcher/nurse/warder) | Take clothing / Leave it | 50% infection, -1 rep, or clean conscience |
| Break 9pm curfew | Non-plague workers | Obey / Break curfew | Infection risk, -10 coins, -1 rep |

### September 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Continue going out in city | Non-plague workers | Stay inside / Go out | Safety vs. narrative |
| Attend plague funerals | Those who go out | Attend / Avoid | 25% infection chance |

Plague workers get role-specific narrative with no choice.

### October 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Report sick people to pesthouse | All players | Report (-1 rep) / Ignore | Reputation cost; both carry infection risk |

**Conditional narrative**: Catholics alarmed by Pope death rumors. French Catholics doubly concerned about French King rumors.

### November 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Visit returning friends | All players | Visit (+1 rep, infection risk) / Greet from window | Social reward vs. safety |

### December 1665
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Celebrate Christmas | All players | Yes (feast, -1 rep, infection risk) / No | Risk vs. celebration |
| Send New Year's gift to King | Nobles who celebrated | Yes (+1 rep, -4800 coins) / No (-1 rep) | Expensive reputation investment |

**Head-of-household gating**: Text varies by `$hoh` value — female characters and servants see modified persuasion language.

### January 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Offer porter services | Day labourers / beggars | Accept (+6 coins, +1 rep, infection risk) / Decline | Small economic/social gain |
| Help returning neighbors | Servants / artisans / merchants | Help (+1 rep, infection risk) / Stay safe | Community vs. safety |

Nobles get narrative-only content about Court moving to Hampton Court.

### February 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Hold pre-Lent feast | All players | Yes (+1 rep, infection risk) / No | Community gathering vs. safety |
| Ash Wednesday church | Those who skipped feast | Attend Queen's church / Stay home | Non-CoE characters lose 1 rep at Queen's church |

### March 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Light candle for Queen of Portugal | Catholics only | Yes (infection risk) / No | Religious observance |

Non-Catholics see narrative only (no choice).

### April 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Easter service | All players (age-gated communion) | Take communion / Attend without / Skip entirely | Communion costs 2 coins; non-CoE fined £20 if rep < 6; skipping fined £20 if rep < 6 |

**Age gating**: Under-16 characters cannot take communion regardless of choice. **Reputation gating**: Rep ≥ 6 grants mercy from churchwardens; rep < 6 triggers £20 fine for absence or non-participation.

### May 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Celebrate King's birthday | Non-CoE characters (others auto-celebrate) | Celebrate (+1 rep) / Skip (-1 rep, rumors) | Religious non-conformists face explicit choice |

### June 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Listen to war gossip | All players | Yes / No | Press gang awareness |
| Volunteer for Navy | Males ≥16, non-Quaker, non-female | Volunteer / Stay out | Enlist or continue |

### July 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Volunteer to defend London | Males ≥16, London-born, non-Quaker | Volunteer / Stay out | Tightest gating: must be male, 16+, London-born, non-Quaker |

### August 1666
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Join Navy to burn Dutch ships | Males ≥16 | Volunteer / Stay out | Last volunteering opportunity |

### September 1666 — The Great Fire
The most complex passage. Location determines the entire experience:

**Inside City walls / fire parishes**: Forced evacuation. Class determines resources:
- Servants: Alert master, find carts (reputation ≥ 3 gets neighbor help)
- Artisans: Agonize over tools, flee with essentials
- Day labourers/beggars: Flee with minimal belongings
- Merchants/nobles: Send servants for carts, bury valuables

**Outside fire zone**:
| Decision | Gating Condition | Options | Consequences |
|----------|-----------------|---------|--------------|
| Help fire refugees | Day labourers / beggars | Help haul (+1 rep) / Laugh off (-1 rep) | |
| Help fire refugees | Other classes | Lend cart (+1 rep) / Laugh off (-1 rep) | |

**Origin gating**: French-origin characters hide at home during fire (fear of violence/blame).

### October 1666
Post-fire housing crisis. Displaced characters face class-specific outcomes:
- Beggars (rep ≤ 2): Risk freezing to death
- Beggars (rep > 2): Friend-of-friend shelter
- Day labourers: Clear debris for room money
- Others (rep > 2): Friends take in through winter
- Others (rep ≤ 2): Vary by class (nobles leave, merchants sleep in office, others get hovels)

Non-displaced characters inside walls may take lodgers.

### November–December 1666
No explicit player choices. Narrative conclusion, thanksgiving, and endgame stats.

---

## 3. Major Branching Pathways {#3-major-branching-pathways}

Beyond the month-by-month storyline, three major systems create deep branching:

### 3A. Flight vs. Stay

At the first plague appearance in the player's parish, most characters face the game's most consequential choice: **flee London or stay**.

**Flight availability by class:**

| Class | Can Flee? | Conditions | Failure Risk |
|-------|-----------|------------|--------------|
| Nobles | Always | No gates | None |
| Merchants | Always | No gates | None |
| Artisans | Conditional | Rep > 5 guaranteed; rep ≤ 5 has 50% failure | Failed flight costs 2+ months wages, -1 rep |
| Day labourers | Conditional | Non-London origin can flee home; London origin cannot flee freely | Must pay household income |
| Servants | Master decides | 50% master flees (player follows or breaks contract); 50% master stays | Breaking contract → downgraded to beggar, -2 rep |
| Beggars | Limited | Only if broke servant contract or started as beggar | No income while fled |

**Household separation**: Players can flee alone, send family away, flee with family, or all stay. This creates combinatorial branching.

**Return decision points** (multiple checkpoints while fled):
1. Summer 1665 (peak deaths)
2. Winter 1665 (deaths declining)
3. Court return to Hampton Court
4. Official Thanksgiving Day
5. No more plague deaths
6. Permanent exile ("for good" → game ending)

**Financial pressure**: Monthly costs drain money while fled. Reaching $0 forces immediate return regardless of plague status.

**Great Fire impact on fled characters**: 50% chance home destroyed if parish is in fire zone, forcing relocation upon return.

### 3B. Plague Work

Characters who stay (especially lower classes) may be assigned or volunteer for plague-related roles.

**Role assignment by gender and reputation:**

| Condition | Assigned Role |
|-----------|---------------|
| Female, reputation ≥ 6 | Searcher (examine corpses for plague marks) |
| Female, reputation < 6 | Nurse (tend sick in homes) |
| Male, reputation ≥ 6 | Warder (guard quarantined houses) |
| Male, reputation < 6 | Corpsebearer (collect/bury corpses) |

**Eligibility**: Must be ≥ 16, Church of England. Day labourers and beggars are primary candidates.

**Monthly choices for nurses/warders**: Accept assignment (+48d, +1 rep for nurses, infection risk) or refuse (-1 rep).

**Refusing plague work escalation**:
1. Day labourers who refuse → downgraded to beggars, money reset to 0
2. Beggars who refuse → jailed
3. From jail: beg forgiveness → accept work OR stand firm → deportation/transportation

### 3C. Sickness, Quarantine, and Death

When plague reaches a household:
1. **Quarantine** (minimum 4 weeks): Player chooses remedies (if affordable)
   - Quality remedies: reduce death chance from 50% to 33%
   - Fumigants: halve secondary infection spread (50% → 25%)
2. **Pesthouse**: Authority figures may send infected family members (12p per person, 50% survival)
3. **Player infection**: 5-stage illness progression with remedy-dependent survival roll
4. **Hiding illness**: Nobles → banished by King (special path); non-nobles → forced to pesthouse

**Child smuggling** (reputation > 5): Can smuggle healthy children out of quarantine to safety.

### 3D. Navy Service

Available at 7 different points (Dec 1664, Jun–Aug 1665, Jun–Aug 1666). Progressively tighter gating:

| Month | Who Can Volunteer |
|-------|-------------------|
| Dec 1664 | Male beggars, non-Quaker (females can disguise) |
| Jun 1665 | Non-female characters |
| Jul 1665 | Males ≥ 16 |
| Jun 1666 | Males ≥ 16, non-Quaker |
| Jul 1666 | Males ≥ 16, London-born, non-Quaker |
| Aug 1666 | Males ≥ 16 |

**Outcomes** (roll 1–10): Death (10%), prisoner of war (10%), wounded with permanent disability (20%), honorable service (60%).

**Foreign-origin special path**: Non-British subjects can challenge impressment. Dutch-origin characters are imprisoned as spies until war ends (1667).

### 3E. Banishment and Deportation

Players who refuse plague work face escalating consequences:
- **Jailed** → Beg forgiveness (accept work) or stand firm
- **Stand firm** → London-origin: transported to New World colonies; non-London: deported to origin
- **Escape attempt** (50/50): Success with rep ≥ 3 → neighbor shelter, downgrade to day labourer; success with rep < 3 → re-caught → transported; failure → transported immediately

---

## 4. Random Events and Life Milestones {#4-random-events}

Beyond the monthly storyline decisions, a **priority cascade** system fires random events each month. The first matching condition triggers, so plague always takes precedence over life events. Player identity determines which events can fire and what choices appear.

### Priority Cascade Order

1. **Player plague infection** → Sickness sequence (no choice)
2. **Family plague infection** → Quarantine sequence
3. **Master/extended household infection** → Household sickness handling
4. **Elderly death** → 1-in-30 chance if elderly (automatic, no choice)
5. **Apprenticeship offer** → 1-in-10 chance if seeking (active choice)
6. **Wedding** → 1-in-10 chance if seeking (active choice)
7. **Pregnancy realization** → Month 4 of pregnancy (automatic)
8. **Miscarriage** → Age-scaled probability (automatic)
9. **Birth** → Month 9 of pregnancy (active choice for celebration)
10. **Fever** → 1-in-20 chance (class-specific consequences)
11. **Class-specific events** → Nobles: steward death; day labourers: accidents; beggars: run-over; merchants: parish office
12. **NPC death (non-plague)** → Triggers household succession
13. **Servant dismissal** → If rep ≤ 2 and servant, 50% chance
14. **Servant promotion** → If rep = 10 and servant aged 14–21

If no event fires: default monthly narrative + church services.

### Wedding System (Active Choice)

When a marriage match is found, players choose the ceremony type:

| Wedding Type | Cost | Reputation | Plague Risk | Notes |
|-------------|------|------------|-------------|-------|
| Parish church | 48d | +2 | High (3 weeks of banns + ceremony) | Public gathering |
| Private license | 96d | 0 | Low (small home ceremony) | Costs more, safer |
| Fleet prison elopement | 72d | -1 | Lowest (tavern marriage) | Social stigma |

### Pregnancy, Birth, and Miscarriage (Mostly Automatic)

- **Pregnancy trigger**: 1-in-10 monthly chance for married/betrothed females age 16–40 (no player choice)
- **Miscarriage**: Age-scaled probability — 10% for women ≤25, rising to 40% at age 40+ (automatic)
- **Plague during pregnancy**: Silently causes miscarriage (automatic)
- **Birth**: 1-in-30 maternal death chance; 1-in-4 stillbirth chance (both automatic)
- **Birth celebration** (active choice if live birth):
  - Host celebration: costs vary by class (nobles 2400d, merchants 480d, artisans 120d, others 6d), higher plague risk
  - Quick baptism: 6d, minimal risk

### Apprenticeship System (Active Choice, Heavily Gated)

When an apprenticeship offer triggers, eligibility depends on reputation and money:

| Trade | Entry Fee | Rep Required | Class Outcome |
|-------|-----------|-------------|---------------|
| Baker | 240d | > 2 | Remains artisan |
| Weaver | 1200d | > 3 | Remains artisan |
| Draper | 2400d | > 4 | Upgrades to merchant |
| Mercer | 6000d | > 5 | Upgrades to merchant |
| Goldsmith | 12000d | > 6 | Upgrades to merchant |

Rep ≤ 2: no one will take the player. Money below 240d: can't afford any fee. This is one of the few mechanisms for **upward social mobility** in the game.

### Plague Worker Bribe Scenarios (July 1665 Helper Widget)

Plague workers face role-specific moral dilemmas with **active choices**:

| Role | Bribe Scenario | Accept Cost | Refuse |
|------|---------------|-------------|--------|
| Corpsebearer | Skip searcher examination of a corpse | -2 rep | No penalty |
| Warder | Let a child escape quarantined house | -2 rep | No penalty |
| Searcher | Misreport a plague death as non-plague | -2 rep | No penalty |
| Nurse | Smuggle a baby out of infected house | -2 rep | No penalty |

These create compelling moral conflicts — the "right" historical action (accepting bribes was common) costs reputation, while the mechanically optimal choice (refuse) is historically less realistic.

### Parish Office (Conditional Offer)

Offered only to **Church of England males, age ≥ 30, reputation ≥ 8** with no current office:
- **Accept**: Churchwarden or Overseer of the Poor (+1 rep)
- **Decline**: Pay 24d fine

Office is **automatically removed** if reputation drops to ≤ 4 (-1 rep penalty).

---

## 5. Economic and Social Systems {#5-economic-systems}

### Income Disparity (Automatic, No Choice)

Income is calculated automatically each month, with dramatic class and gender gaps:

| Class | Male Monthly Income | Female Monthly Income | Ratio |
|-------|--------------------|-----------------------|-------|
| Nobles | 17,600d | 14,080d | 80% |
| Merchants | 4,000d | 3,200d | 80% |
| Artisans | 800d | 640d | 80% |
| Day labourers | 300d | 240d | 80% |
| Servants (adult) | 300d (M) / 240d (F) | — | 80% |
| Beggars | 120d (×0.8 = 96d for males) | 120d | Inverted |

**Key design note**: Female characters earn 80% of male equivalents across all classes except beggars, where the ratio inverts. This reflects historical wage disparities without player choice.

**Fled penalty**: Beggars, day labourers, artisans, and merchants receive half income while fled from London.

### Debt System (Automatic Consequences)

When money falls below the class-specific debt ceiling:
- **Servants with rep ≥ 6**: Master pays off debt (-2 rep)
- **Servants with rep < 6**: Dismissed → downgraded to day labourer
- **Non-servants, rep ≥ 6**: Creditors grant extension
- **Non-servants, rep < 6**: Debtor's prison (-2 rep, 50% plague infection risk)
- **Forced child service**: Parish forcibly places all children ≤21 (unmarried) into service

**Quarantine debt escape** (active choice): If debt ceiling exceeded during quarantine and player isn't infected, option to break quarantine for half-income work (50% success; failure = caught and fined 12d).

### Beggar Survival Options (Active Choice When Money ≤ 12d)

| Option | Gating | Income | Risk |
|--------|--------|--------|------|
| Highway begging (illegal) | All beggars | 6–10d (doubled if disabled) | 1-in-3 impressment; -1 rep |
| Laundry work | Female only | 48d (96d if disabled) | None |
| Church linen washing | Church of England only | 32d (64d if disabled) | None |
| Hope and survive | All | None | None |

**Good neighbors** (rep ≥ 6): Receive feast leftovers or old clothing, earn 2–6d (doubled if disabled). **Disability as economic advantage**: Disabled beggars consistently earn double from charity and begging — one of the few places disability provides a mechanical benefit.

### Child Smuggling (Active Choice, Rep > 5)

Available to parents (hoh 1 or 4) during quarantine with reputation ≥ 6:
- **Accept neighbor offer**: Healthy children sent to countryside safety; -1 rep
- **Decline**: Children remain at home, subject to infection

After plague ends, a **return-children** choice appears: bring them home now or keep them safe longer.

### Lodger System (Post-Fire, October 1666+)

Non-displaced characters inside City walls can take in fire refugees:

| Class | Lodger Capacity |
|-------|----------------|
| Day labourers / servants | 1 |
| Artisans | 3 |
| Merchants | 5 |
| Nobles / beggars | 0 |

**Active choice** on rent:
- High rent (+2d/unit): -1 rep (seen as profiteering)
- Base rent: 0 rep (charitable)
- Refuse: 0 rep

---

## 6. How Identity Variables Gate Choices {#6-identity-gating}

### Social Class (`$socio`)
The single most pervasive gating variable. Every monthly decision diverges by class. Determines:
- Which economic choices exist (charity amounts, investment options)
- Flight availability and success probability
- Plague work eligibility and role
- Household size, servant count, family composition
- Great Fire impact and recovery options
- Head-of-household dynamics

### Gender (`$gender`)
- **Navy volunteering**: Males only (except disguised female beggars in Dec 1664)
- **Plague work roles**: Female → searcher/nurse; male → warder/corpsebearer
- **Monthly narrative variants**: Jan 1665 has entirely separate male/female paths for day labourers and servants
- **Pregnancy**: Only married/betrothed females age 16–40
- **Impressment risk**: Only males face press gang danger

### Age (`$agenum`)
- **< 16**: Cannot take communion, cannot volunteer for Navy, cannot accept plague work, children can be smuggled out of quarantine, apprenticeship instead of impressment
- **16+**: Full access to adult choices
- **≤ 12**: Modified narrative text (can't remember pre-Restoration England)
- **≥ 55**: Rejected from Navy (publicly shamed)
- **≥ 60**: Higher disability chance at character creation

### Religion (`$religion`)
- **Church of England**: Eligible for plague work; automatic celebration of King's birthday; no communion issues
- **Dissident Protestant / Catholic**: Explicit choice whether to celebrate King's birthday (May 1666); fined if skip Easter and rep < 6; non-CoE characters penalized at Queen's church
- **Quaker**: Excluded from Navy volunteering
- **Catholic**: Special narrative about Queen Catherine, Pope death rumors, Queen of Portugal memorial; can light candle in March 1666

### Origin (`$origin`)
- **Dutch Republic**: Fear of neighbors during war; special loyalty text; imprisoned as spy if impressed into Navy
- **France**: Hide during Great Fire (fear of blame/violence); special text when French King rumored dead
- **London**: Tightest Navy gate in July 1666 (defensive volunteering); transported to New World if deported (no homeland return)
- **Non-London English / Foreign**: Can flee to homeland; deported to origin rather than New World
- **Name generation**: Origin boosts culturally appropriate names 5×

### Location (`$location` / `$parish`)
- **Inside City walls / fire parishes**: Directly experience Great Fire evacuation
- **Western suburbs**: First to see plague cases (May 1665)
- **Parish-specific plague rates**: Monthly infection probability varies by parish, creating differential risk for identical choices
- **Post-fire displacement**: Location determines whether character loses home

### Reputation (`$reputation`)
- **≥ 6**: Mercy from churchwardens (no fines); searcher/warder plague roles; neighbor help during fire
- **≥ 5**: Can smuggle children from quarantine; artisan flight guaranteed
- **≥ 3**: Can write will when sick; escape from deportation possible; neighbor shelter
- **< 3**: Murder rumors in pesthouse; will-writing blocked; trapped in poverty/deportation cycles
- **≤ 2**: No neighbor help during fire; risk freezing post-fire

### Role (`$role`)
- **Plague workers** (corpsebearer/searcher/nurse/warder): Get unique August–September 1665 content (corpse theft choice; no curfew choice); monthly work assignments with accept/refuse
- **Non-plague workers**: Get standard civilian narrative with curfew/funeral choices

### Head of Household (`$hoh`)
The HOH system implements **coverture** (married women under husband's legal authority) and **service** (servants under master's authority). It subtly changes narrative voice to reflect who "really" makes decisions:
- **Self (1)**: "You decide to..." — full independent agency
- **Dependent on father (2)**: "Your father decides..." — constrained
- **Servant under master (3)**: "Your master decides..." — master controls flight, housing
- **Under husband/coverture (4)**: "You convince your husband to..." — mediated agency; player still chooses, but text frames it as persuasion
- **Child dependent (0)**: "Your _caretakerLabel decides..." — minimal agency

This creates a **narrative illusion of constrained agency**: the player still clicks choices, but the game's language reminds them their character's authority is mediated through social hierarchies. A married woman "convinces" her husband; a servant "follows" their master — even when the player is the one choosing.

---

## 7. Agency Spectrum by Social Class {#7-agency-by-class}

Ranked from least to most player agency:

### Servants (Least Agency)
- Master's decision determines 50% of flight paths
- Contract status creates binary gate (follow or break)
- Promotion status permanently locks servant into staying
- Breaking contract downgrades to beggar (-2 reputation)
- Cannot independently decide housing, flight timing, or financial allocation
- Head-of-household is master, not player
- **Automatic dismissal**: Rep ≤ 2 triggers 50% monthly chance of being dismissed to day labourer
- **Automatic promotion**: Rep = 10 and age 14–21 → offered apprenticeship (one of the few upward mobility paths)

### Beggars (Low Agency)
- Work refusal → jail → deportation pipeline with few exits
- Reputation < 3 creates poverty trap (escape attempts fail, no neighbor help)
- Navy volunteering is one of few escape routes
- Limited financial capacity constrains remedy/feast/charity choices
- Smallest family (0–1 children, 0–1 siblings)

### Day Labourers (Moderate-Low Agency)
- Non-London origin unlocks flee-home option; London origin restricts flight
- Gender-specific plague work assignment
- Male impressment risk creates involuntary path changes
- Refusing plague work → downgrade to beggar → poverty spiral
- Some economic choices but amounts are small

### Artisans (Moderate Agency)
- Flight success gated by reputation (> 5 guaranteed; ≤ 5 is coin flip)
- Failed flight is recoverable (can retry)
- Meaningful economic choices (560-coin charity/save/theatre)
- Household separation possible
- Some servants to manage
- Plague work roles still gender/reputation gated

### Merchants (Moderate-High Agency)
- Reputation-independent flight (always succeeds)
- Larger economic decisions (2800-coin choices)
- 1–3 servants; meaningful household
- Simpler household separation logic
- Can afford remedies and fumigants

### Nobles (Most Agency)
- Can always flee regardless of reputation
- Country estate as guaranteed refuge
- Largest households (8–12 servants, 2–6 children)
- Unique court/King interaction (New Year's gift, war effort support)
- Illness triggers special banishment path (multiple recovery options)
- Largest financial base enables all remedy/feast/charity options
- Leave city for winter if displaced by fire

---

## 8. Summary Findings {#8-summary}

### Where Players Have the Most Agency

1. **Character creation**: Players choose 6 of 11 identity aspects (gender, age category, relationship, religion, origin, class), shaping every subsequent experience
2. **Flight decision**: The single most consequential choice; creates a fundamentally different game experience (fled characters skip plague/quarantine entirely but face financial pressure and fire uncertainty)
3. **Monthly social choices**: Reputation-building decisions (charity, feasts, church attendance, helping neighbors) accumulate into gating thresholds
4. **Navy volunteering**: Available at 7 time points with varying eligibility; creates permanent exit from plague narrative
5. **Apothecary purchases**: Remedy and fumigant choices directly affect family survival probabilities

### Where Historical Constraints Limit Agency

1. **Social class rigidity**: Class determines which decisions exist at all — a noble and a beggar experience fundamentally different games
2. **Gender restrictions**: Military service, plague work roles, impressment risk, and pregnancy are all gender-locked
3. **Religious penalties**: Non-Church-of-England characters face fines, social pressure, and exclusion from parish work
4. **Origin-based suspicion**: Dutch and French characters face xenophobia; foreign nationals face imprisonment or deportation
5. **Age barriers**: Under-16 characters cannot participate in adult decisions (communion, navy, plague work)
6. **Reputation spirals**: Low reputation creates compounding disadvantages (worse plague roles, no neighbor help, fines, failed escapes)

### The Historical-Agency Balance

The game achieves its goal of **providing historical content while maintaining player agency** through several design strategies:

- **Class-differentiated narrative**: Rather than one storyline with branching, each social class experiences a *different* London during the plague, reflecting historical reality
- **Constrained choice sets**: Players always have choices, but the *available* choices reflect historical constraints on their demographic (e.g., women can't openly volunteer for navy; servants can't independently flee)
- **Reputation as currency**: The reputation system lets players build or spend social capital, creating meaningful tradeoffs between safety, community standing, and moral choices
- **Risk-reward calibration**: Most pro-social choices (helping neighbors, attending funerals, celebrating holidays) carry infection risk, mirroring the real tension between community solidarity and self-preservation
- **Involuntary events**: Plague infection, impressment, master's decisions, and the Great Fire all happen *to* the player, reflecting the historical reality that individual agency was bounded by larger forces
- **Multiple escape hatches**: Navy service, flight, and even deportation provide alternative endings, ensuring players aren't locked into a single narrative rail

### Decision Density by Game Phase

| Phase | Months | Avg Decisions/Month | Primary Agency Type |
|-------|--------|--------------------|--------------------|
| Pre-plague | Dec 1664 – Apr 1665 | 1.4 | Economic/social (class-specific) |
| Plague onset | May – Jun 1665 | 1.5 | Investigation, flight decision |
| Plague peak | Jul – Oct 1665 | 1.5 | Survival, curfew, plague work |
| Plague decline | Nov 1665 – Feb 1666 | 1.5 | Social reconnection, feasting |
| Recovery | Mar – Aug 1666 | 1.2 | Religious observance, navy |
| Great Fire | Sep – Oct 1666 | 1.0 | Evacuation, housing crisis |
| Endgame | Nov – Dec 1666 | 0 | Narrative conclusion only |
