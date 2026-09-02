import { hangingPieces } from "./coach.js";
import { Chess } from "../vendor/chess.js";

export function explainPosition(fen) {
  const chess = new Chess(fen);
  const side = chess.turn() === "w" ? "White" : "Black";
  const bits = [`${side} to move.`];
  if (chess.isCheckmate()) bits.push("This is checkmate.");
  else if (chess.inCheck()) bits.push("The king is in check — get out with a step, a capture, or a block.");
  const ours = hangingPieces(chess, chess.turn());
  const theirs = hangingPieces(chess, chess.turn() === "w" ? "b" : "w");
  if (ours.length) {
    bits.push(`Your ${ours[0].piece.type === "p" ? "pawn" : name(ours[0].piece.type)} on ${ours[0].sq} is hanging.`);
  }
  if (theirs.length) {
    bits.push(`Their ${name(theirs[0].piece.type)} on ${theirs[0].sq} is loose.`);
  }
  if (!ours.length && !theirs.length && !chess.inCheck()) {
    bits.push("No obvious hanging pieces. Look at the center, then at king safety.");
  }
  return bits.join(" ");
}

function name(type) {
  return { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" }[type] || type;
}
