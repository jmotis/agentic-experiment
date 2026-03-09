# Developer Guide

Coding instructions for human developers working on **Gaming the Great Plague**.

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

### When to use which

| Need | Technique |
|------|-----------|
| Fixed linear sequence (wizard, tutorial) | `<<chunkText>>` |
| Multi-step sequence with branching or early exit | Manual `$textGroup` |
| Single inline choice with immediate result | `<<replace>>` |
| Mix of progression + inline choices in one passage | Manual `$textGroup` + `<<replace>>` |
