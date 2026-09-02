import { Chess, SQUARES } from "../vendor/chess.js";

const NAMES = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const WIDE_CENTER = new Set(["c4", "c5", "d4", "d5", "e4", "e5", "f4", "f5"]);

function enemy(color) {
  return color === "w" ? "b" : "w";
}

function pieceNoun(type, captured = false) {
  if (type === "p" && captured) return "pawn";
  return NAMES[type];
}

function walkRay(chess, from, df, dr) {
  const hits = [];
  let file = from.charCodeAt(0) - 97 + df;
  let rank = from.charCodeAt(1) - 49 + dr;
  while (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
    const sq = String.fromCharCode(97 + file) + (rank + 1);
    const piece = chess.get(sq);
    if (piece) hits.push({ sq, piece });
    if (piece) break;
    file += df;
    rank += dr;
  }
  return hits;
}

export function attackedBy(chess, square, color) {
  return chess.attackers(square, color);
}

export function isHanging(chess, square) {
  const piece = chess.get(square);
  if (!piece) return false;
  const attackers = chess.attackers(square, enemy(piece.color));
  if (attackers.length === 0) return false;
  const defenders = chess.attackers(square, piece.color);
  const cheapest = Math.min(
    ...attackers.map((sq) => {
      const att = chess.get(sq);
      return att ? { p: 1, n: 3, b: 3, r: 5, q: 9, k: 4 }[att.type] : 9;
    }),
  );
  const value = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 99 }[piece.type];
  if (cheapest < value) return true;
  return defenders.length === 0;
}

export function hangingPieces(chess, color) {
  const result = [];
  for (const sq of SQUARES) {
    const piece = chess.get(sq);
    if (piece && piece.color === color && piece.type !== "k" && isHanging(chess, sq)) {
      result.push({ sq, piece });
    }
  }
  return result;
}

export function detectFork(chess, fromSquare) {
  const piece = chess.get(fromSquare);
  if (!piece) return null;
  const targets = [];
  for (const sq of SQUARES) {
    const other = chess.get(sq);
    if (!other || other.color === piece.color) continue;
    if (chess.attackers(sq, piece.color).includes(fromSquare)) {
      targets.push({ sq, piece: other });
    }
  }
  if (targets.length < 2) return null;
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };
  const juicy = targets.filter((t) => t.piece.type === "k" || values[t.piece.type] >= values[piece.type]);
  if (juicy.length < 2 && !targets.some((t) => t.piece.type === "k")) return null;
  return { piece, from: fromSquare, targets };
}

export function detectPins(chess, color) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const pins = [];
  for (const sq of SQUARES) {
    const piece = chess.get(sq);
    if (!piece || piece.color !== color) continue;
    if (piece.type !== "b" && piece.type !== "r" && piece.type !== "q") continue;
    for (const [df, dr] of dirs) {
      const diag = df !== 0 && dr !== 0;
      if (diag && piece.type === "r") continue;
      if (!diag && piece.type === "b") continue;
      const hits = [];
      let file = sq.charCodeAt(0) - 97 + df;
      let rank = sq.charCodeAt(1) - 49 + dr;
      while (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
        const hit = String.fromCharCode(97 + file) + (rank + 1);
        const occupant = chess.get(hit);
        if (occupant) hits.push({ sq: hit, piece: occupant });
        if (occupant) break;
        file += df;
        rank += dr;
      }
      if (hits.length !== 1) continue;
      const first = hits[0];
      if (first.piece.color === color) continue;
      const behind = walkRay(chess, first.sq, df, dr)[0];
      if (behind && behind.piece.color !== color && behind.piece.type === "k") {
        pins.push({ slider: sq, pinned: first, king: behind.sq });
      }
    }
  }
  return pins;
}

function developed(move) {
  if (move.piece !== "n" && move.piece !== "b") return false;
  const homeRank = move.color === "w" ? "1" : "8";
  return move.from[1] === homeRank && move.to[1] !== homeRank;
}

function describeCheck(game) {
  if (game.isCheckmate()) return "checkmate";
  if (game.inCheck() || game.isCheck()) return "check";
  return null;
}

/**
 * Explain a move that was just played on `after`.
 * `move` is a chess.js verbose Move.
 */
export function explainMove(beforeFen, move, after, openingTitle) {
  const bits = [];
  const mover = move.color === "w" ? "White" : "Black";
  const check = describeCheck(after);

  if (move.san === "O-O" || move.isKingsideCastle?.()) {
    bits.push("Castling short tucks the king behind a pawn shield and brings a rook toward the center.");
  } else if (move.san === "O-O-O" || move.isQueensideCastle?.()) {
    bits.push("Castling long gets the king off the center file and puts a rook on the d-file.");
  } else if (move.promotion) {
    bits.push(
      `That pawn becomes a ${pieceNoun(move.promotion)}. Promotion is how a tiny pawn can decide a game.`,
    );
  } else if (move.captured) {
    const how = move.isEnPassant?.() ? "en passant — the special pawn capture" : `capturing the ${pieceNoun(move.captured, true)}`;
    bits.push(`${mover} plays ${move.san}, ${how}.`);
  } else if (developed(move)) {
    bits.push(
      `${move.san} develops the ${pieceNoun(move.piece)} off the back rank so it can fight for the center.`,
    );
  } else if (CENTER.has(move.to) && move.piece === "p") {
    bits.push(`${move.san} claims a share of the center. Pawns in the middle give the pieces more room.`);
  } else if (WIDE_CENTER.has(move.to)) {
    bits.push(`${move.san} puts a ${pieceNoun(move.piece)} where it influences the middle of the board.`);
  } else {
    bits.push(`${mover} plays ${move.san}.`);
  }

  if (openingTitle) {
    bits.push(`This is a known starting point: ${openingTitle}.`);
  }

  const fork = detectFork(after, move.to);
  if (fork) {
    const names = fork.targets.map((t) => (t.piece.type === "k" ? "king" : pieceNoun(t.piece.type)));
    bits.push(`Fork! The ${pieceNoun(move.piece)} attacks the ${joinAnd(unique(names))} at once.`);
  }

  const pins = detectPins(after, move.color);
  const newPin = pins.find((p) => p.slider === move.to);
  if (newPin) {
    bits.push(
      `That pins the ${pieceNoun(newPin.pinned.piece.type)} on ${newPin.pinned.sq} against the king — it would be illegal or costly to move it.`,
    );
  }

  if (check === "checkmate") {
    bits.push("Checkmate. The king has no square, no capture, and no block. That's the whole game.");
  } else if (check === "check") {
    const discovered =
      move.piece !== "k" &&
      !after.attackers(kingSquare(after, enemy(move.color)), move.color).includes(move.to);
    if (discovered) {
      bits.push("Discovered check — moving that piece opened a line from another piece onto the king.");
    } else {
      bits.push("Check. The king must step aside, capture the attacker, or block the line.");
    }
  } else if (after.isStalemate()) {
    bits.push("Stalemate — the other side has no legal move, but is not in check. The game is a draw.");
  }

  const ourHanging = hangingPieces(after, move.color);
  const stillOurs = ourHanging.filter((h) => h.sq !== move.to || after.turn() !== move.color);
  if (stillOurs.length) {
    const worst = stillOurs.sort((a, b) => (PIECE_RANK[b.piece.type] || 0) - (PIECE_RANK[a.piece.type] || 0))[0];
    bits.push(
      `Careful: the ${pieceNoun(worst.piece.type)} on ${worst.sq} is hanging. An undefended piece can be taken for free.`,
    );
  }

  const theirHanging = hangingPieces(after, enemy(move.color));
  if (theirHanging.length && check !== "checkmate") {
    const t = theirHanging[0];
    bits.push(`Look: ${pieceNoun(t.piece.type)} on ${t.sq} is left loose. That's a clue for the next move.`);
  }

  if (move.piece === "q" && after.moveNumber() <= 6 && !move.captured) {
    bits.push("The queen is powerful but a target. Early queen trips can lose time if she gets chased.");
  }

  return {
    summary: bits[0],
    notes: bits.slice(1),
    text: bits.join(" "),
    fork,
    pins,
    check,
    hanging: ourHanging,
  };
}

const PIECE_RANK = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function kingSquare(chess, color) {
  for (const sq of SQUARES) {
    const piece = chess.get(sq);
    if (piece && piece.type === "k" && piece.color === color) return sq;
  }
  return null;
}

function unique(list) {
  return [...new Set(list)];
}

function joinAnd(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function explainHint(fen, move) {
  const before = new Chess(fen);
  const played = before.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
  if (!played) return "I do not have a legal hint in this position.";
  const tip = explainMove(fen, played, before);
  return `Try ${played.san}. ${tip.text}`;
}

export function legalDests(chess, from) {
  return chess.moves({ square: from, verbose: true }).map((m) => m.to);
}

export function needsPromotion(chess, from, to) {
  return chess.moves({ square: from, verbose: true }).some((m) => m.to === to && m.promotion);
}
