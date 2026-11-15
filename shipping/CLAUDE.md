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

## Where the game logic lives

Game rules are written as **passage code (widgets)**, not story JavaScript. The story JavaScript holds only
the original interface code, the map coordinates (`setup.portCoords`) and the End-screen chart renderer
(`setup.renderFundsChart`, which needs the DOM). Keep it that way: put new rules in widgets.

TwineScript gotcha: `to`, `is`, `not`, `and`, `or`, `eq`, `gt`, `lt`, etc. are operators, so never use
them as object keys (`{to: x}` breaks; the letter record uses `dest`).

## Recording decisions (`$decisions`)

The End passage shows "The Impact of Your Decisions", built from `$decisions` by `<<decision-report>>`
(Money widgets, pid 35). A recorded choice is **bracketed** and the record stores what actually changed:

- Put `<<decision-start>>` before the choice's effects and `<<decision-end "text" deathPct>>` after them,
  inside a `<<link>>` (`deathPct` optional). Text can be an expression:
  ``<<decision-end `"Married a woman in " + $location`>>``.
- For a choice that also moves to a passage, use a `<<link>>` with a target, not `[[…][setter]]`:
  `<<link "Yes, on trousers" `passage()`>><<decision-start>><<set $money -=30>><<decision-end "…">><</link>>`.
- The record captures the real change in `$money`, `$depmoney` ("Sent home"), `$reputation` and `$skill`
  between the two calls (via `$decisionBefore`), so existing effects stay as written.
- Reputation is clamped to 0–10 by both calls and at the start of every passage (the PassageHeader
  passage). A penalty applied while a passage renders, outside a decision, should clamp itself.
- `<<decision-when>>` sets the time label ("Voyage 2, month 3 at sea", …) from the passage, `$voyage`
  (incremented at the top of Commission and Recommission) and `$location`.
- Record a choice if it changes money, reputation, skill or `$depmoney`, carries a death risk, or is a
  major story choice; also the "decline" side when the other option has an effect.

## Month clock, family, pregnancy and news (widgets)

- **Clock:** `$monthsElapsed` drives the funds chart and pregnancies. `<<sea-month>>` ends every Sea Week
  passage; `<<stay-months>>` starts Recommission and Destination Select (months of a stay ashore);
  `<<end-funds>>` starts End; Commission records the first point. All use `<<record-funds>>`.
- **Ageing (silent):** `<<age-month>>`, run each month by `<<advance-months>>`, gives the player (`$agenum`,
  `$birthMonth`; `$age` is re-banded) and every living wife and parent (`agenum`, `birthMonth`) a birthday
  once a year. Children have no `agenum`: their age is `($monthsElapsed - born) / 12`.
- **Pregnancy** (plague-game odds) is per wife NPC (`agenum` 16–30, `pregnant` counter, `announced`,
  `alive`), run month by month by `<<advance-months>>` → `<<pregnancy-month>>` (char-gen-widgets, pid 32).
  A wife conceives with 30% chance in each month you are in her port (stay months, and the port call you
  sail from: `<<port-call-together>>`). Children are NPCs (`son`/`daughter`, `mother` = wife id).
  `<<child-name sex motherId>>` names them: no two living children of one mother share a name until
  she has used every name for that sex; different wives may reuse names, and the starting wife's
  children (Bio2) are named the same way.
- **Parents** (starting family "your parents") are NPCs named "your mother" / "your father" (`relationship`
  `mother`/`father`, `agenum` = your age +20-40 / +20-60, as in the plague game). `<<parent-month>>`
  (run by `<<advance-months>>`) applies the plague game's old-age rule: 60+ dies with 1 in 30 chance a
  month; the news goes by `<<send-news>>` (kind `parent-death`).
- **News reaches you only in port:** `<<send-news>>` posts to `$mail`, addressed to your next port of call
  and arriving after ⅔ of the cargo sailing time (`<<distance-between>>`, which uses `<<distance>>`), or
  in person in her port. `<<read-mail>>` (Arrive in Port, Recommission) delivers it.
- **What you pay for follows what you know:** `<<recount-dependents>>` rebuilds `$depCount` from
  `$depBase` (the starting family's non-NPC members), wives you believe alive (+1 once you know she is
  expecting), children you know of and parents you believe alive. It also rebuilds `$family` ("your wife
  and children", "your mother", …) and sets `$hasfamily` to 0 once nobody is left. Call it after changing any of those.

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
