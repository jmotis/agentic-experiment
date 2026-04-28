# Shipping.html — Bug Fixes

Branch: `claude/debug-shipping-twine-kLIi3`

## Summary

Fixed 24 coding errors in the Twine/SugarCube source for `Shipping.html` across multiple commits on this branch. The fixes fall into five groups:

1. malformed macros that would throw at runtime,
2. broken HTML tags / unbalanced structures,
3. conditional expressions whose JavaScript semantics made them always-truthy,
4. variable-name typos and double-applied side effects,
5. text encoding (curly quotes) that broke HTML attributes.

## Show-stopper macro / tag bugs

| # | Passage | Before | After |
|---|---------|--------|-------|
| 1 | `Sea Week 6` (pid 30) | `<<if $citrus to 0>>` | `<<if $citrus is 0>>` |
| 2 | `Sea Week 2/3/4/5/6` (pids 17, 19, 23, 26, 30) | `<<set $scurvy random(1,3)>>` | `<<set $scurvy to random(1,3)>>` |
| 3 | `mutiny` (pid 28) | `<<$reputation -=6>>` | `<<set $reputation -=6>>` |
| 4 | `Crime` (pid 27) | `<<link "No, I don't need that trouble">>You leave the watch…` (no opening `<<replace>>`, but a closing `<</replace>>` later) | `<<link "No, I don't need that trouble">><<replace "#watch">>You leave the watch…` |
| 5 | `Crime` (pid 27) | `</span` (missing `>`) | `</span>` |
| 6 | `Injury` (pid 20) | `<deffurl "furling">>` (single `<` on opening) | `<<deffurl "furling">>` |
| 7 | `Arrive in Port` (pid 31) | `<<else>>>` (extra `>`) | `<<else>>` |
| 8 | `Time in Port` (pid 37) | `<else>>` (single `<` on opening) | `<<else>>` |

## Always-truthy condition bugs

In SugarCube/JavaScript, `A or "literal"` evaluates as `A || "literal"`; a non-empty string literal is always truthy, so these conditions matched on every iteration and silently shadowed every later branch.

| # | Passage | Before | After |
|---|---------|--------|-------|
| 9 | `Cargo` (pid 39) | `<<elseif $location is "Tripoli" or "Jeddah">>` — every later location (Dacca, Bombay, Livorno, Rio, Martinique, King's Town, …) was rendered as Tripoli/Jeddah cargo | `<<elseif $location is "Tripoli" or $location is "Jeddah">>` |
| 10 | `Sea Week 1` (pid 15) | `<<elseif $role is "able seaman" or "ordinary seaman">>` — branch was always taken once reached, so idlers/captains saw "set to work on repairing the rigging" | `<<elseif $role is "able seaman" or $role is "ordinary seaman">>` |

## Always-truthy `random()` bugs

`random(1, N)` returns a number from 1 to N, all truthy, so a bare `<<if random(1,N)>>` is always true and the matching `<<else>>` is unreachable.

| # | Passage | Before | After |
|---|---------|--------|-------|
| 11 | `Encounter` (pid 22) | `<<if random(1,2)>>It does not get much closer…` | `<<if random(1,2) is 1>>It does not get much closer…` |
| 12 | `Crime` (pid 27) | `<<if random(1,2)>>accuses you of taking it…` | `<<if random(1,2) is 1>>accuses you of taking it…` |
| 13 | `Sea Week 2` (pid 17) | `<<if random(1,3)>>a different tongue<<elseif random(1,3) is 2>>…<<else>>…<</if>>` | `<<if random(1,3) is 1>>a different tongue<<elseif random(1,3) is 2>>…<<else>>…<</if>>` |

## Variable-name and double-application bugs

| # | Passage | Before | After |
|---|---------|--------|-------|
| 15 | `char-gen-widgets` (pid 33) | One `<<elseif>>` clause inside the Jeddah/Basra distance lookup tested `$distance is "Livorno"` — `$distance` is a number and never matches a port name, so Livorno-bound voyages from Jeddah/Basra fell through to `$distance = 1` | `$destination is "Livorno"` |
| 16 | `char-gen-widgets` (pid 33) | The default branch of the catch-all distance fallback wrote `<<set $destination = 5>>` — overwriting the destination string with the number 5 instead of setting the distance | `<<set $distance = 5>>` |
| 18 | `Recommission` (pid 34) | "Meagre landsman" choice applied `<<set $reputation -=3>>` once *inside* the `<<if $skill gte 4>>` (skilled-liar) branch and once *unconditionally* after `<</if>>`. Skilled liars took −6; honest unskilled players took −3 with text accusing them of having "deceived" the crew | The unconditional `-=3` and its accompanying "When the crew find out…deceived them…" sentence are removed. Only the in-branch (skilled-liar) penalty remains |

## Mutiny gate as a fired-once sentinel

| # | Passage | Before | After |
|---|---------|--------|-------|
| 21 | `Sea Week 2/3/4/5/6` (pids 17, 19, 23, 26, 30) | `<<if $mutiny isnot 1>><<set $mutiny to random(1,10)>><</if>><<if $mutiny is 2>><<mutiny>>` — re-rolled `$mutiny` every week unless it had already landed on the value `1`. If it landed on `2`, mutiny fired but the next week's reroll could overwrite the `2`. If it landed on `1`, mutiny never fired again at all | `<<if $mutiny isnot 1 and random(1,10) is 2>><<mutiny>><<set $mutiny to 1>>` — single short-circuited check. Once `$mutiny` is `1` (the fired sentinel), the AND short-circuits and mutiny is permanently skipped on subsequent weeks. `$mutiny` is no longer a random-roll holder; it is purely a "has-fired" sentinel |

## HTML / tag-balance fixes

| # | Passage | Fix |
|---|---------|-----|
| 22 | `Arrive in Port` (pid 31) | Greenhand "No" link in the second branch had been copy-pasted from the sailor branch and ended with a stray `<</replace>><</link>></li>` (no matching opens). Removed |
| 23 | `Arrive in Port` (pid 31) | Two extra `</ul></span>` lines following the line above (already closed by the corrected line 43). Removed |
| 24 | `Sea Week 4` (pid 23) | `<li>[[Slushing the mainmast->Resupply]]<</link>></li>` — wikilink does not open `<<link>>`. Removed the stray `<</link>>` |
| 25 | `Commission` (pid 13) | `<<replace "#try">>You abandon the dream of [[sailing.->End]]</li><</replace>>` had a stray `</li>` *inside* the replace content. Removed |
| 26 | `Commission` (pid 13) | The idler-young / `$fate is 1` branch opens `<ul>` and `<span id="skill">` but never closes the outer `<ul>` before `<<else>>`. Added the missing `</ul>` |
| 27 | `Port Supply` (pid 14) | One choice ended with `</ul><</replace>><</link>></span></li>` (the `</span>` is misplaced after the macro closes). Reordered to the parallel form `</ul></span><</replace>><</link>></li>` |
| 28 | `Definitions` (pid 40) | All curly quotes (U+2018, U+2019, U+201C, U+201D) replaced with straight `'` and `"`. In `data-def="…"` attributes, inner double-quoted phrases (`"Pretty Polly"`, `"port"`, `"quaranta"`, the Spanish Ladies lyric) were rewritten with single quotes (`'Pretty Polly'`, etc.) so the attribute itself stays cleanly delimited; the Three Jolly Rogues lyric in `defrogues` keeps its outer double quotes via the `&quot;` HTML entity because the lyric contains an apostrophe (`Arthur's`). The `deflarboard` widget also had an unterminated `data-def` (no closing `"` before `>`); the closing quote was added |

## Workflow used

1. Extracted all 40 `<tw-passagedata>` elements from `Shipping.html` into individual `.txt` files (with HTML entity decoding).
2. Edited the affected passage files.
3. Re-encoded entities and patched the modified passages back into `Shipping.html` by `pid`. `<tw-storydata>` attributes and unmodified passages were left byte-identical.
4. Verified macro and HTML tag balance across all 40 passages, then confirmed all passages remained intact in the patched HTML.

## Bugs not addressed (from the original audit)

These were flagged in the review but remain open:

- Empty `StoryInit` passage — global variables (`$money`, `$reputation`, `$scurvy`, `$mutiny`, `$citrus`, …) are uninitialized at game start.
- `dependents` widget body is fully commented out — wages are never actually sent home.
- `disposable` widget doubles `$money` instead of computing disposable income.
- `<<unset hasVisited>>` in `Arrive in Port` and `Recommission` tries to unset a built-in function.
- Cook-idler branch in `Sea Week 2` has an empty `<<if>>` body and no forward link (soft-lock for the cook idler).
- `<<defmusk>>` in `Cargo` is called without an argument.
- `if random(1,N) is 1 / elseif random(1,N) is 2 / …` patterns still roll a fresh number for each branch, skewing probabilities; should capture into a temp first.
- `<<defcareeningdock "<<defcareeningdock "careening dock">>">>` in `Resupply` (nested widget with conflicting quotes).
- Several `<<link "…<<def… "…">>…">>` calls with nested double quotes — fragile compared to the outer-single / inner-double pattern.
- `Equator` widget is a placeholder ("NEEDS WORK") and never invoked.
- Song-definition widgets (`defladies`, `defcruelship`, `defgolden`, `defmermaid`, `defrogues`) are defined but never used.
- Typos: `neeedles` (`Injury`), "Do you see out more sailing work" (`Time in Port`).
