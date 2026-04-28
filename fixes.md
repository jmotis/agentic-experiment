# Shipping.html — Bug Fixes

Branch: `claude/debug-shipping-twine-kLIi3`
Commit: `8ab0e4f`
File changed: `Shipping.html` (16 insertions, 16 deletions)

## Summary

Fixed 13 coding errors in the Twine/SugarCube source for `Shipping.html`. The bugs fall into three groups: malformed macros that would throw at runtime, broken HTML tags, and conditional expressions whose JavaScript semantics made them always-truthy.

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

## Workflow used

1. Extracted all 40 `<tw-passagedata>` elements from `Shipping.html` into individual `.txt` files (with HTML entity decoding).
2. Edited the affected passage files.
3. Re-encoded entities and patched the modified passages back into `Shipping.html` by `pid`. `<tw-storydata>` attributes and the 27 unmodified passages were left byte-identical.
4. Verified each fix in the patched HTML and confirmed all 40 passages remained intact.

## Bugs not addressed (from the original audit)

These were flagged in the review but were out of scope for this commit:

- Empty `StoryInit` passage — global variables (`$money`, `$reputation`, `$scurvy`, `$mutiny`, `$citrus`, …) are uninitialized at game start.
- `dependents` widget body is fully commented out — wages are never sent home.
- `disposable` widget doubles `$money` instead of computing disposable income.
- `<<unset hasVisited>>` in `Arrive in Port` and `Recommission` tries to unset a built-in function.
- Cook-idler branch in `Sea Week 2` has an empty `<<if>>` body and no forward link (soft-lock).
- `Recommission` "meagre landsman" branch applies `$reputation -=3` twice for skilled liars and once unconditionally to honest unskilled players.
- `<<defmusk>>` in `Cargo` is called without an argument.
- Mutiny gating logic re-rolls `$mutiny` whenever it is not `1`.
- `if random(1,N) is 1 / elseif random(1,N) is 2 / …` patterns roll a fresh number for each branch, skewing probabilities; should capture into a temp first.
- HTML tag-balance issues in `Commission`, `Port-Supply`, `Sea-Week-4`, and `Arrive-in-Port` (extra `</li>` / `</ul>` / `</span>` or unclosed parents).
- `<<defcareeningdock "<<defcareeningdock "careening dock">>">>` in `Resupply` (nested widget with conflicting quotes).
- Several `<<link "…<<def… "…">>…">>` calls with nested double quotes — fragile compared to the outer-single / inner-double pattern.
- `Equator` widget is a placeholder ("NEEDS WORK") and never invoked.
- Song-definition widgets (`defladies`, `defcruelship`, `defgolden`, `defmermaid`, `defrogues`) are defined but never used.
- Typos: `neeedles` (`Injury`), "Do you see out more sailing work" (`Time in Port`).
