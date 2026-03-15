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

Storyline passages can present one-time decision widgets that **temporarily replace** the normal monthly narrative. The player sees only the widget's content; once they resolve the decision, the passage re-renders (or downstream content is revealed) and the regular storyline text appears. Two mechanisms exist depending on where the widget is called from, with three sub-patterns for passage-body widgets.

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

### Mechanism 1: Passage-body widgets

These widgets are called from **within the passage body** and suppress the monthly storyline content (or downstream continuation content) until the player resolves a decision. Three sub-patterns exist depending on how suppression is achieved.

#### Sub-pattern A: `<<if>>/<<else>>` branching

**Used by:** `<<marriage-market>>`, `<<preferment-market>>`, `<<apprenticeship-market>>`, `<<bill-subscribe>>`

The passage body wraps the widget call and the main storyline in an `<<if>>/<<else>>` branch. When the widget's condition is met, the widget fires *instead of* the monthly narrative — the `<<else>>` clause (containing the storyline) does not execute.

**Flow:**

1. First visit → widget condition is met → widget fires instead of passage body
2. Player makes a choice → `<<replace>>` swaps the question for confirmation text + `<<storyline-return "..." 0>>`
3. Player clicks the storyline-return link → passage re-renders (second visit)
4. Second visit → widget condition is no longer met (e.g., `$seekingDecision` was set) → falls through to `<<else>>` → regular passage body renders

**Template:**

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

#### Sub-pattern B: `_randomEventFired` flag-setting

**Used by:** `<<church-services>>`, `<<servant-reunion>>`

The widget is called **before** the `<<if not _randomEventFired>>` gate in the passage body. When the widget needs to show a decision, it sets `_randomEventFired to true`, which suppresses the main storyline content below. The widget also guards its own decision branch with `not _randomEventFired` to avoid overlapping with other active events (e.g., a random event already being displayed).

**Flow:**

1. First visit → widget condition is met and `_randomEventFired` is false → widget sets `_randomEventFired to true` and displays the decision
2. Main storyline is hidden because `_randomEventFired` is true
3. Player makes a choice → `<<replace>>` swaps the question for confirmation text + `<<storyline-return "Continue." 0>>`
4. Player clicks the storyline-return link → passage re-renders with `$randomEventCompleted` set to true
5. Second visit → widget condition is no longer met (e.g., `$masterFled` was set to false, or `$churchServiceDecision` was set) → widget skips → `_randomEventFired` stays false → main storyline renders

**Template:**

```
/* In the storyline passage (passage body): */
<<random-events>><<corpse-work>>
<<my-flag-setting-widget>>
<<if not _randomEventFired>>
  [monthly storyline content]
<</if>>
```

```
/* Widget definition: */
<<widget "my-flag-setting-widget">><<nobr>>
<<if [outer condition — e.g. $masterFled is true]>>
<<if [non-interactive branch — e.g. debtor's prison cleanup]>>
  [silent state cleanup — no UI, no flag-setting]
<<elseif not _randomEventFired>>
  <<set _randomEventFired to true>>
  [explanatory text]
  <span id="myDecision">Question text?
  <<link "Option A">><<replace "#myDecision">>
    <<set [state changes that clear the outer condition]>>
    You chose A. <<storyline-return "Continue." 0>>
  <</replace>><</link>> | <<link "Option B">><<replace "#myDecision">>
    <<set [state changes that clear the outer condition]>>
    You chose B. <<storyline-return "Continue." 0>>
  <</replace>><</link>>
  </span>
<</if>>
<</if>>
<</nobr>><</widget>>
```

**Key points:**
- The widget sets `_randomEventFired to true` itself — unlike sub-pattern A, there is no `<<if>>/<<else>>` in the passage to gate the storyline.
- The `not _randomEventFired` guard inside the widget prevents it from displaying when another event (random event, church services, etc.) is already active. The widget will fire on a subsequent re-render once the other event resolves.
- Each choice must clear the widget's outer condition (e.g., set `$masterFled to false`) so the widget does not fire again on re-render.
- Silent, non-interactive branches (like cleanup for debtor's prison) do not set `_randomEventFired` and do not need a `not _randomEventFired` guard — the main storyline renders normally alongside them.
- `<<church-services>>` is called from within `<<random-events>>` (after `$randomEventCompleted` resets `_randomEventFired to false`). `<<servant-reunion>>` is called directly in the passage body before the `_randomEventFired` gate. Both use the same flag-setting mechanism.

#### Sub-pattern C: jQuery `show()`/`hide()` gating

**Used by:** `<<smuggle-children>>`, `<<return-children>>`, `<<funeral-choice>>` (when called inline via `_funeralInline`)

Unlike sub-patterns A and B, which suppress the **entire** passage body, this pattern gates only the **downstream continuation content** that follows the widget. The widget is called inline within the passage body, immediately before a continuation element — a `<span id="...">` that wraps the content the player should not see until the decision is resolved.

When the widget has a decision to present, it hides the continuation element using jQuery:
```
<<done>><<run $("#continuation-id").hide()>><</done>>
```

After the player makes their choice (via `<<replace>>`), the widget reveals the continuation:
```
<<done>><<run $("#continuation-id").show()>><</done>>
```

The `<<done>>` wrapper is required because the jQuery call must execute after SugarCube has rendered the DOM — without it, the target element may not exist yet.

**Flow:**

1. Passage renders → widget condition is met → widget hides the continuation `<span>` and displays the decision
2. Player makes a choice → `<<replace>>` swaps the question for result text → `<<done>><<run $(...).show()>><</done>>` reveals the continuation
3. The continuation content (which may include further widgets, links, or `<<storyline-return>>`) is now visible without a full passage re-render

**Template:**

```
/* In the storyline passage (passage body): */
<<my-inline-widget>>
<span id="my-continue">[downstream content — may include further widgets or <<storyline-return>>]</span>
```

```
/* Widget definition: */
<<widget "my-inline-widget">><<nobr>>
<<if [condition to present decision]>>
<<done>><<run $("#my-continue").hide()>><</done>>
<span id="myInlineDecision">Question text?
<<link "Option A">><<replace "#myInlineDecision">>
  <<set [state changes]>>
  You chose A.
  <<done>><<run $("#my-continue").show()>><</done>>
<</replace>><</link>> | <<link "Option B">><<replace "#myInlineDecision">>
  <<set [state changes]>>
  You chose B.
  <<done>><<run $("#my-continue").show()>><</done>>
<</replace>><</link>>
</span>
<</if>>
<</nobr>><</widget>>
```

**Key points:**
- The continuation `<span id="...">` is defined in the **calling passage**, not inside the widget. The widget only controls visibility via `hide()`/`show()`.
- This pattern does **not** set `_randomEventFired` and does **not** suppress unrelated passage content — it only gates what comes after the widget in the DOM.
- No full passage re-render occurs. The decision resolution and continuation reveal happen in-place via DOM manipulation.
- Multiple sub-pattern C widgets can be **chained sequentially** by nesting continuation spans. For example, `<<smuggle-children>>` hides `#smuggle-continue`, and inside that span `<<return-children>>` hides `#return-continue`. Each widget independently gates its own downstream content.
- The widget's condition should be self-limiting (e.g., checking an array length) so it only fires when there are eligible targets. Unlike sub-patterns A and B, there is typically no need for a state variable to prevent re-firing, because the passage does not re-render.

**Example — chained widgets in quarantine-end (pid 76):**

```
<<funeral-choice>>
<span id="funeral-continue"><<orphan-check>>
<<servant-master-death>>
<<health-update>>
<<return-children>>
<span id="return-continue"><<catch-up>>
<<storyline-return "You open your doors and reenter the outside world.">></span></span>
```

Here, `<<funeral-choice>>` hides `#funeral-continue` when there are dead NPCs needing funerals. After the player chooses a burial type, `#funeral-continue` is shown, revealing orphan checks, health updates, and the `<<return-children>>` widget. If there are smuggled children to bring home, `<<return-children>>` in turn hides `#return-continue` until that decision is resolved.

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

### Choosing between the mechanisms

| Criterion | Sub-pattern A (`<<if>>/<<else>>`) | Sub-pattern B (`_randomEventFired`) | Sub-pattern C (jQuery `show`/`hide`) | Header widget |
|-----------|----------------------------------|-------------------------------------|--------------------------------------|---------------|
| Called from | Inside the passage body | Inside the passage body | Inside the passage body | PassageHeader (pid 11) |
| Fires for | One specific passage (or a small set) | One specific passage (or a small set) | Any passage with an eligible condition | Any storyline passage meeting the condition |
| Suppression mechanism | `<<if>>/<<else>>` in the passage | Sets `_randomEventFired to true` | jQuery `hide()`/`show()` on a continuation `<span>` | `_headerEventActive` → `_randomEventFired` |
| Scope of suppression | Entire passage body | Entire passage body | Only downstream content after the widget | Entire passage body |
| Random events | May or may not run (depends on placement) | May or may not run (depends on placement) | Unaffected — does not interact with `_randomEventFired` | Entirely skipped for that month |
| Re-render guard | Widget must set a state variable to prevent re-firing | Widget must set a state variable to prevent re-firing | Typically self-limiting (condition based on data, e.g., array length); no re-render occurs | `visited() lte 1` in PassageHeader handles it automatically |
| Re-renders passage? | Yes — `<<storyline-return>>` reloads passage | Yes — `<<storyline-return>>` reloads passage | No — resolution is in-place via DOM manipulation | Yes — `<<storyline-return>>` reloads passage |
| Chainable? | No | No | Yes — continuation spans can be nested | No |
| Best for | One-off decisions tied to a specific month | Decisions that must prevent other events from overlapping | Sequential inline decisions where later content depends on earlier choices | Recurring system events (debt, child service) that can fire on any month |
