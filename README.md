# Pawnsy

A Chrome extension that helps you **learn chess** — not by shouting engine lines at you, but by walking through ideas on a board.

Pawnsy is a small coach with a pawn's ambitions: lessons you play through, tactics with explanations, opening drills, and a talking opponent who tells you what a move did.

## What you get

- **Academy** — the board, every piece, special moves, opening principles, forks, pins, and checkmate patterns. You make the moves.
- **Tactics gym** — mate in one, forks, pins, skewers, hanging pieces, discovered checks. A daily puzzle rotates with the date.
- **Opening lab** — Italian, Ruy Lopez, Sicilian, Queen's Gambit, London, French, King's Indian, Caro-Kann. You play the book; Pawnsy plays the other side and says why.
- **Play vs Pawnsy** — three strengths (Beginner, Club, Coach), hints, takebacks, and a running explanation after every ply. Optional spoken coach.
- **Chess.com & Lichess voice** — a small overlay watches the board and **talks through the move that just happened** (ideas, hanging pieces, checks). It does **not** overlay engine best-moves during live games.

Progress (XP, streak, badges) stays on your machine via `chrome.storage`.

## Install (Chrome, Edge, Brave)

1. Clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `extension/` folder.
5. Pin Pawnsy from the puzzle-piece menu. The popup jumps into Academy, the daily puzzle, or a game.

On first install, Pawnsy opens the full trainer tab.

## Try it without loading the extension

From the repo root:

```bash
npm test
npm start
```

Then open [http://localhost:5173/app/index.html](http://localhost:5173/app/index.html). Progress falls back to `localStorage`.

To hear the site coach without Chess.com, open [http://localhost:5173/content/demo.html](http://localhost:5173/content/demo.html) and play 1.e4 / 1…e5 / 2.Nf3.

## How it's built

- Manifest V3 extension (popup + full-page app + service worker + content scripts).
- Rules of chess via [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause), vendored in `extension/vendor/`.
- A small alpha-beta engine with an opening book — enough to teach, not a cheating tool.
- On Chess.com and Lichess, Pawnsy **explains moves after they are played**. It will not draw engine arrows or whisper the best move in a live rated game.

## Tests

```bash
npm test
```

Curriculum tests load every lesson FEN and puzzle solution. Engine tests check mate-in-one, hanging pieces, and fork detection.
