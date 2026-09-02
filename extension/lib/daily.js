import { LESSONS } from "../data/lessons.js";
import { OPENINGS } from "../data/openings.js";
import { dailyPuzzle } from "../data/puzzles.js";
import { awardBadge, addXp } from "../ui/storage.js";

export function utcDayStamp(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function utcDayIndex(date = new Date()) {
  const now = new Date(date);
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
}

export function dailyThreePlan(date = new Date()) {
  const seed = utcDayIndex(date);
  const lessons = LESSONS;
  const openings = OPENINGS;
  return {
    date: utcDayStamp(date),
    lesson: lessons[Math.abs(seed) % lessons.length],
    puzzle: dailyPuzzle(),
    opening: openings[Math.abs(seed * 3) % openings.length],
  };
}

export function ensureDailyThree(progress, date = new Date()) {
  const stamp = utcDayStamp(date);
  if (!progress.dailyThree || progress.dailyThree.date !== stamp) {
    progress.dailyThree = { date: stamp, lesson: false, puzzle: false, opening: false };
  }
  return progress.dailyThree;
}

export function noteDailyThree(progress, kind, id) {
  const plan = dailyThreePlan();
  const state = ensureDailyThree(progress);
  if (kind === "lesson" && id === plan.lesson.id) state.lesson = true;
  if (kind === "puzzle" && id === plan.puzzle.id) state.puzzle = true;
  if (kind === "opening" && id === plan.opening.id) state.opening = true;
  if (state.lesson && state.puzzle && state.opening) {
    awardBadge(progress, "daily-three");
    if (!state.rewarded) {
      addXp(progress, 10);
      state.rewarded = true;
    }
  }
  return state;
}

export function estimateRating(progress) {
  const solved = progress.puzzles?.solved || 0;
  const attempted = progress.puzzles?.attempted || 0;
  const accuracy = attempted ? solved / attempted : 0.55;
  const raw = 720 + solved * 26 + accuracy * 140 + Math.min(80, (progress.journal?.length || 0) * 4);
  return Math.max(600, Math.min(1900, Math.round(raw)));
}
