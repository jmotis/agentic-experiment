# Shipping.html — Bug Fixes

Branch: `claude/debug-shipping-twine-kLIi3`

## Summary

Fixed coding errors in the Twine/SugarCube source for `Shipping.html` across multiple commits on this branch. The fixes fall into seven groups:

1. malformed macros that would throw at runtime,
2. broken HTML tags / unbalanced structures,
3. conditional expressions whose JavaScript semantics made them always-truthy,
4. variable-name typos and double-applied side effects,
5. text encoding (curly quotes) that broke HTML attributes,
6. probability skew from independent `random()` calls in if/elseif chains,
7. uninitialized globals, missing widget args, nested-comment / nested-widget / nested-link string conflicts, and small text typos.

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

## Probability skew (independent `random()` rolls)

Each of the affected chains used a fresh `random()` call in every `<<elseif>>`, so the second branch only matched if the first had already missed *and* the new roll happened to land on its number, etc. Probabilities decayed geometrically. All such chains now capture the roll once into a temp (`_r`, or `_s` for nested chains) and the `<<elseif>>`s test that temp.

| Passage | Chain |
|---------|-------|
| `Port Supply` (pid 14) | hawker outer 1,3 |
| `Sea Week 1` (pid 15) | green-hand task 1,4 |
| `Sea Week 2` (pid 17) | tongue/race/religion 1,3 |
| `Death` (pid 18) | outer 1,3 + two inner 1,3 (`_r`/`_s`) |
| `Injury` (pid 20) | outer 1,5 (`_r`) + inner 1,3 in the bystander branch (`_s`) |
| `Illness` (pid 21) | outer 1,3 |
| `Encounter` (pid 22) | outer 1,5 (`_r`) + four inner 1,3 chains (`_s`) |
| `Weather` (pid 24) | outer 1,4 (`_r`) + inner 1,4 inside the storm branch (`_s`) |
| `Sea Week 5` (pid 26) | inner 1,3 |
| `Crime` (pid 27) | outer 1,3 |
| `mutiny` (pid 28) | outer 1,5 (Asian-mutiny outcome), 1,3 (grievance source), 1,5 (strike outcome inside agree-to-join, `_s`), 1,5 (post-mutiny outcome), 1,3 (alert-the-mate outcome) |
| `char-gen-widgets` (pid 33) | shipType 1,5 |
| `Time in Port` (pid 37) | inner 1,3 (lives at sea / constellations / news) |

Single-branch `random(1,2) is 1` / `random(1,5) lte 3` / `random(1,3) lte 2` tests (no `<<elseif>>` peer) do not have the skew problem and were left as-is.

## Globals initialized in `StoryInit` (pid 5)

`StoryInit` was an empty passage. Every `$`-prefixed variable used elsewhere in the game is now initialized there with a sensible default:

- numeric → `0`: `$money`, `$reputation`, `$skill`, `$experience`, `$dependents`, `$depmoney`, `$mutiny`, `$mutinypay`, `$scurvy`, `$distance`, `$agenum`, `$hoh`, `$wife`, `$trade`, `$fate`, `$portperiod`, `$number`
- numeric → `1`: `$citrus` — preserves prior behavior where the scurvy gate (`<<if $citrus is 0>>`) only fires when the cook explicitly picks a non-citrus supply
- string → `""`: `$name`, `$aName`, `$oName`, `$location`, `$destination`, `$startport`, `$shipName`, `$shipType`, `$nation`, `$age`, `$gender`, `$race`, `$role`, `$family`, `$idlertask`, `$onation`, `$oshipName`, `$navyname`, `$privateername`, `$measure`, `$side`, `$which`, `$song`
- array → `[]`: `$fumes`, `$remedies`

`$args` is a SugarCube widget built-in and was not initialized.

## Other fixes in this round

| Passage | Fix |
|---------|-----|
| `storyMenu` (pid 7) | Removed the inner `/* … */` markers from the commented-out dependents `<div>` so the outer `/* … */` properly spans the whole block (SugarCube comments do not nest; the inner `*/` was closing the outer comment early and the trailing `*/` was rendering as literal text) |
| `Sea Week 2` (pid 17) | Cook-idler's previously-empty `<<if $idlertask is "cook">>` branch now reads `NTS: add text here` so the cook has a forward path instead of soft-locking |
| `Resupply` (pid 35) | Replaced the nested `<<defcareeningdock "<<defcareeningdock "careening dock">>">>` call with a single `<<defcareeningdock "careening dock">>` |
| `Cargo` (pid 39) | `<<defmusk>>` (no argument) → `<<defmusk "musk">>` |
| `Injury` (pid 20) | Typo `darning neeedles` → `darning needles` |
| `Weather` (pid 24) | Missing space: `<<deffurl "furl">>the` → `<<deffurl "furl">> the` |
| `Time in Port` (pid 37) | Typo "Do you see out more sailing work" → "Do you seek out more sailing work" |
| Nested double-quote `<<link>>` strings | All four occurrences converted from `<<link "...<<def... "x">>...">>` to `<<link '...<<def... "x">>...'>>` (outer single quotes), in `Sea Week 2` (pid 17), `mutiny` (pid 28), and `Sea Week 6` (pid 30, two occurrences) |

## Workflow used

1. Extracted all 40 `<tw-passagedata>` elements from `Shipping.html` into individual `.txt` files (with HTML entity decoding).
2. Edited the affected passage files.
3. Re-encoded entities and patched the modified passages back into `Shipping.html` by `pid`. `<tw-storydata>` attributes and unmodified passages were left byte-identical.
4. Verified macro and HTML tag balance across all 40 passages, then confirmed all passages remained intact in the patched HTML.

## `dependents` widget activated

`Money-widgets` (pid 36):

- `<<dependents>>` body changed from a commented-out no-op to `<<set $depmoney += $money>><<set $money to 0>>` — wages are now actually transferred to the family pool. `+=` (rather than the original commented-out `=`) is used so the family pool accumulates across multiple voyages instead of overwriting on each Recommission.
- `<<conversion>>` widget now accepts an optional argument: `<<conversion>>` still formats `$money` (no-arg call sites unchanged), and `<<conversion $depmoney>>` formats any other amount in £/s/d.

`storyMenu` (pid 7):

- The previously-commented-out Dependents `<div>` is now active and uses `<<conversion $depmoney>>` to display the family pool in £/s/d, parallel to the player's Disposable Income display.

`Arrive in Port` (pid 31, four "Yes, send to family" choices) and `Loading` (pid 38, the unload-pay flow):

- Removed the redundant `<<set $money to 0>>` that ran *before* `<<dependents>>` in these call sites. Previously, `$money` was already 0 by the time the widget tried to capture it (which is one reason the widget had been disabled in the first place). Now `<<dependents>>` runs against the un-zeroed wages and the widget itself zeros `$money` after transferring.

## Family pool monthly drain (Option B — category-aware)

`Money-widgets` (pid 36) — added `<<familyexpenses>>` widget:

```
<<widget "familyexpenses">>
  <<if $family is "your wife">><<set _expense to 360>>           /* £1 10s — solo woman */
  <<elseif $family is "your parents">><<set _expense to 480>>    /* £2 — two adults */
  <<else>><<set _expense to 240 + ($dependents * 120)>>          /* £1 base + 10s per child */
  <</if>>
  <<set $depmoney to Math.clamp($depmoney - _expense, 0, Infinity)>>
<</widget>>
```

The pool is clamped at 0, so the family can't go into "negative savings"; downstream logic can later branch on `$depmoney is 0` if a hardship event chain is added.

Call sites (one per in-game month):

- `Sea Week 1` (pid 15) — top of passage, alongside `<<earnings>>`
- `Sea Week 2/3/4/5` (pids 17, 19, 23, 26) — inside the deepest no-event `<<else>>` branch, alongside `<<earnings>>`
- `Sea Week 6` (pid 30) — inside the "stick it out" `<<replace>>`, alongside `<<earnings>>`
- `Resupply` (pid 35) — top of passage (the mid-voyage stop month)
- `Time in Port` (pid 37) — top of passage (the immediate port month)

The drain fires once per visit. Months where a random event (illness/death/injury/crime/encounter/weather/mutiny) fires currently skip both `<<earnings>>` and `<<familyexpenses>>` — the family is treated as having "missed" that pay-and-eat cycle. This matches the existing earnings semantics; if it should drain regardless, both widgets need to be hoisted above the event chain.

## Bugs not addressed (from the original audit)

These were flagged in the review but remain open:

- `disposable` widget doubles `$money` instead of computing disposable income (and is not currently called from anywhere).
- `<<unset hasVisited>>` in `Arrive in Port` and `Recommission` tries to unset a built-in function.
- The `Sea Week 2` cook branch is no longer a soft-lock but its content is a placeholder (`NTS: add text here`) until the author writes prose for it.
- `Equator` widget is a placeholder ("NEEDS WORK") and never invoked.
- Song-definition widgets (`defladies`, `defcruelship`, `defgolden`, `defmermaid`, `defrogues`) are defined but never used.
- `Time in Port`'s "stay 1–9 more months" link choices currently drain `$depmoney` only once (for the immediate decision month). Proportional multi-month drain via the link setters is a follow-up.
- Family expenses are skipped on event-heavy sea months (matching the existing `<<earnings>>` semantics). If the design wants the family to eat *every* month, both widgets should be hoisted above the event chain.
- No "family hardship" event fires when `$depmoney` reaches 0 — just clamped silently.
