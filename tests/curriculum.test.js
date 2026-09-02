import assert from "node:assert/strict";
import { test } from "node:test";
import { Chess, validateFen } from "../extension/vendor/chess.js";
import { OPENINGS, lineIsLegal, bookReply, openingName } from "../extension/data/openings.js";
import { LESSONS } from "../extension/data/lessons.js";
import { activePuzzles } from "../extension/data/puzzles.js";

test("every opening line is legal from the start position", () => {
  for (const opening of OPENINGS) {
    const result = lineIsLegal(opening.line);
    assert.equal(result.ok, true, `${opening.id} fails at ${result.at}: ${result.fen}`);
  }
});

test("bookReply follows a known line", () => {
  assert.ok(["e4", "d4", "c4", "Nf3"].includes(bookReply([])));
  const second = bookReply(["e4"]);
  assert.ok(["e5", "c5", "e6", "c6", "d5"].includes(second), second);
  assert.equal(openingName(["e4", "c5"]), "Sicilian Defence");
});

test("every lesson FEN loads and every move task is legal", () => {
  for (const lesson of LESSONS) {
    for (const [index, step] of lesson.steps.entries()) {
      const check = validateFen(step.fen);
      assert.equal(check.ok, true, `${lesson.id} step ${index + 1}: ${check.error}`);
      const chess = new Chess(step.fen);
      if (step.task?.type === "move") {
        const move = chess.move({
          from: step.task.from,
          to: step.task.to,
          promotion: step.task.promotion,
        });
        assert.ok(move, `${lesson.id} step ${index + 1} cannot play ${step.task.from}${step.task.to}`);
      }
    }
  }
});

test("every puzzle solution is legal and mate-in-ones mate", () => {
  for (const puzzle of activePuzzles()) {
    const check = validateFen(puzzle.fen);
    assert.equal(check.ok, true, `${puzzle.id}: ${check.error}`);
    const chess = new Chess(puzzle.fen);
    for (const san of puzzle.solution) {
      const move = chess.move(san);
      assert.ok(move, `${puzzle.id} cannot play ${san} at ${chess.fen()}`);
    }
    if (puzzle.theme === "mateIn1") {
      assert.equal(chess.isCheckmate(), true, `${puzzle.id} is not mate after ${puzzle.solution}`);
    }
  }
});
