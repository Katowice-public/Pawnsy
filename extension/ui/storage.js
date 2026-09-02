const KEY = "pawnsy-v1";

export const BADGES = [
  { id: "first-lesson", name: "First Lesson", blurb: "Finished an Academy chapter." },
  { id: "first-puzzle", name: "Tactician", blurb: "Solved a tactics puzzle." },
  { id: "puzzles-10", name: "Sharp Eyes", blurb: "Solved 10 puzzles." },
  { id: "first-win", name: "Took a Game", blurb: "Beat Pawnsy in a game." },
  { id: "openings-3", name: "Opening Lab", blurb: "Drilled three openings." },
  { id: "streak-3", name: "Came Back", blurb: "Learned on three different days." },
  { id: "academy-done", name: "Graduate", blurb: "Completed every Academy lesson." },
  { id: "site-coach", name: "Over-the-board ear", blurb: "Let Pawnsy talk through a Chess.com or Lichess game." },
  { id: "site-games-5", name: "Match reporter", blurb: "Coached five games on a real site." },
  { id: "journal-5", name: "Mistake collector", blurb: "Saved five positions in the journal." },
  { id: "daily-three", name: "Daily three", blurb: "Lesson, puzzle, and opening ply in one day." },
  { id: "rush-5", name: "Sprint", blurb: "Scored 5 in a 3-minute puzzle rush." },
  { id: "guess-10", name: "Guessing well", blurb: "Matched ten moves from master games." },
  { id: "course-week", name: "Tournament week", blurb: "Finished seven days of the first-tournament course." },
  { id: "course-done", name: "Ready to play", blurb: "Completed the 14-day first-tournament course." },
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
    settings: {
      strength: "club",
      color: "white",
      voice: true,
      siteCoach: true,
      voiceLocale: "en",
      persona: "calm",
      captions: true,
      talkOwnMovesMore: true,
      studyPages: false,
      clockSilence: false,
      useNewTab: false,
      parentalLock: false,
    },
    journal: [],
    repertoire: [],
    courseDone: {},
    privacyLog: [],
    siteSessions: 0,
    adaptive: { winStreak: 0, loseStreak: 0 },
    dailyThree: { date: null, lesson: false, puzzle: false, opening: false },
    rushBest: 0,
    guessScore: { played: 0, correct: 0 },
    pendingPgn: "",
  };
}

export function rankFor(xp) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.min) current = rank;
  }
  return current;
}

export function todayStamp() {
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
    games: { ...base.games, ...(stored.games || {}) },
    adaptive: { ...base.adaptive, ...(stored.adaptive || {}) },
    dailyThree: { ...base.dailyThree, ...(stored.dailyThree || {}) },
    guessScore: { ...base.guessScore, ...(stored.guessScore || {}) },
    journal: stored.journal || [],
    repertoire: stored.repertoire || [],
    courseDone: { ...base.courseDone, ...(stored.courseDone || {}) },
    privacyLog: stored.privacyLog || [],
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

export function logPrivacy(progress, kind) {
  progress.privacyLog = progress.privacyLog || [];
  progress.privacyLog.push({ t: Date.now(), kind });
  if (progress.privacyLog.length > 100) progress.privacyLog = progress.privacyLog.slice(-100);
  return progress;
}

export function adaptPlayStrength(progress, result) {
  if (progress.settings?.parentalLock) return progress.settings.strength || "beginner";
  const a = progress.adaptive || (progress.adaptive = { winStreak: 0, loseStreak: 0 });
  let strength = progress.settings.strength || "club";
  if (result === "win") {
    a.winStreak += 1;
    a.loseStreak = 0;
    if (a.winStreak >= 3 && strength === "beginner") strength = "club";
    else if (a.winStreak >= 4 && strength === "club") strength = "coach";
  } else if (result === "loss") {
    a.loseStreak += 1;
    a.winStreak = 0;
    if (a.loseStreak >= 2 && strength === "coach") strength = "club";
    else if (a.loseStreak >= 3 && strength === "club") strength = "beginner";
  } else {
    a.winStreak = 0;
    a.loseStreak = 0;
  }
  progress.settings.strength = strength;
  return strength;
}

export function toggleRepertoire(progress, openingId) {
  const list = progress.repertoire || (progress.repertoire = []);
  const i = list.indexOf(openingId);
  if (i >= 0) list.splice(i, 1);
  else list.push(openingId);
  return list;
}
