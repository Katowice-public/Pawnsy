# Pawnsy

A Chrome (and Firefox MV3) extension that helps you **learn chess** — not by shouting engine lines at you, but by walking through ideas on a board.

Pawnsy is a small coach with a pawn's ambitions: lessons you play through, tactics with explanations, opening drills, and a talking opponent who tells you what a move did.

## What you get

- **Academy** — the board, every piece, special moves, opening principles, forks, pins, checkmate patterns, endgames (opposition, Lucena, Philidor), and a trap library. The pack lives in the extension, so it still works **offline** after you load it.
- **Today's three** — one lesson, one puzzle, one opening ply, rotating with the UTC date.
- **Tactics gym** — mate in one, forks, pins, skewers, hanging pieces, discovered checks. A daily puzzle, a 3-minute rush-lite, and a “your misses” filter fed by the journal.
- **Opening lab** — Italian, Ruy Lopez, Sicilian, Queen's Gambit, London, French, King's Indian, Caro-Kann. Star lines into a personal repertoire.
- **Play vs Pawnsy** — three strengths that adapt after win/loss streaks, hints, takebacks, human move-quality labels (“this loses a pawn”), optional spoken coach. A beginner lock can hide eval, hints, and takebacks.
- **Lab** — post-game PGN review with voice, mistake journal + Anki TSV, guess-the-move on master fragments, board-vision drills, classroom share codes, a 14-day first-tournament course, and a privacy log.
- **Chess.com & Lichess voice** — a small overlay watches the board and **talks through the move that just happened** (ideas, hanging pieces, king safety). It does **not** overlay engine best-moves during live games. Optional (off by default): analysis-page coaching, and silence in bullet / low clock. New-tab hijack is **not** installed; bookmark Today's page if you want a dashboard.

Progress (XP, streak, badges, journal) stays on your machine via `chrome.storage`. Puzzle attempts produce a rough rating estimate on the Progress page. Nothing in the privacy log stores moves or FENs.

## Install (Chrome, Edge, Brave)

1. Clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `extension/` folder.
5. Pin Pawnsy from the puzzle-piece menu.

On first install, Pawnsy opens the full trainer tab.

## Firefox

The manifest includes `browser_specific_settings.gecko`. In Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → pick `extension/manifest.json`. Spoken coach uses the browser TTS permission.

Safari can load a similar MV3 package via the appropriate converter; Pawnsy does not ship a separate Safari target.

## Try it without loading the extension

From the repo root:

```bash
npm test
npm start
```

Then open [http://localhost:5173/app/index.html](http://localhost:5173/app/index.html). Progress falls back to `localStorage`.

To hear the site coach without Chess.com, open [http://localhost:5173/content/demo.html](http://localhost:5173/content/demo.html) and play 1.e4 / 1…e5 / 2.Nf3.

Optional dashboard (not a forced new tab): [http://localhost:5173/app/newtab.html](http://localhost:5173/app/newtab.html) jumps to Today's three.

## Fair play

- Live games: Pawnsy explains **after** a move is played. No engine arrows, no whispered best move.
- Analysis / study / broadcast pages: coaching is **off** until you opt in from the popup.
- The local sandbox (“a calmer try was…”) runs only on a **finished** PGN in the Review screen.

## How it's built

- Manifest V3 extension (popup + full-page app + service worker + content scripts).
- Rules of chess via [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause), vendored in `extension/vendor/`.
- A small alpha-beta engine with an opening book — enough to teach, not a cheating tool.
- Voice locales: English, Spanish, French, German (overlay chrome + TTS language; move essays stay in English).
- Woman or man voice, plus warm / calm / bright / hype / firm-coach tones. Pawnsy picks the most natural system voice it can find and speaks in short sentences instead of one robotic paragraph.
- Large captions even when voice is muted.

## Tests

```bash
npm test
```

Curriculum tests load every lesson FEN and puzzle solution. Engine tests check mate-in-one, hanging pieces, and fork detection. Feature tests cover human eval labels, classroom codes, PGN review, and the 14-day course.
