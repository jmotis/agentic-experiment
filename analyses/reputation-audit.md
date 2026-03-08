# Reputation System Audit

**Game:** Gaming the Great Plague 2026
**Date:** 2026-03-05
**Variable:** `$reputation` (integer, range 0–10)

---

## Table of Contents

1. [Initialization](#1-initialization)
2. [Reputation Increases](#2-reputation-increases)
3. [Reputation Decreases](#3-reputation-decreases)
4. [Reputation-Dependent Text & Branching](#4-reputation-dependent-text--branching)
5. [Reputation in the UI](#5-reputation-in-the-ui)
6. [Indirect Reputation Mechanics](#6-indirect-reputation-mechanics)
7. [Summary Statistics](#7-summary-statistics)

---

## 1. Initialization

| Passage (pid) | Line | Value | Condition |
|---|---|---|---|
| `010-StoryInit.txt` (pid 10) | 11 | `$reputation to 6` | Default for all characters |
| `001-bio.txt` (pid 1) | 20 | `$reputation to 4` | If `$socio is "beggars"` |
| `001-bio.txt` (pid 1) | 20 | `$reputation to 8` | If `$socio is "nobles"` |

Starting reputation: **4** (beggars), **6** (default), or **8** (nobles).

---

## 2. Reputation Increases

### +3 (Large increase)

| Passage (pid) | Line | Trigger |
|---|---|---|
| `040-sick-fam-widget.txt` (pid 40) | 58 | Quarantine with your household (family sick) |
| `040-sick-fam-widget.txt` (pid 40) | 297 | Quarantine with the sick (swap-to-other-hh variant) |

### +2

| Passage (pid) | Line | Trigger |
|---|---|---|
| `108-wedding.txt` (pid 108) | 7 | Be married in your parish church |

### +1

| Passage (pid) | Line | Trigger |
|---|---|---|
| `007-july-1665-helper-widget.txt` (pid 7) | 23 | Refuse the bribe |
| `009-January-1665.txt` (pid 9) | 74 | Increase donations to the poor (day labourers) |
| `009-January-1665.txt` (pid 9) | 95 | Agree with master's warning about alehouses |
| `009-January-1665.txt` (pid 9) | 106 | Celebrate good fortune by increasing donations (artisans) |
| `009-January-1665.txt` (pid 9) | 118 | Celebrate good fortune by increasing donations (merchants) |
| `009-January-1665.txt` (pid 9) | 127 | Throw in and help with the war effort (nobles) |
| `031-September-1666.txt` (pid 31) | 31, 33, 35 | Agree to help neighbor during the Great Fire |
| `044-YouPesthouse.txt` (pid 44) | 21 | Give all money to the poor AND perform public penance |
| `044-YouPesthouse.txt` (pid 44) | 27 | Perform public penance in church |
| `051-beggar-choice-widgets.txt` (pid 51) | 10 | Put trust in the charity of neighbors (female beggars) |
| `093-steward.txt` (pid 93) | 5 | Hold a funeral for your steward |
| `114-Claude-widgets.txt` (pid 114) | 104 | Accept a church office (Churchwarden / Overseer of the Poor) |
| `114-Claude-widgets.txt` (pid 114) | 635 | Apprentice to Trade A |
| `114-Claude-widgets.txt` (pid 114) | 665 | Apprentice to Trade B |
| `114-Claude-widgets.txt` (pid 114) | 694 | Apprentice to Trade C |
| `114-Claude-widgets.txt` (pid 114) | 723 | Apprentice to Trade D |
| `114-Claude-widgets.txt` (pid 114) | 752 | Apprentice to Trade E |

### +N via `storyline-return` widget

| Passage (pid) | Line | Mechanism |
|---|---|---|
| `041-storyline-return-widget.txt` (pid 41) | 29 | Adds `_reputationOffset` (arg 3) to `$reputation`; clamped to 0–10 via `Math.clamp` |

---

## 3. Reputation Decreases

### -3 (Large decrease)

| Passage (pid) | Line | Trigger |
|---|---|---|
| `040-sick-fam-widget.txt` (pid 40) | 59 | Send the sick to the pesthouse |
| `050-sickPC.txt` (pid 50) | 11 | Try to hide your plague sickness |
| `042-Hide.txt` (pid 42) | 5 | Neighbors discover hidden illness → sent to pesthouse / banished (nobles) |

### -2

| Passage (pid) | Line | Trigger |
|---|---|---|
| `007-july-1665-helper-widget.txt` (pid 7) | 22 | Accept the bribe |
| `058-debtor-widgets.txt` (pid 58) | 30 | Master pays off your debts (servants) |
| `064-flight-choice.txt` (pid 64) | 91 | Break servant contract and remain in the city |
| `064-flight-choice.txt` (pid 64) | 96 | Break servant contract and flee the city |

### -1

| Passage (pid) | Line | Trigger |
|---|---|---|
| `009-January-1665.txt` (pid 9) | 75 | Splurge on a trip to the theatre (day labourers) |
| `009-January-1665.txt` (pid 9) | 79 | Accept suspicious generous offer (50% chance, day labourers) |
| `009-January-1665.txt` (pid 9) | 90 | Spend time in streets/alehouses (50% chance, day labourers) |
| `009-January-1665.txt` (pid 9) | 96 | Spend time in streets/alehouses (servants) |
| `009-January-1665.txt` (pid 9) | 108 | Splurge on theatre (artisans) |
| `009-January-1665.txt` (pid 9) | 120 | Go fox hunting (merchants) |
| `009-January-1665.txt` (pid 9) | 128 | Keep yourself out of the fray / ignore war effort (nobles) |
| `015-impressed.txt` (pid 15) | 16 | Publicly shamed after failed impressment |
| `018-August-1665.txt` (pid 18) | 15 | Steal clothing from the dead |
| `031-September-1666.txt` (pid 31) | 31, 33, 35 | Refuse to help neighbor during the Great Fire |
| `037-work-refusal.txt` (pid 37) | 16 | Assigned warder role (reputation too low for better job) |
| `039-FamPesthouse.txt` (pid 39) | 28 | Murder rumor after pesthouse (low rep, `$reputation lte 2`) |
| `051-beggar-choice-widgets.txt` (pid 51) | 9 | Beg on the highways (if not caught) |
| `052-begging-success.txt` (pid 52) | 3 | Successful begging costs reputation |
| `054-beggar-roles.txt` (pid 54) | 7 | Assigned warder role (reputation too low for searcher) |
| `063-Fled.txt` (pid 63) | 8 | Flee the city (general penalty) |
| `064-flight-choice.txt` (pid 64) | 45 | Refuse the plague work job |
| `064-flight-choice.txt` (pid 64) | 121, 134, 135, 152, 167 | Flee the city with household (London-origin nobles/merchants) |
| `080-preventatives-treatments.txt` (pid 80) | 15 | Overseers of the Poor pay for treatment (poor reputation) |
| `087-official-end.txt` (pid 87) | 4 | Nobles at game end |
| `108-wedding.txt` (pid 108) | 10 | Elope at Fleet prison |
| `114-Claude-widgets.txt` (pid 114) | 92 | Removed from church office (reputation ≤ 4) |
| `114-Claude-widgets.txt` (pid 114) | 263 | Caught breaking quarantine |
| `114-Claude-widgets.txt` (pid 114) | 423 | Accept lodgers and charge extra rent (Oct 1666) |
| `115-june-1665-helper-widget.txt` (pid 115) | 34 | Refuse to do assigned plague work |
| `115-june-1665-helper-widget.txt` (pid 115) | 43 | Quit plague work and look for other work |
| `115-june-1665-helper-widget.txt` (pid 115) | 105, 117, 119, 123 | Skip Church of England services (first time only, tracked by `$churchSkipRepPenalty`) |

---

## 4. Reputation-Dependent Text & Branching

### Narrative text changes based on reputation

| Passage (pid) | Line(s) | Threshold | Effect |
|---|---|---|---|
| `006-Sickness.txt` (pid 6) | 39–40 | `$reputation lte 2` | Cannot get writing materials for a will / cannot convince a scrivener |
| `006-Sickness.txt` (pid 6) | 143–144 | `$reputation lte 2` vs `gt 2` | Neighbors stop/continue bringing food and plague remedies |
| `042-Hide.txt` (pid 42) | 5 | Always | Nobles: banished; others: removed to pesthouse |
| `046-escape.txt` (pid 46) | 4–5 | `$reputation gte 3` vs `lt 3` | After escape: neighbor takes pity vs. homeless/caught/gaol |
| `053-good-neighbors.txt` (pid 53) | 2 | `$reputation gte 6` | Better food from neighbors (leftovers from a feast vs. moldy bread) |
| `062-death-widget.txt` (pid 62) | 4 | `$reputation lte 2` | Death: neighbors didn't care, cursed your name |
| `062-death-widget.txt` (pid 62) | 12 | `$reputation gte 3` | Death: neighbors mourned you |
| `062-death-widget.txt` (pid 62) | 23 | `$reputation lte 2` | Catholic purgatory text: "despite your poor reputation" |
| `097-accident.txt` (pid 97) | 7 | `$reputation lte 2` vs `else` | Accident recovery: no one helps vs. family/neighbors care for you |
| `101-fever.txt` (pid 101) | 3 | `$reputation gte 3` vs `else` | Fever: friends care for you vs. no one helps (death variant) |
| `101-fever.txt` (pid 101) | 6 | `$reputation gte 3` vs `else` | Fever: friends care for you vs. no one helps (survival variant) |
| `102-navy-volunteer.txt` (pid 102) | 12 | `$reputation lte 2` | Navy death: fellow sailors didn't care |
| `102-navy-volunteer.txt` (pid 102) | 16 | `$reputation lte 2` | Catholic purgatory text on navy death |
| `039-FamPesthouse.txt` (pid 39) | 27 | `$reputation lte 2` | Murder rumor about your family |

### Gating / branching based on reputation

| Passage (pid) | Line(s) | Threshold | Gate |
|---|---|---|---|
| `054-beggar-roles.txt` (pid 54) | 3 | `$reputation gte 6` (female) | Assigned as "searcher" (better role) vs. "warder" (worse role) |
| `037-work-refusal.txt` (pid 37) | 12 | `$reputation gte 6` (female) | Same role assignment after refusing work |
| `058-debtor-widgets.txt` (pid 58) | 28 | `$reputation gte 6` | Master pays off debts (servants) |
| `064-flight-choice.txt` (pid 64) | 111 | `$reputation lte 5` | London-origin characters can't flee (not enough reputation for anyone to take them in) |
| `064-flight-choice.txt` (pid 64) | 121, 131 | `$reputation gt 5` | Flee option available for London-origin nobles/merchants |
| `092-servant-rep-widgets.txt` (pid 92) | 4 | `$reputation lte 2` | Servant dismissed (50% chance each month) |
| `092-servant-rep-widgets.txt` (pid 92) | 15 | `$reputation gte 10` | Servant promoted to apprentice |
| `114-Claude-widgets.txt` (pid 114) | 89 | `$reputation lte 4` | Removed from church office |
| `114-Claude-widgets.txt` (pid 114) | 96 | `$reputation gte 8` | Eligible for church office |
| `114-Claude-widgets.txt` (pid 114) | 194 | `$reputation gte 6` | Able to smuggle healthy children out of quarantined house |
| `114-Claude-widgets.txt` (pid 114) | 631 | `$reputation gte 2` | Eligible for Trade A apprenticeship |
| `114-Claude-widgets.txt` (pid 114) | 661 | `$reputation gte 3` | Eligible for Trade B apprenticeship |
| `114-Claude-widgets.txt` (pid 114) | 690 | `$reputation gte 4` | Eligible for Trade C apprenticeship |
| `114-Claude-widgets.txt` (pid 114) | 719 | `$reputation gte 5` | Eligible for Trade D apprenticeship |
| `114-Claude-widgets.txt` (pid 114) | 748 | `$reputation gte 6` | Eligible for Trade E apprenticeship |

---

## 5. Reputation in the UI

### Sidebar / Story Menu (`072-storyMenu.txt`, pid 72)

Displayed permanently in the sidebar with color-coded styling:

| Threshold | Label | CSS class |
|---|---|---|
| `$reputation gte 9` | "a worthy soul" | `rep-best` |
| `$reputation gte 6 and lte 8` | "of good credit and quality" | `rep-good` |
| `$reputation gte 3 and lte 5` | "bad credit is better than none" | `rep-poor` |
| `$reputation lte 2` | "a worthless and base rogue" | `rep-worst` |

### Story Caption (`056-StoryCaption.txt`, pid 56)

| Threshold | Display |
|---|---|
| `$reputation gte 3` | "Your reputation is **good**." (white) |
| `$reputation lt 3` | "Your reputation is **bad**." (red) |

### Stats Page (`048-stats.txt`, pid 48)

Shows numeric reputation value plus descriptive label (same four tiers as sidebar).

---

## 6. Indirect Reputation Mechanics

### Decision tracking (`$decisions` array)

Most decisions record `repBefore: $reputation` and `repDelta` in the `$decisions` array for end-game review. These are **read-only** snapshots — they do not modify reputation, but they document the player's reputation at each decision point. Found in approximately 60+ locations across the codebase.

### `storyline-return` widget (pid 41)

This widget accepts an optional 4th argument for reputation offset. The reputation change uses `Math.clamp($reputation + _reputationOffset, 0, 10)`, consistent with all other reputation changes in the codebase.

### Church attendance (`115-june-1665-helper-widget.txt`, pid 115)

The first time a Church of England member skips services, they lose 1 reputation. Subsequent skips in the same period do **not** cost additional reputation, tracked by `$churchSkipRepPenalty`.

---

## 7. Summary Statistics

| Metric | Value |
|---|---|
| Starting reputation (default) | 6 |
| Starting reputation range | 4–8 |
| Minimum possible | 0 |
| Maximum possible | 10 |
| Largest single increase | +3 (quarantine with household) |
| Largest single decrease | -3 (hide sickness / send sick to pesthouse) |
| Total unique increase events | ~20 |
| Total unique decrease events | ~30 |
| Reputation-conditional text passages | ~15 |
| Reputation-gated mechanics | ~15 |
| UI display locations | 3 (sidebar, caption, stats page) |
| Key thresholds | ≤2 (punitive), ≥3 (baseline safety), ≥6 (privileged), ≥8 (office-eligible), 10 (promotion) |

### Reputation threshold tiers

| Range | Gameplay effect |
|---|---|
| **0–2** | Punitive: dismissed from service, murder rumors, no help during sickness/accidents, cannot write will, cannot flee London, worst death text |
| **3–5** | Baseline: neighbors provide basic help, can flee if non-London origin, neutral death text |
| **6–8** | Privileged: better plague work roles, master pays debts, better neighbor charity, can smuggle children, can flee London, higher apprenticeship tiers |
| **9–10** | Elite: "worthy soul" label, eligible for church office (at 8+), servant-to-apprentice promotion (at 10) |
