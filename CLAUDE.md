# CLAUDE.md

## Project Overview

This repository contains **Gaming the Great Plague**, an interactive fiction game built with [Twine 2](https://twinery.org/) using the [SugarCube 2.37.3](https://www.motoslave.net/sugarcube/2/) story format. The project is a single self-contained HTML file that runs directly in a web browser.

**Author:** Jessica Otis
**Co-authors:** Stephanie Grimm, Alexandra Miller, Nathan Sleeter

## Repository Structure

```
/
├── CLAUDE.md                      # This file — guidance for AI assistants
├── GamingtheGreatPlague.html      # Complete Twine game (single-file, ~1.2 MB)
├── extract.js                     # Extracts <tw-passagedata> elements to passages.json
├── patch.js                       # Patches modified passage content back into the HTML
└── README.md                      # Project description and play instructions
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

## Working with Twine Passage Content

When asked to **analyze, review, search, or edit** passage text from the Twine file, you **must** use the extract/patch workflow described below. **Never** read, parse, or edit `GamingtheGreatPlague.html` directly for passage work.

### Extract → Analyze → Patch workflow

1. **Extract** — Run `node extract.js` to produce `passages.json` from the HTML file. This is your sole working copy of passage data.
2. **Analyze / Edit** — Perform all reading, searching, and editing against `passages.json`. Never open or modify the HTML file for passage content.
   - **`passages.json` is large** (generally exceeds 256 KB). Do not attempt to read the entire file at once. Use the `offset` and `limit` parameters to read specific portions, or use the Grep tool to search for specific content by keyword or passage name.
3. **Patch** — When edits are complete, run `node patch.js` to write changes back into the HTML.

### Pre-patch safety rules (mandatory before running `node patch.js`)

1. **List every pid you modified.** Before executing `patch.js`, explicitly state which `pid` values were changed and summarize what changed in each.
2. **Never touch passages you did not explicitly analyze.** If a passage was not part of the current task, its `content` field in `passages.json` must remain byte-identical to what `extract.js` produced. Do not reformat, re-encode, or "clean up" unrelated passages.
3. **Never alter `<tw-storydata>` wrapper attributes.** The attributes on the `<tw-storydata>` element (`name`, `startnode`, `creator`, `creator-version`, `format`, `format-version`, `ifid`, `options`, `tags`, `zoom`, `hidden`) are managed by Twine and must never be modified. `patch.js` only replaces inner text of `<tw-passagedata>` elements matched by `pid` — do not change this behavior.

### Additional guardrails

- **Do not reconstruct or rewrite** `<tw-storydata>` or any `<tw-passagedata>` opening/closing tags. `patch.js` preserves them automatically.
- **Passage matching is by `pid`, not by `name`.** Passage names can change; `pid` is the stable identifier.
- **Preserve verbatim encoding.** Passage content in the HTML uses HTML-entity encoding (e.g., `&lt;&lt;nobr&gt;&gt;`). The extract/patch scripts handle this transparently — do not manually re-encode or decode content in `passages.json`.
- After patching, `passages.json` is a **transient artifact** and should not be committed to the repository. Only the updated HTML file should be committed.

## Version Control (Game Title)

The game title includes a version number in the format **"Gaming the Great Plague 2026 vX.Y"**. The current version is stored in the `<tw-storydata>` element's `name` attribute in `GamingtheGreatPlague.html` (e.g., `name="Gaming the Great Plague 2026 v1.1"`).

### Mandatory version bump rule

**Whenever you edit the game file** (`GamingtheGreatPlague.html`) — whether through the extract/patch workflow or any other means — you **must** increment the minor version number in the game title (e.g., `v1.1` → `v1.2`, `v1.9` → `v1.10`). This applies to every commit that modifies the game file.

### How to update the version

The version string is in the `<tw-storydata name="...">` attribute, **not** in passage content. Since `patch.js` only updates passage content (inner text of `<tw-passagedata>` elements), updating the version requires **direct editing of the HTML file**:

1. Open `GamingtheGreatPlague.html` in a text editor.
2. Locate the `<tw-storydata>` opening tag (near the beginning of the file).
3. Find the `name` attribute, which contains the full game title including version (e.g., `name="Gaming the Great Plague 2026 v1.1"`).
4. Increment the minor version number by 1 (the number after the dot).
5. Save the file.
6. Include the new version number in your commit message (e.g., "Update X — bump to v1.2").

### Important notes

- Only increment the **minor** version (the number after the dot). Do not change the major version unless explicitly asked by the user.
- If multiple passage edits are made in a single session, only bump the version **once** per commit, not once per passage edit.
- **This is one of the rare exceptions** where direct HTML editing is necessary, since the `<tw-storydata>` attributes cannot be modified through the extract/patch workflow.

## SugarCube 2 Macro Reference Notes

Known limitations and gotchas discovered during development:

- **No `<<while>>` macro.** SugarCube 2 does not have a `<<while>>` loop. Use a C-style `<<for>>` with only a condition instead:
  ```
  /* Wrong — <<while>> does not exist */
  <<while _usedNames.includes(_n)>><<set _n to weightedEither($fNames)>><</while>>
  /* Correct — <<for>> with empty init and post */
  <<for ; _usedNames.includes(_n); >><<set _n to weightedEither($fNames)>><</for>>
  ```
  The body executes as long as the condition is true; if the condition is false on first entry the body is skipped entirely, matching typical while-loop semantics.

## Git Conventions

- **Primary branch:** `master`
- **Remote:** `origin`
- The repository has a single initial commit. Keep commit messages descriptive of content changes (e.g., narrative updates, gameplay fixes).
