import { SQUARES } from "../vendor/chess.js";

function kingSq(chess, color) {
  for (const sq of SQUARES) {
    const piece = chess.get(sq);
    if (piece && piece.type === "k" && piece.color === color) return sq;
  }
  return null;
}

function pawnOn(chess, square, color) {
  const piece = chess.get(square);
  return piece && piece.type === "p" && piece.color === color;
}

function looksCastled(sq, color) {
  if (color === "w") return sq === "g1" || sq === "c1";
  return sq === "g8" || sq === "c8";
}

/** Short spoken notes about king safety. No numbers. */
export function kingSafetyTalk(chess) {
  const bits = [];
  const moveNo = chess.moveNumber();
  for (const color of ["w", "b"]) {
    const sq = kingSq(chess, color);
    if (!sq) continue;
    const name = color === "w" ? "White" : "Black";
    const file = sq[0];
    const rank = sq[1];
    const home = color === "w" ? "1" : "8";
    const shieldRank = color === "w" ? "2" : "7";

    if (moveNo <= 14 && file === "e" && rank === home && !looksCastled(sq, color)) {
      bits.push(`${name}'s king is still in the center.`);
    }

    if (looksCastled(sq, color) || (rank === home && (file === "g" || file === "c"))) {
      const files =
        file === "c"
          ? ["a", "b", "c", "d"]
          : file === "g"
            ? ["f", "g", "h"]
            : [file];
      const missing = files.filter((f) => !pawnOn(chess, `${f}${shieldRank}`, color));
      if (missing.length >= 2) {
        bits.push(`${name}'s king shield is thin — pawns have left the doorstep.`);
      }
    }

    const attackers = chess.attackers(sq, color === "w" ? "b" : "w");
    if (attackers.length >= 2 && !chess.inCheck()) {
      bits.push(`${name}'s king is staring at more than one enemy piece.`);
    }
  }
  return bits;
}

export function kingSafetySentence(chess) {
  const bits = kingSafetyTalk(chess);
  return bits[0] || "";
}
