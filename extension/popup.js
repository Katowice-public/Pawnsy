import { loadProgress, rankFor, saveProgress } from "./ui/storage.js";
import { LESSONS } from "./data/lessons.js";
import { dailyPuzzle } from "./data/puzzles.js";

function openPage(hash) {
  const url = chrome.runtime.getURL(`app/index.html${hash}`);
  chrome.tabs.create({ url });
}

const progress = await loadProgress();
const rank = rankFor(progress.xp);
document.getElementById("rankline").textContent = `${rank.name} · ${progress.xp} XP · streak ${progress.streak}`;
document.getElementById("daily-name").textContent = dailyPuzzle().title;

const next = LESSONS.find((l) => !progress.completedLessons[l.id]) || LESSONS[0];
document.getElementById("academy").addEventListener("click", (event) => {
  event.preventDefault();
  openPage(`#/academy/${next.id}`);
});
document.getElementById("daily").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/tactics/daily");
});
document.getElementById("play").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/play");
});
document.getElementById("open").addEventListener("click", (event) => {
  event.preventDefault();
  openPage("#/");
});

const voice = document.getElementById("voice");
const siteCoach = document.getElementById("siteCoach");
voice.checked = progress.settings?.voice !== false;
siteCoach.checked = progress.settings?.siteCoach !== false;

async function persist() {
  progress.settings = {
    ...progress.settings,
    voice: voice.checked,
    siteCoach: siteCoach.checked,
  };
  await saveProgress(progress);
}

voice.addEventListener("change", persist);
siteCoach.addEventListener("change", persist);
