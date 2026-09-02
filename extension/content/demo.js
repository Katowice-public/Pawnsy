import { startWatching } from "./watch.js";

const FILES = "abcdefgh";
const GLYPH = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

const START = [
  ["a8", "br"],
  ["b8", "bn"],
  ["c8", "bb"],
  ["d8", "bq"],
  ["e8", "bk"],
  ["f8", "bb"],
  ["g8", "bn"],
  ["h8", "br"],
  ["a7", "bp"],
  ["b7", "bp"],
  ["c7", "bp"],
  ["d7", "bp"],
  ["e7", "bp"],
  ["f7", "bp"],
  ["g7", "bp"],
  ["h7", "bp"],
  ["a2", "wp"],
  ["b2", "wp"],
  ["c2", "wp"],
  ["d2", "wp"],
  ["e2", "wp"],
  ["f2", "wp"],
  ["g2", "wp"],
  ["h2", "wp"],
  ["a1", "wr"],
  ["b1", "wn"],
  ["c1", "wb"],
  ["d1", "wq"],
  ["e1", "wk"],
  ["f1", "wb"],
  ["g1", "wn"],
  ["h1", "wr"],
];

const board = document.getElementById("board");

function squareClass(square) {
  const file = square.charCodeAt(0) - 96;
  const rank = square[1];
  return `square-${file}${rank}`;
}

function leftTop(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return { left: `${file * 12.5}%`, top: `${(7 - rank) * 12.5}%` };
}

function renderSquares() {
  board.innerHTML = "";
  for (let r = 0; r < 8; r += 1) {
    for (let f = 0; f < 8; f += 1) {
      const light = (f + (7 - r)) % 2 === 1;
      const sq = document.createElement("div");
      sq.className = `sq ${light ? "light" : "dark"}`;
      board.appendChild(sq);
    }
  }
}

function place(pieces) {
  board.querySelectorAll(".piece").forEach((el) => el.remove());
  for (const [square, code] of pieces) {
    const el = document.createElement("div");
    el.className = `piece ${code} ${squareClass(square)}`;
    const pos = leftTop(square);
    el.style.left = pos.left;
    el.style.top = pos.top;
    el.textContent = GLYPH[code];
    board.appendChild(el);
  }
}

let pieces = START.map((row) => [...row]);

function movePiece(from, to) {
  pieces = pieces.map(([square, code]) => (square === from ? [to, code] : [square, code]));
  place(pieces);
}

renderSquares();
place(pieces);

document.getElementById("e4").addEventListener("click", () => movePiece("e2", "e4"));
document.getElementById("e5").addEventListener("click", () => movePiece("e7", "e5"));
document.getElementById("nf3").addEventListener("click", () => movePiece("g1", "f3"));
document.getElementById("reset").addEventListener("click", () => {
  pieces = START.map((row) => [...row]);
  place(pieces);
});

startWatching();
