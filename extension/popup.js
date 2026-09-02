import { loadProgress, rankFor, saveProgress } from "./ui/storage.js";
import { LESSONS } from "./data/lessons.js";
import { dailyPuzzle } from "./data/puzzles.js";
import { dailyThreePlan } from "./lib/daily.js";

function openPage(hash) {
  const url = chrome.runtime.getURL(`app/index.html${hash}`);
  chrome.tabs.create({ url });
}

const progress = await loadProgress();
const rank = rankFor(progress.xp);
const three = dailyThreePlan();
document.getElementById("rankline").textContent = `${rank.name} · ${progress.xp} XP · streak ${progress.streak}`;
document.getElementById("daily-name").textContent = dailyPuzzle().title;
document.getElementById("today-name").textContent = `${three.lesson.title} · puzzle · ${three.opening.name}`;

const next = LESSONS.find((l) => !progress.completedLessons[l.id]) || LESSONS[0];
document.getElementById("academy").addEventListener("click", (event) => {
  event.preventDefault();
  openPage(`#/academy/${next.id}`);
});
document.getElementById("daily").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/tactics/daily");
});
document.getElementById("today").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/today");
});
document.getElementById("play").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/play");
});
document.getElementById("open").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/");
});

const ids = [
  "voice",
  "siteCoach",
  "captions",
  "talkOwnMovesMore",
  "parentalLock",
  "studyPages",
  "clockSilence",
  "useNewTab",
];
const settings = progress.settings || {};
for (const id of ids) {
  const el = document.getElementById(id);
  if (!el) continue;
  if (id === "voice" || id === "siteCoach" || id === "captions" || id === "talkOwnMovesMore") {
    el.checked = settings[id] !== false;
  } else {
    el.checked = Boolean(settings[id]);
  }
}
document.getElementById("voiceLocale").value = settings.voiceLocale || "en";
document.getElementById("persona").value = settings.persona || "calm";
const hint = document.getElementById("newtab-hint");
hint.hidden = !document.getElementById("useNewTab").checked;

async function persist() {
  progress.settings = {
    ...progress.settings,
    voice: document.getElementById("voice").checked,
    siteCoach: document.getElementById("siteCoach").checked,
    captions: document.getElementById("captions").checked,
    talkOwnMovesMore: document.getElementById("talkOwnMovesMore").checked,
    parentalLock: document.getElementById("parentalLock").checked,
    studyPages: document.getElementById("studyPages").checked,
    clockSilence: document.getElementById("clockSilence").checked,
    useNewTab: document.getElementById("useNewTab").checked,
    voiceLocale: document.getElementById("voiceLocale").value,
    persona: document.getElementById("persona").value,
  };
  hint.hidden = !progress.settings.useNewTab;
  await saveProgress(progress);
}

for (const id of [...ids, "voiceLocale", "persona"]) {
  document.getElementById(id).addEventListener("change", persist);
}

document.getElementById("review-pgn").addEventListener("click", async () => {
  const pgn = document.getElementById("pgn").value.trim();
  if (!pgn) return;
  progress.pendingPgn = pgn;
  await saveProgress(progress);
  openPage("#/review");
});
