import assert from "node:assert/strict";
import { test } from "node:test";
import { Chess } from "../extension/vendor/chess.js";
import { pickMove } from "../extension/lib/search.js";
import { evaluate, evaluateWhite } from "../extension/lib/eval.js";
import { detectFork, explainMove, hangingPieces } from "../extension/lib/coach.js";

test("starting evaluation is roughly even", () => {
  const chess = new Chess();
  assert.ok(Math.abs(evaluateWhite(chess)) < 40);
  assert.equal(evaluate(chess), evaluateWhite(chess));
});

test("engine finds back-rank mate in one", () => {
  const fen = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1";
  const move = pickMove(fen, "coach");
  assert.ok(move);
  assert.equal(move.san.replace(/[+#]/g, ""), "Ra8");
});

test("engine takes a hanging queen", () => {
  const fen = "4k3/8/8/8/8/2q5/8/2Q1K3 w - - 0 1";
  const move = pickMove(fen, "club");
  assert.equal(move.san.replace(/[+#]/g, ""), "Qxc3");
});

test("royal fork is detected after Nc7+", () => {
  const chess = new Chess("q3k3/8/8/3N4/8/8/8/4K3 w - - 0 1");
  const move = chess.move("Nc7+");
  const fork = detectFork(chess, move.to);
  assert.ok(fork);
  const types = fork.targets.map((t) => t.piece.type).sort().join("");
  assert.equal(types, "kq");
});

test("coach mentions a hanging piece", () => {
  const before = "4k3/4r3/8/8/8/8/8/4QK2 w - - 0 1";
  const chess = new Chess(before);
  const move = chess.move("Qe2");
  const hanging = hangingPieces(chess, "w");
  assert.ok(hanging.some((h) => h.piece.type === "q"));
  const text = explainMove(before, move, chess).text.toLowerCase();
  assert.ok(text.includes("hanging") || text.includes("loose"));
});
