# Gaming the Great Plague

An browser-based interactive fiction experience built with [Twine 2](https://twinery.org/) and the [SugarCube 2](https://www.motoslave.net/sugarcube/2/) story format. _Gaming the Great Plague_ explores the 1665-1666 Great Plague of London. Players navigate through the story by making choices that shape the narrative.

## Creators

Jessica Otis, Stephanie Grimm, Alexandra Miller, Nathan Sleeter

## How to Play

Either
1. Navigate to the live version of this game via [https://1665plague.rrchnm.org](https://1665plague.rrchnm.org)
2. Download or clone this repository, then open `GamingtheGreatPlague.html` in any modern web browser (Chrome, Firefox, Safari, Edge). No installation, server, or internet connection is required — the game is entirely self-contained in a single HTML file.

## Character Impact on Gameplay

### Tier 1 — Game-Defining

**$socio —** The most impactful variable in the entire game. Determines economics (0d to 17,600d/month income), household composition (0 to 12 servants), flee options (beggars can't flee at all; nobles pay 10,000d), available jobs (plague work forced on lower classes), starting reputation (0–10), and narrative events. Every system checks social class.

**$location / $parish —** Controls when plague arrives (May vs July 1665 — a 2-month difference) and how likely infection is each month via historically-accurate parish-specific rates. Two players in different parishes can face 1-in-23 vs 1-in-335 infection odds in the same month.

### Tier 2 — Major

**$age / $agenum —** The age-16 threshold divides dependent children from autonomous adults. Gates marriage, pregnancy, communion, military service, and church office. Children and elderly have the most distinctive experiences (dependent narratives vs. monthly death risk).

**$gender —** Gates military service (female must disguise), plague work roles (female: searcher/nurse; male: corpsebearer/warder), pregnancy (female only), church office (male only), and impressment protection (female immune).

### Tier 3 — Moderate

**$religion —** Non-Church of England members (< 1% of characters) face a persistent 48d/month fine and -1 reputation drain. Quakers additionally can't volunteer for the Navy. Catholics get unique devotional events. Church office requires Church of England membership.

**$relationship —** Shapes initial household (single: parents + siblings; married: spouse + children). Only married women can become pregnant during gameplay. Servant living arrangements depend on it (single servants live with master).

### Tier 4 — Minor

**$origin —** Almost entirely cosmetic. Affects NPC name pools (5x cultural boosts for Irish, Scottish, Dutch, French names) and flee destination text. The one mechanical effect: foreign-born characters (Dutch Republic, France, elsewhere) can escape naval impressment. Players from "English countryside" (~80% of characters) get the baseline experience with no special mechanics.
