import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { legalDests, needsPromotion } from "../lib/coach.js";
import { LESSONS, lessonById, chapterGroups } from "../data/lessons.js";
import { addXp, awardBadge, touchStreak } from "../ui/storage.js";
import { noteDailyThree } from "../lib/daily.js";

export function renderAcademy(root, ctx) {
  const groups = chapterGroups();
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Academy</p>
        <h1>Learn the game in small scenes</h1>
        <p>Each lesson is a few minutes on one idea. Play the moves on the board — reading alone will not stick. The whole Academy pack lives in the extension, so it still works offline after you load it.</p>
      </header>
      ${groups
        .map(
          (group) => `
        <div class="chapter">
          <h2>${group.chapter}</h2>
          <div class="card-grid">
            ${group.lessons
              .map((lesson) => {
                const done = Boolean(ctx.progress.completedLessons[lesson.id]);
                return `<a class="card ${done ? "is-done" : ""}" href="#/academy/${lesson.id}">
                  <span class="card-kicker">${done ? "Reviewed" : `${lesson.minutes} min`}</span>
                  <strong>${lesson.title}</strong>
                  <span>${lesson.blurb}</span>
                </a>`;
              })
              .join("")}
          </div>
        </div>`,
        )
        .join("")}
    </section>
  `;
}

export function renderLesson(root, ctx, id) {
  const lesson = lessonById(id);
  if (!lesson) {
    root.innerHTML = `<section class="page"><p>That lesson walked off the board. <a href="#/academy">Back to Academy</a></p></section>`;
    return;
  }

  let stepIndex = ctx.progress.lessonStep[lesson.id] || 0;
  if (stepIndex >= lesson.steps.length) stepIndex = lesson.steps.length - 1;
  let game = new Chess();
  let board;
  let status = "idle";

  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/academy">Academy</a> · ${lesson.chapter}</p>
        <h1>${lesson.title}</h1>
        <div class="board-well" id="lesson-board"></div>
      </div>
      <aside class="lesson-side">
        <p class="step-meter" id="step-meter"></p>
        <div id="lesson-speech"></div>
        <div class="lesson-actions">
          <button type="button" class="btn ghost" id="btn-prev">Back</button>
          <button type="button" class="btn" id="btn-next">Continue</button>
          <button type="button" class="btn" id="btn-check" hidden>Check squares</button>
        </div>
      </aside>
    </section>
  `;

  const speech = root.querySelector("#lesson-speech");
  const meter = root.querySelector("#step-meter");
  const nextBtn = root.querySelector("#btn-next");
  const prevBtn = root.querySelector("#btn-prev");
  const checkBtn = root.querySelector("#btn-check");

  board = new Board(root.querySelector("#lesson-board"), {
    onSelect(square) {
      if (board.mode === "select") return;
      board.setDests(legalDests(game, square));
    },
    onMove({ from, to }) {
      const step = lesson.steps[stepIndex];
      if (!step.task || step.task.type !== "move") return;
      if (needsPromotion(game, from, to)) {
        board.askPromotion(game.turn(), (promotion) => tryTaskMove(from, to, promotion));
        return;
      }
      tryTaskMove(from, to);
    },
  });

  function tryTaskMove(from, to, promotion) {
    const step = lesson.steps[stepIndex];
    const ok = from === step.task.from && to === step.task.to && (!step.task.promotion || promotion === step.task.promotion);
    const played = game.move({ from, to, promotion: promotion || step.task.promotion || "q" });
    if (!played) return;
    board.setPiecesFromBoard(game.board());
    board.setLastMove(from, to);
    board.clearSelection();
    if (ok) {
      status = "done";
      speech.innerHTML = pawnsySays(step.task.success || "That's the idea.");
      nextBtn.hidden = false;
    } else {
      game.undo();
      board.setPiecesFromBoard(game.board());
      speech.innerHTML = pawnsySays(step.task.fail || "Not that one. Look at the highlighted squares and try again.");
    }
  }

  function showStep() {
    const step = lesson.steps[stepIndex];
    status = "idle";
    game = new Chess(step.fen);
    board.setOrientation(step.orientation || "white");
    board.setPiecesFromBoard(game.board());
    board.setHighlights(step.highlights || []);
    board.setArrows(step.arrows || []);
    board.setLastMove(null, null);
    board.setCheck(game.inCheck() ? kingSquare(game, game.turn()) : null);
    board.clearSelection();
    meter.textContent = `Step ${stepIndex + 1} of ${lesson.steps.length}`;
    speech.innerHTML = pawnsySays(step.text, step.extra || "");
    const task = step.task;
    if (!task) {
      board.setInteractive(false);
      board.setMode("move");
      nextBtn.hidden = false;
      checkBtn.hidden = true;
      nextBtn.textContent = stepIndex === lesson.steps.length - 1 ? "Finish lesson" : "Continue";
    } else if (task.type === "move") {
      board.setInteractive(true);
      board.setMode("move");
      nextBtn.hidden = true;
      checkBtn.hidden = true;
      board.setHighlights([task.from, ...(step.highlights || [])]);
    } else if (task.type === "select") {
      board.setInteractive(true);
      board.setMode("select");
      nextBtn.hidden = true;
      checkBtn.hidden = false;
    }
    ctx.progress.lessonStep[lesson.id] = stepIndex;
    ctx.save();
  }

  let finished = false;

  nextBtn.addEventListener("click", () => {
    if (finished) {
      location.hash = "#/academy";
      return;
    }
    if (stepIndex >= lesson.steps.length - 1) {
      touchStreak(ctx.progress);
      if (!ctx.progress.completedLessons[lesson.id]) {
        addXp(ctx.progress, 15);
        ctx.progress.completedLessons[lesson.id] = Date.now();
      }
      awardBadge(ctx.progress, "first-lesson");
      if (LESSONS.every((item) => ctx.progress.completedLessons[item.id])) {
        awardBadge(ctx.progress, "academy-done");
      }
      noteDailyThree(ctx.progress, "lesson", lesson.id);
      ctx.save();
      finished = true;
      speech.innerHTML = pawnsySays("Lesson complete. A little every day beats a cram before a tournament.");
      nextBtn.hidden = false;
      nextBtn.textContent = "Back to Academy";
      return;
    }
    stepIndex += 1;
    showStep();
  });

  prevBtn.addEventListener("click", () => {
    stepIndex = Math.max(0, stepIndex - 1);
    showStep();
  });

  checkBtn.addEventListener("click", () => {
    const step = lesson.steps[stepIndex];
    const want = new Set(step.task.squares);
    const got = new Set(board.selectedPicked());
    const ok = want.size === got.size && [...want].every((sq) => got.has(sq));
    if (ok) {
      speech.innerHTML = pawnsySays("That's every square I wanted. On to the next idea.");
      nextBtn.hidden = false;
    } else {
      speech.innerHTML = pawnsySays("Not quite. Count again — include captures and empty squares alike.");
    }
  });

  showStep();
}
