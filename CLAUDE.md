# CLAUDE.md

## Rebase Priority

**Any instruction to rebase takes absolute priority over all other directives in this file.** If a rebase command is issued — whether as part of a multi-step request or alongside questions or edit tasks — the rebase must be executed **first**, before answering any questions about the code or making any edits to the codebase. Do not begin analysis, code review, or file modifications until the rebase is fully complete.

## Project Overview

This repository contains **Gaming the Great Plague**, an interactive fiction game built with [Twine 2](https://twinery.org/) using the [SugarCube 2.37.3](https://www.motoslave.net/sugarcube/2/) story format. The project is a single self-contained HTML file that runs directly in a web browser.

**Author:** Jessica Otis
**Co-authors:** Stephanie Grimm, Alexandra Miller, Nathan Sleeter

## Repository Structure

```
/
├── CLAUDE.md                      # This file — guidance for AI assistants
├── GamingtheGreatPlague.html      # Complete Twine game (single-file, ~1.2 MB)
├── extract.js                     # Extracts passages to passages/ dir + passage-index.json
├── patch.js                       # Re-encodes and patches passage files back into the HTML
├── variables.md                   # Reference list of all global game variables
├── README.md                      # Project description and play instructions
├── passage-index.json             # [transient] Lightweight index of all passages (pid, name, tags, size)
└── passages/                      # [transient] Individual decoded passage files (one per passage)
    ├── 001-bio.txt
    ├── 002-December-1664.txt
    └── ...
```

There is no build system, package manager, test framework, or CI/CD pipeline.

## Technology Stack

- **Twine 2** — Interactive fiction authoring tool
- **SugarCube 2.37.3** — Story format / game engine (embedded in HTML)
- **HTML/CSS/JavaScript** — All minified and embedded within the single HTML file
- **FileSaver.js** — Embedded library for save/download functionality

## How to Run

Open `GamingtheGreatPlague.html` in any modern web browser. No server, build step, or installation is required.

## Development Workflow

This project is authored in the **Twine editor**, not in a traditional code editor. The HTML file is the compiled output from Twine. Direct edits to the HTML are not recommended — changes should be made in Twine and re-exported.

### Key points for AI assistants

- **Do not reformat or minify** the HTML file — it is Twine-generated output.
- **No linting, testing, or build commands** exist for this project.
- **No `.gitignore`** is configured; be cautious about adding files that shouldn't be tracked.
- The HTML file contains very long lines (up to ~32K characters) due to embedded minified JavaScript and story data. This is expected.
- **Explore subagent model selection:** When using the Explore subagent on `.html` files (the game file or extracted passage files), configure it to use **Sonnet** — the game file's complexity requires stronger reasoning than Haiku provides. Haiku is acceptable for exploring `.md` files (e.g., `variables.md`, `README.md`, `CLAUDE.md`).

## Working with Twine Passage Content

When asked to **analyze, review, search, or edit** passage text from the Twine file, you **must** use the extract/patch workflow described below. **Never** read, parse, or edit `GamingtheGreatPlague.html` directly for passage work.

### Extract → Analyze → Patch workflow

1. **Extract** — Run `node extract.js`. This produces:
   - `passages/` — A directory of individual passage files (one `.txt` file per passage), with **decoded** plain-text content (no HTML entities). Files are named `{pid}-{name}.txt` (e.g., `010-StoryInit.txt`).
   - `passage-index.json` — A lightweight JSON index (~5 KB) listing each passage's `pid`, `name`, `tags`, `filename`, and `size` in bytes. Use this to find passages by name or tag without reading any content.
2. **Analyze / Edit** — Work with individual passage files in `passages/`. Never open or modify the HTML file for passage content.
   - **Start with `passage-index.json`** to find the passage you need by name, tag, or pid. Read only the specific passage file(s) relevant to your task.
   - **Passage content is plain text** — SugarCube macros appear as `<<macro>>`, quotes as `"`, etc. Write edits using normal characters, not HTML entities.
   - **Search across all passages** using `Grep(pattern="keyword", path="passages/")`. Results include the filename, so you instantly know which passage matched.
   - **Read before editing.** `Grep` results do not satisfy the `Edit` tool's read requirement. Before editing any passage file, always call `Read` on it first — even if you already know the content from grep output. When editing multiple files, batch the `Read` calls in parallel before starting edits to avoid repeated round-trips.
3. **Patch** — When edits are complete, run `node patch.js` to re-encode passage content (back to HTML entities) and write changes into the HTML file.

### Pre-patch safety rules (mandatory before running `node patch.js`)

1. **List every pid you modified.** Before executing `patch.js`, explicitly state which `pid` values were changed and summarize what changed in each.
2. **Never touch passages you did not explicitly analyze.** If a passage was not part of the current task, its file in `passages/` must remain byte-identical to what `extract.js` produced. Do not reformat or "clean up" unrelated passage files.
3. **Never alter `<tw-storydata>` wrapper attributes.** The attributes on the `<tw-storydata>` element (`name`, `startnode`, `creator`, `creator-version`, `format`, `format-version`, `ifid`, `options`, `tags`, `zoom`, `hidden`) are managed by Twine and must never be modified. `patch.js` only replaces inner text of `<tw-passagedata>` elements matched by `pid` — do not change this behavior.

### Passage creation rules

- **Do not create new passages.** The `patch.js` script can only update existing `<tw-passagedata>` elements matched by `pid`. It cannot insert new passages into the HTML. Any new passage added to `passages.json` will be silently ignored during patching and will not appear in the game. Only the Twine editor can create new passages.
- **New widgets go in the Claude-widgets passage (pid 114).** When you need to define a new `<<widget>>`, append its `<<widget "name">>...<</widget>>` block to the file `passages/114-Claude-widgets.txt`. Do not attempt to create a separate widget passage.
- **New `def*` definition widgets go in the glossary-widgets passage (pid 81).** The `def*` widgets in `passages/081-glossary-widgets.txt` are kept in alphabetical order by widget name (case-insensitive, ignoring the `def` prefix). When adding a new definition widget, insert it into the correct alphabetical position — do not append to the end. The `defVar*` dispatcher widgets (e.g., `defVarReligion`, `defVarSocio`, `defVarRelationship`) are exceptions and remain at the end of the file after all alphabetical `def*` entries.

### Additional guardrails

- **Do not reconstruct or rewrite** `<tw-storydata>` or any `<tw-passagedata>` opening/closing tags. `patch.js` preserves them automatically.
- **Passage matching is by `pid`, not by `name`.** Passage names can change; `pid` is the stable identifier.
- **Write plain text in passage files.** Passage files in `passages/` contain decoded plain text. Write SugarCube macros as `<<macro>>`, use normal `"` quotes, etc. `patch.js` handles re-encoding to HTML entities automatically.
- After patching, `passages/` and `passage-index.json` are **transient artifacts** and should not be committed to the repository. Only the updated HTML file should be committed.
- **Verify external URLs before committing.** If changing image sources, API endpoints, or external links, confirm each URL resolves successfully. For Wikimedia Commons thumbnail URLs, verify the source image dimensions support the requested width — requesting a thumbnail wider than the original produces a 404.

## Impact Analysis (mandatory for state/logic changes)

Before editing any passage that reads or writes a `$variable` or calls a `<<widget>>`:

1. **Find all references.** Run `Grep(pattern="variableName", path="passages/")` after extracting. List every passage that reads, writes, or conditions on the variable.
2. **Check widget callers.** If modifying a widget, find every passage that invokes it: `Grep(pattern="<<widgetName", path="passages/")`.
3. **Verify guards.** If adding a condition or guard (e.g., `$relationship isnot "married"`), check whether the same guard is needed at other call sites. A widget may be called from multiple passages.
4. **Document scope.** Before committing, state which passages were modified AND which were checked-but-not-modified (and why).

## Pre-Commit Verification (mandatory before patching)

1. **Closing-tag audit.** In every modified passage, count opening and closing tags for `<<if>>/<</if>>`, `<<for>>/<</for>>`, `<<link>>/<</link>>`, and `<<widget>>/<</widget>>`. They must match.
2. **String-building trace.** For any loop that builds a display string (names, lists, descriptions), manually trace the output for 1 item, 2 items, and 3+ items. Verify separators (commas, "and") are concatenated into the string variable, not output as bare inline text.
3. **Edge cases.** For conditional logic, verify behavior when: arrays are empty, variables are `undefined` or `0`, and boundary values are hit.
4. **URL/resource check.** If modifying external URLs (images, links), verify each URL resolves before committing.
5. **Scope completeness.** For visual or layout changes, search for ALL matching elements across the game (e.g., all portrait-oriented images), not just the one that prompted the task. Prefer one thorough commit over incremental fix-ups.

## Version Control (Game Title)

The game title includes a version number in the format **"Gaming the Great Plague 2026 vX.Y"**. The current version is stored in the `<tw-storydata>` element's `name` attribute in `GamingtheGreatPlague.html` (e.g., `name="Gaming the Great Plague 2026 v1.1"`).

### Mandatory version bump rule

**Whenever you edit the game file** (`GamingtheGreatPlague.html`) — whether through the extract/patch workflow or any other means — you **must** increment the minor version number in the game title (e.g., `v1.1` → `v1.2`, `v1.9` → `v1.10`). This applies to every commit that modifies the game file.

### How to update the version

The version string is in the `<tw-storydata name="...">` attribute, **not** in passage content. Since `patch.js` only updates passage content (inner text of `<tw-passagedata>` elements), updating the version requires **direct editing of the HTML file**:

1. **Read the current version** from the HTML file before bumping:
   ```
   grep -oP 'name="Gaming the Great Plague 2026 v\K[^"]+' GamingtheGreatPlague.html
   ```
   Do NOT assume the version from the commit you branched from — a parallel branch may have been merged since then.
2. Locate the `<tw-storydata>` opening tag (near the beginning of the file).
3. Find the `name` attribute and increment the minor version number by 1 from whatever the current value is.
4. Save the file.
5. Include the new version number in your **commit subject line** (e.g., "Update X — bump to v1.2").

### Version numbering rules

- Only increment the **minor** version (the number after the dot). Do not change the major version unless explicitly asked by the user.
- If multiple passage edits are made in a single session, only bump the version **once** per commit, not once per passage edit.
- **This is one of the rare exceptions** where direct HTML editing is necessary, since the `<tw-storydata>` attributes cannot be modified through the extract/patch workflow.
- **Reverts must increment** to a new version — never reuse the reverted version number.
- **Always include the version in the commit subject line**, not just the body. This ensures versions are visible in `git log --oneline`.
- **Never skip version numbers.** If a branch has multiple commits that each bump the version, all intermediate versions must be sequential.
- **Check for collisions before pushing.** If the version you're about to use already exists in `git log`, increment again.

## SugarCube 2 Syntax Gotchas

Known limitations and pitfalls discovered during development:

- **No `<<while>>` macro.** SugarCube 2 does not have a `<<while>>` loop. Use a C-style `<<for>>` with only a condition instead:
  ```
  /* Wrong — <<while>> does not exist */
  <<while _usedNames.includes(_n)>><<set _n to weightedEither($fNames)>><</while>>
  /* Correct — <<for>> with empty init and post */
  <<for ; _usedNames.includes(_n); >><<set _n to weightedEither($fNames)>><</for>>
  ```
  The body executes as long as the condition is true; if the condition is false on first entry the body is skipped entirely, matching typical while-loop semantics.

- **No `var`/`let`/`const` or named functions inside `<<set>>` or `<<run>>`.** SugarCube's expression parser does not support JavaScript declarations. Use anonymous functions assigned to temp variables:
  ```
  /* Wrong — named function inside <<run>> */
  <<run $arr.sort(function mySort(a,b) { return a - b; })>>
  /* Correct — anonymous function via <<set>>, then use in sort */
  <<set _cmp to function(a,b) { return a - b; }>>
  <<run $arr.sort(_cmp)>>
  ```

- **`<<print>>` does not work inside HTML attributes.** SugarCube does not process macros within HTML tag attributes — they render as literal text. Use `@` attribute directives instead:
  ```
  /* Wrong — <<print>> is literal text inside an attribute */
  <div style="height: <<print _h>>px">
  /* Correct — @ directive evaluates a JS expression */
  <div @style="'height: ' + _h + 'px'">
  ```

- **Nested bracket indexing fails inline.** Expressions like `$NPCs[$otherArray[0]].name` produce `[object Object]` because SugarCube can't resolve the nested indexing in one pass. Extract the inner index first:
  ```
  /* Wrong */
  $NPCs[_eligibleList[0]].name
  /* Correct */
  <<set _idx to _eligibleList[0]>>$NPCs[_idx].name
  ```

- **`||` treats 0 as falsy.** `_args[1] || 1` will default to 1 when the argument is legitimately 0. Use an explicit `undefined` check:
  ```
  /* Wrong — 0 becomes 1 */
  <<set _offset to _args[1] || 1>>
  /* Correct */
  <<set _offset to (typeof _args[1] !== 'undefined') ? _args[1] : 1>>
  ```

- **Don't reverse-engineer pre-clamp values with arithmetic.** After `<<set $reputation to Math.clamp($reputation - 2, 0, 10)>>`, writing `repBefore: $reputation + 2` assumes the clamp didn't fire. If `$reputation` was 0 before and stayed 0, the expression evaluates to 2 — a value it never was. Always capture the value *before* mutation with `<<set _repBefore to $reputation>>` or use the `<<record-decision>>` widget. See the "Recording Decisions" section for details.

- **Don't confuse `<</macro>>` with `</htmltag>`.** SugarCube macros close with `<</ >>`. HTML tags close with `</ >`. Writing `<</span>>` produces a macro-not-found error.

## Recording Decisions (`$decisions.push`)

Every player decision is recorded via `$decisions.push({text, money, repDelta, repBefore, infectPct})`. The `repBefore` field must capture `$reputation` **before** any mutation in that decision block. Three patterns exist; only the first two are correct.

### Preferred: `<<record-decision>>` widget (pid 114)

Use this in `<<link>>`, `<<replace>>`, `<<linkreplace>>`, and `<<set>>` blocks — anywhere a widget call is valid. The widget captures `$reputation`, applies the reputation change via `Math.clamp(0, 10)`, and pushes the decision record with the true `repBefore` and actual clamped `repDelta`.

```
/* Widget signature */
<<record-decision text moneyRecord repChange infectPct>>

/* Example — reputation decreases by 1 */
<<record-decision "May 1666: Declined to celebrate" 0 -1>>

/* Example — with infection percentage */
<<record-decision "Aug 1666: Celebrated in the streets" 0 1 _riskPct>>
```

- `text` — decision description string
- `moneyRecord` — money amount to record (does **not** modify `$money`)
- `repChange` — intended reputation change (widget applies it)
- `infectPct` — infection percentage (optional, defaults to `null`)

### Fallback: `_repBefore` temp variable

Use this **only** in `[[link->target][$decisions.push(...)]]` inline setter syntax, where widgets cannot be called.

```
/* Correct — capture before mutation */
[[refuse the job->Stay][_repBefore to $reputation; $reputation to Math.clamp($reputation - 1, 0, 10); $decisions.push({text: "Refused the job", money: 0, repDelta: $reputation - _repBefore, repBefore: _repBefore, infectPct: null})]]
```

### Forbidden: arithmetic reconstruction

**Never** reverse-engineer `repBefore` from `$reputation` after mutation. This breaks when `Math.clamp` actually clamps (e.g., rep was 0, stayed 0, but `$reputation + 2` records 2).

```
/* WRONG — breaks at clamp boundaries */
<<set $reputation to Math.clamp($reputation - 2, 0, 10)>>
<<set $decisions.push({..., repBefore: $reputation + 2, ...})>>
```

### Decision-recording checklist (for code review)

When reviewing or writing `$decisions.push()` calls:

1. **Is `repBefore` the pre-mutation value?** If `$reputation` is mutated anywhere before the push in the same block, `repBefore: $reputation` captures the wrong (post-mutation) value.
2. **Is `repDelta` the actual delta, not the intended delta?** Use `$reputation - _repBefore` or let the widget compute it. A hardcoded `repDelta: -2` is wrong if clamping reduced the actual change.
3. **Could the widget be used instead?** If the push is inside a `<<link>>`, `<<replace>>`, or `<<set>>` block (not an inline `[[...]]` setter), prefer `<<record-decision>>`.

## Decision-Gating Widgets (enforcing player choices)

Some widgets present a decision that the player **must** resolve before seeing the main monthly storyline content. These widgets suppress the passage body until the player clicks through. Two sub-patterns exist; see `developers.md` → "Widget Decision Events" for full details, flow diagrams, and templates.

### Sub-pattern A: `<<if>>/<<else>>` branching

The passage body uses `<<if>>/<<else>>` to show EITHER the widget OR the storyline. When the widget's condition is met, the storyline branch does not execute.

**Used by:** `<<marriage-market>>`, `<<preferment-market>>`, `<<apprenticeship-market>>`, `<<bill-subscribe>>`

### Sub-pattern B: `_randomEventFired` flag-setting

The widget is called before the `<<if not _randomEventFired>>` gate. When showing a decision, it sets `_randomEventFired to true` to suppress the storyline below. It also guards its own decision branch with `not _randomEventFired` to avoid overlapping with other active events.

**Used by:** `<<church-services>>`, `<<servant-reunion>>`

### Mandatory rules for new decision-gating widgets

1. **Never display a decision alongside the main storyline.** The player must resolve the decision before seeing passage content. Use one of the two sub-patterns above.
2. **Always end each choice with `<<storyline-return "Continue." 0>>`** so the player can click through to the main storyline after making their decision.
3. **Ensure the widget does not re-fire on re-render.** Each choice must set a state variable (or clear a condition) so the widget skips on the second visit.
4. **For sub-pattern B:** guard the decision branch with `not _randomEventFired` so it does not overlap with random events or other flag-setting widgets.

## Global Variables Reference

The file `variables.md` contains a comprehensive list of all global (`$`-prefixed) game variables, including their types, possible values, dependencies, and usage notes. Consult this file when you need to understand what a variable does, what values it can hold, or how it relates to other variables.

**Maintenance rule:** If a future update creates a new global variable or changes how an existing variable is used, `variables.md` must be updated along with the game file.

**StoryInit initialization rule:** Every global (`$`-prefixed) variable must be initialized in the `StoryInit` passage (pid 10). This includes variables that are later overwritten during character generation or gameplay — they still need a default value in `StoryInit` so that no global variable is ever undefined. When adding a new global variable, add its `<<set>>` initialization to `StoryInit` in addition to wherever it is set during gameplay. The only exceptions are:
- Variables set by `<<initDeathData>>` (called from `StoryInit`): `$parishRate`, `$corpseBuried`, `$corpsePlague`
- `$textGroup` — intentionally managed with `<<if ndef $textGroup>>` checks and `<<unset>>`
- `$args` — SugarCube built-in widget argument variable

## Session Setup

At the start of every session, set the following environment variable:

```
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000
```

This ensures Claude Code has sufficient output capacity for tasks involving large passage files or `GamingtheGreatPlague.html`.

## Git Conventions

- **Primary branch:** `main`
- **Remote:** `origin`
- The repository has a single initial commit. Keep commit messages descriptive of content changes (e.g., narrative updates, gameplay fixes).
