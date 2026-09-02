import assert from "node:assert/strict";
import { test } from "node:test";
import { Chess, validateFen } from "../extension/vendor/chess.js";
import { labelMoveQuality, swingForMover } from "../extension/lib/human-eval.js";
import { kingSafetyTalk } from "../extension/lib/king-safety.js";
import { decodeClassroom, encodeClassroom, shareText } from "../extension/lib/share.js";
import { pgnFromSans, reviewPlies, sandboxIdea } from "../extension/lib/review-game.js";
import { ankiTsv } from "../extension/lib/journal.js";
import { isStudyPage } from "../extension/lib/page-kind.js";
import { COURSE } from "../extension/data/course.js";
import { VISION } from "../extension/data/vision.js";
import { GUESS_GAMES } from "../extension/data/guess-games.js";
import { LESSONS } from "../extension/data/lessons.js";
import { lessonById } from "../extension/data/lessons.js";
import { puzzleById } from "../extension/data/puzzles.js";
import { OPENINGS } from "../extension/data/openings.js";
import { t } from "../extension/lib/i18n.js";
import {
  humanizeForSpeech,
  pickBestVoice,
  scoreVoice,
  splitSentences,
  styleFromSettings,
} from "../extension/lib/voice-style.js";

test("human labels never show numeric eval", () => {
  const labels = [-900, -400, -200, -80, 0, 90, 200, 500].map(labelMoveQuality);
  for (const label of labels) {
    assert.equal(/\d/.test(label), false, label);
    assert.equal(/−|-1\.|cp/i.test(label), false, label);
  }
  assert.match(labelMoveQuality(-300), /pawn|piece/i);
});

test("eval swing flags a hung queen as a serious drop", () => {
  const before = new Chess("4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1");
  const after = new Chess("4k3/8/8/8/8/4q3/8/4K3 b - - 0 1");
  const swing = swingForMover(before, after, "w");
  assert.ok(swing < -400, String(swing));
  assert.match(labelMoveQuality(swing), /piece|worse/i);
});

test("king safety mentions a king left in the center", () => {
  const chess = new Chess();
  chess.move("e4");
  chess.move("e5");
  const talk = kingSafetyTalk(chess).join(" ");
  assert.match(talk.toLowerCase(), /center/);
});

test("classroom codes round-trip", () => {
  const fen = "4k3/8/8/8/8/8/8/4K3 w - - 0 1";
  const code = encodeClassroom({ fen, prompt: "Find opposition." });
  assert.match(code, /^PWN1\./);
  const back = decodeClassroom(code);
  assert.equal(back.fen, fen);
  assert.equal(back.prompt, "Find opposition.");
});

test("share text includes FEN and the sentence", () => {
  const text = shareText("8/8/8/8/8/8/8/4K2k w - - 0 1", "King still in the corner.");
  assert.match(text, /Pawnsy:/);
  assert.match(text, /4K2k/);
});

test("PGN review labels scholar's mate without numbers", () => {
  const result = reviewPlies("1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#");
  assert.equal(result.ok, true);
  assert.ok(result.plies.length >= 7);
  const last = result.plies.at(-1);
  assert.match(last.san, /Qxf7/);
  for (const ply of result.plies) {
    assert.equal(/-?\d+\.\d/.test(ply.quality), false, ply.quality);
  }
});

test("sandbox idea only runs on an unfinished position", () => {
  const mate = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1";
  const idea = sandboxIdea(mate);
  assert.ok(idea);
  assert.match(idea, /Ra8|calmer/i);
  const over = new Chess(mate);
  over.move("Ra8#");
  assert.equal(sandboxIdea(over.fen()), null);
});

test("pgnFromSans rebuilds a mini game", () => {
  const pgn = pgnFromSans(["e4", "e5", "Nf3"]);
  assert.match(pgn, /1\.\s*e4/);
});

test("study page detector is conservative", () => {
  assert.equal(isStudyPage({ hostname: "lichess.org", pathname: "/analysis/standard", hash: "" }), true);
  assert.equal(isStudyPage({ hostname: "www.chess.com", pathname: "/game/live/123", hash: "" }), false);
});

test("i18n overlay strings exist in four locales", () => {
  for (const loc of ["en", "es", "fr", "de"]) {
    assert.ok(t({ voiceLocale: loc }, "fairplay").length > 10);
    assert.ok(t({ voiceLocale: loc }, "retry").length > 2);
  }
});

test("vision drill answers match legal attacks", () => {
  for (const drill of VISION) {
    assert.equal(validateFen(drill.fen).ok, true, drill.id);
    const chess = new Chess(drill.fen);
    const legal = new Set(chess.moves({ square: drill.square, verbose: true }).map((m) => m.to));
    for (const sq of drill.answers) {
      assert.ok(legal.has(sq), `${drill.id} extra ${sq}`);
    }
  }
});

test("guess games load as legal PGN", () => {
  for (const game of GUESS_GAMES) {
    const chess = new Chess();
    chess.loadPgn(game.pgn, { strict: false });
    assert.ok(chess.history().length >= 8, game.id);
  }
});

test("14-day course points at real lessons and puzzles", () => {
  assert.equal(COURSE.length, 14);
  for (const day of COURSE) {
    assert.ok(lessonById(day.lesson), day.lesson);
    if (day.puzzle) assert.ok(puzzleById(day.puzzle), day.puzzle);
    if (day.opening) assert.ok(OPENINGS.some((o) => o.id === day.opening), day.opening);
  }
});

test("endgame and trap lessons are in the academy pack", () => {
  const ids = LESSONS.map((l) => l.id);
  for (const id of ["opposition", "lucena", "philidor", "legal-trap", "fishing-pole", "elephant-trap"]) {
    assert.ok(ids.includes(id), id);
  }
});

test("voice picker prefers a natural woman over a robot", () => {
  const voices = [
    { name: "Zarvox", lang: "en-US" },
    { name: "Google US English", lang: "en-US" },
    { name: "Microsoft David", lang: "en-US", gender: "male" },
    { name: "Samantha", lang: "en-US" },
  ];
  const woman = pickBestVoice(voices, { lang: "en-US", gender: "female" });
  assert.equal(woman.name, "Samantha");
  const man = pickBestVoice(voices, { lang: "en-US", gender: "male" });
  assert.equal(man.name, "Microsoft David");
  assert.ok(scoreVoice({ name: "Zarvox", lang: "en-US" }, { gender: "female" }) < 0);
  const femaleWarm = styleFromSettings({ voiceGender: "female", persona: "warm" });
  const maleCoach = styleFromSettings({ voiceGender: "male", persona: "coach" });
  assert.ok(femaleWarm.pitch > maleCoach.pitch);
  assert.equal(femaleWarm.gender, "female");
  assert.equal(maleCoach.gender, "male");
  assert.match(humanizeForSpeech("Center — then the king."), /,/);
  const bits = splitSentences("Center first. Then look at the king.");
  assert.equal(bits.length, 2);
});

test("anki export is tab-separated and has no raw eval", () => {
  const tsv = ankiTsv([{ fen: "4k3/8/8/8/8/8/4r3/4K3 w - - 0 1", theme: "hanging", note: "Rook hangs", san: "Ke2" }]);
  assert.match(tsv, /\t/);
  assert.equal(tsv.includes("-1.7"), false);
});
