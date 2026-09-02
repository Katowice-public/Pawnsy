import { Chess } from "../vendor/chess.js";

const FILES = "abcdefgh";

export function squareFromChessComToken(token) {
  const match = String(token).match(/square-([1-8])([1-8])/);
  if (!match) return null;
  return FILES[Number(match[1]) - 1] + match[2];
}

export function pieceFromChessComToken(token) {
  const match = String(token).match(/(?:^|[\s.])([wb])([pnbrqk])(?:$|[\s.])/i);
  if (!match) return null;
  return { color: match[1].toLowerCase(), type: match[2].toLowerCase() };
}

export function pieceFromLichessClass(className) {
  const text = String(className).toLowerCase();
  const color = text.includes("white") || text.includes(" w ") ? "w" : text.includes("black") ? "b" : null;
  const types = [
    ["knight", "n"],
    ["bishop", "b"],
    ["queen", "q"],
    ["king", "k"],
    ["rook", "r"],
    ["pawn", "p"],
  ];
  const hit = types.find(([name]) => text.includes(name));
  if (!color || !hit) return null;
  return { color, type: hit[1] };
}

export function squareFromBoardRect(pieceEl, boardEl, orientation = "white") {
  const board = boardEl.getBoundingClientRect();
  const piece = pieceEl.getBoundingClientRect();
  if (!board.width || !piece.width) return null;
  const size = board.width / 8;
  const fileIndex = Math.max(0, Math.min(7, Math.floor((piece.left - board.left + piece.width / 2) / size)));
  const rankFromTop = Math.max(0, Math.min(7, Math.floor((piece.top - board.top + piece.height / 2) / size)));
  let file = fileIndex;
  let rank = 7 - rankFromTop;
  if (orientation === "black") {
    file = 7 - fileIndex;
    rank = rankFromTop;
  }
  return FILES[file] + (rank + 1);
}

export function mapToPlacement(map) {
  const ranks = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < 8; file += 1) {
      const sq = FILES[file] + rank;
      const piece = map[sq];
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty) {
        row += empty;
        empty = 0;
      }
      const letter = piece.type;
      row += piece.color === "w" ? letter.toUpperCase() : letter;
    }
    if (empty) row += empty;
    ranks.push(row);
  }
  return ranks.join("/");
}

export function castlingFromMap(map) {
  let rights = "";
  if (map.e1?.type === "k" && map.e1.color === "w") {
    if (map.h1?.type === "r" && map.h1.color === "w") rights += "K";
    if (map.a1?.type === "r" && map.a1.color === "w") rights += "Q";
  }
  if (map.e8?.type === "k" && map.e8.color === "b") {
    if (map.h8?.type === "r" && map.h8.color === "b") rights += "k";
    if (map.a8?.type === "r" && map.a8.color === "b") rights += "q";
  }
  return rights || "-";
}

export function fenFromMap(map, turn = "w") {
  return `${mapToPlacement(map)} ${turn} ${castlingFromMap(map)} - 0 1`;
}

export function looksLikeFen(value) {
  if (!value || typeof value !== "string") return false;
  const parts = value.trim().split(/\s+/);
  return parts.length >= 2 && parts[0].includes("/") && (parts[1] === "w" || parts[1] === "b");
}

export function findMoveMatching(chess, targetPlacement) {
  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    const placement = chess.fen().split(" ")[0];
    chess.undo();
    if (placement === targetPlacement) return move;
  }
  return null;
}

export function loadFromMap(map, turn = "w") {
  const fen = fenFromMap(map, turn);
  try {
    return new Chess(fen);
  } catch {
    try {
      return new Chess(fenFromMap(map, turn === "w" ? "b" : "w"));
    } catch {
      return null;
    }
  }
}
