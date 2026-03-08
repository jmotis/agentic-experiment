# Repeated Player-Facing Text Analysis

This document catalogs all text a player could see more than once during a playthrough of *Gaming the Great Plague*, organized by frequency.

---

## 1. Text Shown on EVERY Passage (Seen 20–50+ Times Per Playthrough)

These elements appear in the sidebar or header on every single passage the player visits.

### Sidebar — Always Visible

| Element | Source | Content | Notes |
|---|---|---|---|
| Game title | pid 70 (gameTitle) | "Gaming the Great Plague" | Static |
| RRCHNM logo | pid 69 (storyLogo) | RRCHNM logo image | Static |
| Author link | pid 71 (storyAuthor) | "RRCHNM" link | Static |
| Nav tooltips | pid 67 (StoryInterface) | "Restart", "Saves", "Settings" | Static tooltip text |
| Reputation (simple) | pid 56 (StoryCaption) | "good" (white) or "bad" (red) | Dynamic, threshold at `$reputation >= 3` |
| Reputation (detailed) | pid 72 (storyMenu) | Four-tier label: "a worthy soul" / "of good credit and quality" / "bad credit is better than none" / "a worthless and base rogue" | Dynamic |
| Income | pid 56 (StoryCaption) | Monthly income with currency conversion | Dynamic |
| Monthly spending | pid 56 (StoryCaption) | Monthly expenses with currency conversion | Dynamic |
| Total wealth | pid 56 (StoryCaption) | Total savings with currency conversion | Dynamic |
| Disposable income | pid 72 (storyMenu) | Net income with currency conversion | Dynamic |
| Menu links | pid 72 (storyMenu) | "Apothecary", "Inventory", "Household Status" | Static link text |
| Inventory link | pid 56 (StoryCaption) | "Inventory" | Duplicates the storyMenu link |
| Flight link | pid 72 (storyMenu) | "Flight" | Conditional, mid-game only |

**Notable duplication:** Reputation is displayed twice simultaneously in the sidebar — a simple good/bad indicator AND a four-tier descriptive label. The "Inventory" link also appears twice.

### Passage Header

| Element | Source | Content | Notes |
|---|---|---|---|
| Month + location heading | pid 11 (PassageHeader) | `<h2>` with passage name and `$location` | Shown on every storyline passage |

---

## 2. Text from Widgets Called Monthly (Seen Up to ~20 Times)

These widgets are invoked from most or all storyline passages, producing the same or structurally identical text each month.

### `<<fumigant>>` — Up to 21 times

Called from 21 monthly passages. Players who own a fumigant see one of four fixed sentences every single month:

- "You fall asleep every night to the lingering perfume of the **rosemary** you burnt to cleanse your home of miasmas."
- "You fall asleep every night to the lingering perfume of the **frankincense** you burnt to cleanse your home of miasmas."
- "You fall asleep every night to the lingering odor of the **brimstone** you burnt to cleanse your home of miasmas."
- "You fall asleep every night to the lingering odor of the **saltpeter** you burnt to cleanse your home of miasmas."

No variation within a given fumigant type across months.

### `<<corpse-work>>` — Up to 19 times

Called from 19 monthly passages for players assigned plague work. Structurally identical text each month:

- **Corpsebearers:** "You and your fellow corpsebearer(s) transported X corpses this month and you were paid Xd..."
- **Searchers:** Same structure with "examined" instead of "transported"
- **Nurses/Warders:** Same choice each month: "Do you nurse them?" / "Do you take the assignment?" with identical outcome text

### `<<church-services>>` — Up to ~18 times

Called every month via `<<random-events>>`. Non-Church of England players see the identical choice menu monthly:

> "As a [religion], do you want to attend services at your parish Church of England this month?"

Three identical options and outcome texts every time.

### `<<NPC-death>>` — Variable (potentially every month)

Called every month via `<<random-events>>`. Uses the same template each time:

> "Your [relationship] [name] has died of [cause]."

Only the names and causes vary; the sentence structure is identical across all occurrences.

### `<<funeral-choice>>` — Variable (follows every NPC death)

Called from the NPC-death widget and Reconnecting passage. Same binary choice each time:

> "Do you give [dead NPCs] a quick burial | a proper funeral."

### `<<debtor>>` system — Variable (monthly while in debt)

Players in debt see escalating but fixed text from the creditor system:

- "To your relief, your creditors agree to wait a little longer."
- "Your creditors are growing impatient."
- "Your creditors are furious."

---

## 3. Quarantine Loop Text (Seen 4–10+ Times Per Quarantine Episode)

The quarantine system creates a loop where players revisit the same passages multiple times.

### Quarantine Continues (pid 60) — No Hard Cap on Iterations

Each visit increments `$quarantine` by 1 and shows week-specific flavor text:

- **Week 2:** "The first week was agony. The second is no better."
- **Week 3:** "As you enter the third week of quarantine, even the smallest glimmer of hope is a welcome relief."
- **Week 4:** "After nearly a month in quarantine, you begin to believe you might survive this."
- **Week 5:** "You have now been in quarantine for over a month, and there is no sign that the plague's spread is slowing."
- **Week 6+:** "You have been in quarantine so long, you've lost track of time. The days are interminable."

Players in extended quarantine (week 6+) see the "lost track of time" text repeatedly with no further variation.

### Text repeated every quarantine week:

| Text | Frequency |
|---|---|
| "You tend to the sick and suffering." (link text) | Every week |
| "You wonder what has happened while you were away from the world." (link text) | Every week (appears 4× in pid 60) |
| Treatment choice menu via `<<hh-treatments>>` | Every week |
| Death/recovery reports: "Despite your care, your [relationship] [name] has died" / "The treatments seem to be helping, and your [relationship] [name] has started to recover." | Every week with sick NPCs |

### `<<hh-treatments>>` — Every quarantine week

Same treatment menu each week: purgative drink, plaster, tincture, treacle, suppository, anti-diarrheal. Identical explanation text for each option.

### Multiple quarantine episodes possible

A player can enter quarantine multiple times in a single playthrough. If household members get reinfected in a later month, the `sickFam` widget routes back to Quarantine Week 1 again.

---

## 4. Moderately Repeated Text (Seen 3–8 Times)

### `<<beggar-choice>>` — Up to 4 times (early game)

Called from 4 early-game passages. Identical paragraph each time:

> "The alms you receive from your parish are just enough to pay for your housing and keep you from starvation, but you're always hungry..."

Followed by the same choice menu.

### `<<fled-opening>>` — Up to 4 times

Called from 4 fled passages. Same class-dependent sentence each time, e.g.:

> "You lose money every day that you're away from the city... luckily it's a price that you're able to pay."

### `<<preventative>>` — Up to 3 times

Called from 3 passages. Same three choices: pray at church, avoid certain foods, visit apothecary. Outcome text identical each time.

### Fled-city timeline narration — Across 4 passages

The largest block of duplicated prose. Three substantial paragraphs describing declining death tolls are copied across different "how long do you stay away" branches:

> "When the death tolls top 7,000 a week in August and September, you're sure you made the right call."

> "By the beginning of October, death tolls have fallen to half that but there are still a horrifying number of people dying every week."

> "You anxiously watch the fall in the number of deaths each week, thanking God when only a thousand people a week are dying at the beginning of November."

**Files containing this text:**
- pid 84 (Summer 1665) — first two blocks
- pid 85 (Winter 1665) — all three blocks
- pid 86 (court-return) — all three blocks
- pid 87 (official-end) — all three blocks

A player who stays away longer sees the earlier months' text again when it's repeated in the later passages.

### "As a good Christian" moral dilemma — 2 widgets

Both the `<<sickFam>>` and `<<sickOtherHH>>` widgets (pid 40) contain the identical text:

> "As a good Christian, it is your duty to look after the poor, sick, and needy. But as a good Christian, you also know it is a sin to needlessly risk your life."

A player whose own family and master's family both get sick would see this text twice.

---

## 5. Identical Text Duplicated Across Multiple Source Files

These are cases where the same (or near-identical) text exists in multiple passage files. Even if a player only sees one version per playthrough, this represents duplicated content.

### Death opening line — 6 files

> "Send not to know for whom the church bells toll. They toll for you."

- pid 5 (death), pid 97 (accident), pid 99 (elderly), pid 100 (runover), pid 101 (fever), pid 110 (pregnancy widgets)

A player can only die once, so they see this once. But it's maintained in 6 separate locations.

### End-of-game stats link — 5 files

> "How typical was your experience of the Great Plague of London? Let's find out!"

- pid 15 (impressed), pid 47 (go quietly), pid 49 (transported), pid 58 (debtor widgets), pid 62 (death widget)

### Non-plague death consolation — 5 files

> "At least you didn't die of plague."

- pid 99 (elderly), pid 100 (runover), pid 101 (fever), pid 110 (pregnancy widgets), pid 111 (naval-experience)

### Red cross / quarantine announcement — 2 files

> "Your neighbors shut up the entrances to your house and paint a red cross with the words *Lord Have Mercy* on the front door."

- pid 6 (Sickness), pid 59 (Quarantine, Week 1)

Mutually exclusive paths, so only seen once per playthrough.

### Plague recovery text — 2 files

> "After a few days you feel your fever break and your buboes begin to go down. Thanks be to God, you have survived the plague."

- pid 6 (Sickness), pid 44 (YouPesthouse)

### Death reputation and afterlife text — 2 files

Four near-identical text blocks between plague death (pid 62) and naval death (pid 111), differing only in "neighbors" vs. "fellow sailors":

- **Poor rep:** "You died with such a poor reputation that most of your [neighbors/fellow sailors] didn't care."
- **Good rep:** "You died with a good enough reputation that your [neighbors/fellow sailors] say prayers for your soul."
- **Catholic:** "As a God-fearing Catholic, you know you are destined to spend time in purgatory..."
- **Protestant:** "As a good Protestant, you know that Christ the Redeemer has died for you..."

### Great Fire description — 2 files

Two full paragraphs about the Great Fire of London are copied into the runover widget (pid 100) so it can display them before the cart accident during September 1666. The same text originates in pid 31 (September 1666).

### "First case of plague" announcement — 2 files

> "Worse, the first case of plague has appeared in your parish."

- pid 16 (May 1665), pid 115 (june-1665-helper-widget)

### Promise to reunite — 2 files

> "You promise to meet them should the situation grow worse."

- pid 65 (Household-Fled), pid 89 (Stay)

### NPC death/recovery reporting templates — 2 files

The same reporting structure for servant and family deaths/recoveries appears in both pid 6 (Sickness) and pid 40 (sick-fam-widget).

---

## 6. Repeated Images

| Image | Files | A player could see it twice? |
|---|---|---|
| Corpse bearer engraving (Wellcome L0016624) | pid 7, pid 54, pid 68 | Yes — if assigned corpse work AND begging |
| Plague cart engraving (BM 1875) | pid 7, pid 54, pid 68 | Yes — same conditions |
| Pest house illustration (Wellcome V0013229) | pid 39, pid 44 | Yes — if family sent to pesthouse AND player sent there later |

---

## 7. Random Event Text (Seen 0–3 Times, Probabilistic)

These fire with a random chance each month and show the same text each time:

| Widget | Chance | Text |
|---|---|---|
| `<<fever>>` | 1-in-20/month | "Alack! You have come down with a mysterious fever." |
| `<<accident>>` | 1-in-20/month (day labourers/servants) | "You have suffered an accident while [out on a job/running errands]..." |
| `<<runover>>` | 1-in-30/month (beggars) | Run-over-by-cart scenario with same framing |
| `<<orphan-check>>` | When guardians die | "Because you have been orphaned, [placement text]." Same template if it fires multiple times |
| `<<child-service-check>>` | Monthly while in debt | "Your family is struggling..." Same text each month |

---

## Summary: Highest-Impact Repeated Text

Ranked by how much identical text a player encounters across a playthrough:

1. **Fumigant description** — Same sentence every single month (up to ~20 times)
2. **Quarantine loop** — Same link text, treatment menus, and death/recovery templates every week (4–10+ times per episode, potentially multiple episodes)
3. **Corpse-work reports** — Same sentence structure every month for plague workers (~19 times)
4. **Church services choice** — Same menu for non-Anglican players every month (~18 times)
5. **Sidebar financial/reputation info** — Same format every passage (20–50+ times)
6. **Funeral choice** — Same binary choice after every NPC death (variable, potentially 5–10 times)
7. **Fled-city timeline** — 3 narrative paragraphs duplicated across 4 fled passages
8. **Debtor escalation** — Same creditor text monthly while in debt
9. **Beggar choice** — Same paragraph 4 times in early game
10. **Week 6+ quarantine** — "You have been in quarantine so long, you've lost track of time" with no further variation
