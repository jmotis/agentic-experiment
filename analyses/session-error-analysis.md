# Session Error Analysis & Suggested Workflow Updates

Analysis of ~50 commits across ~40 Claude Code sessions on *Gaming the Great Plague*.

---

## Part 1: Errors Encountered

### Category A: SugarCube Syntax Misunderstandings

These errors stem from Claude not knowing how SugarCube's parser differs from standard JavaScript.

| Session | Version | Error | Detail |
|---------|---------|-------|--------|
| `01TSmG…` | v3.6 | `orderNPCs` widget syntax error | Used `<<set>>` with a `.sort()` callback containing `var` declarations. SugarCube's parser chokes on `var`/`let`/`const` inside `<<set>>`. Fix: switch to `<<run>>`. |
| `01XRES…` | v3.14 | `orderNPCs` widget syntax error **again** | The v3.6 `<<run>>` fix still broke — `<<run>>` doesn't support named function declarations either. Had to refactor to anonymous function assigned via `<<set>>`. **Same bug fixed twice, 8 versions apart.** |
| `01EwER…` | v3.25 | Stats visualizations completely blank | `<<print>>` macros inside HTML attributes are treated as literal text by SugarCube. Required `@` attribute directives instead. |
| `01WeS8…` | v3.34 | `[object Object]` displayed in-game | Nested bracket indexing `$NPCs[_smuggleEligible[0]].relationship` can't be resolved inline. Must extract inner index to a temp variable first. |
| `01WeS8…` | v3.34 | Missing `<</if>>` closing tag | Day labourers `<<if>>` block left unclosed, causing "cannot find closing tag" errors at runtime. |
| (unknown) | v3.15 | `||` operator treated 0 as falsy | `_args[1] || 1` defaulted to 1 when argument was legitimately 0. Classic JS gotcha. |
| (unknown) | v3.33 | `<</span>>` used instead of `</span>` | Confused SugarCube macro syntax (`<<…>>`) with HTML tag syntax (`<…>`). |

### Category B: Incomplete First-Pass Implementation

Changes committed before fully considering edge cases, requiring follow-up commits in the same session.

| Session | Versions | What happened |
|---------|----------|---------------|
| `01WeS8…` | v3.33 → v3.34 | **Bug fixes, two PRs.** First pass (#366) fixed funeral widget grouping but left string concatenation broken — produced "your mother Anneyour sister Alice" (commas/and output as inline text instead of concatenated into the string variable). Second pass (#367) fixed that plus three more bugs in the same code areas. |
| `013A8q…` | v3.35 → v3.36 → v3.37 | **Portrait layout, three commits.** First commit only fixed one image (Henrietta Maria, float:left). Second commit applied to all portraits (float:right) — but also reversed the first commit's float direction. Third commit caught one more image missed by the "all portraits" pass. |
| `019aJM…` | v3.18 → v3.19 → v3.20 | **Westminster location, three attempts.** First oversimplified the label. Second tried to paper over it (verbose listbox, short `$location`). Third finally settled on "in Westminster" / "in the western suburbs" for grammatical correctness. |
| `01EwER…` | v3.25 → v3.26 | **Stats visualizations, two PRs.** First fixed the rendering bug, but didn't account for months when the player fled London, producing incorrect risk data. |
| `01JBrV…` | v3.29 → v3.30 | **Impressment/debt, two commits.** First commit incorrectly forgave debts upon impressment. Second commit fixed that and added a missing non-noble flee option. |
| `016cof…` | v3.41 → v3.42 | **Plague worker pay, two commits.** First commit capped burials but left in crew division. Second removed crew division entirely. |

### Category C: External Resource Assumptions

| Session | Version | Error |
|---------|---------|-------|
| `01CT3Q…` | v3.28 | **Image optimization broke images, required partial revert.** Converted Wikimedia Commons URLs to `/thumb/` format at 1024px. Some source images were smaller than 1024px, making the thumb URLs invalid (404). Had to revert Wikimedia changes while keeping Wellcome IIIF and responsive dimension fixes. |

### Category D: Version Number Management Failures

**Duplicate versions (same number used by different commits):**
- **v3.20**: Westminster rename (`31d5ad5`) and treatment reminders (`f58378a`) — parallel branches forked from same base
- **v3.28**: Image optimization (`824581d`) and its revert (`b034640`) — revert reused version instead of incrementing
- **v3.41**: Corpsebearer pay cap (`925b09e`) and noble expenses (`3e5aa00`) — parallel branches again

**Skipped versions:**
- **v3.29, v3.30**: Exist in non-merge commits (impressment branch) but appear skipped in the mainline merge sequence
- **v3.32**: Marriage widget fix says "Bump to v3.32" in body text but the subject line omits it — invisible in standard log searches
- **v3.43**: Skipped entirely (v3.42 → v3.44)

### Category E: Missed Cross-Passage State Updates

| Session | Version | Error |
|---------|---------|-------|
| `01WeS8…` | v3.34 | `$hoh` and `$caretakerLabel` not updated after quarantine household swaps — fix required adding `<<set-hoh>><<set-caretaker>>` in two separate passages |
| `01Cbe9…` | v3.32 | Marriage widget missing `$relationship isnot "married"` guard — three separate passages all needed the check, not just one |
| (various) | v3.24 | Accumulated typos and spacing errors across passages ("unexpeced", "spoonfulls", "Do you you", "now you are now", broken `[[` link) — caught in a bulk cleanup pass |

---

## Part 2: Pattern Analysis

### Root Causes (ranked by frequency)

1. **Insufficient SugarCube parser knowledge** (7 incidents) — The `<<set>>` vs `<<run>>` saga, `<<print>>` in attributes, nested bracket indexing, and `<<while>>` not existing all stem from not knowing the story format's non-obvious limitations.

2. **Incomplete scope analysis** (6 incidents) — Fixing one instance instead of all matching instances (portraits), or modifying a variable without checking all passages that reference it (marriage guard, hoh/caretaker).

3. **Committing before verifying** (3 incidents) — Image URLs committed without checking they resolve; funeral string concatenation committed without tracing output for 1, 2, and 3+ items; Westminster naming committed without checking how the label reads in surrounding prose.

4. **Version tracking breakdown** (6 incidents) — Parallel branches produce collisions; reverts reuse versions; versions mentioned in body but not subject line.

### Sessions with the Most Corrections

| Session | Commits | Issue |
|---------|---------|-------|
| `019aJM…` (Westminster) | 3 | Iterative naming — needed to test in context |
| `013A8q…` (portraits) | 3 | Incomplete initial scope |
| `01WeS8…` (multiple bugs) | 2 | Bugs in same code area missed on first pass |
| `01EwER…` (stats viz) | 2 | Edge case (fled months) not considered |
| `01CT3Q…` (image opt) | 2 | External URL assumption, partial revert |

---

## Part 3: Suggested CLAUDE.md Updates

### Update 1: Expand SugarCube Syntax Gotchas

**Current state:** CLAUDE.md has one gotcha (`<<while>>` doesn't exist).

**Proposed:** Replace the "SugarCube 2 Macro Reference Notes" section with:

```markdown
## SugarCube 2 Syntax Gotchas

Known limitations and pitfalls discovered during development:

- **No `<<while>>` macro.** SugarCube 2 does not have a `<<while>>` loop. Use a C-style `<<for>>` with only a condition instead:
  ```
  /* Wrong — <<while>> does not exist */
  <<while _usedNames.includes(_n)>><<set _n to weightedEither($fNames)>><</while>>
  /* Correct — <<for>> with empty init and post */
  <<for ; _usedNames.includes(_n); >><<set _n to weightedEither($fNames)>><</for>>
  ```

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

- **`||` treats 0 as falsy.** `_args[1] || 1` will default to 1 when the argument is legitimately 0. Use `_args[1] ?? 1` or an explicit `undefined` check:
  ```
  /* Wrong — 0 becomes 1 */
  <<set _offset to _args[1] || 1>>
  /* Correct */
  <<set _offset to (typeof _args[1] !== 'undefined') ? _args[1] : 1>>
  ```

- **Don't confuse `<</macro>>` with `</htmltag>`.** SugarCube macros close with `<</ >>`. HTML tags close with `</ >`. Writing `<</span>>` produces a macro-not-found error.
```

### Update 2: Add Pre-Edit Impact Analysis Rule

**Proposed addition** (new section after "Additional guardrails"):

```markdown
## Impact Analysis (mandatory for state/logic changes)

Before editing any passage that reads or writes a `$variable` or calls a `<<widget>>`:

1. **Find all references.** Run `grep -r "variableName" passages/` (after extracting). List every passage that reads, writes, or conditions on the variable.
2. **Check widget callers.** If modifying a widget, find every passage that invokes it: `grep -r "<<widgetName" passages/`.
3. **Verify guards.** If adding a condition or guard (e.g., `$relationship isnot "married"`), check whether the same guard is needed at other call sites. A widget may be called from multiple passages.
4. **Document scope.** Before committing, state which passages were modified AND which were checked-but-not-modified (and why).
```

### Update 3: Add Pre-Commit Verification Steps

**Proposed addition** (new section before "Version Control"):

```markdown
## Pre-Commit Verification (mandatory before patching)

1. **Closing-tag audit.** In every modified passage, count opening and closing tags for `<<if>>/<</if>>`, `<<for>>/<</for>>`, `<<link>>/<</link>>`, and `<<widget>>/<</widget>>`. They must match.
2. **String-building trace.** For any loop that builds a display string (names, lists, descriptions), manually trace the output for 1 item, 2 items, and 3+ items. Verify separators (commas, "and") are concatenated into the string variable, not output as bare inline text.
3. **Edge cases.** For conditional logic, verify behavior when: arrays are empty, variables are `undefined` or `0`, and boundary values are hit.
4. **URL/resource check.** If modifying external URLs (images, links), verify each URL resolves before committing. For Wikimedia Commons, confirm the image resolution supports the requested thumbnail width.
5. **Scope completeness.** For visual or layout changes, search for ALL matching elements across the game (e.g., all portrait-oriented images), not just the one that prompted the task. Prefer one thorough commit over incremental fix-ups.
```

### Update 4: Strengthen Version Number Rules

**Proposed replacement** for the "How to update the version" subsection:

```markdown
### How to update the version

1. **Read the current version** from the HTML file before bumping:
   ```
   grep -oP 'name="Gaming the Great Plague 2026 v\K[^"]+' GamingtheGreatPlague.html
   ```
   Do NOT assume the version from the commit you branched from — a parallel branch may have been merged since then.
2. Increment the minor version number by 1 from whatever the current value is.
3. Save the file.

### Version numbering rules

- **Reverts must increment** to a new version — never reuse the reverted version number.
- **Include the version in the commit subject line**, not just the body (e.g., "Fix X — bump to v3.28"). This ensures versions are visible in `git log --oneline`.
- **Never skip version numbers.** If a branch has multiple commits that each bump the version, all intermediate versions should be sequential.
- **Check for collisions before pushing.** If the version you're about to use already exists in `git log`, increment again.
```

### Update 5: Add "Complete the Fix" Principle

**Proposed addition** (new section after "Pre-Commit Verification"):

```markdown
## Completeness Principle

- **Fix all instances, not just the first.** When a bug or improvement applies to multiple passages (e.g., image layout, missing guards), apply the fix everywhere in a single commit. Search the full passage set before committing.
- **Trace the full code path.** Bugs often have upstream causes and downstream effects. When fixing a widget, check every passage that calls it. When modifying a variable, check every passage that reads it.
- **Test your fix against the original bug.** Mentally simulate the game scenario that triggers the bug and verify the fix resolves it completely — including edge cases like empty arrays, undefined variables, and boundary conditions.
- **One thorough commit beats three incremental ones.** If you find additional issues while working, fix them before committing rather than planning a follow-up.
```

### Update 6: Add Guidance on External Resource Changes

**Proposed addition** (append to "Additional guardrails"):

```markdown
- **Verify external URLs before committing.** If changing image sources, API endpoints, or external links, confirm each URL resolves successfully. For Wikimedia Commons thumbnail URLs, verify the source image dimensions support the requested width — requesting a thumbnail wider than the original produces a 404.
```

---

## Summary

| Suggested Update | Errors It Would Have Prevented |
|---|---|
| Expanded SugarCube gotchas | orderNPCs (x2), stats viz blank, `[object Object]`, `<</span>>`, `\|\|` with 0 |
| Pre-edit impact analysis | Marriage widget (3 passages), hoh/caretaker (2 passages), accumulated typos |
| Pre-commit verification | Missing `<</if>>`, funeral name concat, string-building bugs |
| Stronger version rules | 3 duplicate versions, 4 skipped versions, 1 version missing from subject |
| Completeness principle | Portrait layout (3 commits), Westminster (3 attempts), bug-fix follow-ups |
| External URL verification | Wikimedia thumb URL revert |
