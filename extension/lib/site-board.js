import {
  fenFromMap,
  looksLikeFen,
  pieceFromChessComToken,
  pieceFromLichessClass,
  squareFromBoardRect,
  squareFromChessComToken,
} from "./board-read.js";

function pierceAll(selector, root = document) {
  const hits = [...root.querySelectorAll(selector)];
  const nodes = [...root.querySelectorAll("*")];
  for (const node of nodes) {
    if (node.shadowRoot) hits.push(...pierceAll(selector, node.shadowRoot));
  }
  return hits;
}

function firstHost(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el.shadowRoot || el;
  }
  return document;
}

export function fenFromInputs(root = document) {
  const fields = pierceAll("input, textarea", root);
  for (const el of fields) {
    const value = (el.value || el.textContent || "").trim();
    if (looksLikeFen(value)) return value;
  }
  return null;
}

export function readChessComMap() {
  const host = firstHost(["wc-chess-board", "chess-board", ".board"]);
  const pieces = pierceAll(".piece", host instanceof Document ? document : host);
  if (!pieces.length) return null;
  const map = {};
  for (const el of pieces) {
    const token = `${el.className} ${el.getAttribute("class") || ""}`;
    const piece = pieceFromChessComToken(token);
    const square = squareFromChessComToken(token) || el.dataset.square;
    if (piece && square) map[square] = piece;
  }
  return Object.keys(map).length ? map : null;
}

export function boardOrientation() {
  if (document.querySelector(".cg-wrap.orientation-black, .board.flipped, wc-chess-board.flipped")) {
    return "black";
  }
  const coords = document.querySelector(".coords, .coordinate-light, .file");
  if (coords && /8/.test(coords.textContent || "") && coords.getBoundingClientRect().bottom > innerHeight * 0.6) {
    return "black";
  }
  return "white";
}

export function readLichessMap() {
  const board = document.querySelector("cg-board, .cg-board");
  if (!board) return null;
  const pieces = [...board.querySelectorAll("piece")];
  if (!pieces.length) return null;
  const orientation = boardOrientation();
  const map = {};
  for (const el of pieces) {
    if (el.classList.contains("ghost")) continue;
    const piece = pieceFromLichessClass(el.className);
    const key = el.getAttribute("cgKey") || el.dataset.key;
    const square = key || squareFromBoardRect(el, board, orientation);
    if (piece && square) map[square] = piece;
  }
  return Object.keys(map).length ? map : null;
}

export function guessTurn() {
  if (document.querySelector(".clock-bottom.clock-player-turn, .clock-component.clock-player-turn")) {
    const bottomIsWhite = !document.querySelector(".board.flipped, wc-chess-board.flipped");
    return bottomIsWhite ? "w" : "b";
  }
  if (document.querySelector(".rclock-bottom.running")) {
    const blackBottom = Boolean(document.querySelector(".cg-wrap.orientation-black"));
    return blackBottom ? "b" : "w";
  }
  return null;
}

export function readSiteSnapshot() {
  const fromInput = fenFromInputs();
  if (fromInput) {
    const [placement, turn] = fromInput.split(/\s+/);
    return { placement, turn: turn === "b" ? "b" : "w", source: "fen" };
  }
  const map = readChessComMap() || readLichessMap();
  if (!map) return null;
  const turn = guessTurn() || "w";
  const fen = fenFromMap(map, turn);
  return { placement: fen.split(" ")[0], turn, map, fen, source: "dom" };
}
