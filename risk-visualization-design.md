# Risk Visualization Design for Final Stats Passage

## Available Data

The game tracks three layers of plague risk that accumulate over the 22-month timeline (Dec 1664 – Dec 1666):

### Layer 1: Parish Baseline Risk
- `$parishRate[$parish]` — array of 22 monthly values, one per timeline entry
- Each value is a "1 in X" chance (e.g., 24 means 1-in-24 ≈ 4.2% monthly risk; 1000 means effectively zero)
- This is the risk every resident of that parish faces just by living there
- Conversion to percentage: `(1 / rate) × 100`

### Layer 2: Role-Based Risk
- Corpsebearers and searchers get a **second** parish-rate infection check each month (effectively doubling their baseline)
- Nurses face a **50%** infection chance per patient assignment
- Warders get an additional parish-rate infection check per assignment
- Only applies during months when plague deaths exist in the parish
- Tracked in `$decisions` with matching `infectPct` values

### Layer 3: Decision-Based Risk
- Church attendance, quarantine-breaking, laundry work, funerals, etc.
- Each recorded in `$decisions` as `{text, money, repDelta, repBefore, infectPct}`
- `infectPct` ranges from 0 (safe choice) to 50 (nursing a plague patient)
- Scattered across different months; some months have multiple decisions, others none

### Timeline Reference
```
Index:  0            1            2          3          4          5
Month:  Dec 1664     Jan 1665     May 1665   Jun 1665   Jul 1665   Aug 1665

Index:  6            7            8            9            10           11
Month:  Sep 1665     Oct 1665     Nov 1665     Dec 1665     Jan 1666     Feb 1666

Index:  12           13           14           15           16           17
Month:  Mar 1666     Apr 1666     May 1666     Jun 1666     Jul 1666     Aug 1666

Index:  18           19           20           21
Month:  Sep 1666     Oct 1666     Nov 1666     Dec 1666
```

Note the gap between Jan 1665 (index 1) and May 1665 (index 2) — Feb–Apr 1665 are skipped in the timeline because plague hadn't arrived yet.

---

## Visualization Options

All visualizations must be implementable in pure HTML/CSS/JavaScript within SugarCube 2 — no external charting libraries. The approach uses `<div>` elements with calculated heights/widths and inline styles set via SugarCube `<<set>>` and `<<print>>`.

---

### Option A: Stacked Bar Chart — Monthly Risk Breakdown

**Concept:** A vertical bar chart with one bar per month. Each bar is divided into colored segments showing where the player's risk came from.

```
Risk %
  50 |
     |          ┌──┐
  40 |          │//│
     |       ┌──┤//│
  30 |       │//│//│
     |       │//│//├──┐
  20 |       │//│//│▓▓│
     |    ┌──┤//│//│▓▓│
  10 |    │▓▓│//│//│▓▓├──┐
     | ┌──┤▓▓│▓▓│▓▓│▓▓│░░│
   0 └─┴──┴──┴──┴──┴──┴──┴──
       May  Jun  Jul  Aug Sep  Oct ...

  ░░ = Parish baseline    (everyone faces this)
  ▓▓ = Role additional    (from your occupation)
  // = Decision additional (from your choices)
```

**What each segment represents:**
- **Parish baseline** (bottom, muted color): `(1 / $parishRate[$parish][i]) × 100` — the risk from simply living in that parish that month
- **Role risk** (middle, medium color): The additional monthly risk from the player's plague-work role, computed as the `infectPct` values from role-related decisions in `$decisions` for that month
- **Decision risk** (top, bright color): The `infectPct` values from non-role decisions (church attendance, quarantine-breaking, laundry, funerals, etc.) for that month

**Strengths:**
- Very intuitive — players immediately see which months were dangerous and *why*
- Shows the epidemic's bell curve shape through bar heights
- Clear visual separation of "things you couldn't control" vs. "risks you chose to take"
- The stacked segments make it obvious how much the player's choices added to their baseline

**Weaknesses:**
- 22 bars may feel crowded, especially on mobile (could abbreviate month labels or show only plague-active months, roughly indices 2–17)
- Percentages above ~10% are relatively rare for parish baseline; most risk action happens in the 0–5% range, so the chart may need careful scaling
- Requires binning decisions into months (need to parse the month prefix from `_d.text`)

**Implementation complexity:** Medium. CSS `flexbox` or `inline-block` divs with percentage heights. Color via CSS classes. Month parsing from `$decisions[i].text`.

---

### Option B: Cumulative Risk Line Chart — Survival Probability Over Time

**Concept:** A line chart showing how the player's cumulative probability of catching plague grew month by month. Multiple lines show different risk layers.

```
Cumulative
 Risk %
  60 |                              _____.........
     |                         ____/ decision risk
  50 |                        /
     |                   ____/
  40 |                  / ___............
     |                 / /   role risk
  30 |                / /
     |            ___/ /
  20 |           /  __/
     |       ___/ _/ ___..............
  10 |      /   _/ _/    parish only
     |   __/ __/ _/
   0 └──/──/──/──────────────────────
       May Jun Jul Aug Sep Oct Nov ...

  — Parish baseline only      (what you faced just by living there)
  — Parish + role              (adding occupational risk)
  — Parish + role + decisions  (your total actual risk)
```

**How cumulative risk is calculated:**
- Start with `survivalProb = 1.0`
- Each month, for each risk source: `survivalProb *= (1 - monthlyRisk)`
- Cumulative risk = `(1 - survivalProb) × 100`
- Three lines, each adding one more layer of risk

**Strengths:**
- Tells a compelling narrative: "By the end, you had a _% chance of having caught plague"
- The gap between lines directly shows how much the player's role and decisions increased their risk
- Naturally handles the fact that some months have zero risk (lines stay flat)
- Matches the existing `stats-cumulative-risk` widget's calculation, extending it with visual breakdown

**Weaknesses:**
- Line charts in pure CSS are harder — requires either SVG `<polyline>` or positioned dots with connecting lines
- Three overlapping lines may be hard to distinguish without good color contrast
- Less immediately intuitive than bars for casual players

**Implementation complexity:** Medium-High. Best done with inline SVG (`<svg>` with `<polyline>` elements), which SugarCube supports. Coordinates calculated via `<<set>>` and injected with `<<print>>`.

---

### Option C: Horizontal Risk Thermometer / Gauge

**Concept:** A single horizontal bar showing the player's total cumulative risk, with colored segments showing the contribution of each risk layer. Simpler than a full chart but very readable.

```
Your Cumulative Plague Risk
┌──────────────────────────────────────────────────────┐
│████████████████████▓▓▓▓▓▓▓▓░░░░░░                   │
│████████████████████▓▓▓▓▓▓▓▓░░░░░░                   │
└──────────────────────────────────────────────────────┘
 0%        20%        40%        60%        80%       100%
 ████ Parish: 22%   ▓▓▓▓ Role: +9%   ░░░░ Decisions: +6%
                                      Total: 37%
```

**Strengths:**
- Extremely simple to implement (just nested `<div>` elements with percentage widths)
- Very readable, even on mobile
- Could be paired with a brief text explanation

**Weaknesses:**
- Loses the temporal dimension — doesn't show *when* risk was highest
- Less informative than Options A or B
- May feel underwhelming as a "visualization"

**Implementation complexity:** Low.

---

### Option D: Combined Approach (Recommended)

**Concept:** Use **Option A (stacked bar chart)** as the primary visualization for month-by-month risk, plus **Option C (thermometer)** as a summary underneath. This gives both the temporal story and the at-a-glance total.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  YOUR PLAGUE RISK OVER TIME                             │
│                                                         │
│  Risk %                                                 │
│   10 |          ┌──┐                                    │
│      |       ┌──┤//│                                    │
│    5 |    ┌──┤▓▓│//├──┐                                 │
│      | ┌──┤▓▓│▓▓│▓▓│░░├──┐                             │
│    0 └─┴──┴──┴──┴──┴──┴──┴──                           │
│        May Jun Jul Aug Sep Oct ...                      │
│                                                         │
│  ░░ Living in your parish                               │
│  ▓▓ Your role as [corpsebearer]                         │
│  // Your other decisions                                │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  CUMULATIVE RISK                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │████████████████████▓▓▓▓▓▓▓▓░░░░░░                 │ │
│  └────────────────────────────────────────────────────┘ │
│   Parish: 22%  +  Role: 9%  +  Decisions: 6%  = 37%    │
│                                                         │
│  For comparison, the average Londoner in your parish     │
│  had a 22% chance of catching plague.                   │
└─────────────────────────────────────────────────────────┘
```

**Strengths:**
- Best of both worlds: temporal detail + summary
- The thermometer provides a quick takeaway even if the bar chart is complex
- The comparison line ("average Londoner had X%") gives context
- Can be built entirely with CSS flexbox + a few `<<for>>` loops

---

## Implementation Notes

### Parsing Decisions by Month

The `$decisions` array contains entries like `{text: "August 1665: Transported plague corpses", infectPct: 4}`. To bin these by month for the bar chart:

```
<<for _di to 0; _di lt $decisions.length; _di++>>
  <<set _d to $decisions[_di]>>
  <<if typeof _d is "object" and _d.infectPct neq null and _d.infectPct gt 0>>
    /* Extract month from decision text (everything before the colon) */
    <<set _monthStr to _d.text.slice(0, _d.text.indexOf(":"))>>
    <<set _mIdx to $timeline.indexOf(_monthStr)>>
    /* Categorize as role vs. decision based on text content */
    ...
  <</if>>
<</for>>
```

### Distinguishing Role vs. Decision Risk

Role-related decisions can be identified by text patterns:
- "Transported plague corpses" → corpsebearer role
- "Examined plague corpses" → searcher role
- "Nursed a plague patient" → nurse role
- "Guarded a plague house" → warder role

Everything else with `infectPct > 0` is a player decision (church attendance, laundry, funerals, etc.).

### CSS Bar Chart Approach

Each bar is a `<div>` with `display: inline-block`, fixed width, and a calculated height. Stacked segments are nested divs with different background colors. The container has a fixed height representing the max scale (e.g., 200px = the maximum risk percentage shown).

### SVG Line Chart Approach (if Option B is chosen)

SugarCube allows raw HTML including `<svg>`. A `<polyline>` element with computed `points` attribute works well:

```html
<svg width="100%" viewBox="0 0 440 200">
  <polyline points="..." fill="none" stroke="#c0392b" stroke-width="2"/>
</svg>
```

### Color Palette (plague-era appropriate)

- Parish baseline: `#8B7355` (parchment brown)
- Role risk: `#B22222` (dark red / firebrick)
- Decision risk: `#DAA520` (goldenrod / amber)
- Background: `#2C2C2C` (matches existing game dark theme)

---

## Recommendation

**Option D (Combined: bar chart + thermometer)** provides the richest experience. However, if implementation time is a concern, **Option A (stacked bar chart alone)** gives 80% of the value with less complexity.

The bar chart naturally tells the story of the plague's arc — low risk in early months, peaking in Aug–Sep 1665, then declining — while layered segments show the player what they could vs. couldn't control.

The key insight for the player should be: *"Your parish determined most of your risk, but your role and decisions could significantly increase it."*
