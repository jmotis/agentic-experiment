# Analysis: `$hoh` (Head of Household) Variable — Logical Inconsistencies

**Date:** 2026-03-02
**Scope:** All passages in `GamingtheGreatPlague.html` that reference `$hoh` or present household-level decisions

---

## Table of Contents

1. [How `$hoh` Is Currently Set](#1-how-hoh-is-currently-set)
2. [Where `$hoh` Is Currently Checked](#2-where-hoh-is-currently-checked)
3. [Root Problem: `$hoh` Ignores Gender, Marital Status, and Social Class](#3-root-problem-hoh-ignores-gender-marital-status-and-social-class)
4. [Inconsistency Category A: Married Women Acting as Head of Household](#4-inconsistency-category-a-married-women-acting-as-head-of-household)
5. [Inconsistency Category B: Servants Acting as Head of Household](#5-inconsistency-category-b-servants-acting-as-head-of-household)
6. [Inconsistency Category C: Merchant/Noble Children and Adolescents — Missing `$hoh` Gates](#6-inconsistency-category-c-merchantnoble-children-and-adolescents--missing-hoh-gates)
7. [Inconsistency Category D: Household Decisions with No `$hoh` Gating at All](#7-inconsistency-category-d-household-decisions-with-no-hoh-gating-at-all)
8. [Summary Table: All Household Decisions and Their Gating Status](#8-summary-table-all-household-decisions-and-their-gating-status)
9. [Recommendations](#9-recommendations)

---

## 1. How `$hoh` Is Currently Set

The `$hoh` variable is a boolean-like integer (`0` or `1`) representing whether the player character is the "head of household."

### Initialization (PID 10, `StoryInit`)
```
<<set $hoh to 0>>
```

### Assignment (PID 14, `playerAge` widget)
```
<<widget "playerAge">>
<<if $age eq "child">>       <<set $agenum to random(5,9)>>
<<elseif $age eq "adolescent">>  <<set $agenum to random(10,15)>>
<<elseif $age eq "young adult">> <<set $agenum to random(16,29)>>  <<set $hoh to 1>>
<<elseif $age eq "middle-aged adult">> <<set $agenum to random(30,59)>> <<set $hoh to 1>>
<<elseif $age eq "elderly adult">>     <<set $agenum to random(60,76)>> <<set $hoh to 1>>
<</if>>
<</widget>>
```

### Living-alone fallback (PID 1, `bio`)
```
<<elseif $NPCs.length eq 0>>You live alone.<<set $hoh to 1>>
```

### Key observation

**`$hoh` is determined purely by age.** Any character aged 16+ gets `$hoh = 1`, regardless of:
- **Gender** — a married woman gets `$hoh = 1`
- **Marital status** — married, single, widowed, betrothed are all treated identically
- **Social class** — a servant living in their master's household gets `$hoh = 1`

---

## 2. Where `$hoh` Is Currently Checked

`$hoh` appears in only **three passages** in the entire game:

| PID | Passage | Usage |
|-----|---------|-------|
| **6** | `Sickness` | Gates will-writing: `<<if $hoh is 1>>` (merchants/artisans only) |
| **64** | `flight-choice` | Gates flee/stay narrative framing and the "send household away" option |
| **89** | `Stay` | Gates narrative framing: "You decide to" vs. "You convince your family to" |

The flight-choice widget (PID 64) is the most extensively gated. The Sickness passage gates only the will-writing decision. All other household decisions in the game have **no `$hoh` check whatsoever**.

---

## 3. Root Problem: `$hoh` Ignores Gender, Marital Status, and Social Class

In 17th-century England, the head of household was determined by a combination of factors, not just age:

### Married women (feme covert)
Under the legal doctrine of **coverture**, a married woman's legal identity was subsumed by her husband's. She could not independently own property, enter contracts, write a will, or make major household decisions. When the player is a married woman, her husband NPC (always present in `$NPCs` via the `addPartnerNPC` widget) should be the decision-maker.

Notably, the game **already acknowledges coverture** in the marriage-market widget (PID 107):
> "The downside is all your property will become your husband's and you will be legally dependent on him until he dies... or you do."

But this warning is never mechanically enforced. After marriage, a female player retains full `$hoh = 1` authority.

### Servants
Servants live under their master's authority. The game correctly models this for **flee decisions** — the master decides whether to flee, and the servant's only real choice is to follow or break contract. However, `$hoh` is still `1` for adult servants, meaning they have autonomous authority over all other household decisions.

### Widows and single women
Widowed women and never-married women running their own households **were** effectively heads of household in this period (femme sole). The current system accidentally gets this right, since these women are adults with `$hoh = 1`.

---

## 4. Inconsistency Category A: Married Women Acting as Head of Household

A married adult woman (`$gender = "female"`, `$relationship = "married"`, `$hoh = 1`) can:

### A1. Autonomously decide to flee or stay (PID 64, `flight-choice`)
- **Current behavior:** For day labourers and artisans, `$hoh = 1` triggers the framing "You decide to:" and offers the full menu of options, including sending the household away.
- **Historically accurate behavior:** The husband (present as an NPC) would make this decision. The married woman should get the `$hoh = 0` framing: "You convince your family to..." or "Your husband decides to..."

### A2. Send the household away while staying behind (PID 64, artisans/day labourers initial context)
- **Current behavior:** The "send the rest of your household away" option is gated by `$hoh is 1 and $NPCs.length gt 0`. A married woman qualifies.
- **Historically accurate behavior:** Only the actual head of household (the husband) would have the authority to split up and relocate the family.

### A3. Write a will (PID 6, `Sickness`)
- **Current behavior:** Will-writing is offered when `$hoh is 1` and `$socio is "merchants"` or `$socio is "artisans"`. A married female merchant or artisan would be offered this.
- **Historically accurate behavior:** Under coverture, a married woman could **not** write a will. Her property legally belonged to her husband. Only widowed women (femmes sole) and single women had testamentary capacity.

### A4. Make all household purchases freely (PID 79, `Apothecary`)
- **Current behavior:** No `$hoh` check at all. Any player can buy fumigants and remedies.
- **Historically accurate behavior:** This is a grey area. Day-to-day domestic purchases (food, medicine) were often within a wife's sphere even under coverture. However, expensive items like St. Giles Powder (192d.) might exceed what a wife could authorize independently.

---

## 5. Inconsistency Category B: Servants Acting as Head of Household

An adult servant (`$socio = "servants"`, `$hoh = 1`) is correctly modeled in **some** contexts but not others.

### What's already correct
- **Flee decisions (PID 64, initial context):** The master decides whether to flee. The servant chooses only whether to follow or break contract. `$hoh` is not checked here because the master's authority is modeled directly.
- **Stay passage (PID 89):** Uses `$hoh` for narrative framing of the servant's decision.

### What's inconsistent

**B1. Flee decisions (PID 64, late context):** When a servant who initially stayed (`$fled = 0`) gets a later flee opportunity, the `$hoh` check is `<<if $hoh is 0 and $NPCs.length gt 0>>try to convince your family to<</if>>`. Since adult servants have `$hoh = 1`, they get autonomous framing — but they are still under their master's authority.

**B2. All other household decisions:** Servants with `$hoh = 1` can make all the same household decisions as any other adult: purchasing remedies, deciding on quarantine treatments, taking in dependents, etc. While a married/widowed servant has their own family in `$NPCs`, their master still has authority over the broader household, and the servant's own family decisions would typically require the master's consent.

---

## 6. Inconsistency Category C: Merchant/Noble Children and Adolescents — Missing `$hoh` Gates

While merchant and noble children/adolescents correctly have `$hoh = 0`, several major decisions **do not check `$hoh` at all**, meaning these characters can act with full household authority.

### C1. Merchants: "Send household away" option (PID 64, initial context)
- **Current behavior:** The three options (remain, send household away, flee) are presented to **all** merchant players with no `$hoh` check. A merchant child (`$hoh = 0`) can spend 800d. to send the household away.
- **Contrast:** Day labourers and artisans correctly gate this option with `$hoh is 1`.

### C2. Nobles: "Send household away" option (PID 64, initial context)
- **Current behavior:** Same as merchants — no `$hoh` check. A noble child can spend 5,000d. to send most of the household to the countryside.
- **Contrast:** This is a massive household decision and financial expenditure with no authority gate.

### C3. Artisans: "Send household away" (PID 64, late context)
- **Current behavior:** In the artisans' late-departure context (when `$fled = 4` and `$reputation > 5`), the "send the rest of your household away" option is presented **without** a `$hoh` check. The `$hoh` check only applies to the "flee" option's narrative text.
- **Contrast:** The artisans' initial context correctly gates "send household away" with `$hoh is 1`.

---

## 7. Inconsistency Category D: Household Decisions with No `$hoh` Gating at All

These decisions affect the entire household (financially, medically, or structurally) but never check `$hoh`. Any player — child, married woman, or servant — can make them autonomously.

### D1. Christmas Feast — December 1664 (PID 12) and December 1665 (PID 22)
- **Decision:** "Will you celebrate Christmas with a feast?"
- **Financial impact:** Variable (via `<<party-costs>>` widget)
- **Current accommodation:** Uses `<<if $agenum lte 15>>and your family<</if>>` for narrative flavor — but the decision itself is not gated.
- **Note:** This pattern of using `$agenum lte 15` for text flavor instead of `$hoh` for decision gating recurs throughout the game.

### D2. Pre-Lent Feast — February 1666 (PID 24)
- **Decision:** "Will you hold one last feast before fasting?"
- **Same pattern** as the Christmas feasts — `$agenum lte 15` text only, no `$hoh` gate.

### D3. King's Birthday — May 1666 (PID 27)
- **Decision:** Whether to celebrate the king's birthday
- **Financial impact:** `<<party-costs>>` widget
- **No `$hoh` check.**

### D4. Quarantine vs. Pesthouse (PID 40, `sickFam` widget)
- **Decision:** "Do you quarantine with your household or send the sick to the pesthouse?"
- **Impact:** Affects the entire household — quarantine locks everyone inside for weeks; pesthouse sends family members away.
- **Current accommodation:** `<<if $agenum lte 15>>convince your household to<</if>>` — narrative text only.
- **Assessment:** This is one of the **most significant household decisions** in the game and has no `$hoh` gate.

### D5. Quarantine Treatments for Sick Family Members (PID 80, `hh-treatments` widget, called from PIDs 59 and 60)
- **Decision:** Which remedies to administer to sick household members, whether to purchase additional remedies.
- **Financial impact:** Varies by remedy (12–192d.)
- **No `$hoh` check.** A child player can choose what plague treatments to apply to their parents.

### D6. Apothecary Purchases (PID 79)
- **Decision:** Purchase fumigants and preventative remedies for the household.
- **Financial impact:** 21–192d. per item, prices scaled by household size.
- **No `$hoh` check whatsoever.** Any player can spend household money freely.

### D7. Taking in Dependents — Worker's Child, Apprentice, Ward (PID 105, `add-dependent` widget)
- **Decision:** "Will you accept them into your home?"
- **Impact:** Adds a new person to the household, increasing expenses.
- **Current accommodation:** `<<if $agenum lte 15>>r family<</if>>` adjusts "your" to "your family" for children, but the decision is fully available.

### D8. Church Services — Monthly (PID 115, `church-services` widget)
- **Decision:** Whether to attend Church of England services (for non-CoE characters).
- **Financial impact:** 48d. fine plus −1 reputation for skipping.
- **No `$hoh` check.** Arguably a personal religious conviction, but the financial penalty affects the household.

### D9. Bills of Mortality Subscription (PID 114, `bill-subscribe` widget)
- **Decision:** Subscribe at 4d./month.
- **No `$hoh` check.** Low financial impact; borderline case.

---

## 8. Summary Table: All Household Decisions and Their Gating Status

### Currently Gated by `$hoh`

| Decision | PID | Gate | Notes |
|----------|-----|------|-------|
| Will-writing (sickness) | 6 | `$hoh is 1` + merchant/artisan | Correct for men; incorrect for married women (coverture) |
| Flee/stay framing (day labourers) | 64 | `$hoh is 0/1` for text; `$hoh is 1` for "send away" | Correct for children; incorrect for married women |
| Flee/stay framing (artisans, initial) | 64 | `$hoh is 0/1` for text; `$hoh is 1` for "send away" | Correct for children; incorrect for married women |
| Flee/stay framing (all classes, late) | 64 | `$hoh is 0` for "convince" text | Text adjustment only; no decision restriction |
| Stay framing (beggars) | 89 | `$hoh is 0/1` for text | Text adjustment only |
| Stay framing (servants) | 89 | `$hoh is 0` for "convince" text | Text adjustment only |

### Missing `$hoh` Gate — High Priority

| Decision | PID | Current Gate | Who Can Inappropriately Decide |
|----------|-----|-------------|-------------------------------|
| Send household away (merchants, initial) | 64 | None | Children, adolescents, married women |
| Send household away (nobles, initial) | 64 | None | Children, adolescents, married women |
| Send household away (artisans, late) | 64 | None | Children, adolescents, married women |
| Quarantine vs. pesthouse | 40 | `$agenum lte 15` text only | Married women, servants |
| Quarantine treatments / purchases | 80 | None | Children, adolescents, married women, servants |
| Apothecary purchases | 79 | None | Children, adolescents, married women, servants |
| Taking in dependents | 105 | `$agenum lte 15` text only | Married women, servants |

### Missing `$hoh` Gate — Medium Priority

| Decision | PID | Current Gate | Notes |
|----------|-----|-------------|-------|
| Christmas feast (Dec 1664) | 12 | `$agenum lte 15` text only | Household expense; flavor text partially mitigates |
| Christmas feast (Dec 1665) | 22 | `$agenum lte 15` text only | Same |
| Pre-Lent feast (Feb 1666) | 24 | `$agenum lte 15` text only | Same |
| King's Birthday (May 1666) | 27 | None | Household expense |
| Church services fine | 115 | None | 48d. monthly financial impact |

### No `$hoh` Gate Needed

| Decision | PID | Rationale |
|----------|-----|-----------|
| Personal plague treatments (player sick) | 80 | Applied to player's own body |
| Investigate plague rumors | 16 | Individual action, no household impact |
| Curfew compliance | 18 | Individual movement decision |
| Report sick to pesthouse | 20 | Civic action |
| Plague work acceptance | 64 | Parish-assigned, not a household decision |
| Navy volunteering | 2 | Already gated by gender/age; individual decision |
| Impressment | 15 | Involuntary — not a decision |
| Searcher bribery | 7 | Individual professional decision |
| Stealing from the dead | 18 | Individual professional decision |

---

## 9. Recommendations

### 9.1 Fundamental: Refine how `$hoh` is assigned

The current logic (`$hoh = 1` for all adults) should be expanded to account for historical household authority:

```
/* In playerAge widget, after setting $agenum: */
<<if $age eq "young adult" or $age eq "middle-aged adult" or $age eq "elderly adult">>
    <<set $hoh to 1>>
<</if>>

/* Then, after relationship and socio are determined (in bio or random-character): */

/* Married women are not hoh — their husband is */
<<if $gender is "female" and $relationship is "married">>
    <<set $hoh to 0>>
<</if>>

/* Servants living in master's household are not hoh */
<<if $socio is "servants" and ($relationship is "single" or $relationship is "betrothed")>>
    <<set $hoh to 0>>
<</if>>
```

Important: `$hoh` should be **dynamically updated** when circumstances change:
- A married woman who becomes **widowed** (husband NPC dies) should gain `$hoh = 1`
- A servant who **breaks their contract** should gain `$hoh = 1` (they are now independent)
- A single woman who **marries** should lose `$hoh` (gain a husband)

### 9.2 Add `$hoh` checks to ungated household decisions

For decisions currently missing `$hoh` gating, the game already has two patterns it could follow:

**Pattern 1 — Narrative text adjustment** (currently used in flight-choice):
```
<<if $hoh is 0>>You convince your family to<<else>>You decide to:<</if>>
```
This preserves gameplay freedom but acknowledges the player's non-authority status.

**Pattern 2 — Decision restriction** (currently used for "send household away"):
```
<<if $hoh is 1 and $NPCs.length gt 0>>
    <li>[[Send the rest of your household away...]]</li>
<</if>>
```
This restricts the option entirely for non-hoh characters.

For most decisions, **Pattern 1** (narrative framing) is the lighter-touch approach that avoids removing gameplay agency while improving historical accuracy.

### 9.3 Fix merchant/noble "send household away" gap

The most clear-cut bug is that merchants and nobles in the **initial** flee context have no `$hoh` check on the "send household away" option. This should be gated the same way day labourers and artisans are:

```
/* Current (merchants, initial): */
<li>[[Remain in the city, but send the rest of your household away->Stay][...]]</li>

/* Should be: */
<<if $hoh is 1 and $NPCs.length gt 0>>
    <li>[[Remain in the city, but send the rest of your household away->Stay][...]]</li>
<</if>>
```

The same fix should apply to nobles.

### 9.4 Fix artisan late-context "send household away" gap

The artisans' late-departure context has the "send household away" option without a `$hoh` gate, even though the initial context gates it. This should be consistent:

```
/* Current (artisans, late, $fled is 4): */
[[flee the city...]], or [[send the rest of your household away...]]

/* The "send away" link should be gated: */
[[flee the city...]]<<if $hoh is 1 and $NPCs.length gt 0>>, or [[send the rest of your household away...]]<</if>>
```

### 9.5 Note on the `$agenum lte 15` pattern

Several passages use `<<if $agenum lte 15>>` to adjust narrative text (e.g., "Will you and your family celebrate Christmas?"). This is a workaround that partially addresses the child/adolescent case but:
- Does not use `$hoh` (so it wouldn't benefit from a corrected `$hoh` assignment)
- Only provides flavor text, not decision gating
- Does not address married women or servants at all

A consistent approach would be to replace these `$agenum lte 15` checks with `$hoh is 0` checks, so that the same framing applies to all non-hoh characters (children, married women, servants).
