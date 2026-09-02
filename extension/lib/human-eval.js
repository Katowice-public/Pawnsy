import { evaluateWhite } from "./eval.js";
import { hangingPieces } from "./coach.js";

const NAMES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

/** Human label for how the mover's chances changed. Never a numeric eval. */
export function labelMoveQuality(swingForMover) {
  const drop = -swingForMover;
  if (drop >= 450) return "This drops a piece — or worse.";
  if (drop >= 280) return "This loses a piece's worth of juice.";
  if (drop >= 140) return "This loses a pawn.";
  if (drop >= 70) return "A little inaccuracy — something small slips.";
  if (swingForMover >= 280) return "A strong punch. That wins real material.";
  if (swingForMover >= 140) return "A useful gain — about a pawn of pressure.";
  return "A solid, ordinary move.";
}

export function swingForMover(beforeChess, afterChess, moverColor) {
  const before = evaluateWhite(beforeChess);
  const after = evaluateWhite(afterChess);
  return moverColor === "w" ? after - before : before - after;
}

export function describeHanging(chess, color) {
  const list = hangingPieces(chess, color);
  if (!list.length) return null;
  const worst = [...list].sort((a, b) => rank(b.piece.type) - rank(a.piece.type))[0];
  const who = color === chess.turn() ? "Your" : "Their";
  return `${who} ${NAMES[worst.piece.type]} on ${worst.sq} is hanging.`;
}

function rank(type) {
  return { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[type] || 0;
}

export function humanPositionLabel(chess) {
  const ours = hangingPieces(chess, chess.turn());
  const theirs = hangingPieces(chess, chess.turn() === "w" ? "b" : "w");
  if (ours.length) return describeHanging(chess, chess.turn());
  if (theirs.length) return describeHanging(chess, chess.turn() === "w" ? "b" : "w");
  const cp = evaluateWhite(chess);
  const side = chess.turn() === "w" ? "White" : "Black";
  if (Math.abs(cp) < 80) return `${side} to move in a roughly balanced fight.`;
  if (cp > 0) return "White has the more comfortable position — more space or material.";
  return "Black has the more comfortable position — more space or material.";
}
