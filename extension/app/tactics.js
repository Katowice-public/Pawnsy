import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { legalDests, needsPromotion } from "../lib/coach.js";
import { THEMES, activePuzzles, dailyPuzzle, puzzleById, puzzlesByTheme } from "../data/puzzles.js";
import { addXp, awardBadge, touchStreak } from "../ui/storage.js";
import { journalThemes } from "../lib/journal.js";
import { noteDailyThree } from "../lib/daily.js";

export function renderTactics(root, ctx, id) {
  if (id === "daily") {
    renderPuzzle(root, ctx, dailyPuzzle());
    return;
  }
  if (id) {
    const puzzle = puzzleById(id);
    if (!puzzle) {
      root.innerHTML = `<section class="page"><p>Puzzle missing. <a href="#/tactics">Tactics gym</a></p></section>`;
      return;
    }
    renderPuzzle(root, ctx, puzzle);
    return;
  }

  const solved = ctx.progress.puzzles.solvedIds || {};
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Tactics gym</p>
        <h1>Find the shot</h1>
        <p>Short positions, one clear idea. ${ctx.progress.puzzles.solved} solved · ${ctx.progress.puzzles.attempted} tried</p>
      </header>
      <a class="card featured" href="#/tactics/daily">
        <span class="card-kicker">Today</span>
        <strong>${dailyPuzzle().title}</strong>
        <span>${labelTheme(dailyPuzzle().theme)} · a fresh position every UTC day</span>
      </a>
      <div class="chip-row" id="theme-row">
        ${THEMES.map((t) => `<button type="button" class="chip" data-theme="${t.id}">${t.label}</button>`).join("")}
        ${ctx.progress.journal?.length ? `<button type="button" class="chip" data-theme="misses">Your misses</button>` : ""}
      </div>
      <div class="card-grid" id="puzzle-grid"></div>
    </section>
  `;

  const grid = root.querySelector("#puzzle-grid");
  const missThemes = new Set(journalThemes(ctx.progress.journal).map((t) => t.id));
  const paint = (theme) => {
    let list = puzzlesByTheme(theme === "misses" ? "all" : theme);
    if (theme === "misses") {
      list = list.filter((p) => missThemes.has(p.theme));
      if (!list.length) list = puzzlesByTheme("hanging");
    } else if (theme === "all" && missThemes.size) {
      list = [...list].sort((a, b) => Number(missThemes.has(b.theme)) - Number(missThemes.has(a.theme)));
    }
    grid.innerHTML = list
      .map((p) => {
        const done = Boolean(solved[p.id]);
        return `<a class="card ${done ? "is-done" : ""}" href="#/tactics/${p.id}">
          <span class="card-kicker">${done ? "Solved" : labelTheme(p.theme)}</span>
          <strong>${p.title}</strong>
        </a>`;
      })
      .join("");
  };
  paint("all");
  root.querySelector("#theme-row").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-theme]");
    if (!btn) return;
    for (const el of root.querySelectorAll(".chip")) el.classList.toggle("is-on", el === btn);
    paint(btn.dataset.theme);
  });
  root.querySelector('[data-theme="all"]').classList.add("is-on");
}

function labelTheme(id) {
  return THEMES.find((t) => t.id === id)?.label || id;
}

function renderPuzzle(root, ctx, puzzle) {
  const game = new Chess(puzzle.fen);
  let ply = 0;
  const answers = puzzle.solution;

  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/tactics">Tactics</a> · ${labelTheme(puzzle.theme)}</p>
        <h1>${puzzle.title}</h1>
        <div class="board-well" id="pz-board"></div>
      </div>
      <aside class="lesson-side">
        <div id="pz-speech"></div>
        <div class="lesson-actions">
          <button type="button" class="btn ghost" id="pz-hint">Hint</button>
          <button type="button" class="btn ghost" id="pz-reset">Reset</button>
          <a class="btn" id="pz-next" href="#/tactics">More puzzles</a>
        </div>
      </aside>
    </section>
  `;

  const speech = root.querySelector("#pz-speech");
  const side = game.turn() === "w" ? "White" : "Black";
  speech.innerHTML = pawnsySays(`${side} to move. One idea wins — find it.`, "Play the move on the board.");

  const board = new Board(root.querySelector("#pz-board"), {
    orientation: game.turn() === "w" ? "white" : "black",
    onSelect(square) {
      board.setDests(legalDests(game, square));
    },
    onMove({ from, to }) {
      if (needsPromotion(game, from, to)) {
        board.askPromotion(game.turn(), (promotion) => tryMove(from, to, promotion));
        return;
      }
      tryMove(from, to);
    },
  });

  function paint(last) {
    board.setPiecesFromBoard(game.board());
    board.setLastMove(last?.from, last?.to);
    board.setCheck(game.inCheck() ? kingSquare(game, game.turn()) : null);
    board.clearSelection();
  }

  function tryMove(from, to, promotion) {
    const played = game.move({ from, to, promotion: promotion || "q" });
    if (!played) return;
    const expected = answers[ply];
    const alts = puzzle.alt || [];
    const match = sameMove(played, expected) || alts.some((san) => sameMove(played, san));
    paint(played);
    if (!match) {
      ctx.progress.puzzles.attempted += 1;
      ctx.save();
      speech.innerHTML = pawnsySays("That's legal, but it isn't the idea. Reset and look again.");
      board.setInteractive(false);
      return;
    }
    ply += 1;
    if (ply >= answers.length) {
      finish(true);
      return;
    }
    const reply = game.move(answers[ply]);
    ply += 1;
    paint(reply);
    speech.innerHTML = pawnsySays("Yes. Now finish it.");
  }

  function finish(won) {
    board.setInteractive(false);
    touchStreak(ctx.progress);
    ctx.progress.puzzles.attempted += 1;
    if (won && !ctx.progress.puzzles.solvedIds[puzzle.id]) {
      ctx.progress.puzzles.solved += 1;
      ctx.progress.puzzles.solvedIds[puzzle.id] = Date.now();
      addXp(ctx.progress, 8);
      awardBadge(ctx.progress, "first-puzzle");
      if (ctx.progress.puzzles.solved >= 10) awardBadge(ctx.progress, "puzzles-10");
    }
    noteDailyThree(ctx.progress, "puzzle", puzzle.id);
    ctx.save();
    speech.innerHTML = pawnsySays(won ? puzzle.explain : "Have another look.", won ? "The pattern will show up in your games." : "");
  }

  root.querySelector("#pz-hint").addEventListener("click", () => {
    speech.innerHTML = pawnsySays(puzzle.hint);
  });
  root.querySelector("#pz-reset").addEventListener("click", () => {
    renderPuzzle(root, ctx, puzzle);
  });

  paint();
}

function sameMove(played, san) {
  if (!san) return false;
  const a = played.san.replace(/[+#]/g, "");
  const b = san.replace(/[+#]/g, "");
  return a === b || played.san === san;
}

export { activePuzzles };
