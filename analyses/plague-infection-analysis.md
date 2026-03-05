# Plague Infection Analysis: Increased Risk Over Baseline

## How Baseline Plague Works

The **baseline** plague infection check is the `<<infection-program>>` widget (pid 76), triggered automatically by `PassageHeader` (pid 11) every time a `storyline`-tagged passage loads. It uses historical parish data:

```
_rate = $parishRate[$parish][$monthIndex]
if random(1, _rate) == 1 → $plagueInfection = 1
```

Lower `_rate` = higher risk (e.g., `_rate` of 10 = 10% chance, `_rate` of 1000 = 0.1%).

**Fumigant protection:** If the player owns any fumigant, there is a **50% chance the entire infection-program is skipped** that month (`random(1,2) eq 1` gate in PassageHeader).

**Post-recovery immunity:** The player cannot be re-infected after recovering (guarded by `hasVisited("Sickness")` in infection-program and `$playerPlagueStatus is "recovered"` in random-events).

---

## What Happens When the Player Catches Plague

When `$plagueInfection` is set to 1, one of three things happens depending on context:

- **sickPC on next passage load**: The `<<random-events>>` widget runs at the top of each storyline passage. If `$plagueInfection is 1`, it fires `<<sickPC>>`, which shows the player a bubo appearing and gives them a choice (warn people → Sickness passage, or hide it → reputation destroyed). This replaces the normal monthly narrative entirely.

- **Player sees passage text first, then sickPC on next load**: If `$plagueInfection` is set during the current passage (via `<<replace>>` or `<<corpse-work>>`), the player sees the current passage content first. The sickPC widget fires when they navigate to the next monthly passage.

- **Routed directly to Sickness (bypasses sickPC)**: During quarantine, the passage explicitly checks `$plagueInfection` and routes the player to the Sickness passage via a link, without going through sickPC.

---

## All Locations with Increased Plague Chance Over Baseline

### A. Recurring / Systemic Increased Risks

#### 1. Church Services (church-services widget, pid 115 — runs every month)
- **Who:** Church of England members (automatic, no choice); non-CoE members who choose to attend
- **Risk:** `random(1,50)` = **2%** extra
- **Skipped in:** April 1666 (Easter has its own code)
- **What happens:** Set via in-page `<<replace>>` or silently. Player sees the monthly passage text. **sickPC fires on next passage load.**

#### 2. Corpse-Work (corpse-work widget, pid 114 — runs every month for plague workers)
- **Who:** Players with role = corpsebearer, searcher, nurse, or warder
- **Risk (corpsebearer/searcher/nurse):** `random(1,100) <= _cwPlague` = **_cwPlague%** (where `_cwPlague` = number of plague deaths in parish that month). At peak plague (e.g., 30+ plague deaths/month in some parishes), this can be 30%+ extra risk.
- **Risk (warder):** `random(1,100) <= min(_cwPlague * 2, 100)` = **double** the plague corpse rate, capped at 100%. Warders guard quarantined houses and face the highest occupational risk.
- **What happens:** The corpse-work text (earnings, plague death count) displays as part of the monthly passage. Player sees passage text first. **sickPC fires on next passage load.**

#### 3. Quarantine Spread to Player (pids 59/60 — each week of quarantine)
- **Who:** Player quarantining with infected household members
- **Risk without fumigants:** `random(1,2) == 1` = **50%** per week
- **Risk with fumigants:** `random(1,4) == 1` = **25%** per week
- **What happens:** Player sees the quarantine passage text (who died, who recovered, new infections). Then **routed directly to the Sickness passage** via link (bypasses sickPC).

---

### B. Monthly Storyline Decision-Based Risks

Each of these is an **additional** plague roll on top of the baseline infection-program that already ran when the passage loaded.

#### 4. May 1665 — "Decide to investigate" plague rumors (pid 16)
- **Risk:** `random(1,100)` = **1%**
- **What happens:** Set via `<<replace>>`. Player sees investigation text. **sickPC fires on next passage load.**

#### 5. June 1665 — "Seek out war news" (pid 17)
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set via `<<replace>>`. Player sees war gossip text. **sickPC fires on next passage load.**

#### 6. June 1665 — Plague workers in western suburbs accept duty (june-1665-helper, pid 115)
- **Who:** Beggars/day labourers with plague worker roles, located in western suburbs
- **Risk with fumigants:** `random(1,6) == 1` = **~17%**
- **Risk without fumigants:** `random(1,3) == 1` = **~33%**
- **What happens:** Set via link navigation to July 1665. **sickPC fires on next passage load.**

#### 7. July 1665 — "Seek out war news" (pid 38)
- **Who (adult males):** Two stacked rolls: `random(1,30)` (~3.3%) PLUS `random(1, _rate)` (parish rate). Combined chance is roughly 3.3% + parish rate.
- **Who (others):** Extra parish rate roll only: `random(1, _rate)` (same as baseline but an additional roll, effectively doubling the parish rate for that month)
- **What happens:** Set via `<<replace>>`. Player sees gossip text. **sickPC fires on next passage load.**

#### 8. August 1665 — Steal clothing from the dead (pid 18)
- **Who:** Plague workers only (corpsebearer/searcher/nurse/warder), textGroup 1
- **Risk:** `random(0,1)` = **50%** (the value can be 0 or 1; only 1 triggers sickPC)
- **What happens:** Set via `<<link ... `passage()`>>` which reloads the current passage. **sickPC fires on passage reload** (immediate — the passage reloads and `<<random-events>>` catches it at the top).

#### 9. August 1665 — Break curfew to seek news (pid 18)
- **Who:** Non-plague-workers
- **Risk:** `random(1,8)` = **12.5%**
- **What happens:** Set via `<<replace>>`. Player sees curfew-breaking text. **sickPC fires on next passage load.**

#### 10. September 1665 — "Go out to conduct business" (pid 19)
- **Who:** Non-plague-workers
- **Risk:** Extra parish rate roll: `random(1, _rate)` (effectively doubles the baseline for that month)
- **What happens:** Set via `<<replace>>`. Player sees text about plague funerals appearing. If they then also attend plague funerals (see below), that's yet another risk on top.

#### 11. September 1665 — "Attend plague funerals" (pid 19)
- **Who:** Non-plague-workers who chose to go out (stacks with #10 above)
- **Risk:** `random(1,5)` = **20%**
- **What happens:** Set via `<<replace>>`. Player sees funeral attendance text. **sickPC fires on next passage load.**

#### 12. October 1665 — Report sick / Ignore sick on streets (pid 20)
- **Who:** All non-plague-workers (both choices carry the same risk)
- **Risk:** Extra parish rate roll: `random(1, _rate)` (effectively doubles baseline)
- **What happens:** Set via `<<replace>>`. Player sees October narrative. **sickPC fires on next passage load.**

#### 13. November 1665 — "Visit returning neighbors" (pid 21)
- **Risk:** `random(1,30)` = **~3.3%**
- **What happens:** Set via `<<replace>>`. Player sees reunion text. **sickPC fires on next passage load.**

#### 14. December 1665 — "Celebrate Christmas with a feast" (pid 22)
- **Risk:** Runs `<<infection-program>>` again (extra baseline roll) PLUS `random(1,50)` = **2%** on top of the extra baseline
- **What happens:** Set via `<<replace>>`. Player sees feast text. **sickPC fires on next passage load.**

#### 15. January 1666 — "Offer porter services" / "Help returning neighbors" (pid 23)
- **Who:** Beggars/day labourers (porter), or servants/artisans/merchants (help neighbors). Nobles skip this choice.
- **Risk:** `random(1,100)` = **1%**
- **What happens:** Set via `<<replace>>`. Player sees reunion text. **sickPC fires on next passage load.**

#### 16. February 1666 — "Hold a pre-Lent feast" (pid 24)
- **Risk:** Runs `<<infection-program>>` again (extra baseline roll) PLUS `random(1,50)` = **2%** on top
- **What happens:** Set via `<<replace>>`. Player sees feast text. **sickPC fires on next passage load.**

#### 17. March 1666 — "Light a candle for the Queen of Portugal" (pid 25)
- **Who:** Catholic characters only
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set via `<<replace>>`. Player sees church text. **sickPC fires on next passage load.**

#### 18. April 1666 — Attend Easter services (pid 26)
- **Who:** All players who attend (take communion or skip communion). Skipping church entirely avoids this risk.
- **Risk:** `random(1,100)` = **1%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>` creates a link. **sickPC fires on next passage load.**

#### 19. May 1666 — Celebrate King's birthday (pid 27)
- **Who:** Church of England members (automatic); non-CoE who choose to celebrate
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set inline or via `<<replace>>`. **sickPC fires on next passage load.**

#### 20. June 1666 — "Listen to gossip" (pid 28)
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set via `<<replace>>`. Player sees war gossip. **sickPC fires on next passage load.**

---

### C. Random Event Risks (Non-Monthly)

These fire from the `<<random-events>>` widget when certain conditions are met.

#### 21. NPC Funeral — "A proper funeral" (funeral-choice widget, pid 13)
- **When:** An NPC dies of non-plague causes; player chooses a proper funeral over a quick burial
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>` provides a link. **sickPC fires on next passage load.**

#### 22. Wedding — Parish church (wedding widget, pid 108)
- **When:** Player gets married in their parish church
- **Risk:** `random(1,15)` = **~6.7%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>`. **sickPC fires on next passage load.**

#### 23. Wedding — Private license (wedding widget, pid 108)
- **When:** Player pays for a private wedding license
- **Risk:** `random(1,30)` = **~3.3%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>`. **sickPC fires on next passage load.**

#### 24. Wedding — Elope at Fleet prison (wedding widget, pid 108)
- **When:** Player elopes at Fleet prison
- **Risk:** `random(1,30)` = **~3.3%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>`. **sickPC fires on next passage load.**

#### 25. Birth Celebration — "Host a celebration" (birth widget, pid 111)
- **When:** Player gives birth and chooses to host a celebration (vs. quick baptism)
- **Risk:** `random(1,50)` = **2%**
- **What happens:** Set via `<<replace>>`, then `<<storyline-return>>`. **sickPC fires on next passage load.**

#### 26. Preventative — "Go to church and pray often" (preventative widget, pid 80)
- **When:** Player is offered preventative measures against plague and chooses this option
- **Risk:** `random(1,10)` = **10%**
- **What happens:** Set via `<<replace>>` (in-page). **sickPC fires on next passage load.**

#### 27. Good Neighbors — Receive an old dress (pid 53)
- **Who:** Beggar characters with reputation < 6, when the random charity check gives them a dress instead of bread
- **Risk:** `random(1,100)` = **1%**
- **What happens:** Set inline, then `<<storyline-return>>`. **sickPC fires on next passage load.**

#### 28. Beggar Choice — "Take in extra laundry" (beggar-choice widget, pid 51)
- **Who:** Female beggar characters
- **Risk:** 10% (via `<<storyline-return>>` 5th argument: `_plagueRisk = 10`)
- **What happens:** Risk is checked when the player clicks the storyline-return link to advance. **sickPC fires on next passage load.**

#### 29. Beggar Choice — "Wash church linens" (beggar-choice widget, pid 51)
- **Who:** Beggar characters who are Church of England members
- **Risk:** 5% (via `<<storyline-return>>` 5th argument: `_plagueRisk = 5`)
- **What happens:** Risk is checked when the player clicks the storyline-return link to advance. **sickPC fires on next passage load.**

---

### D. Special Circumstances

#### 30. Debtor's Prison (prison widget, pid 58)
- **When:** Player falls too far into debt and has reputation < 6
- **Risk:** `random(0,1)` = **50%**
- **What happens:** **sickPC fires immediately within the same passage** (the widget checks `$plagueInfection eq 1` right after setting it and calls `<<sickPC>>` inline). This is **unique** — it's the only place outside of `<<random-events>>` that fires sickPC immediately.

#### 31. FamPesthouse — Sending sick family to the pesthouse (pid 39)
- **When:** Player chooses to send infected family to the pesthouse instead of quarantining
- **Risk:** `random(1,2) == 1` = **50%** (the player catches plague from contact before sending them away)
- **What happens:** Player sees pesthouse resolution text (who died, who survived). Then `<<storyline-return>>` provides a link. **sickPC fires on next passage load.**

#### 32. December 1664 — "Celebrate Christmas with a feast" (december-1664-helper, pid 12)
- **Risk:** Runs `<<infection-program>>` (extra baseline roll). At this point `_rate` is typically 1000, so effectively ~0.1%.
- **Note:** No additional flat risk, just an extra baseline roll. Risk is negligible in December 1664 since plague hasn't arrived yet.
- **What happens:** If infected (extremely unlikely), **sickPC fires on next passage load.**

#### 33. Flight Attempt While Infected (flight-choice widget, pid 64)
- **When:** Player tries to flee the city but `$plagueInfection` is already set to 1
- **Risk:** No new roll — the flight is blocked and **sickPC fires immediately** within the passage.
- **What happens:** The widget detects the existing infection, blocks flight, and calls `<<sickPC>>` inline.

---

## Summary Table

| # | Location | Risk Over Baseline | Trigger |
|---|----------|-------------------|---------|
| 1 | Church services (monthly) | 2% | sickPC on next load |
| 2 | Corpse-work: bearer/searcher/nurse | _cwPlague% (variable, up to ~50%+) | Text first, sickPC next load |
| 3 | Corpse-work: warder | min(_cwPlague*2, 100)% | Text first, sickPC next load |
| 4 | Quarantine spread (per week) | 50% (no fumigants) / 25% (fumigants) | Text first, routed to Sickness directly |
| 5 | May 1665: Investigate rumors | 1% | sickPC on next load |
| 6 | Jun 1665: Seek war news | 2% | sickPC on next load |
| 7 | Jun 1665: Plague worker duty (W. suburbs) | 33% (no fumigants) / 17% (fumigants) | sickPC on next load |
| 8 | Jul 1665: Seek war news (adult male) | ~3.3% + parish rate | sickPC on next load |
| 9 | Jul 1665: Seek war news (others) | Extra parish rate roll | sickPC on next load |
| 10 | Aug 1665: Steal dead's clothing | 50% | sickPC on passage reload (immediate) |
| 11 | Aug 1665: Break curfew | 12.5% | sickPC on next load |
| 12 | Sep 1665: Go out for business | Extra parish rate roll | sickPC on next load |
| 13 | Sep 1665: Attend plague funerals | 20% (stacks with #12) | sickPC on next load |
| 14 | Oct 1665: Report/ignore sick (both) | Extra parish rate roll | sickPC on next load |
| 15 | Nov 1665: Visit returning neighbors | 3.3% | sickPC on next load |
| 16 | Dec 1665: Christmas feast | Extra baseline + 2% | sickPC on next load |
| 17 | Jan 1666: Porter/help neighbors | 1% | sickPC on next load |
| 18 | Feb 1666: Pre-Lent feast | Extra baseline + 2% | sickPC on next load |
| 19 | Mar 1666: Light candle (Catholic) | 2% | sickPC on next load |
| 20 | Apr 1666: Attend Easter | 1% | sickPC on next load |
| 21 | May 1666: Celebrate King's birthday | 2% | sickPC on next load |
| 22 | Jun 1666: Listen to gossip | 2% | sickPC on next load |
| 23 | NPC funeral: Proper funeral | 2% | sickPC on next load |
| 24 | Wedding: Parish church | 6.7% | sickPC on next load |
| 25 | Wedding: Private license | 3.3% | sickPC on next load |
| 26 | Wedding: Fleet prison elopement | 3.3% | sickPC on next load |
| 27 | Birth: Host celebration | 2% | sickPC on next load |
| 28 | Preventative: Pray at church | 10% | sickPC on next load |
| 29 | Good neighbors: Old dress (beggar) | 1% | sickPC on next load |
| 30 | Beggar: Take in laundry (female) | 10% | sickPC on next load |
| 31 | Beggar: Wash church linens (CoE) | 5% | sickPC on next load |
| 32 | Debtor's prison | 50% | **sickPC fires immediately** |
| 33 | FamPesthouse: Send sick away | 50% | sickPC on next load |
| 34 | Dec 1664: Christmas feast | Extra baseline (~0.1%) | sickPC on next load |
| 35 | Flight attempt while infected | No new roll (blocks flight) | **sickPC fires immediately** |
