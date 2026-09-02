import { pieceSvg, pieceGlyph } from "./pieces.js";

const FILES = "abcdefgh";

function squareName(file, rank) {
  return FILES[file] + (rank + 1);
}

export class Board {
  constructor(root, options = {}) {
    this.root = root;
    this.orientation = options.orientation || "white";
    this.interactive = options.interactive !== false;
    this.onMove = options.onMove || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onSquare = options.onSquare || (() => {});
    this.pieces = {};
    this.selected = null;
    this.dests = [];
    this.lastMove = null;
    this.checkSquare = null;
    this.highlights = [];
    this.arrows = [];
    this.mode = "move";
    this.picked = new Set();
    this.pending = null;
    this.ghost = null;
    this.root.classList.add("board-wrap");
    this.root.innerHTML = `
      <div class="board-frame">
        <div class="board" role="grid" aria-label="Chessboard"></div>
        <svg class="board-arrows" viewBox="0 0 8 8" preserveAspectRatio="none"></svg>
      </div>
      <div class="promo-pop hidden" hidden></div>
    `;
    this.boardEl = this.root.querySelector(".board");
    this.arrowEl = this.root.querySelector(".board-arrows");
    this.promoEl = this.root.querySelector(".promo-pop");
    this._pointer = null;
    this.renderSquares();
    this.bind();
  }

  setOrientation(color) {
    this.orientation = color === "black" ? "black" : "white";
    this.renderSquares();
    this.draw();
  }

  setInteractive(value) {
    this.interactive = value;
    this.root.classList.toggle("is-locked", !value);
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== "select") this.picked.clear();
  }

  setPiecesFromBoard(board) {
    const pieces = {};
    for (const row of board) {
      for (const cell of row) {
        if (cell) pieces[cell.square] = { type: cell.type, color: cell.color };
      }
    }
    this.pieces = pieces;
    this.draw();
  }

  setLastMove(from, to) {
    this.lastMove = from && to ? [from, to] : null;
    this.paintMarks();
  }

  setCheck(square) {
    this.checkSquare = square;
    this.paintMarks();
  }

  setHighlights(squares) {
    this.highlights = squares || [];
    this.paintMarks();
  }

  setArrows(arrows) {
    this.arrows = arrows || [];
    this.drawArrows();
  }

  setDests(dests) {
    this.dests = dests || [];
    this.paintMarks();
  }

  clearSelection() {
    this.selected = null;
    this.dests = [];
    this.paintMarks();
  }

  renderSquares() {
    const white = this.orientation === "white";
    this.boardEl.innerHTML = "";
    for (let r = 0; r < 8; r += 1) {
      for (let f = 0; f < 8; f += 1) {
        const file = white ? f : 7 - f;
        const rank = white ? 7 - r : r;
        const name = squareName(file, rank);
        const light = (file + rank) % 2 === 1;
        const sq = document.createElement("button");
        sq.type = "button";
        sq.className = `square ${light ? "light" : "dark"}`;
        sq.dataset.square = name;
        sq.setAttribute("aria-label", name);
        if (white ? rank === 0 : rank === 7) {
          const coord = document.createElement("span");
          coord.className = "coord file";
          coord.textContent = FILES[file];
          sq.appendChild(coord);
        }
        if (white ? file === 0 : file === 7) {
          const coord = document.createElement("span");
          coord.className = "coord rank";
          coord.textContent = String(rank + 1);
          sq.appendChild(coord);
        }
        const holder = document.createElement("span");
        holder.className = "piece-holder";
        sq.appendChild(holder);
        this.boardEl.appendChild(sq);
      }
    }
  }

  draw() {
    for (const sq of this.boardEl.querySelectorAll(".square")) {
      const name = sq.dataset.square;
      const holder = sq.querySelector(".piece-holder");
      const piece = this.pieces[name];
      holder.innerHTML = piece ? pieceSvg(piece.type, piece.color) : "";
      sq.classList.toggle("has-piece", Boolean(piece));
      sq.setAttribute("aria-label", piece ? `${name}, ${piece.color === "w" ? "white" : "black"} ${pieceGlyph(piece.type, piece.color)}` : name);
    }
    this.paintMarks();
    this.drawArrows();
  }

  paintMarks() {
    for (const sq of this.boardEl.querySelectorAll(".square")) {
      const name = sq.dataset.square;
      sq.classList.toggle("selected", this.selected === name);
      sq.classList.toggle("last", Boolean(this.lastMove && this.lastMove.includes(name)));
      sq.classList.toggle("check", this.checkSquare === name);
      sq.classList.toggle("marked", this.highlights.includes(name));
      sq.classList.toggle("picked", this.picked.has(name));
      const dest = this.dests.includes(name);
      sq.classList.toggle("dest", dest);
      sq.classList.toggle("capture", dest && Boolean(this.pieces[name]));
    }
  }

  squareCenter(name) {
    const file = name.charCodeAt(0) - 97;
    const rank = name.charCodeAt(1) - 49;
    const white = this.orientation === "white";
    const x = (white ? file : 7 - file) + 0.5;
    const y = (white ? 7 - rank : rank) + 0.5;
    return { x, y };
  }

  drawArrows() {
    const parts = ['<defs><marker id="arrowhead" markerWidth="0.4" markerHeight="0.4" refX="0.18" refY="0.2" orient="auto"><polygon points="0 0, 0.4 0.2, 0 0.4" fill="#d4a02a" /></marker></defs>'];
    for (const [from, to] of this.arrows) {
      const a = this.squareCenter(from);
      const b = this.squareCenter(to);
      parts.push(
        `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#d4a02a" stroke-width="0.14" stroke-linecap="round" marker-end="url(#arrowhead)" opacity="0.88" />`,
      );
    }
    this.arrowEl.innerHTML = parts.join("");
  }

  bind() {
    this.boardEl.addEventListener("pointerdown", (event) => {
      const sq = event.target.closest(".square");
      if (!sq || !this.interactive) return;
      const name = sq.dataset.square;
      if (this.mode === "select") {
        if (this.picked.has(name)) this.picked.delete(name);
        else this.picked.add(name);
        this.paintMarks();
        this.onSquare(name, [...this.picked]);
        return;
      }
      const piece = this.pieces[name];
      if (this.selected && this.dests.includes(name)) {
        this.tryMove(this.selected, name);
        return;
      }
      if (piece) {
        this.selected = name;
        this.onSelect(name);
        this.paintMarks();
        this._pointer = { from: name, id: event.pointerId };
        sq.setPointerCapture?.(event.pointerId);
      } else {
        this.clearSelection();
      }
    });

    this.boardEl.addEventListener("pointerup", (event) => {
      if (!this._pointer) return;
      const sq = event.target.closest(".square");
      const from = this._pointer.from;
      this._pointer = null;
      this.hideGhost();
      if (!sq) return;
      const to = sq.dataset.square;
      if (to && to !== from) this.tryMove(from, to);
    });

    this.boardEl.addEventListener("pointermove", (event) => {
      if (!this._pointer) return;
      this.showGhost(event);
    });
  }

  showGhost(event) {
    if (!this.ghost) {
      this.ghost = document.createElement("div");
      this.ghost.className = "drag-ghost";
      document.body.appendChild(this.ghost);
    }
    const piece = this.pieces[this._pointer.from];
    if (!piece) return;
    this.ghost.innerHTML = pieceSvg(piece.type, piece.color, 52);
    this.ghost.style.left = `${event.clientX - 26}px`;
    this.ghost.style.top = `${event.clientY - 26}px`;
  }

  hideGhost() {
    this.ghost?.remove();
    this.ghost = null;
  }

  tryMove(from, to) {
    this.onMove({ from, to, promotion: this.pending?.promotion });
  }

  askPromotion(color, cb) {
    this.promoEl.hidden = false;
    this.promoEl.classList.remove("hidden");
    this.promoEl.innerHTML = ["q", "r", "b", "n"]
      .map((type) => `<button type="button" data-promo="${type}">${pieceSvg(type, color, 40)}</button>`)
      .join("");
    const handler = (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;
      this.promoEl.hidden = true;
      this.promoEl.classList.add("hidden");
      this.promoEl.removeEventListener("click", handler);
      cb(btn.dataset.promo);
    };
    this.promoEl.addEventListener("click", handler);
  }

  selectedPicked() {
    return [...this.picked];
  }
}

export function kingSquare(chess, color) {
  const board = chess.board();
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.type === "k" && cell.color === color) return cell.square;
    }
  }
  return null;
}
