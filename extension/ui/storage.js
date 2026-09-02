const KEY = "pawnsy-v1";

export const BADGES = [
  { id: "first-lesson", name: "First Lesson", blurb: "Finished an Academy chapter." },
  { id: "first-puzzle", name: "Tactician", blurb: "Solved a tactics puzzle." },
  { id: "puzzles-10", name: "Sharp Eyes", blurb: "Solved 10 puzzles." },
  { id: "first-win", name: "Took a Game", blurb: "Beat Pawnsy in a game." },
  { id: "openings-3", name: "Opening Lab", blurb: "Drilled three openings." },
  { id: "streak-3", name: "Came Back", blurb: "Learned on three different days." },
  { id: "academy-done", name: "Graduate", blurb: "Completed every Academy lesson." },
];

export const RANKS = [
  { name: "Pawn", min: 0 },
  { name: "Knight", min: 40 },
  { name: "Bishop", min: 90 },
  { name: "Rook", min: 150 },
  { name: "Queen", min: 230 },
  { name: "King", min: 320 },
];

export function defaultProgress() {
  return {
    version: 1,
    xp: 0,
    lastDate: null,
    streak: 0,
    completedLessons: {},
    lessonStep: {},
    puzzles: { attempted: 0, solved: 0, solvedIds: {} },
    openings: {},
    games: { played: 0, wins: 0, losses: 0, draws: 0 },
    badges: {},
    settings: { strength: "club", color: "white", voice: true, siteCoach: true },
  };
}

export function rankFor(xp) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.min) current = rank;
  }
  return current;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStamp() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function rawGet() {
  if (globalThis.chrome?.storage?.local) {
    const result = await chrome.storage.local.get(KEY);
    return result[KEY];
  }
  const text = globalThis.localStorage?.getItem(KEY);
  return text ? JSON.parse(text) : undefined;
}

async function rawSet(value) {
  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [KEY]: value });
    return;
  }
  globalThis.localStorage?.setItem(KEY, JSON.stringify(value));
}

export async function loadProgress() {
  const stored = await rawGet();
  const base = defaultProgress();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    settings: { ...base.settings, ...(stored.settings || {}) },
    puzzles: { ...base.puzzles, ...(stored.puzzles || {}) },
  };
}

export async function saveProgress(progress) {
  await rawSet(progress);
  return progress;
}

export function touchStreak(progress) {
  const today = todayStamp();
  if (progress.lastDate === today) return progress;
  if (progress.lastDate === yesterdayStamp()) progress.streak += 1;
  else progress.streak = 1;
  progress.lastDate = today;
  if (progress.streak >= 3) awardBadge(progress, "streak-3");
  return progress;
}

export function addXp(progress, amount) {
  progress.xp += amount;
  return progress;
}

export function awardBadge(progress, id) {
  if (!progress.badges[id]) {
    progress.badges[id] = Date.now();
  }
  return progress;
}
