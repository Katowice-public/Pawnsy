import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { explainMove, explainHint, hangingPieces, legalDests, needsPromotion } from "../lib/coach.js";
import { evaluateWhite } from "../lib/eval.js";
import { openingName } from "../data/openings.js";
import { think } from "./engine-client.js";
import { speakCoach } from "../lib/voice.js";
import { addXp, adaptPlayStrength, awardBadge, logPrivacy, touchStreak } from "../ui/storage.js";
import { voiceOptions, withPersona } from "../lib/i18n.js";
import { previewLine } from "../lib/voice-style.js";
import { kingSafetySentence } from "../lib/king-safety.js";
import { labelMoveQuality, swingForMover } from "../lib/human-eval.js";
import { addJournalEntry, hangingNote } from "../lib/journal.js";
import { copyText, shareText } from "../lib/share.js";
import { pgnFromSans } from "../lib/review-game.js";

const STRENGTHS = [
  { id: "beginner", label: "Beginner", blurb: "Plays like a fellow learner." },
  { id: "club", label: "Club", blurb: "Solid, a bit forgetful." },
  { id: "coach", label: "Coach", blurb: "Looks further ahead." },
];

export function renderPlay(root, ctx) {
  const settings = ctx.progress.settings || { strength: "club", color: "white" };
  const lock = Boolean(settings.parentalLock);
  let userColor = settings.color || "white";
  let strength = lock ? "beginner" : settings.strength || "club";
  let game = new Chess();
  let board;
  let thinking = false;
  let lastLine = "";
  const log = [];

  root.innerHTML = `
    <section class="play-layout">
      <div class="play-main">
        <div class="board-well" id="play-board"></div>
        <div class="play-toolbar">
          <button type="button" class="btn ghost" data-act="back" ${lock ? "hidden" : ""}>Take back</button>
          <button type="button" class="btn ghost" data-act="hint" ${lock ? "hidden" : ""}>Hint</button>
          <button type="button" class="btn ghost" data-act="flip">Flip</button>
          <button type="button" class="btn ghost" data-act="share">Share position</button>
          <button type="button" class="btn ghost" data-act="review" hidden>Review this game</button>
          <button type="button" class="btn" data-act="new">New game</button>
        </div>
      </div>
      <aside class="play-side">
        <div class="eval-shell" aria-hidden="true" ${lock ? "hidden" : ""}>
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
          <label class="field" ${lock ? "hidden" : ""}>
            <span>Pawnsy's strength</span>
            <select id="play-strength">
              ${STRENGTHS.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Pawnsy's voice</span>
            <select id="play-gender">
              <option value="female">Woman</option>
              <option value="male">Man</option>
            </select>
          </label>
          <label class="field">
            <span>Tone</span>
            <select id="play-tone">
              <option value="warm">Warm</option>
              <option value="calm">Calm</option>
              <option value="bright">Bright</option>
              <option value="hype">Hype</option>
              <option value="coach">Firm coach</option>
            </select>
          </label>
          <button type="button" class="btn ghost" id="play-preview-voice">Preview voice</button>
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
  const genderSel = root.querySelector("#play-gender");
  const toneSel = root.querySelector("#play-tone");
  const blurb = root.querySelector("#strength-blurb");

  colorSel.value = userColor;
  strengthSel.value = strength;
  genderSel.value = settings.voiceGender === "male" ? "male" : "female";
  toneSel.value = settings.persona || "warm";
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

  function say(text, extra, speak = true, extraOpts = {}) {
    lastLine = [text, extra].filter(Boolean).join(" ");
    coachBox.innerHTML = pawnsySays(text, extra);
    if (speak && ctx.progress.settings?.voice !== false && text !== "Let me think…") {
      const spoken = withPersona(lastLine, ctx.progress.settings, extraOpts);
      speakCoach(spoken, voiceOptions(ctx.progress.settings));
    }
  }

  function commentOn(before, played) {
    const title = openingName(game.history());
    const exp = explainMove(before, played, game, title);
    const safety = kingSafetySentence(game);
    const prior = new Chess(before);
    const quality = labelMoveQuality(swingForMover(prior, game, played.color));
    const hung = hangingPieces(game, played.color);
    if (hung.length) {
      addJournalEntry(ctx.progress, {
        fen: game.fen(),
        theme: "hanging",
        san: played.san,
        note: hangingNote(hung[0].piece.type, hung[0].sq),
      });
      ctx.save();
    }
    return {
      summary: exp.summary,
      text: [exp.text, safety, quality].filter(Boolean).join(" "),
    };
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
    const exp = commentOn(before, played);
    log.push({ san: played.san, note: exp.summary });
    renderLog();
    syncBoard(played);
    board.clearSelection();
    if (game.isGameOver()) {
      finishGame();
      return;
    }
    say(exp.text, "", true, { ownMove: true });
    window.setTimeout(reply, 180);
  }

  async function reply() {
    thinking = true;
    syncBoard(game.history({ verbose: true }).at(-1));
    say("Let me think…");
    const move = await think(game.fen(), strength, game.history());
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
    const exp = commentOn(before, played);
    log.push({ san: played.san, note: move.book ? `Book move. ${exp.summary}` : exp.summary });
    renderLog();
    syncBoard(played);
    if (game.isGameOver()) {
      finishGame();
      return;
    }
    const talkMore = ctx.progress.settings?.talkOwnMovesMore !== false;
    const line = move.book ? `I'll stay in a known opening. ${exp.text}` : exp.text;
    say(talkMore ? exp.summary : line, talkMore ? "" : "", true, { ownMove: false });
  }

  function finishGame() {
    board.setInteractive(false);
    touchStreak(ctx.progress);
    ctx.progress.games.played += 1;
    let line = "Game over.";
    let result = "draw";
    if (game.isCheckmate()) {
      const winner = game.turn() === "b" ? "white" : "black";
      if (winner === userColor) {
        ctx.progress.games.wins += 1;
        addXp(ctx.progress, 20);
        awardBadge(ctx.progress, "first-win");
        line = "Checkmate. You win! That was clean.";
        result = "win";
      } else {
        ctx.progress.games.losses += 1;
        line = lock
          ? "Checkmate. Try another game — same ideas, slower if you like."
          : "Checkmate. I got there first — take back a few moves and try another idea.";
        result = "loss";
      }
    } else {
      ctx.progress.games.draws += 1;
      if (game.isStalemate()) line = "Stalemate. That's a draw — the king is safe but has no legal move.";
      else line = "Draw. Sometimes the honest result is a handshake.";
    }
    if (!lock) {
      const next = adaptPlayStrength(ctx.progress, result);
      strength = next;
      strengthSel.value = next;
      blurb.textContent = `${STRENGTHS.find((s) => s.id === next).blurb} Strength shifts after win/loss streaks.`;
    }
    ctx.progress.pendingPgn = pgnFromSans(game.history());
    logPrivacy(ctx.progress, "play_finish");
    ctx.save();
    const reviewBtn = root.querySelector("[data-act=review]");
    if (reviewBtn) reviewBtn.hidden = false;
    say(line, "Start a new game whenever you're ready — or review the PGN.");
  }

  function newGame() {
    game = new Chess();
    log.length = 0;
    renderLog();
    board.setOrientation(userColor);
    syncBoard();
    const reviewBtn = root.querySelector("[data-act=review]");
    if (reviewBtn) reviewBtn.hidden = true;
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
  root.querySelector("[data-act=share]").addEventListener("click", async () => {
    const ok = await copyText(shareText(game.fen(), lastLine));
    say(ok ? "Copied the position and my last sentence." : shareText(game.fen(), lastLine), "", false);
  });
  root.querySelector("[data-act=review]").addEventListener("click", () => {
    ctx.progress.pendingPgn = pgnFromSans(game.history());
    ctx.save();
    location.hash = "#/review";
  });
  root.querySelector("[data-act=back]").addEventListener("click", () => {
    if (thinking || lock) return;
    game.undo();
    if (game.history().length && !canUserMove()) game.undo();
    log.splice(game.history().length);
    renderLog();
    syncBoard(game.history({ verbose: true }).at(-1));
    say("Let's try that position again.");
  });
  root.querySelector("[data-act=hint]").addEventListener("click", async () => {
    if (!canUserMove() || lock) return;
    say("Looking for a constructive idea…");
    const move = await think(game.fen(), "coach", game.history());
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
  genderSel.addEventListener("change", () => {
    ctx.progress.settings.voiceGender = genderSel.value;
    ctx.save();
  });
  toneSel.addEventListener("change", () => {
    ctx.progress.settings.persona = toneSel.value;
    ctx.save();
  });
  root.querySelector("#play-preview-voice").addEventListener("click", () => {
    ctx.progress.settings.voiceGender = genderSel.value;
    ctx.progress.settings.persona = toneSel.value;
    ctx.save();
    say(previewLine(ctx.progress.settings), "", true);
  });

  newGame();
}
