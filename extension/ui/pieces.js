const STROKE = {
  w: "#2a2118",
  b: "#0d0b09",
};
const FILL = {
  w: "#f4efe4",
  b: "#2c241c",
};

function wrap(body, color) {
  const fill = FILL[color];
  const stroke = STROKE[color];
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
}

const SHAPES = {
  p: `
    <path d="M22.5 11a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z"/>
    <path d="M22.5 20.2c-3.4 0-6.2 1.3-7.3 3.2 1.8 1 4.4 1.7 7.3 1.7s5.5-.7 7.3-1.7c-1.1-1.9-3.9-3.2-7.3-3.2z"/>
    <path d="M13.8 32.8c1.5-4.6 4.4-7.2 8.7-7.2s7.2 2.6 8.7 7.2H13.8z"/>
    <path d="M12 36.2h21v3.2H12z"/>
  `,
  r: `
    <path d="M14 13h4v4h9v-4h4v7H14z"/>
    <path d="M16 20h13l1.4 12.4H14.6z"/>
    <path d="M13 33.2h19v3.2H13z"/>
    <rect x="12" y="11" width="5" height="5" rx="0.6"/>
    <rect x="20" y="11" width="5" height="5" rx="0.6"/>
    <rect x="28" y="11" width="5" height="5" rx="0.6"/>
  `,
  n: `
    <path d="M14 36.5h18v-3.1l-2.2-1.2c-1.8-6.2-1-11.2 1.2-15.2 1.4-2.5 1.6-5.1.3-7.2-1.8-2.8-5.2-3.4-8.3-2.1l-4.2 2.1c-2.1-1.1-4.6-.4-5.7 1.6-1 1.8-.5 4 1.1 5.3L16 18.4c-2.6 2.8-4.4 6.5-4.6 10.4-.1 2.3.8 4.6 2.6 6.4l.2 1.3z"/>
    <circle cx="18.2" cy="16.2" r="1.1" fill="#2a2118" stroke="none"/>
  `,
  b: `
    <path d="M22.5 9.5c2.4 2.8 6.8 7.4 6.8 12.2 0 3.8-3 6.4-6.8 6.4s-6.8-2.6-6.8-6.4c0-4.8 4.4-9.4 6.8-12.2z"/>
    <path d="M15.5 29.2h14l1.6 4.6h-17.2z"/>
    <path d="M13 34.6h19v3.3H13z"/>
    <path d="M20.4 17.2h4.2v2.2h-4.2z" stroke-width="1.2"/>
  `,
  q: `
    <circle cx="12.5" cy="12" r="2.1"/>
    <circle cx="22.5" cy="8.6" r="2.1"/>
    <circle cx="32.5" cy="12" r="2.1"/>
    <circle cx="17.2" cy="10" r="1.5"/>
    <circle cx="27.8" cy="10" r="1.5"/>
    <path d="M13.2 14.2 16 24.5h13l2.8-10.3-4.6 5.4-4.7-7.2-4.7 7.2z"/>
    <path d="M16.2 25.2h12.6l1.4 8.2H14.8z"/>
    <path d="M13 34.2h19v3.4H13z"/>
  `,
  k: `
    <path d="M21.2 8.2h2.6v4.2h4.2v2.6h-4.2v4.2h-2.6v-4.2h-4.2v-2.6h4.2z"/>
    <path d="M14.5 20.5h16l-1.2 4.6H15.7z"/>
    <path d="M15.5 25.8h14l1.2 8.4H14.3z"/>
    <path d="M13 35h19v3.4H13z"/>
  `,
};

export function pieceSvg(type, color, size = 45) {
  const body = SHAPES[type];
  return `<svg class="piece-svg" viewBox="0 0 45 45" width="${size}" height="${size}" aria-hidden="true">${wrap(body, color)}</svg>`;
}

export function pieceGlyph(type, color) {
  const map = {
    w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
    b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
  };
  return map[color][type];
}
