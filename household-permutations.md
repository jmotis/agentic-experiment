# Household Permutations Analysis

This document catalogs all possible initial household compositions generated during character creation, based on the code in `passages/001-bio.txt` (household assembly logic) and `passages/014-char-gen-widgets.txt` (NPC generation widgets).

## Key Variables Governing Household Composition

| Variable | Possible Values |
|----------|----------------|
| **Age** (`$age`) | child (5–9), adolescent (10–15), young adult (16–29), middle-aged adult (30–59), elderly adult (60–76) |
| **Gender** (`$gender`) | male, female |
| **Relationship** (`$relationship`) | single, betrothed (age ≤ 15 only), married (age ≥ 16), widowed (age ≥ 16) |
| **Socioeconomic status** (`$socio`) | beggars, day labourers, servants, artisans, merchants, nobles |

## How the Code Works

The household assembly in `001-bio.txt` runs through three sequential blocks. A character may enter multiple blocks depending on their age and relationship status.

- **Block 1** (age ≤ 29, single/betrothed): Generates parents + class-scaled siblings → placed in the primary household (`$NPCs`).
- **Block 2** (age ≥ 16): Generates spouse (if married), children (if married/widowed), a second round of parents, and 0–3 siblings. Older/married characters' parents and siblings go to the extended household (`$NPCsExtended`).
- **Block 3** (age ≥ 60, single/widowed): Adds one sibling or niece/nephew to the primary household.
- **Servant overlay**: If `$socio` is "servants", a master's household is generated. Unmarried servants' families are moved to extended and the master's household becomes primary.
- **Servants (staff)**: Nobles get 8–12 servants, merchants 1–3, artisans 0–1, added to `$NPCsServants`.

### Parent Generation Details (`addParentNPC`)
- Mother: 75% chance to exist; if generated, 1/6 chance of being a step-mother
- Father: 75% chance to exist; if generated, 1/6 chance of being a step-father
- **No orphans under 16**: If age ≤ 15 and neither parent was generated, one parent is guaranteed (50/50 mother or father, each with 1/6 step-parent chance)
- Placement rule: Parents go to `$NPCs` if player is age ≤ 30 AND single/betrothed; otherwise `$NPCsExtended`

### Sibling Generation Details (`addSiblingsNPC`)
- Placement rule: Siblings go to `$NPCs` if player is age ≤ 30, single, AND sibling age ≤ 30; otherwise `$NPCsExtended`

---

## Permutation Catalog

### 1. CHILD Player Character (age 5–9)

**Available relationship statuses:** single, betrothed

**Code path:** Block 1 only (age ≤ 29 + single/betrothed; Block 2 requires age ≥ 16)

**Guaranteed:** At least one parent (orphan prevention kicks in for age ≤ 15)

#### 1A. Child, Single/Betrothed, Beggars
- **Parents:** 1–2 parents in household (mother/step-mother and/or father/step-father; at least one guaranteed)
- **Siblings:** 0–1 siblings (brother/sister)
- **Household:** PC + 1–3 NPCs

#### 1B. Child, Single/Betrothed, Day Labourers
- **Parents:** 1–2 parents in household
- **Siblings:** 0–2 siblings
- **Household:** PC + 1–4 NPCs

#### 1C. Child, Single/Betrothed, Servants
- **Parents:** 1–2 parents → moved to extended family
- **Siblings:** 0–2 siblings → moved to extended family
- **Master's household becomes primary:** master (or mistress, ~20% chance) + mistress/wife (if male master, ~55% chance) + 1–9 additional members (master's children, parents, servants depending on master's status: artisans 2–4 total, merchants 3–6 total, nobles 5–10 total)
- **Household:** PC lives in master's household; birth family listed as extended

#### 1D. Child, Single/Betrothed, Artisans
- **Parents:** 1–2 parents in household
- **Siblings:** 1–2 siblings
- **Servants:** 0–1 household servants
- **Household:** PC + 2–5 NPCs + 0–1 servants

#### 1E. Child, Single/Betrothed, Merchants
- **Parents:** 1–2 parents in household
- **Siblings:** 1–4 siblings
- **Servants:** 1–3 household servants
- **Household:** PC + 2–6 NPCs + 1–3 servants

#### 1F. Child, Single/Betrothed, Nobles
- **Parents:** 1–2 parents in household
- **Siblings:** 2–6 siblings
- **Servants:** 8–12 household servants
- **Household:** PC + 3–8 NPCs + 8–12 servants

---

### 2. ADOLESCENT Player Character (age 10–15)

**Available relationship statuses:** single, betrothed

**Code path:** Block 1 only (same as child)

**Guaranteed:** At least one parent (orphan prevention for age ≤ 15)

Household compositions are identical to the child permutations above (1A–1F). The only difference is the player's age range (10–15 vs 5–9), which affects parent and sibling age ranges.

---

### 3. YOUNG ADULT Player Character (age 16–29)

**Available relationship statuses:** single, married, widowed

**Code paths vary by relationship status:**

#### 3A. Young Adult, Single — enters BOTH Block 1 and Block 2

This is a notable case: the character gets **two rounds** of parent generation and **two rounds** of sibling generation.

- **Round 1 parents (Block 1):** 0–2 parents in household (75% chance each; no orphan guarantee since age > 15)
- **Round 1 siblings (Block 1):** Class-scaled siblings in household
- **Round 2 parents (Block 2):** 0–2 additional parents; placement depends on age — if ≤ 30 and single, goes to household; but if the same parent type already exists, both are added
- **Round 2 siblings (Block 2):** 0–3 additional siblings; if age ≤ 30 and single and sibling ≤ 30, goes to household; otherwise extended

##### 3A-i. Young Adult, Single, Beggars
- **Parents:** 0–4 parents across two rounds (typically 1–3)
- **Siblings:** 0–4 total (0–1 from Block 1 + 0–3 from Block 2)
- **Household:** PC + 0–8 NPCs (realistically 1–5)

##### 3A-ii. Young Adult, Single, Day Labourers
- **Parents:** 0–4 parents
- **Siblings:** 0–5 total (0–2 + 0–3)
- **Household:** PC + 0–9 NPCs

##### 3A-iii. Young Adult, Single, Servants
- **Parents from Block 1:** 0–2 → will be moved to extended
- **Siblings from Block 1:** 0–2 → will be moved to extended
- **Parents from Block 2:** 0–2 → placed in household (age ≤ 30, single) then moved to extended
- **Siblings from Block 2:** 0–3 → placed in household then moved to extended
- **Master's household becomes primary** (same as 1C)
- **All birth family goes to extended**
- **Household:** PC + master's household members

##### 3A-iv. Young Adult, Single, Artisans
- **Parents:** 0–4
- **Siblings:** 1–5 (1–2 + 0–3)
- **Servants:** 0–1
- **Household:** PC + 1–9 NPCs + 0–1 servants

##### 3A-v. Young Adult, Single, Merchants
- **Parents:** 0–4
- **Siblings:** 1–7 (1–4 + 0–3)
- **Servants:** 1–3
- **Household:** PC + 1–11 NPCs + 1–3 servants

##### 3A-vi. Young Adult, Single, Nobles
- **Parents:** 0–4
- **Siblings:** 2–9 (2–6 + 0–3)
- **Servants:** 8–12
- **Household:** PC + 2–13 NPCs + 8–12 servants

#### 3B. Young Adult, Married — Block 2 only

- **Spouse:** 1 (husband if PC is female; wife if PC is male; age within ±15 of PC)
- **Children:** Class-scaled (ages 0 to PC age minus 20; since PC is 16–29, children are very young or this may produce 0)
- **Parents:** 0–2, placed based on age/relationship (≤ 30 → household or extended depending on married status; married adults' parents go to extended)
- **Siblings:** 0–3 (go to extended since married)

##### 3B-i. Young Adult, Married, Beggars
- **Household:** PC + spouse + 0–1 children
- **Extended:** 0–2 parents + 0–3 siblings
- **Household size:** 2–3

##### 3B-ii. Young Adult, Married, Day Labourers
- **Household:** PC + spouse + 0–2 children
- **Extended:** 0–2 parents + 0–3 siblings
- **Household size:** 2–4

##### 3B-iii. Young Adult, Married, Servants
- **Household:** PC + spouse + 0–2 children
- **Master's household:** Separate listing (master is artisan/merchant/noble, 2–10 members)
- **Extended:** 0–2 parents + 0–3 siblings
- **Household size:** 2–4 (own) + master's household

##### 3B-iv. Young Adult, Married, Artisans
- **Household:** PC + spouse + 1–3 children
- **Extended:** 0–2 parents + 0–3 siblings
- **Servants:** 0–1
- **Household size:** 3–5 + 0–1 servants

##### 3B-v. Young Adult, Married, Merchants
- **Household:** PC + spouse + 1–4 children
- **Extended:** 0–2 parents + 0–3 siblings
- **Servants:** 1–3
- **Household size:** 3–6 + 1–3 servants

##### 3B-vi. Young Adult, Married, Nobles
- **Household:** PC + spouse + 2–6 children
- **Extended:** 0–2 parents + 0–3 siblings
- **Servants:** 8–12
- **Household size:** 4–8 + 8–12 servants

#### 3C. Young Adult, Widowed — Block 2 only

Same as 3B except **no spouse**.

##### 3C-i. Young Adult, Widowed, Beggars
- **Household:** PC + 0–1 children
- **Extended:** 0–2 parents + 0–3 siblings

##### 3C-ii. Young Adult, Widowed, Day Labourers
- **Household:** PC + 0–2 children
- **Extended:** 0–2 parents + 0–3 siblings

##### 3C-iii. Young Adult, Widowed, Servants
- **Household:** PC + 0–2 children
- **Master's household:** Separate listing
- **Extended:** 0–2 parents + 0–3 siblings

##### 3C-iv. Young Adult, Widowed, Artisans
- **Household:** PC + 1–3 children + 0–1 servants
- **Extended:** 0–2 parents + 0–3 siblings

##### 3C-v. Young Adult, Widowed, Merchants
- **Household:** PC + 1–4 children + 1–3 servants
- **Extended:** 0–2 parents + 0–3 siblings

##### 3C-vi. Young Adult, Widowed, Nobles
- **Household:** PC + 2–6 children + 8–12 servants
- **Extended:** 0–2 parents + 0–3 siblings

---

### 4. MIDDLE-AGED ADULT Player Character (age 30–59)

**Available relationship statuses:** single, married, widowed

**Code path:** Block 2 only

**Key difference from young adults:** Parents and siblings are always placed in the extended household (age > 30).

#### 4A. Middle-Aged Adult, Single

- **No spouse, no children**
- **Parents:** 0–2 in extended household
- **Siblings:** 0–3 in extended household
- **Household:** PC alone (possibly truly alone)

##### 4A-i. Middle-Aged Single, Beggars
- **Household:** PC alone
- **Extended:** 0–5 family members

##### 4A-ii. Middle-Aged Single, Day Labourers
- **Household:** PC alone
- **Extended:** 0–5 family members

##### 4A-iii. Middle-Aged Single, Servants
- **Master's household becomes primary** (master is artisan only for non-servant socio; for servants, master is randomly artisan/merchant/noble)
- Wait — for single servants, the family swap happens: `$NPCsExtended = $NPCsExtended.concat($NPCs); $NPCs = $NPCsMaster.slice(); $NPCsMaster = []`
- But for age > 30 single: Block 1 isn't entered. Block 2 adds parents/siblings to extended. So $NPCs is empty at the swap point.
- Actually re-reading: the condition is `if $relationship is "single" or $relationship is "betrothed"` for the swap. So middle-aged single servants DO get the swap.
- **Household:** PC lives in master's household
- **Extended:** 0–5 family members

##### 4A-iv. Middle-Aged Single, Artisans
- **Household:** PC alone + 0–1 servants
- **Extended:** 0–5 family members

##### 4A-v. Middle-Aged Single, Merchants
- **Household:** PC alone + 1–3 servants
- **Extended:** 0–5 family members

##### 4A-vi. Middle-Aged Single, Nobles
- **Household:** PC alone + 8–12 servants
- **Extended:** 0–5 family members

#### 4B. Middle-Aged Adult, Married

- **Spouse:** 1
- **Children:** Class-scaled (ages 0 to PC age minus 20; wider range since PC is 30–59)
- **Parents:** 0–2 in extended
- **Siblings:** 0–3 in extended

##### 4B-i. Middle-Aged Married, Beggars
- **Household:** PC + spouse + 0–1 children
- **Extended:** 0–5 family members

##### 4B-ii. Middle-Aged Married, Day Labourers
- **Household:** PC + spouse + 0–2 children
- **Extended:** 0–5 family members

##### 4B-iii. Middle-Aged Married, Servants
- **Household:** PC + spouse + 0–2 children
- **Master's household:** Listed separately (2–10 members)
- **Extended:** 0–5 family members

##### 4B-iv. Middle-Aged Married, Artisans
- **Household:** PC + spouse + 1–3 children + 0–1 servants
- **Extended:** 0–5 family members

##### 4B-v. Middle-Aged Married, Merchants
- **Household:** PC + spouse + 1–4 children + 1–3 servants
- **Extended:** 0–5 family members

##### 4B-vi. Middle-Aged Married, Nobles
- **Household:** PC + spouse + 2–6 children + 8–12 servants
- **Extended:** 0–5 family members

#### 4C. Middle-Aged Adult, Widowed

Same as 4B except **no spouse**.

##### 4C-i through 4C-vi
- Same structure as 4B-i through 4B-vi minus the spouse.

---

### 5. ELDERLY ADULT Player Character (age 60–76)

**Available relationship statuses:** single, married, widowed

**Code paths:** Block 2 + Block 3 (for single/widowed)

#### 5A. Elderly Adult, Single

- Block 2: No spouse, no children. Parents in extended (very unlikely to generate given age constraints). 0–3 siblings in extended.
- Block 3: Adds 1 sibling or niece/nephew to **primary** household.

##### 5A-i. Elderly Single, Beggars/Day Labourers
- **Household:** PC + 1 relative (sister, niece, brother, or nephew)
- **Extended:** 0–3 siblings (+ extremely unlikely parents)

##### 5A-ii. Elderly Single, Servants
- **Master's household becomes primary** (single servant swap)
- **Block 3 relative added to $NPCs BEFORE the swap** — so the niece/nephew goes to primary, then gets swapped to extended when master's HH replaces $NPCs
- Wait, let me re-check the order. Block 3 (lines 62-78) runs inside the `<<silently>>` block. Then the servant overlay (line 85) runs after. So yes, the Block 3 relative ends up in extended.
- **Household:** PC + master's household
- **Extended:** 1 relative + 0–3 siblings

##### 5A-iii. Elderly Single, Artisans
- **Household:** PC + 1 relative + 0–1 servants
- **Extended:** 0–3 siblings

##### 5A-iv. Elderly Single, Merchants
- **Household:** PC + 1 relative + 1–3 servants
- **Extended:** 0–3 siblings

##### 5A-v. Elderly Single, Nobles
- **Household:** PC + 1 relative + 8–12 servants
- **Extended:** 0–3 siblings

#### 5B. Elderly Adult, Married

- Block 2: Spouse + children + parents (extended) + siblings (extended)
- Block 3: Not entered (married)

##### 5B-i through 5B-vi
- Same structure as 4B (middle-aged married) permutations. Children may be older (up to PC age minus 20, so potentially adults themselves).

#### 5C. Elderly Adult, Widowed

- Block 2: No spouse + children + parents (extended) + siblings (extended)
- Block 3: Adds 1 sibling/niece/nephew to primary household.

##### 5C-i. Elderly Widowed, Beggars
- **Household:** PC + 0–1 children + 1 relative (from Block 3)
- **Extended:** 0–5 family members

##### 5C-ii. Elderly Widowed, Day Labourers
- **Household:** PC + 0–2 children + 1 relative
- **Extended:** 0–5 family members

##### 5C-iii. Elderly Widowed, Servants
- **Household:** PC + 0–2 children (married servants keep own household; widowed is not single, so NO master swap)
- **Master's household:** Listed separately
- Wait — actually, the servant swap condition is `if $relationship is "single" or $relationship is "betrothed"`. Widowed doesn't trigger the swap. So widowed elderly servants live with their own family + the Block 3 relative, with master's HH listed separately.
- **Household:** PC + 0–2 children + 1 relative
- **Master's household:** Separate
- **Extended:** 0–5 family members

##### 5C-iv. Elderly Widowed, Artisans
- **Household:** PC + 1–3 children + 1 relative + 0–1 servants
- **Extended:** 0–5 family members

##### 5C-v. Elderly Widowed, Merchants
- **Household:** PC + 1–4 children + 1 relative + 1–3 servants
- **Extended:** 0–5 family members

##### 5C-vi. Elderly Widowed, Nobles
- **Household:** PC + 2–6 children + 1 relative + 8–12 servants
- **Extended:** 0–5 family members

---

## Master's Household Composition (Servants Only)

When `$socio` is "servants", a master's household is generated via `addMasterHousehold`. The master's social status is randomly chosen from artisans, merchants, or nobles.

- **Master:** Always generated (age 30–76, ~80% male / ~20% female/"widowed mistress")
- **Mistress (wife):** If male master, ~55% chance (11/20) of having a wife
- **Additional members** (randomly selected per slot):
  - Master's daughter, master's son
  - Master's mother (at most one), master's father (at most one)
  - Female servant, male servant

| Master Status | Household Size (including master) |
|---------------|----------------------------------|
| Artisans | 2–4 |
| Merchants | 3–6 |
| Nobles | 5–10 |

---

## Mid-Game Household Additions

These are not part of initial generation but can add members during gameplay:

- **Lodgers** (`add-lodgers` widget, offered in October 1666): Available to day labourers (cap 1), servants (cap 1), artisans (cap 3), merchants (cap 5). Five lodger types:
  1. Single male lodger (1 slot)
  2. Single female lodger (1 slot)
  3. Widowed lodger + 1–2 children (2–3 slots)
  4. Married couple (2 slots)
  5. Married couple + 1–3 children (3–5 slots)

- **Apprentice** (`addApprenticeNPC`): An adolescent male added for artisan/merchant households
- **Worker's kid** (`addWorkerKidNPC`): An adolescent friend's child, for day labourers/servants
- **Ward** (`addWardNPC`): An adolescent ward, for noble households

---

## Summary Table of Initial Household Permutations

| # | Age | Relationship | Socio | Primary Household Members | Extended Family | Staff |
|---|-----|-------------|-------|--------------------------|-----------------|-------|
| 1 | Child/Adolescent | Single/Betrothed | Beggars | 1–2 parents + 0–1 siblings | — | — |
| 2 | Child/Adolescent | Single/Betrothed | Day Labourers | 1–2 parents + 0–2 siblings | — | — |
| 3 | Child/Adolescent | Single/Betrothed | Servants | Master's HH (2–10) | 1–2 parents + 0–2 siblings | — |
| 4 | Child/Adolescent | Single/Betrothed | Artisans | 1–2 parents + 1–2 siblings | — | 0–1 |
| 5 | Child/Adolescent | Single/Betrothed | Merchants | 1–2 parents + 1–4 siblings | — | 1–3 |
| 6 | Child/Adolescent | Single/Betrothed | Nobles | 1–2 parents + 2–6 siblings | — | 8–12 |
| 7 | Young Adult | Single | Beggars | 0–4 parents + 0–4 siblings | — | — |
| 8 | Young Adult | Single | Day Labourers | 0–4 parents + 0–5 siblings | — | — |
| 9 | Young Adult | Single | Servants | Master's HH (2–10) | 0–4 parents + 0–5 siblings | — |
| 10 | Young Adult | Single | Artisans | 0–4 parents + 1–5 siblings | — | 0–1 |
| 11 | Young Adult | Single | Merchants | 0–4 parents + 1–7 siblings | — | 1–3 |
| 12 | Young Adult | Single | Nobles | 0–4 parents + 2–9 siblings | — | 8–12 |
| 13 | Young Adult | Married | Beggars | Spouse + 0–1 children | 0–2 parents + 0–3 siblings | — |
| 14 | Young Adult | Married | Day Labourers | Spouse + 0–2 children | 0–2 parents + 0–3 siblings | — |
| 15 | Young Adult | Married | Servants | Spouse + 0–2 children | 0–2 parents + 0–3 siblings | Master's HH separate |
| 16 | Young Adult | Married | Artisans | Spouse + 1–3 children | 0–2 parents + 0–3 siblings | 0–1 |
| 17 | Young Adult | Married | Merchants | Spouse + 1–4 children | 0–2 parents + 0–3 siblings | 1–3 |
| 18 | Young Adult | Married | Nobles | Spouse + 2–6 children | 0–2 parents + 0–3 siblings | 8–12 |
| 19 | Young Adult | Widowed | Beggars | 0–1 children | 0–2 parents + 0–3 siblings | — |
| 20 | Young Adult | Widowed | Day Labourers | 0–2 children | 0–2 parents + 0–3 siblings | — |
| 21 | Young Adult | Widowed | Servants | 0–2 children | 0–2 parents + 0–3 siblings | Master's HH separate |
| 22 | Young Adult | Widowed | Artisans | 1–3 children | 0–2 parents + 0–3 siblings | 0–1 |
| 23 | Young Adult | Widowed | Merchants | 1–4 children | 0–2 parents + 0–3 siblings | 1–3 |
| 24 | Young Adult | Widowed | Nobles | 2–6 children | 0–2 parents + 0–3 siblings | 8–12 |
| 25 | Middle-Aged | Single | Beggars | PC alone | 0–2 parents + 0–3 siblings | — |
| 26 | Middle-Aged | Single | Day Labourers | PC alone | 0–2 parents + 0–3 siblings | — |
| 27 | Middle-Aged | Single | Servants | Master's HH (2–10) | 0–2 parents + 0–3 siblings | — |
| 28 | Middle-Aged | Single | Artisans | PC alone | 0–2 parents + 0–3 siblings | 0–1 |
| 29 | Middle-Aged | Single | Merchants | PC alone | 0–2 parents + 0–3 siblings | 1–3 |
| 30 | Middle-Aged | Single | Nobles | PC alone | 0–2 parents + 0–3 siblings | 8–12 |
| 31 | Middle-Aged | Married | Beggars | Spouse + 0–1 children | 0–2 parents + 0–3 siblings | — |
| 32 | Middle-Aged | Married | Day Labourers | Spouse + 0–2 children | 0–2 parents + 0–3 siblings | — |
| 33 | Middle-Aged | Married | Servants | Spouse + 0–2 children | 0–2 parents + 0–3 siblings | Master's HH separate |
| 34 | Middle-Aged | Married | Artisans | Spouse + 1–3 children | 0–2 parents + 0–3 siblings | 0–1 |
| 35 | Middle-Aged | Married | Merchants | Spouse + 1–4 children | 0–2 parents + 0–3 siblings | 1–3 |
| 36 | Middle-Aged | Married | Nobles | Spouse + 2–6 children | 0–2 parents + 0–3 siblings | 8–12 |
| 37 | Middle-Aged | Widowed | Beggars | 0–1 children | 0–2 parents + 0–3 siblings | — |
| 38 | Middle-Aged | Widowed | Day Labourers | 0–2 children | 0–2 parents + 0–3 siblings | — |
| 39 | Middle-Aged | Widowed | Servants | 0–2 children | 0–2 parents + 0–3 siblings | Master's HH separate |
| 40 | Middle-Aged | Widowed | Artisans | 1–3 children | 0–2 parents + 0–3 siblings | 0–1 |
| 41 | Middle-Aged | Widowed | Merchants | 1–4 children | 0–2 parents + 0–3 siblings | 1–3 |
| 42 | Middle-Aged | Widowed | Nobles | 2–6 children | 0–2 parents + 0–3 siblings | 8–12 |
| 43 | Elderly | Single | Beggars/Day Lab | 1 relative (sibling/niece/nephew) | 0–3 siblings | — |
| 44 | Elderly | Single | Servants | Master's HH (2–10) | 1 relative + 0–3 siblings | — |
| 45 | Elderly | Single | Artisans | 1 relative | 0–3 siblings | 0–1 |
| 46 | Elderly | Single | Merchants | 1 relative | 0–3 siblings | 1–3 |
| 47 | Elderly | Single | Nobles | 1 relative | 0–3 siblings | 8–12 |
| 48 | Elderly | Married | Beggars | Spouse + 0–1 children | 0–3 siblings | — |
| 49 | Elderly | Married | Day Labourers | Spouse + 0–2 children | 0–3 siblings | — |
| 50 | Elderly | Married | Servants | Spouse + 0–2 children | 0–3 siblings | Master's HH separate |
| 51 | Elderly | Married | Artisans | Spouse + 1–3 children | 0–3 siblings | 0–1 |
| 52 | Elderly | Married | Merchants | Spouse + 1–4 children | 0–3 siblings | 1–3 |
| 53 | Elderly | Married | Nobles | Spouse + 2–6 children | 0–3 siblings | 8–12 |
| 54 | Elderly | Widowed | Beggars | 0–1 children + 1 relative | 0–3 siblings | — |
| 55 | Elderly | Widowed | Day Labourers | 0–2 children + 1 relative | 0–3 siblings | — |
| 56 | Elderly | Widowed | Servants | 0–2 children + 1 relative | 0–3 siblings | Master's HH separate |
| 57 | Elderly | Widowed | Artisans | 1–3 children + 1 relative | 0–3 siblings | 0–1 |
| 58 | Elderly | Widowed | Merchants | 1–4 children + 1 relative | 0–3 siblings | 1–3 |
| 59 | Elderly | Widowed | Nobles | 2–6 children + 1 relative | 0–3 siblings | 8–12 |

### Parent Relationship Subtypes

Each parent slot can be one of:
- **Mother** (5/6 chance) or **step-mother** (1/6 chance)
- **Father** (5/6 chance) or **step-father** (1/6 chance)

This creates 9 possible parent combinations for any permutation with parents:
1. Mother only
2. Father only
3. Step-mother only
4. Step-father only
5. Mother + father
6. Mother + step-father
7. Step-mother + father
8. Step-mother + step-father
9. No parents (not possible for children/adolescents)

### Gender Dimension

Player gender (male/female) affects:
- **Spouse relationship label:** Male PC gets "wife"; female PC gets "husband"
- **Head of household:** Married females get `$hoh = 4` (coverture); males with living father get `$hoh = 2`
- **Sibling gender:** Each sibling is randomly male (brother) or female (sister), 50/50

---

## Notable Design Observations

1. **Young adult singles get double family generation** — Both Block 1 and Block 2 fire, producing two rounds of parents and siblings. This can result in unusually large households for single young adults, or NPCs with duplicate relationship types (e.g., two "mothers").

2. **Beggars and nobles cannot have servants (as staff)** — Only artisans, merchants, and nobles get servant NPCs. Beggars and day labourers never do.

3. **Unmarried servants always live in master's household** — Their birth family is moved entirely to extended family.

4. **Married/widowed servants keep their own household** — Master's household is listed separately in `$NPCsMaster`.

5. **Elderly singles/widowed always get a companion** — Block 3 ensures they have at least one relative (sibling, niece, or nephew) in their primary household.

6. **Children/adolescents can never be orphans** — The code guarantees at least one parent for characters age ≤ 15.
