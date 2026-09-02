import { loadProgress, saveProgress, rankFor, BADGES, touchStreak } from "../ui/storage.js";
import { mascotSvg } from "../ui/mascot.js";
import { LESSONS } from "../data/lessons.js";
import { activePuzzles, dailyPuzzle } from "../data/puzzles.js";
import { OPENINGS } from "../data/openings.js";
import { renderPlay } from "./play.js";
import { renderAcademy, renderLesson } from "./academy.js";
import { renderTactics } from "./tactics.js";
import { renderOpenings } from "./openings-view.js";
import {
  renderClassroom,
  renderCourse,
  renderGuess,
  renderJournal,
  renderLab,
  renderPrivacy,
  renderReview,
  renderRush,
  renderToday,
  renderVision,
} from "./extras.js";
import { dailyThreePlan, ensureDailyThree, estimateRating } from "../lib/daily.js";
import { COURSE } from "../data/course.js";

const view = document.getElementById("view");
const ctx = {
  progress: null,
  save() {
    return saveProgress(this.progress);
  },
};

function parseRoute() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  return { name: parts[0] || "home", id: parts[1] || "" };
}

function navState(name) {
  for (const link of document.querySelectorAll(".nav a")) {
    const href = link.getAttribute("href");
    const key = href === "#/" ? "home" : href.replace("#/", "").split("/")[0];
    const extras = ["review", "journal", "rush", "guess", "vision", "classroom", "privacy", "course"];
    const labish = extras.includes(name) ? "lab" : name;
    link.classList.toggle("is-active", key === labish || (name === "home" && href === "#/"));
  }
}

function renderHome() {
  const p = ctx.progress;
  const rank = rankFor(p.xp);
  const nextLesson = LESSONS.find((l) => !p.completedLessons[l.id]) || LESSONS[0];
  const daily = dailyPuzzle();
  const three = dailyThreePlan();
  const state = ensureDailyThree(p);
  const threeDone = [state.lesson, state.puzzle, state.opening].filter(Boolean).length;
  view.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        ${mascotSvg(108)}
        <div>
          <p class="eyebrow">Chess coach in your browser</p>
          <h1>Learn the ideas, not a pile of moves.</h1>
          <p class="lede">Pawnsy is a patient trainer: pieces, tactics, openings, and a talking opponent who explains what just happened.</p>
          <div class="hero-actions">
            <a class="btn" href="#/academy/${nextLesson.id}">${p.completedLessons[nextLesson.id] ? "Revisit" : "Continue"} ${nextLesson.title}</a>
            <a class="btn ghost" href="#/today">Today's three (${threeDone}/3)</a>
            <a class="btn ghost" href="#/play">Play vs Pawnsy</a>
          </div>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat"><span>Rank</span><strong>${rank.name}</strong></div>
        <div class="stat"><span>XP</span><strong>${p.xp}</strong></div>
        <div class="stat"><span>Streak</span><strong>${p.streak}d</strong></div>
        <div class="stat"><span>Est. rating</span><strong>${estimateRating(p)}</strong></div>
      </div>
    </section>
    <section class="card-grid home-grid">
      <a class="card" href="#/today">
        <span class="card-kicker">Daily three</span>
        <strong>${three.lesson.title}, a puzzle, ${three.opening.name}</strong>
        <span>One lesson, one tactic, one opening ply. ${threeDone}/3 today.</span>
      </a>
      <a class="card" href="#/academy">
        <span class="card-kicker">Academy · offline pack</span>
        <strong>Guided lessons</strong>
        <span>${Object.keys(p.completedLessons).length}/${LESSONS.length} complete. Endgames, traps, and the starter kit live on your machine.</span>
      </a>
      <a class="card" href="#/tactics/daily">
        <span class="card-kicker">Daily puzzle</span>
        <strong>${daily.title}</strong>
        <span>A bite-size tactic every day. Short enough for a coffee.</span>
      </a>
      <a class="card" href="#/lab">
        <span class="card-kicker">Lab</span>
        <strong>Review, rush, journal</strong>
        <span>PGN talk-through, 3-minute rush, guess-the-move, vision, classroom codes.</span>
      </a>
      <a class="card" href="#/play">
        <span class="card-kicker">Play</span>
        <strong>A coach on the other side</strong>
        <span>Adaptive strength. Hints. Takebacks. No clocks, no shame.</span>
      </a>
      <a class="card" href="#/course">
        <span class="card-kicker">14 days</span>
        <strong>First tournament course</strong>
        <span>${Object.keys(p.courseDone || {}).length}/${COURSE.length} days toward sitting down with a clock.</span>
      </a>
    </section>
  `;
}

function renderProgress() {
  const p = ctx.progress;
  const rank = rankFor(p.xp);
  const rating = estimateRating(p);
  view.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Progress</p>
        <h1>${rank.name} · ${p.xp} XP</h1>
        <p>Streak ${p.streak} day${p.streak === 1 ? "" : "s"} · games ${p.games.wins}–${p.games.losses}–${p.games.draws} · puzzle rating ~${rating}</p>
      </header>
      <div class="card-grid">
        <div class="card static">
          <span class="card-kicker">Academy</span>
          <strong>${Object.keys(p.completedLessons).length} / ${LESSONS.length}</strong>
          <span>lessons finished</span>
        </div>
        <div class="card static">
          <span class="card-kicker">Tactics</span>
          <strong>${p.puzzles.solved} / ${activePuzzles().length}</strong>
          <span>puzzles solved (${p.puzzles.attempted} tries)</span>
        </div>
        <div class="card static">
          <span class="card-kicker">Openings</span>
          <strong>${Object.keys(p.openings).length} / ${OPENINGS.length}</strong>
          <span>lines drilled · ${p.repertoire?.length || 0} starred</span>
        </div>
        <div class="card static">
          <span class="card-kicker">Journal</span>
          <strong>${p.journal?.length || 0}</strong>
          <span>saved misses</span>
        </div>
      </div>
      <h2 class="section-title">Badges</h2>
      <div class="card-grid">
        ${BADGES.map((b) => {
          const got = Boolean(p.badges[b.id]);
          return `<div class="card static ${got ? "is-done" : "is-locked"}">
            <span class="card-kicker">${got ? "Earned" : "Locked"}</span>
            <strong>${b.name}</strong>
            <span>${b.blurb}</span>
          </div>`;
        }).join("")}
      </div>
      <p class="muted reset-wrap"><button type="button" class="btn ghost" id="reset-progress">Reset all progress</button></p>
    </section>
  `;
  view.querySelector("#reset-progress").addEventListener("click", async () => {
    if (!confirm("Reset lessons, puzzles, and games on this device?")) return;
    const { defaultProgress } = await import("../ui/storage.js");
    ctx.progress = defaultProgress();
    await ctx.save();
    render();
  });
}

function render() {
  const route = parseRoute();
  navState(route.name);
  if (route.name === "home") renderHome();
  else if (route.name === "play") renderPlay(view, ctx);
  else if (route.name === "academy" && route.id) renderLesson(view, ctx, route.id);
  else if (route.name === "academy") renderAcademy(view, ctx);
  else if (route.name === "tactics") renderTactics(view, ctx, route.id);
  else if (route.name === "openings") renderOpenings(view, ctx, route.id);
  else if (route.name === "progress") renderProgress();
  else if (route.name === "today") renderToday(view, ctx);
  else if (route.name === "lab") renderLab(view, ctx);
  else if (route.name === "review") renderReview(view, ctx);
  else if (route.name === "journal") renderJournal(view, ctx);
  else if (route.name === "rush") renderRush(view, ctx);
  else if (route.name === "guess") renderGuess(view, ctx, route.id);
  else if (route.name === "vision") renderVision(view, ctx, route.id);
  else if (route.name === "classroom") renderClassroom(view, ctx);
  else if (route.name === "privacy") renderPrivacy(view, ctx);
  else if (route.name === "course") renderCourse(view, ctx);
  else renderHome();
}

async function boot() {
  ctx.progress = await loadProgress();
  touchStreak(ctx.progress);
  await ctx.save();
  render();
  window.addEventListener("hashchange", render);
}

boot();
