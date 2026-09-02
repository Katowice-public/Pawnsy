import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { explainMove, explainHint, legalDests, needsPromotion } from "../lib/coach.js";
import { evaluateWhite } from "../lib/eval.js";
import { openingName } from "../data/openings.js";
import { think } from "./engine-client.js";
import { addXp, awardBadge, touchStreak } from "../ui/storage.js";

const STRENGTHS = [
  { id: "beginner", label: "Beginner", blurb: "Plays like a fellow learner." },
  { id: "club", label: "Club", blurb: "Solid, a bit forgetful." },
  { id: "coach", label: "Coach", blurb: "Looks further ahead." },
];

export function renderPlay(root, ctx) {
  const settings = ctx.progress.settings || { strength: "club", color: "white" };
  let userColor = settings.color || "white";
  let strength = settings.strength || "club";
  let game = new Chess();
  let board;
  let thinking = false;
  const log = [];

  root.innerHTML = `
    <section class="play-layout">
      <div class="play-main">
        <div class="board-well" id="play-board"></div>
        <div class="play-toolbar">
          <button type="button" class="btn ghost" data-act="back">Take back</button>
          <button type="button" class="btn ghost" data-act="hint">Hint</button>
          <button type="button" class="btn ghost" data-act="flip">Flip</button>
          <button type="button" class="btn" data-act="new">New game</button>
        </div>
      </div>
      <aside class="play-side">
        <div class="eval-shell" aria-hidden="true">
          <div class="eval-fill" id="eval-fill"></div>
        </div>
        <div class="panel">
          <label class="field">
            <span>Your color</span>
            <select id="play-color">
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </label>
          <label class="field">
            <span>Pawnsy's strength</span>
            <select id="play-strength">
              ${STRENGTHS.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}
            </select>
          </label>
          <p class="muted" id="strength-blurb"></p>
        </div>
        <div class="panel coach-panel">
          <div id="coach-box"></div>
          <ol class="move-log" id="move-log"></ol>
        </div>
      </aside>
    </section>
  `;

  const boardRoot = root.querySelector("#play-board");
  const coachBox = root.querySelector("#coach-box");
  const logEl = root.querySelector("#move-log");
  const evalFill = root.querySelector("#eval-fill");
  const colorSel = root.querySelector("#play-color");
  const strengthSel = root.querySelector("#play-strength");
  const blurb = root.querySelector("#strength-blurb");

  colorSel.value = userColor;
  strengthSel.value = strength;
  blurb.textContent = STRENGTHS.find((s) => s.id === strength).blurb;

  board = new Board(boardRoot, {
    orientation: userColor,
    onSelect(square) {
      if (!canUserMove()) return;
      board.setDests(legalDests(game, square));
    },
    onMove({ from, to }) {
      if (!canUserMove()) return;
      if (needsPromotion(game, from, to)) {
        board.askPromotion(game.turn(), (promotion) => applyUser({ from, to, promotion }));
        return;
      }
      applyUser({ from, to });
    },
  });

  function canUserMove() {
    if (thinking || game.isGameOver()) return false;
    const turn = game.turn() === "w" ? "white" : "black";
    return turn === userColor;
  }

  function syncBoard(last) {
    board.setPiecesFromBoard(game.board());
    board.setLastMove(last?.from, last?.to);
    const inCheck = game.inCheck();
    board.setCheck(inCheck ? kingSquare(game, game.turn()) : null);
    const cp = game.isCheckmate() ? (game.turn() === "w" ? -9999 : 9999) : evaluateWhite(game);
    const pct = 50 + 50 * Math.tanh(cp / 380);
    evalFill.style.width = `${pct}%`;
    board.setInteractive(canUserMove());
  }

  function say(text, extra) {
    coachBox.innerHTML = pawnsySays(text, extra);
  }

  function renderLog() {
    logEl.innerHTML = log
      .map((entry) => `<li><strong>${entry.san}</strong> ${entry.note}</li>`)
      .join("");
  }

  function applyUser(move) {
    const before = game.fen();
    const played = game.move(move);
    if (!played) {
      say("That isn't legal from here. If a square has a dot, the piece can go there.");
      return;
    }
    const title = openingName(game.history());
    const exp = explainMove(before, played, game, title);
    log.push({ san: played.san, note: exp.summary });
    renderLog();
    syncBoard(played);
    board.clearSelection();
    if (game.isGameOver()) {
      finishGame();
      return;
    }
    say(exp.text);
    window.setTimeout(reply, 180);
  }

  async function reply() {
    thinking = true;
    syncBoard(game.history({ verbose: true }).at(-1));
    say("Let me think…");
    const move = await think(game.fen(), strength);
    thinking = false;
    if (!move) {
      finishGame();
      return;
    }
    const before = game.fen();
    const played = game.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
    if (!played) {
      say("I got tangled up. Your move — try a hint if you like.");
      syncBoard();
      return;
    }
    const title = openingName(game.history());
    const exp = explainMove(before, played, game, title);
    log.push({ san: played.san, note: move.book ? `Book move. ${exp.summary}` : exp.summary });
    renderLog();
    syncBoard(played);
    if (game.isGameOver()) {
      finishGame();
      return;
    }
    say(move.book ? `I'll stay in a known opening. ${exp.text}` : exp.text);
  }

  function finishGame() {
    board.setInteractive(false);
    touchStreak(ctx.progress);
    ctx.progress.games.played += 1;
    let line = "Game over.";
    if (game.isCheckmate()) {
      const winner = game.turn() === "b" ? "white" : "black";
      if (winner === userColor) {
        ctx.progress.games.wins += 1;
        addXp(ctx.progress, 20);
        awardBadge(ctx.progress, "first-win");
        line = "Checkmate. You win! That was clean.";
      } else {
        ctx.progress.games.losses += 1;
        line = "Checkmate. I got there first — take back a few moves and try another idea.";
      }
    } else {
      ctx.progress.games.draws += 1;
      if (game.isStalemate()) line = "Stalemate. That's a draw — the king is safe but has no legal move.";
      else line = "Draw. Sometimes the honest result is a handshake.";
    }
    ctx.save();
    say(line, "Start a new game whenever you're ready.");
  }

  function newGame() {
    game = new Chess();
    log.length = 0;
    renderLog();
    board.setOrientation(userColor);
    syncBoard();
    say(
      userColor === "white"
        ? "You have White. Center, develop, castle — I'll play along and talk you through it."
        : "You have Black. I'll open, then it's your turn to answer in the center.",
    );
    if (userColor === "black") window.setTimeout(reply, 250);
  }

  root.querySelector("[data-act=new]").addEventListener("click", newGame);
  root.querySelector("[data-act=flip]").addEventListener("click", () => {
    board.setOrientation(board.orientation === "white" ? "black" : "white");
  });
  root.querySelector("[data-act=back]").addEventListener("click", () => {
    if (thinking) return;
    game.undo();
    if (game.history().length && !canUserMove()) game.undo();
    log.splice(game.history().length);
    renderLog();
    syncBoard(game.history({ verbose: true }).at(-1));
    say("Let's try that position again.");
  });
  root.querySelector("[data-act=hint]").addEventListener("click", async () => {
    if (!canUserMove()) return;
    say("Looking for a constructive idea…");
    const move = await think(game.fen(), "coach");
    if (!move) return;
    board.setArrows([[move.from, move.to]]);
    say(explainHint(game.fen(), move));
  });

  colorSel.addEventListener("change", () => {
    userColor = colorSel.value;
    ctx.progress.settings.color = userColor;
    ctx.save();
    newGame();
  });
  strengthSel.addEventListener("change", () => {
    strength = strengthSel.value;
    ctx.progress.settings.strength = strength;
    blurb.textContent = STRENGTHS.find((s) => s.id === strength).blurb;
    ctx.save();
  });

  newGame();
}
