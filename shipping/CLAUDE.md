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

## Version number

The version lives in the `<tw-storydata name="Shipping vX.Y">` attribute **and** the page
`<title>Shipping vX.Y</title>`; update both together. The sidebar title shown to players comes from the
`gameTitle` passage ("Learning the Ropes") and is not versioned.

Read the current version before bumping:

```
grep -oP 'name="Shipping v\K[^"]+' Shipping.html
```

Every commit that modifies `Shipping.html` bumps the minor version once (v1.0 → v1.1 → …), and the new
version goes in the commit subject line. The other version rules in the root `CLAUDE.md` (no skipped
numbers, reverts get a new number, check `git log` for collisions) apply as written.
