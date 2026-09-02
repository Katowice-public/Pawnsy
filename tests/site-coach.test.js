import assert from "node:assert/strict";
import { test } from "node:test";
import { Chess } from "../extension/vendor/chess.js";
import {
  fenFromMap,
  findMoveMatching,
  pieceFromChessComToken,
  squareFromChessComToken,
} from "../extension/lib/board-read.js";
import { forVoice, speakableSan } from "../extension/lib/voice.js";
import { explainPosition } from "../extension/lib/position-talk.js";

test("chess.com square and piece tokens", () => {
  assert.equal(squareFromChessComToken("piece wp square-52"), "e2");
  assert.equal(squareFromChessComToken("square-18"), "a8");
  assert.deepEqual(pieceFromChessComToken("piece wp square-52"), { color: "w", type: "p" });
  assert.deepEqual(pieceFromChessComToken("bn square-72"), { color: "b", type: "n" });
});

test("starting map becomes a legal FEN and e4 is detected", () => {
  const chess = new Chess();
  const map = {};
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell) map[cell.square] = { type: cell.type, color: cell.color };
    }
  }
  const fen = fenFromMap(map, "w");
  const game = new Chess(fen);
  game.move("e4");
  const before = new Chess(fen);
  const move = findMoveMatching(before, game.fen().split(" ")[0]);
  assert.equal(move.san.replace(/[+#]/g, ""), "e4");
  assert.ok(fen.includes("KQkq"));
});

test("voice reads SAN in English", () => {
  assert.match(speakableSan("Nf3"), /knight/i);
  assert.match(speakableSan("O-O"), /castle/i);
  assert.match(speakableSan("Qxf7#"), /queen|takes|checkmate/i);
  assert.match(forVoice("White plays Nf3."), /knight/i);
});

test("position talk mentions a hanging piece", () => {
  const text = explainPosition("4k3/4r3/8/8/8/8/8/4QK2 w - - 0 1");
  assert.match(text.toLowerCase(), /hanging|loose|white to move/);
});
