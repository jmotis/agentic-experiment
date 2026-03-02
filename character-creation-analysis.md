# Character Creation Variables: Gameplay Impact Analysis

This document analyzes the seven character creation variables in **Gaming the Great Plague** and categorizes them—and their individual values—by how much they affect the player's gameplay experience. The analysis is based on a thorough review of all 117 passages in the game.

---

## Impact Tier Summary

| Tier | Label | Variables |
|------|-------|-----------|
| **1** | **Game-Defining** | `$socio`, `$location` / `$parish` |
| **2** | **Major** | `$age` / `$agenum`, `$gender` |
| **3** | **Moderate** | `$religion`, `$relationship` |
| **4** | **Minor** | `$origin` |

---

## TIER 1 — GAME-DEFINING IMPACT

These variables fundamentally reshape the entire game. Two players with different values here will have drastically different experiences across nearly every system: economics, household, story events, flee mechanics, plague exposure, and available choices.

---

### `$socio` (Social Class)

**The single most impactful variable in the game.** It touches almost every gameplay system: starting wealth, monthly income/expenses, household composition, available jobs, flee options, reputation, narrative events, and plague worker assignments. The game explicitly notes this is "one of the most heavily used variables."

#### Values ranked by gameplay distinctiveness

| Value | Weight | Probability | Impact Assessment |
|-------|--------|-------------|-------------------|
| **servants** | 1820 | ~19% | **Unique gameplay path.** Only class with a master household, contract-breaking mechanic, and externally-driven flee decisions. Breaking contract drops you to beggar status with 0 reputation—a catastrophic, irreversible consequence. Living arrangements depend on relationship status (single servants live with master; married servants live independently). |
| **nobles** | 8 | ~0.08% | **Highest economic freedom but unique constraints.** 17,600d/month income, 8–12 servants, starting reputation of 10. Court attendance events in January 1665. Flee costs 10,000d but only -1 reputation. Cannot take plague work. Has steward and ward events. |
| **beggars** | 4000 | ~42% | **Most constrained path.** 0 starting money, 120d/month income, reputation 0. Only class eligible for Navy volunteering (December 1664). Forced into plague work by Overseers of the Poor. Cannot flee the city. Refusing plague work leads to gaol, transportation, or deportation. Has a "beggar's luck" random event. |
| **merchants** | 80 | ~0.8% | **Wealthy but distinct from nobles.** 4,000d/month income, 1–3 servants, reputation 8. Flee costs 1,600d with -2 reputation. Eligible for church office. Different feast/celebration costs than nobles. |
| **artisans** | 600 | ~6% | **Middle class with reputation risk.** 800d/month income, 10,000d starting wealth, reputation 8. Flee costs 1,120d with -3 reputation. Unique mechanic: artisans with reputation ≤5 have a 50% chance of flee failure ($fled=7, "turned away"). Eligible for church office. |
| **day labourers** | 1820 | ~19% | **Similar to beggars but slightly better.** 300d/month income, reputation 6. Can be forced into plague work—refusing converts them to beggars ($money reset to 0). Porter work available in January 1666 (+6d, +2 reputation). Can flee for free. |

#### Key economic comparison

| Class | Income | Expenses | Disposable | Starting $ | Flee Cost |
|-------|--------|----------|------------|------------|-----------|
| Beggars | 120d | 114d | 6d | 0 | Cannot flee |
| Day labourers | 300d | 240d | 60d | 0 | Free |
| Servants | 300d | 220d | 80d | 0 | Free (follow master) |
| Artisans | 800d | 560d | 240d | 10,000d | 1,120d |
| Merchants | 4,000d | 2,800d | 1,200d | High | 1,600d |
| Nobles | 17,600d | 12,800d | 4,800d | Highest | 10,000d |

#### Systems gated by `$socio`

- **Income/expenses/starting wealth** — completely determined by class
- **Household size and composition** — servants (0 personal servants) vs nobles (8–12 servants)
- **Flee options** — beggars cannot flee; servants depend on master; artisans can fail; costs scale with class
- **Reputation starting value** — 0 (beggars) to 10 (nobles)
- **Plague worker availability** — only beggars and day labourers are assigned plague roles
- **Navy volunteering** — beggars only
- **Porter work** — beggars and day labourers only
- **Court events** — nobles only
- **Church office eligibility** — artisans and merchants only
- **Contract-breaking** — servants only
- **Debt prison thresholds** — vary by class (nobles get 4x ceiling, beggars get fixed 60d ceiling)
- **Christmas feast and birth celebration costs** — scale from 6d (beggars) to 4,800d (nobles)

---

### `$location` and `$parish`

**Together these variables control when and how severely the plague affects the player.** Location determines the macro-level plague timeline, while parish determines the micro-level monthly infection probability using real Bills of Mortality data from 1665–1666.

#### `$location` values ranked by gameplay impact

| Value | Weight | Impact Assessment |
|-------|--------|-------------------|
| **"in another part of the western suburbs"** | 2405 | **Earliest plague exposure.** Plague arrives in May 1665, a full two months before City residents. This means more months of infection risk, earlier flee pressure, and more total gameplay months spent dealing with plague. Routes to June 1665 after First Plague Day. |
| **"inside the City walls"** | 3458 | **Latest plague exposure.** Plague doesn't arrive until July 1665 and the passage routes directly to August 1665 after First Plague Day, skipping months of plague content. Generally lower parish infection rates due to wealthier, less crowded conditions. Also determines apothecary access timing. |
| **"in the western suburbs, specifically Westminster"** | 2796 | Plague arrives June–July 1665. 5 Westminster parishes, including high-population St Martin in the Fields (weight 1242). |
| **"in the northern suburbs"** | 4810 | Plague arrives June–July 1665. 11 parishes including heavily-hit St Giles Cripplegate (1353 weight). Routes to July 1665. |
| **"in the eastern suburbs"** | 3140 | Plague arrives June–July 1665. 6 parishes including the massive St Dunstan Stepney (1392 weight). Routes to July 1665. |
| **"across the river in the southern suburbs"** | 2563 | Plague arrives June–July 1665. 8 parishes. Routes to July 1665. |

#### `$parish` — dynamic infection rates

Parish is the granular driver of infection mechanics. Each of 100+ historical parishes has a unique 22-element array in `$parishRate` mapping month-by-month infection probability:

- **Lower rate number = higher infection risk** (e.g., rate of 24 means 1-in-24 chance per month)
- **Rate of 1000 = effectively no plague risk** that month
- Rates are historically derived from actual Bills of Mortality data

For plague workers (corpsebearers, searchers), parish also determines:
- `$corpseBuried[$parish][$monthIndex]` — monthly corpse count (affects pay at 4d/corpse)
- `$corpsePlague[$parish][$monthIndex]` — plague corpse count (affects infection risk)

**Gameplay consequence:** Two players in different parishes can have wildly different infection probabilities in the same month. A player in a lightly-affected parish might face a 1-in-335 monthly infection chance while a player in a hard-hit parish faces 1-in-23.

#### Location-specific mechanics

- **Plague arrival date** — ranges from May 1665 (western suburbs) to July 1665 (City walls)
- **Passage routing after First Plague Day** — determines which months of content the player experiences
- **Apothecary access timing** — City residents get access after June 1665; others vary
- **Corpse work narrative** — suburban corpsebearers try to sneak corpses into City graveyards
- **Flee timing** — earlier plague = earlier flee pressure
- **Final stats** — survival probability calculated from parish-specific historical data

---

## TIER 2 — MAJOR IMPACT

These variables gate significant gameplay mechanics and create meaningfully different story paths, but their effects are concentrated in specific systems rather than permeating every aspect of the game.

---

### `$age` / `$agenum`

**Age determines autonomy, available life events, and household structure.** The key threshold is 16 (head of household vs. dependent), with additional gates at 30 (church office), 40 (fertility ceiling), 55 (military ceiling), and 60 (elderly death risk).

#### Age categories ranked by gameplay distinctiveness

| Category | Range | Weight | Impact Assessment |
|----------|-------|--------|-------------------|
| **child** | 5–9 | 14% | **Most restricted.** Not head of household ($hoh=0). Cannot marry, have children, take communion, volunteer for military, or hold office. Parents guaranteed in household. Grabs "favorite toy" during Great Fire. Narrative framed as dependent ("you and your family"). Relationship limited to single (95%) or betrothed (5%). |
| **adolescent** | 10–15 | 16% | **Still restricted but slightly more agency.** Same $hoh=0 as children. Can potentially work if age ≥12 (beggars). Cannot marry, take communion, or volunteer for military. Parents guaranteed in household. Grabs "clothes" during Great Fire. |
| **elderly adult** | 60–76 | 10% | **Unique death risk.** 3.3% monthly chance of death by old age. Cannot bear children (past fertility window). Too old for Navy service (rejected at 55+). Can hold church office (if eligible). Protected from impressment. Household typically small (widowed, adult children in extended family). |
| **young adult** | 16–29 | 25% | **Full access, maximum options.** Head of household. Can marry, have children (if female, up to 40), volunteer for military (if male), take communion. Parents and siblings can live in main household if single and age ≤29. Cannot hold church office (requires 30+). |
| **middle-aged adult** | 30–59 | 35% | **Full access plus office eligibility.** Same as young adult but with church office eligibility at 30+. Parents/siblings move to extended family. Female fertility window still open (30–40). Most common age category. |

#### Key age thresholds

| Threshold | What It Gates |
|-----------|---------------|
| **≤15** | Not head of household; dependent narratives; no marriage/pregnancy/communion/military |
| **≥16** | Head of household; marriage; female fertility opens; communion; military (if male); autonomous decisions |
| **≤29 (single)** | Parents and siblings can live in main household |
| **≥30** | Church office eligibility (with other requirements); parents/siblings to extended family |
| **≤40 (female)** | Pregnancy possible if married |
| **≥55** | Too old for Navy; protected from impressment |
| **≥60** | Elderly category; 3.3% monthly death risk |

#### Age-dependent household generation

| Player Profile | Parents in Household? | Siblings in Household? | Spouse? | Children? |
|---------------|----------------------|----------------------|---------|-----------|
| Child, single | Yes (guaranteed) | Yes | No | No |
| Adolescent, single | Yes (likely) | Yes | No | No |
| Young adult (≤29), single | Yes | Yes | No | No |
| Young adult, married | No (extended) | No | Yes | Yes (by class) |
| Middle-aged (30+), any | No (extended) | No (extended) | If married | If married |
| Elderly, widowed | No (extended) | Maybe 1 adult sibling | No | No |

---

### `$gender`

**Gender gates military service, plague work roles, pregnancy, church office, and several narrative paths.** While some effects are cosmetic (pronouns, name pools), many create mechanically distinct gameplay experiences.

#### Values ranked by gameplay distinctiveness

| Value | Impact Assessment |
|-------|-------------------|
| **female** | **Most mechanically distinct.** Exclusive access to pregnancy/childbirth (if married, age 16–40). Blocked from standard Navy volunteering (must disguise, 10% discovery risk with -3 reputation). Can only be searcher (reputation >5) or nurse among plague roles. Cannot hold church office. Protected from impressment. Loses property rights upon marriage (narrative consequence). |
| **male** | **Default/broadest access.** Can volunteer for Navy directly. Can be corpsebearer or warder among plague roles. Eligible for church office (if other conditions met). Vulnerable to impressment. Cannot become pregnant. |
| **nonbinary** | Currently commented out / disabled in the random character path. If enabled: similar to male for military/plague work; paired name selection (Thomas/Thomasina, etc.); "spouse" instead of husband/wife. |

#### Gender-gated systems

| System | Male | Female |
|--------|------|--------|
| **Navy volunteering** (3 occasions) | Available directly | Must disguise (10% discovery → -3 reputation) or unavailable |
| **Plague work roles** | Corpsebearer or warder | Searcher (needs rep >5) or nurse |
| **Church office** | Eligible (with other conditions) | Excluded entirely |
| **Pregnancy/childbirth** | N/A | Monthly 10% chance if married, age 16–40 |
| **Marriage economic effect** | Gains wife's dowry | Loses property rights to husband |
| **Impressment** | Vulnerable (unless 55+) | Protected (can prove ineligibility) |
| **Name pool** | 113 male names | 86 female names |

---

## TIER 3 — MODERATE IMPACT

These variables have meaningful but more narrowly-scoped effects. They create recurring costs or unlock specific events, but don't reshape the fundamental gameplay loop the way Tier 1 and 2 variables do.

---

### `$religion`

**Religion creates a persistent financial/reputation drain for minorities and gates church office access.** The dominant Church of England (~99.3% probability) is the mechanically "default" path; minority religions face monthly fines and blocked opportunities but gain unique narrative events.

#### Values ranked by gameplay impact

| Value | Probability | Impact Assessment |
|-------|-------------|-------------------|
| **"Quaker"** | ~0.27% | **Most mechanically impactful minority.** Shares all dissident Protestant penalties (monthly 48d fine, -1 reputation for skipping services). ADDITIONALLY: Quaker beggars are blocked from Navy volunteering due to pacifism—the only religion that loses an income/escape path. Has unique narrative branch in July 1666. |
| **"Catholic"** | ~0.04% | **Unique narrative events.** Same monthly fine/reputation penalties as dissidents. Gets exclusive Queen's candle event in March 1666 (2% plague risk if they choose to attend). Unique death text referencing purgatory. Special combined narrative with French origin in October 1665. |
| **"Presbyterian"** | ~0.27% | **Standard dissident penalties.** Monthly 48d fine and -1 reputation for skipping Church of England services. Special engagement with public fast events in August 1665. No church office. No unique mechanical gates beyond the shared dissident penalties. |
| **"Baptist"** | ~0.27% | **Standard dissident penalties.** Same recurring costs as Presbyterian. Least mechanically distinctive religion—similar narrative framing but fewer unique events. |
| **"member of the Church of England"** | ~99.3% | **No penalties, maximum access.** No service fines. Eligible for church office (Churchwarden or Overseer of the Poor, 25% monthly chance if male, artisan/merchant, age 30+, reputation ≥8). Full Easter communion participation. Preferentially assigned plague work roles. |

#### Recurring financial impact for non-Church of England

- **Monthly cost:** 48d fine + reputation erosion (-1/month)
- **Cumulative over 22 game months:** up to 1,056d in fines and up to -22 reputation (clamped at 0)
- **Easter special penalty (April 1666):** If reputation <6 and skip Easter, fined £20 (4,800d)—a potentially devastating single penalty
- **$skipServices toggle:** Can automate skipping (set to 1) if not in debt, avoiding monthly player prompts but accepting the penalties automatically

#### Church office (Church of England exclusive)

Only Church of England male artisans/merchants aged 30+ with reputation ≥8 can hold office:
- 25% monthly chance of being offered Churchwarden or Overseer of the Poor
- +1 reputation on acceptance
- Removed if reputation drops ≤4 or player flees

---

### `$relationship`

**Relationship status determines household composition, pregnancy eligibility, and servant living arrangements.** Its impact is significant at character creation (shaping who lives with you) and during specific life events (weddings, spouse death), but it doesn't create the same pervasive game-wide branching as higher-tier variables.

#### Values ranked by gameplay impact

| Value | Probability | Impact Assessment |
|-------|-------------|-------------------|
| **"married"** | 32% (adults) | **Unlocks pregnancy.** Only married women age 16–40 can become pregnant during gameplay (10% monthly chance). Spouse is a household member. For servants: married servants live independently (not in master's household). Different household generation—children instead of siblings. Wedding type choices affect cost, reputation, and infection risk. |
| **"single"** | 95% (children/adolescents), 17% (adults) | **Largest household potential.** Single characters aged ≤29 have parents and siblings in main household. Can seek marriage during gameplay via $seeking mechanic (10% monthly chance of wedding event). Single servants live in master's household. |
| **"widowed"** | 9% (adults) | **Post-spouse path.** Spouse has died. Can remarry through marriage market. Retains children from previous marriage. Similar household generation to married but without living spouse NPC. Unique biographical narrative text. |
| **"betrothed"** | 5% (children/adolescents) | **Pre-marriage state.** Can become pregnant at game start (10% chance, January 1665) but NOT during ongoing gameplay—only married women get monthly pregnancy rolls. Otherwise functions like single for household generation. |

#### Relationship-gated systems

- **Pregnancy** — only married women, age 16–40
- **Household composition** — single/betrothed ≤29: parents + siblings in household; married/widowed: spouse + children
- **Servant living arrangements** — single/betrothed servants live in master's household; married/widowed servants live independently
- **Marriage market** — single/widowed can seek marriage (10% monthly chance); three wedding types with different cost/reputation/infection tradeoffs
- **Widow transition** — automatic when spouse NPC dies from plague or other causes
- **Servant dismissal aftermath** — single dismissed servants get family moved back in; married dismissed servants lose master household only

---

## TIER 4 — MINOR IMPACT

These variables primarily affect narrative flavor text and cosmetic details. While they create meaningful roleplaying differences, they have minimal effect on game mechanics.

---

### `$origin`

**Origin's gameplay impact is almost entirely cosmetic.** It modifies NPC name pools, determines flee destination text, and provides narrative flavor. The one genuine mechanical effect is that foreign-born characters can escape naval impressment.

#### Values ranked by gameplay impact

| Value | Weight | Impact Assessment |
|-------|--------|-------------------|
| **"the Dutch Republic"** | 5 (~2%) | **Most mechanically distinct origin.** Can escape naval impressment (foreign-born argument). Gets unique negative narrative during March 1665 war declaration ("things go from bad to worse for you"). Dutch Republic sailors face suspicion at Naval Board. 15+ female and 8 male names get 5x weight boost. |
| **"France"** | 4 (~1.6%) | **Moderate narrative flavor.** Can escape naval impressment. Special combined text if also Catholic (October 1665). 14+ female and 15+ male names get 5x boost—largest name pool modification. |
| **"somewhere else"** | 1 (~0.4%) | **Resolves to Holy Roman Empire, Italy, Spain, or the Americas.** Can escape naval impressment. No name boosts. Unique resolution mechanic at game start. |
| **"Ireland"** | 20 (~8%) | **Name boosts only.** Cannot escape impressment (not foreign-born in game's framework). 5 female and 10 male Irish-coded names get 5x boost (Bridget, Patrick, Owen, etc.). Standard flee text. |
| **"Scotland"** | 20 (~8%) | **Name boosts only.** Cannot escape impressment. 6 female and 9 male Scottish names get 5x boost (Archibald, Duncan, Muriel, etc.). Standard flee text. |
| **"London"** | 30 (~12%) | **No name boosts, different flee text.** Cannot "return home" when fleeing—must go to countryside or colonies. No naval impressment escape. Low reputation check: "not sure if anyone will take you in." Unique "New World" ending option. |
| **"the English countryside"** | 200 (~80%) | **Least distinctive.** No name boosts, no special narrative. Standard flee-home option. Cannot escape impressment. The default experience. |
| **"another English town or city"** | 20 (~8%) | **Identical to countryside** in practice. Standard flee-home option, no boosts, no special narrative. |

#### Origin-gated systems

| System | Impact | Affected Origins |
|--------|--------|-----------------|
| **Naval impressment escape** | Can argue foreign birth to escape press gang | Dutch Republic, France, "somewhere else" (HRE/Italy/Spain/Americas) |
| **NPC name pool 5x boosts** | Cultural naming patterns for all generated NPCs | Ireland, Scotland, Dutch Republic, France |
| **Flee destination text** | "Return to $origin" vs "go to countryside/colonies" | London gets unique colonial option; non-London gets "return home" |
| **War narrative** | Special text during March 1665 war declaration | Dutch Republic only |
| **Combined religion+origin text** | Catholic+French special dialogue | France + Catholic only |

#### Bottom line on `$origin`

The only true **mechanical** consequence is the naval impressment escape for foreign-born characters (Dutch Republic, France, "somewhere else"). Everything else—name boosts, flee text, narrative flavor—is cosmetic. A player from "the English countryside" and a player from "another English town or city" will have functionally identical gameplay experiences.

---

## Cross-Variable Interactions

Several character creation variables interact with each other to create compound effects:

| Interaction | Effect |
|-------------|--------|
| **$socio=servants + $relationship=single** | Player lives in master's household instead of with own family |
| **$gender=female + $age≥16 + $relationship=married** | Pregnancy mechanics activate (10% monthly chance) |
| **$gender=male + $religion=CoE + $socio=artisan/merchant + $age≥30 + $reputation≥8** | Church office eligibility |
| **$socio=beggars + $gender=male + $religion≠Quaker** | Navy volunteering available |
| **$socio=beggars + $gender=female + $religion≠Quaker** | Navy via disguise (10% discovery risk, -3 rep) |
| **$religion=Catholic + $origin=France** | Special combined narrative text |
| **$socio=artisans + $reputation≤5** | 50% flee failure chance |
| **$location=western suburbs** | Plague arrives 2 months before City; more months of exposure |
| **$age=elderly** | 3.3% monthly death risk + protected from impressment |
| **$gender=female + $socio=beggars/day labourers** | Plague work limited to searcher (if rep >5) or nurse |

---

## Summary: Variable Impact Ranking

From most to least impactful on total gameplay experience:

1. **`$socio`** — Reshapes economics, household, events, flee options, jobs, reputation, and narrative across the entire game. Every system checks social class.
2. **`$location` / `$parish`** — Controls plague timing and parish-specific infection rates using historical data. Creates 2-month variation in plague arrival and dramatically different survival odds.
3. **`$age` / `$agenum`** — Determines autonomy (head of household), available life events (marriage, pregnancy, office, military), household structure, and elderly death risk.
4. **`$gender`** — Gates military service, plague work roles, pregnancy, church office, and impressment. Creates meaningfully different available actions.
5. **`$religion`** — Creates persistent monthly financial/reputation drain for minorities (~5% of all religions). Gates church office. Provides unique events for Catholics and Quakers.
6. **`$relationship`** — Shapes initial household composition and enables pregnancy for married women. Important at creation but changes less frequently during gameplay.
7. **`$origin`** — Almost entirely cosmetic. One mechanical effect (foreign-born impressment escape). Name pool boosts and narrative flavor text.
