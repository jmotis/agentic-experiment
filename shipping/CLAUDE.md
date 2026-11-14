# CLAUDE.md — Shipping game ("Learning the Ropes")

This folder holds a second Twine 2 / SugarCube 2.37.3 game, `Shipping.html`. The rules in the
repository-root `CLAUDE.md` apply here too, with these differences:

- **Extract/patch from this folder.** Run `node extract.js` and `node patch.js` inside `shipping/`.
  They read and write `shipping/Shipping.html` and use `shipping/passages/` and
  `shipping/passage-index.json` (both transient and git-ignored).
- **There is no Claude-widgets passage or glossary-widgets passage.** New `<<widget>>` blocks go in
  the existing widget passage they belong with (e.g. `032-char-gen-widgets.txt`, `035-Money-widgets.txt`);
  new `def*` definition widgets go in `039-Definitions.txt`.
- `variables.md` describes the plague game only; it does not cover this game's variables.

## Recording decisions (`$decisions`)

The End passage shows "The Impact of Your Decisions", built from `$decisions` by the `<<decision-report>>`
widget (Money widgets, pid 35). This parallels the plague game's report, but works differently: instead of
passing the effects to a widget, a recorded choice is **bracketed** and the record stores what actually
changed.

- In `<<link>>` / `<<replace>>` code, put `<<decision-start>>` before the choice's effects and
  `<<decision-end "text" deathPct>>` after them (`deathPct` optional: the % chance the choice kills the
  player). Text can be an expression: ``<<decision-end `"Married a woman in " + $location`>>``.
- In `[[text->Passage][setter]]` links, call the functions in the setter:
  `[[...][setup.decisionStart(); $money -= 30; setup.decisionEnd("Bought trousers at auction")]]`.
- The record captures the real change in `$money`, `$depmoney` (shown as "Sent home"), `$reputation`
  and `$skill` between the two calls, so the game's existing effects stay as written. Don't add the
  amounts by hand.
- Reputation is clamped to 0–10 by both calls and at every passage start (story JavaScript). Don't add
  separate clamps.
- The time label ("Voyage 2, month 3 at sea", "After voyage 1, in port at Boston", …) comes from
  `setup.decisionWhen()` in the story JavaScript, using the passage name, `$voyage` (incremented at the
  top of Commission and Recommission) and `$location`.
- Record a new choice if it changes money, reputation, skill or `$depmoney`, carries a death risk, or is a
  major story choice. Also record the "decline" side when the other option has an effect. Don't record
  links that only continue the story or show an outcome.

## Version number

The version lives in the `<tw-storydata name="Shipping vX.Y">` attribute **and** the page
`<title>Shipping vX.Y</title>`; update both together. The sidebar title shown to players comes from the
`gameTitle` passage ("Learning the Ropes") and is not versioned.

Twine also bakes the story name into the embedded SugarCube engine (`generateName("Shipping")`). That
copy sets the browser-tab title at runtime **and** the save-slot ID, so leave it as `"Shipping"`:
changing it would orphan every player's saved games on each version bump. As a result the tab shows
"Shipping" without the version; the version is visible in the story data (and in Twine's library).

**Re-exporting from Twine rewrites it** to the current story name (e.g. `generateName("Shipping v1.25")`).
After any Twine re-export, set it back to `generateName("Shipping")` (a direct HTML edit) before
committing:

```
grep -o 'generateName("[^"]*")' Shipping.html
```

Read the current version before bumping:

```
grep -oP 'name="Shipping v\K[^"]+' Shipping.html
```

Every commit that modifies `Shipping.html` bumps the minor version once (v1.0 → v1.1 → …), and the new
version goes in the commit subject line. The other version rules in the root `CLAUDE.md` (no skipped
numbers, reverts get a new number, check `git log` for collisions) apply as written.
