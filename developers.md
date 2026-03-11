# Developer Guide

Coding instructions for human developers working on **Gaming the Great Plague**.

## Global Variable Initialization

**All global (`$`-prefixed) variables must be initialized in the `StoryInit` passage (pid 10).** This ensures no global variable is ever `undefined` when checked during gameplay. Even variables that are overwritten during character generation or later in the game need a default value in `StoryInit`.

When adding a new global variable:
1. Add a `<<set>>` line in `StoryInit` with an appropriate default (e.g., `0` for integers, `""` for strings, `false` for booleans, `[]` for arrays).
2. Update `variables.md` with the variable's documentation.

**Exceptions** (do not duplicate in `StoryInit`):
- `$parishRate`, `$corpseBuried`, `$corpsePlague` — initialized by the `<<initDeathData>>` widget, which is called from `StoryInit`.
- `$textGroup` — intentionally managed with `<<if ndef $textGroup>>` / `<<unset $textGroup>>` to support multi-step passage sequences.
- `$args` — a SugarCube built-in for widget arguments, not a game variable.

## SugarCube 2 Link Syntax

### Wiki-style links do not process macros

SugarCube's wiki-style link markup (`[[...]]`) treats everything between the brackets as literal text. Macros like `<<if>>`, `<<print>>`, and widgets (e.g., `<<defPlague>>`) will **not** execute inside wiki-style links — they render as raw text in the player's browser.

**Wrong — macros are literal text inside `[[ ]]`:**
```
[[careful to heed <<if $masterGender is "female">>her<<else>>his<</if>> warning->May 1665]]
```

### Fix: use `<<link>>` with backtick expressions

Replace wiki-style links with the `<<link>>` macro. Use a backtick expression (`` ` ``) as the first argument to build dynamic display text from variables.

**Correct — backtick expression evaluates at runtime:**
```
<<set _pronoun to ($masterGender is "female") ? "her" : "his">>
<<link `"careful to heed " + _pronoun + " warning"` "May 1665">><</link>>
```

### Converting links that have setters

Wiki-style links can include variable assignments in a trailing `[...]` block. When converting to `<<link>>`, move those assignments into `<<set>>` macros inside the link body:

**Before (broken — macro in link text, plus setter):**
```
[[agree with <<if $masterGender is "female">>her<<else>>his<</if>> warning->May 1665][$reputation to Math.clamp($reputation + 1, 0, 10)]]
```

**After (working):**
```
<<set _pronoun to ($masterGender is "female") ? "her" : "his">>
<<link `"agree with " + _pronoun + " warning"` "May 1665">>
  <<set $reputation to Math.clamp($reputation + 1, 0, 10)>>
<</link>>
```

### Using `<<print>>` output in link text

The `<<print>>` macro also does not work inside wiki-style links. Use the variable directly in a backtick expression instead:

**Before (broken):**
```
[[remain in the city with your <<print $caretakerLabel>>->Stay]]
```

**After (working):**
```
<<link `"remain in the city with your " + $caretakerLabel` "Stay">><</link>>
```

### Widgets in link text

Widget calls (e.g., `<<defPlague "plague">>`) produce HTML elements like tooltip spans. These cannot be embedded in `<<link>>` text arguments either, since the first argument is a plain string. Use the plain-text equivalent instead:

**Before (broken):**
```
[[make sure you don't spread the <<defPlague "plague">> to anyone->Reconnecting]]
```

**After (working — tooltip sacrificed for functional link):**
```
<<link "make sure you don't spread the plague to anyone" "Reconnecting">><</link>>
```

## Widget `<<nobr>>` Requirements

Every widget **must** wrap its entire content in `<<nobr>>...<</nobr>>` or `<<silently>>...<</silently>>`, and both the opening and closing tags must be on the **same line** as their corresponding `<<widget>>`/`<</widget>>` tags. Line breaks between these tags leak into the rendered HTML as stray `<br>` elements, causing unwanted vertical spacing.

### `<<nobr>>` vs `<<silently>>`

- **`<<nobr>>`** — Strips newlines (preventing `<br>` conversion) but **renders visible output**: text, HTML, macros like `<<print>>`, `<<link>>`, etc. Use this for widgets that produce content the player sees.
- **`<<silently>>`** — Strips newlines **and suppresses all output**. Any text or HTML inside is discarded; only side effects (like `<<set>>`) take effect. Use this for widgets that only do computation (populating arrays, setting variables) and intentionally produce no visible output.

### Rules

1. `<<nobr>>` (or `<<silently>>`) must immediately follow the `<<widget>>` tag **on the same line**.
2. `<</nobr>>` (or `<</silently>>`) must immediately precede `<</widget>>` **on the same line**.
3. No exceptions for "data-only" widgets — even `<<set>>` operations can produce invisible `<br>` tags that affect layout in some contexts.

### Why this matters

SugarCube converts newlines to `<br>` tags outside of `<<nobr>>` blocks. A newline between `<<widget>>` and `<<nobr>>` (or between `<</nobr>>` and `<</widget>>`) falls outside the nobr block and renders as a `<br>`. When a widget is called inside a passage, these stray `<br>` tags appear in the page — often as mysterious extra spacing between the header and passage text.

**Wrong — line break between widget and nobr at opening:**
```
<<widget "my-widget">>
<<nobr>>
...content...
<</nobr>><</widget>>
```

**Wrong — line break between nobr and widget at closing:**
```
<<widget "my-widget">><<nobr>>
...content...
<</nobr>>
<</widget>>
```

**Correct — both on the same line:**
```
<<widget "my-widget">><<nobr>>
...content...
<</nobr>><</widget>>
```

### Quick reference

| Technique | Works in `[[ ]]`? | Works in `<<link>>`? |
|-----------|-------------------|---------------------|
| Plain text | Yes | Yes |
| `$variable` | Yes | Yes (in backtick expr) |
| `<<if>>`/`<<else>>` | No | No (use ternary + backtick) |
| `<<print>>` | No | No (use variable + backtick) |
| Widget calls | No | Only in the link body, not the text argument |

## Text Flow Control

This game uses three techniques to control how text is revealed to the player within a single passage. Each technique keeps the player on the same passage and shows new content when they click a link or make a choice.

### 1. `<<chunkText>>` macro (linear progression)

Use `<<chunkText>>` when a passage needs to show a **fixed sequence of screens** one after another, like a wizard or tutorial. The player clicks "Next" to advance through each section in order, and the final section must navigate to another passage.

`<<chunkText>>` is a custom macro (defined in the HTML file, not a SugarCube built-in). Under the hood it compiles into a `<<switch $textGroup>>` with auto-incrementing cases, so you don't have to manage `$textGroup` yourself.

**Structure:**
```
<<chunkText>>
First screen content.
<<next>>
Second screen content.
<<next>>
Third screen content.
<<next "Continue" "NextPassage">>
Final screen content.
<</chunkText>>
```

**`<<next>>` arguments:**

| Arguments | Behavior |
|-----------|----------|
| *(none)* | Shows a "Next" link that reloads the current passage (advances to next chunk) |
| `"Link Text"` | Shows a link with custom text that reloads the current passage |
| `"Link Text" "PassageName"` | Shows a link that navigates to another passage and unsets `$textGroup`. **Required on the final `<<next>>`** |
| `".className"` | Wraps the link in a `<span>` with the given CSS class (combinable with other args) |

**Rules:**
- The **final** `<<next>>` must have both link text and a passage name — `<<chunkText>>` will throw an error otherwise.
- All sections are linear; you cannot skip, branch, or exit early.
- `<<silently>>` blocks within a section work normally — they only execute when that section's case is active.

**Current usage:** character creation in `identity` (pid 4).

### 2. Manual `$textGroup` / `<<switch>>` (branching progression)

Use manual `$textGroup` when you need capabilities that `<<chunkText>>` cannot provide:

- **Conditional branching** — different outcomes based on game state (e.g., player dies vs. recovers)
- **Early exit** — ending the sequence before all cases are reached via `<<unset $textGroup>>`
- **Variable-length sequences** — using `<<default>>` as a catch-all after the numbered cases
- **Partial coverage** — applying `$textGroup` to only one code path in a passage while other paths use different techniques

**Structure:**
```
<<if ndef $textGroup>><<set $textGroup = 1>><</if>>
<<switch $textGroup>>
  <<case 1>>
    First screen content.
    <<link "Continue" `passage()`>><</link>>
  <<case 2>>
    Second screen content.
    <<link "Continue" `passage()`>><</link>>
  <<default>>
    <<unset $textGroup>>
    <<if $someCondition>>
      [[Good ending->GoodPassage]]
    <<else>>
      [[Bad ending->BadPassage]]
    <</if>>
<</switch>><<if def $textGroup>><<set $textGroup += 1>><</if>>
```

**Key details:**
- Initialize with `<<if ndef $textGroup>><<set $textGroup = 1>><</if>>` at the top.
- Increment with `<<if def $textGroup>><<set $textGroup += 1>><</if>>` at the bottom (after `<</switch>>`).
- Use `<<unset $textGroup>>` before navigating away so the variable doesn't persist.
- Links within cases use `` <<link "text" `passage()`>><</link>> `` to reload the current passage and advance to the next case.
- `$textGroup` is a **global variable**, so only one passage at a time can use this mechanism. Always unset it before leaving.

**Current usage:** `Sickness` (pid 6), `August-1665` (pid 18).

### 3. `<<replace>>` / `<<append>>` (inline reveal)

Use `<<replace>>` when the player makes a **one-time choice** and the result should appear in place without reloading the passage. This is best for binary choices or simple reveals where you don't need multi-step progression.

**Structure:**
```
<span id="my-choice">
  <<link "Option A">><<replace "#my-choice">>
    You chose A. Here is what happens.
  <</replace>><</link>>
  |
  <<link "Option B">><<replace "#my-choice">>
    You chose B. Here is what happens.
  <</replace>><</link>>
</span>
```

**Key details:**
- The `<span id="...">` element is replaced by the content inside `<<replace>>`, so the original links disappear after the player clicks.
- Each `id` must be unique within the passage.
- No global variable management is needed — this is purely DOM-based.
- Can be freely mixed with other flow control techniques in the same passage.

**Current usage:** widespread across monthly passages for inline choices (e.g., curfew decision in `August-1665`, spending choices in helper widgets).

### 4. `<<linkappend>>` / `<<linkreplace>>` (self-contained inline reveal)

These are SugarCube built-in macros that combine a link and an inline reveal into a single construct — no `<span id>` wrapper needed.

#### `<<linkappend>>`

The link text remains visible and the macro's content is **appended** after it when clicked. Use this for "read more" or "continue the narrative" moments.

**Structure:**
```
<<linkappend "That is the last good day of the month, though.">>
  The rest of the month's events unfold here...
<</linkappend>>
```

After clicking, the player sees: *That is the last good day of the month, though. The rest of the month's events unfold here...*

The link becomes plain text — it cannot be clicked again.

**Current usage:** narrative continuations in `June-1665` (pid 17), `May-1665` (pid 16), `Quarantine-Continues` (pid 60).

#### `<<linkreplace>>`

The link text **disappears** and is replaced by the macro's content. Use this for choices where the link text itself should not persist (e.g., "accept a purgative drink" becomes a description of what happens).

**Structure:**
```
<li><<linkreplace "accept a purgative drink">>
  You are offered a purgative drink, which induces vomiting.
<</linkreplace>></li>
```

After clicking, the link text is gone — only the replacement content remains.

**Current usage:** treatment choices in `preventatives-treatments` (pid 80), penance choices in `YouPesthouse` (pid 44), exploration choices in `banished` (pid 43).

#### `<<linkappend>>` vs `<<replace>>` — when to use which

| Scenario | Technique |
|----------|-----------|
| Single link reveals more text after itself | `<<linkappend>>` |
| Single link swaps itself for different text | `<<linkreplace>>` |
| Multiple links share one target area (e.g., Option A \| Option B) | `<<replace>>` with `<span id>` |
| Need to replace content in a different part of the page | `<<replace>>` with `<span id>` |

### When to use which

| Need | Technique |
|------|-----------|
| Fixed linear sequence (wizard, tutorial) | `<<chunkText>>` |
| Multi-step sequence with branching or early exit | Manual `$textGroup` |
| Single link reveals continuation text | `<<linkappend>>` |
| Single link swaps itself for result text | `<<linkreplace>>` |
| Multiple links targeting the same area | `<<replace>>` with `<span id>` |
| Mix of progression + inline choices in one passage | Manual `$textGroup` + `<<replace>>` |

## Widget Decision Events

Storyline passages can present one-time decision widgets that **temporarily replace** the normal monthly narrative. The player sees only the widget's content; once they resolve the decision, the passage re-renders and the regular storyline text appears. Two mechanisms exist depending on where the widget is called from.

### Architecture overview

Every storyline passage (May 1665 onward) has this structure:

```
<<nobr>><<random-events>><<corpse-work>><<if not _randomEventFired>>
[monthly storyline content — narrative text + player choices]
<</if>><</nobr>>
```

Meanwhile, `PassageHeader` (pid 11) fires before the passage body on every passage load:

```
<<set _headerEventActive to false>>
<<if tags().includes("storyline") and visited() lte 1>>
  <<debt-check>><<child-service-check>><<noble-child-service-check>><<debtor>>
<</if>>
```

The `_randomEventFired` flag is the single gate that controls whether the monthly storyline content is visible. Any widget that needs to suppress the passage body must ensure `_randomEventFired` is `true`.

### Mechanism 1: Passage-body widgets ("market" pattern)

**Used by:** `<<marriage-market>>`, `<<preferment-market>>`, `<<apprenticeship-market>>`, `<<church-services>>`

These widgets are called from **within the passage body**, either inside an `<<if>>/<<else>>` branch (market widgets in January 1665) or after `<<random-events>>` sets `_randomEventFired` (church-services).

**How they suppress the passage body:**

- **Market widgets** are placed inside an `<<if>>/<<else>>` in the passage body itself. When the widget fires, the `<<else>>` clause (which contains the regular monthly narrative) does not execute. The widget content is the *only* visible output.
- **`<<church-services>>`** is called by `<<random-events>>` after it sets `_randomEventFired to true`. If the widget presents a choice (for non-Church of England members), it uses `<<replace>>` + `<<storyline-return 0>>` to stay on the same passage. On re-render, `$randomEventCompleted` is `true`, so `<<random-events>>` sets `_randomEventFired to false` and the passage body appears.

**Flow for market widgets:**

1. First visit → market widget condition is met → widget fires instead of passage body
2. Player makes a choice → `<<replace>>` swaps the question for confirmation text + `<<storyline-return "..." 0>>`
3. Player clicks the storyline-return link → passage re-renders (second visit)
4. Second visit → market widget condition is no longer met (e.g., `$seekingDecision` was set) → falls through to `<<else>>` → regular passage body renders

**Template for a new passage-body widget:**

```
/* In the storyline passage (passage body): */
<<if [widget-should-fire condition]>>
  <<my-decision-widget>>
<<else>>
  [regular monthly storyline content]
<</if>>
```

```
/* Widget definition: */
<<widget "my-decision-widget">><<nobr>>
[explanatory text]
<span id="myDecision">Question text?
<<link "Option A">><<replace "#myDecision">>
  <<set [state changes]>>
  You chose A. <<storyline-return "Continue." 0>>
<</replace>><</link>> | <<link "Option B">><<replace "#myDecision">>
  <<set [state changes]>>
  You chose B. <<storyline-return "Continue." 0>>
<</replace>><</link>>
</span>
<</nobr>><</widget>>
```

**Key points:**
- The `<<if>>/<<else>>` in the passage body ensures the widget fires *instead of* the passage content, not alongside it.
- `<<storyline-return "..." 0>>` keeps the player on the same passage (offset 0) and sets `$randomEventCompleted to true`, so on re-render the passage body will display.
- The widget must set a state variable (e.g., `$seekingDecision`) so the `<<if>>` condition is no longer true on re-render. Otherwise the widget fires again in an infinite loop.

### Mechanism 2: Header widgets ("header event" pattern)

**Used by:** `<<child-service-check>>`, `<<noble-child-service-check>>`, `<<debtor>>` (via `<<prison>>`)

These widgets are called from **PassageHeader**, which fires before the passage body. They cannot use the `<<if>>/<<else>>` technique because PassageHeader and the passage body are separate — there is no shared conditional structure.

**How they suppress the passage body:**

1. PassageHeader initializes `_headerEventActive to false`.
2. When a header widget produces interactive content, it sets `_headerEventActive to true`.
3. When the passage body calls `<<random-events>>`, the widget checks `_headerEventActive` first. If `true`, it sets `_randomEventFired to true` and skips all random-event logic. This suppresses the passage body via the existing `<<if not _randomEventFired>>` gate.
4. The player sees only the header widget content.
5. After the player resolves the decision via `<<storyline-return 0>>`, the passage re-renders:
   - `visited() > 1` → PassageHeader skips the widget calls → `_headerEventActive` stays `false`
   - `$randomEventCompleted` is `true` → `<<random-events>>` sets `_randomEventFired to false` and calls `<<church-services>>`
   - The passage body renders normally.

**Consequence:** When a header event fires, `<<random-events>>` is entirely skipped for that month — pregnancy tracking, NPC death rolls, servant dismissal/promotion, and random event checks do not run. This is consistent with how market widgets behave (they also prevent `<<random-events>>` from executing when they fire in January 1665).

**Flow diagram:**

```
PassageHeader
  │
  ├─ _headerEventActive = false
  ├─ <<debt-check>>            (informational — does NOT set flag)
  ├─ <<child-service-check>>   (sets flag if interactive content produced)
  ├─ <<noble-child-service-check>> (sets flag if interactive content produced)
  └─ <<debtor>> → <<prison>>   (sets flag unconditionally when called)
  │
Passage Body
  │
  ├─ <<random-events>>
  │    ├─ if _headerEventActive  → _randomEventFired = true  (SUPPRESS)
  │    ├─ elif $randomEventCompleted → _randomEventFired = false (SHOW)
  │    └─ else → normal event cascade
  │
  ├─ <<corpse-work>>
  │
  └─ <<if not _randomEventFired>>
       [monthly storyline content]    ← hidden when flag is true
     <</if>>
```

**Template for a new header widget:**

```
/* Widget definition: */
<<widget "my-header-widget">><<nobr>>
<<if [condition for this widget to fire]>>
  <<set _headerEventActive to true>>

  <span id="myHeaderDecision">[Question text]
  <br><br>
  <<link "Option A">><<replace "#myHeaderDecision">>
    <<set [state changes]>>
    You chose A. <<storyline-return "Continue." 0>>
  <</replace>><</link>> | <<link "Option B">><<replace "#myHeaderDecision">>
    <<set [state changes]>>
    You chose B. <<storyline-return "Continue." 0>>
  <</replace>><</link>>
  </span>
<</if>>
<</nobr>><</widget>>
```

Then register the widget call in PassageHeader (pid 11), inside the `visited() lte 1` guard:

```
<<if tags().includes("storyline") and visited() lte 1>>
  <<debt-check>><<child-service-check>><<noble-child-service-check>><<debtor>>
  <<my-header-widget>>
<</if>>
```

**Key points:**
- Set `_headerEventActive to true` **only** when the widget actually produces interactive content (inside the guarding `<<if>>`). If the widget's conditions aren't met and it produces no output, the flag must stay `false`.
- The widget's condition must ensure it does not fire on re-render. The `visited() lte 1` guard in PassageHeader handles this automatically — header widgets only fire on the first visit.
- Use `<<storyline-return "..." 0>>` (offset 0) to re-render the same passage. Offset 1+ advances to the next month, which is also valid — the passage body simply never appears for that month.
- Header widgets that produce only informational text (no interactive choices) should **not** set `_headerEventActive`. See `<<debt-check>>` for an example — it outputs a debt warning but has no links for the player to click.

### Choosing between the two mechanisms

| Criterion | Passage-body widget | Header widget |
|-----------|-------------------|---------------|
| Called from | Inside the passage body | PassageHeader (pid 11) |
| Fires for | One specific passage (or a small set) | Any storyline passage meeting the condition |
| Suppression mechanism | `<<if>>/<<else>>` in the passage | `_headerEventActive` → `_randomEventFired` |
| Random events | May or may not run (depends on placement) | Entirely skipped for that month |
| Re-render guard | Widget must set a state variable to prevent re-firing | `visited() lte 1` in PassageHeader handles it automatically |
| Best for | One-off decisions tied to a specific month | Recurring system events (debt, child service) that can fire on any month |
