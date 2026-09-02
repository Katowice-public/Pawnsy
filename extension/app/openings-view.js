import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { legalDests, needsPromotion } from "../lib/coach.js";
import { OPENINGS } from "../data/openings.js";
import { addXp, awardBadge, touchStreak } from "../ui/storage.js";

export function renderOpenings(root, ctx, id) {
  if (id) {
    const opening = OPENINGS.find((o) => o.id === id);
    if (!opening) {
      root.innerHTML = `<section class="page"><p>Unknown opening. <a href="#/openings">Opening lab</a></p></section>`;
      return;
    }
    renderDrill(root, ctx, opening);
    return;
  }

  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Opening lab</p>
        <h1>Play the book moves</h1>
        <p>You take the side that owns the idea. Pawnsy plays the other half of the line and explains each ply.</p>
      </header>
      <div class="card-grid">
        ${OPENINGS.map((o) => {
          const done = Boolean(ctx.progress.openings[o.id]);
          return `<a class="card ${done ? "is-done" : ""}" href="#/openings/${o.id}">
            <span class="card-kicker">${o.eco}${done ? " · drilled" : ""}</span>
            <strong>${o.name}</strong>
            <span>${o.summary}</span>
          </a>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderDrill(root, ctx, opening) {
  const userIsWhite = opening.color === "white";
  let game = new Chess();
  let ply = 0;

  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/openings">Openings</a> · ${opening.eco}</p>
        <h1>${opening.name}</h1>
        <div class="board-well" id="op-board"></div>
      </div>
      <aside class="lesson-side">
        <ul class="idea-list">${opening.ideas.map((idea) => `<li>${idea}</li>`).join("")}</ul>
        <div id="op-speech"></div>
        <div class="lesson-actions">
          <button type="button" class="btn ghost" id="op-reset">Restart line</button>
          <a class="btn ghost" href="#/openings">All openings</a>
        </div>
      </aside>
    </section>
  `;

  const speech = root.querySelector("#op-speech");
  const board = new Board(root.querySelector("#op-board"), {
    orientation: userIsWhite ? "white" : "black",
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

  function noteFor(san) {
    return opening.notes[san] || `${san} continues the line.`;
  }

  function playReply() {
    if (ply >= opening.line.length) return finish();
    const turnWhite = game.turn() === "w";
    if (turnWhite === userIsWhite) {
      speech.innerHTML = pawnsySays(`Your move. The book wants ${opening.line[ply]}.`, noteFor(opening.line[ply]));
      return;
    }
    const played = game.move(opening.line[ply]);
    ply += 1;
    paint(played);
    if (ply >= opening.line.length) return finish();
    speech.innerHTML = pawnsySays(noteFor(played.san), `Now play ${opening.line[ply]}.`);
  }

  function tryMove(from, to, promotion) {
    const expected = opening.line[ply];
    const played = game.move({ from, to, promotion: promotion || "q" });
    if (!played) return;
    const got = played.san.replace(/[+#]/g, "");
    const want = expected.replace(/[+#]/g, "");
    if (got !== want && played.san !== expected) {
      game.undo();
      paint();
      speech.innerHTML = pawnsySays(`Hold on — the line goes ${expected}.`, noteFor(expected));
      return;
    }
    ply += 1;
    paint(played);
    speech.innerHTML = pawnsySays(noteFor(played.san));
    window.setTimeout(playReply, 280);
  }

  function finish() {
    board.setInteractive(false);
    touchStreak(ctx.progress);
    if (!ctx.progress.openings[opening.id]) {
      ctx.progress.openings[opening.id] = Date.now();
      addXp(ctx.progress, 12);
    }
    if (Object.keys(ctx.progress.openings).length >= 3) awardBadge(ctx.progress, "openings-3");
    ctx.save();
    speech.innerHTML = pawnsySays(
      "That's the skeleton of the opening. Play it vs me in a full game and notice when the ideas still apply after the book ends.",
    );
  }

  function restart() {
    game = new Chess();
    ply = 0;
    board.setInteractive(true);
    paint();
    speech.innerHTML = pawnsySays(opening.summary, opening.ideas[0]);
    playReply();
  }

  root.querySelector("#op-reset").addEventListener("click", restart);
  restart();
}
