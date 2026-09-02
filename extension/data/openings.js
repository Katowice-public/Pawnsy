import { Chess } from "../vendor/chess.js";

export const OPENINGS = [
  {
    id: "italian",
    name: "Italian Game",
    eco: "C50",
    color: "white",
    summary: "A calm, classical way to fight for the center with a bishop on c4 aiming at f7.",
    ideas: [
      "Occupy the center with e4, then develop the king's knight and bishop.",
      "The bishop on c4 looks at the weak f7 pawn — Black's least-defended square.",
      "Castle early, then decide between a slow Giuoco Piano (c3, d3) or sharper play.",
    ],
    line: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+"],
    notes: {
      e4: "The king's pawn opening. You take space and free the queen and bishop.",
      e5: "Black answers in the center so White does not get a free hand.",
      Nf3: "Develop toward the middle and attack e5.",
      Nc6: "The most natural way to defend e5.",
      Bc4: "Italian bishop: it eyes f7 and prepares castling.",
      Bc5: "Giuoco Piano — Black mirrors and looks at f2.",
      c3: "Prepare d4 so you can build a full pawn center.",
      Nf6: "Black develops and hits e4 before you can roll the d-pawn in peace.",
      d4: "The central break the c3-pawn was waiting for.",
      exd4: "Black takes rather than letting you keep two pawns in the center.",
      cxd4: "You recapture toward the middle.",
      "Bb4+": "A useful check that develops and asks the king or a piece to respond.",
    },
  },
  {
    id: "ruy",
    name: "Ruy Lopez",
    eco: "C60",
    color: "white",
    summary: "White's bishop pins (or threatens) the knight that defends e5. Slow, rich, and full of ideas.",
    ideas: [
      "Pressure the defender of e5 instead of attacking the pawn at once.",
      "a6 and Ba4 are the Morphy Defence — Black asks the bishop what it wants.",
      "White often plays c3 and d4 after tucking the bishop on b3.",
    ],
    line: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3"],
    notes: {
      e4: "Claim the center.",
      e5: "Meet pawn with pawn.",
      Nf3: "Attack e5 and develop.",
      Nc6: "Defend e5.",
      Bb5: "The Spanish bishop. It does not take the knight yet — it threatens the defender.",
      a6: "Put the question to the bishop.",
      Ba4: "Keep the pressure. Taking on c6 too early often helps Black's center.",
      Nf6: "Develop and hit e4 (the Berlin/Morphy idea).",
      "O-O": "King safety first. The e-file may open later.",
      Be7: "Prepare to castle and break the pin ideas on the king.",
      Re1: "Defend e4 and put a rook on a file that might open.",
      b5: "Kick the bishop and gain queenside space.",
      Bb3: "The bishop still aims at f7 from a safer square.",
    },
  },
  {
    id: "sicilian",
    name: "Sicilian Defence",
    eco: "B20",
    color: "black",
    summary: "Black fights for the center with a flank pawn. Unbalanced, ambitious, and the most popular reply to e4 at many levels.",
    ideas: [
      "c5 trades a side pawn for White's d-pawn if White opens with d4.",
      "Black often gets an extra central pawn and the c-file for a rook.",
      "You must develop quickly — White gets a lead in time as the trade happens.",
    ],
    line: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    notes: {
      e4: "White's usual first move.",
      c5: "The Sicilian. You unbalance the game on move one.",
      Nf3: "Prepare the Open Sicilian with d4.",
      d6: "Control e5 and let the c8-bishop out later. Najdorf/Classical structures.",
      d4: "White opens the center.",
      cxd4: "The trade that defines the Open Sicilian.",
      Nxd4: "White's knight sits proudly in the middle.",
      Nf6: "Hit e4 and develop.",
      Nc3: "Defend e4 and keep developing toward the center.",
      a6: "Najdorf move — stop Nb5 and prepare ...b5.",
    },
  },
  {
    id: "qgd",
    name: "Queen's Gambit",
    eco: "D06",
    color: "white",
    summary: "Offer the c-pawn to lure Black's d-pawn aside and take the center with e4 later.",
    ideas: [
      "It is a gambit in name: if Black hangs on to the extra pawn, White gets a huge center.",
      "Declining with ...e6 is solid and very common.",
      "Develop knights to f3/c3, bishop to g5 or f4, and castle.",
    ],
    line: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3"],
    notes: {
      d4: "Queen's pawn opening — a sturdy stake in the center.",
      d5: "Black copies so White cannot play e4 for free.",
      c4: "The gambit. You pressure d5 from the side.",
      e6: "Queen's Gambit Declined. Black keeps a solid chain.",
      Nc3: "More pressure on d5.",
      Nf6: "Develop and watch e4.",
      Bg5: "Pin the knight that defends d5 and e4.",
      Be7: "Break the pin and prepare to castle.",
      e3: "Solidify d4 and open a path for the other bishop.",
      "O-O": "Black is safe and ready for the middlegame.",
      Nf3: "The last easy developing move toward the center.",
    },
  },
  {
    id: "london",
    name: "London System",
    eco: "D00",
    color: "white",
    summary: "A setup opening: the same solid triangle of pawns and a bishop on f4, almost no matter what Black does.",
    ideas: [
      "Play d4, Nf3, Bf4, e3, c3, Nbd2, and castle. The order can flex.",
      "You get a safe king and a bishop outside the pawn chain.",
      "Learn the ideas (Ne5, h4 attacks) rather than a forest of variations.",
    ],
    line: ["d4", "d5", "Nf3", "Nf6", "Bf4", "c5", "e3", "Nc6", "c3", "e6", "Nbd2"],
    notes: {
      d4: "A reliable central pawn.",
      d5: "Black takes a fair share of the middle.",
      Nf3: "Flexible development. You still might play the London or something else.",
      Nf6: "Black develops naturally.",
      Bf4: "The London bishop. Get it out before you close the chain with e3.",
      c5: "Black chips at your center — a healthy reaction.",
      e3: "Support d4 and free the light-squared bishop later.",
      Nc6: "More pressure on d4.",
      c3: "A solid pawn triangle: c3–d4–e3.",
      e6: "Black builds a similar wall.",
      Nbd2: "The knight belongs on d2 in this system, supporting e4 or f3.",
    },
  },
  {
    id: "french",
    name: "French Defence",
    eco: "C00",
    color: "black",
    summary: "Black says 'you can have the center for a minute' and then undermines it with ...d5.",
    ideas: [
      "The pawn on e6 blunts White's pieces but also hems in the c8-bishop — the French bishop problem.",
      "...c5 is the usual lever against d4.",
      "You often castle short and play on the queenside.",
    ],
    line: ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "Bg5", "Be7", "e5", "Nfd7"],
    notes: {
      e4: "White takes the center.",
      e6: "The French. You prepare ...d5 without letting a bishop pin you on g4 yet.",
      d4: "White builds the classical duo.",
      d5: "The point. Challenge e4 at once.",
      Nc3: "Defend e4 and develop. (The Advance is 3.e5; this is the Classical.)",
      Nf6: "More pressure on e4.",
      Bg5: "Pin the defender.",
      Be7: "Unpin.",
      e5: "White closes the center and gains space.",
      Nfd7: "The knight heads toward the typical ...c5 break.",
    },
  },
  {
    id: "kings-indian",
    name: "King's Indian Defence",
    eco: "E60",
    color: "black",
    summary: "Black lets White take the center, then attacks it later with pieces and pawn breaks (...e5 or ...c5).",
    ideas: [
      "Fianchetto the dark-squared bishop on g7. It is your best piece.",
      "Castle quickly, then choose a break.",
      "The positions can become sharp when the center closes and both sides attack opposite wings.",
    ],
    line: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"],
    notes: {
      d4: "White's queen-pawn start.",
      Nf6: "Stop e4 for a moment and stay flexible.",
      c4: "White wants a broad center.",
      g6: "The king's Indian signal: bishop coming to g7.",
      Nc3: "Control e4.",
      Bg7: "The pride of the opening.",
      e4: "White takes the whole center. That's the deal you offered.",
      d6: "Stop e5 and prepare your own ...e5.",
      Nf3: "Natural development.",
      "O-O": "King in the house before the fight starts.",
      Be2: "A calm Classical setup.",
      e5: "The classic break. If White pushes d5, the center closes and you play on the kingside.",
    },
  },
  {
    id: "caro",
    name: "Caro-Kann Defence",
    eco: "B10",
    color: "black",
    summary: "Like the French, Black prepares ...d5 — but with c6, so the light-squared bishop can still get out.",
    ideas: [
      "Solid structure, fewer attacking chances for White against your king.",
      "After ...dxe4 you often play ...Bf5 and ...e6.",
      "A great choice if you like a tough, slightly cramped position with a clear plan.",
    ],
    line: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6"],
    notes: {
      e4: "White moves first in the center.",
      c6: "Caro-Kann. The pawn will support ...d5.",
      d4: "Take more space.",
      d5: "Now the fight for e4 is on.",
      Nc3: "The Classical. Other options include the Advance 3.e5.",
      dxe4: "Release the tension and free your bishop.",
      Nxe4: "White recaptures with an active knight.",
      Bf5: "This is why you chose c6 over e6 — the bishop is outside the chain.",
      Ng3: "White hits the bishop and gains a tempo.",
      Bg6: "Keep the bishop. It still watches the center from g6.",
    },
  },
];

const BOOK_LINES = OPENINGS.map((o) => o.line);

const EXTRA_BOOK = [
  ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
  ["e4", "e5", "Nf3", "Nc6", "Bc4", "Be7"],
  ["e4", "e5", "Nf3", "d6"],
  ["e4", "e5", "Nc3"],
  ["e4", "c5", "Nf3", "Nc6"],
  ["e4", "c5", "c3"],
  ["d4", "d5", "c4", "c6"],
  ["d4", "Nf6", "c4", "e6"],
  ["d4", "d5", "Nf3", "Nf6"],
  ["c4", "e5"],
  ["c4", "c5"],
  ["Nf3", "d5"],
];

function allLines() {
  return BOOK_LINES.concat(EXTRA_BOOK);
}

export function bookReply(history) {
  const candidates = [];
  for (const line of allLines()) {
    if (line.length <= history.length) continue;
    let ok = true;
    for (let i = 0; i < history.length; i += 1) {
      if (line[i] !== history[i]) {
        ok = false;
        break;
      }
    }
    if (ok) candidates.push(line[history.length]);
  }
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function openingName(history) {
  if (!history.length) return null;
  let best = null;
  for (const opening of OPENINGS) {
    const n = matchLength(opening.line, history);
    if (n >= 2 && n >= history.length - 1 && (!best || n > best.n)) {
      best = { n, name: opening.name };
    }
  }
  const named = {
    e4: "King's Pawn Opening",
    d4: "Queen's Pawn Opening",
    c4: "English Opening",
    Nf3: "Réti Opening",
    "e4 e5": "Open Game",
    "e4 c5": "Sicilian Defence",
    "e4 e6": "French Defence",
    "e4 c6": "Caro-Kann Defence",
    "e4 d5": "Scandinavian Defence",
    "d4 d5": "Closed Game",
    "d4 Nf6": "Indian Defence",
  };
  const key = history.join(" ");
  if (named[key]) return named[key];
  if (best) return best.name;
  const prefix = named[history.slice(0, 2).join(" ")] || named[history[0]];
  return prefix || null;
}

function matchLength(line, history) {
  let n = 0;
  while (n < line.length && n < history.length && line[n] === history[n]) n += 1;
  return n;
}

export function isBookMove(historyBefore, san) {
  const next = historyBefore.concat(san);
  return allLines().some((line) => matchLength(line, next) === next.length && next.length <= line.length);
}

export function expectedBookMoves(history) {
  const set = new Set();
  for (const line of allLines()) {
    if (line.length <= history.length) continue;
    if (matchLength(line, history) === history.length) set.add(line[history.length]);
  }
  return [...set];
}

/** Verify a line is legal from the start position. */
export function lineIsLegal(line) {
  const chess = new Chess();
  for (const san of line) {
    const move = chess.move(san);
    if (!move) return { ok: false, at: san, fen: chess.fen() };
  }
  return { ok: true };
}
