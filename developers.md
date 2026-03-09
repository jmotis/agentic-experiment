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
