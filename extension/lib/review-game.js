import { Chess } from "../vendor/chess.js";
import { explainMove } from "./coach.js";
import { openingName } from "../data/openings.js";
import { labelMoveQuality, swingForMover } from "./human-eval.js";
import { kingSafetySentence } from "./king-safety.js";
import { pickMove } from "./search.js";

export function parsePgn(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(String(pgn || "").trim(), { strict: false });
  } catch (error) {
    return { ok: false, error: error.message || "That does not look like a PGN game.", chess };
  }
  if (chess.history().length === 0) {
    return { ok: false, error: "That PGN has no moves.", chess };
  }
  return { ok: true, chess };
}

export function reviewPlies(pgn) {
  const parsed = parsePgn(pgn);
  if (!parsed.ok) return parsed;
  const verbose = parsed.chess.history({ verbose: true });
  const headers = parsed.chess.header();
  const board = new Chess();
  const plies = [];

  for (const move of verbose) {
    const before = new Chess(board.fen());
    const played = board.move({ from: move.from, to: move.to, promotion: move.promotion });
    if (!played) break;
    const title = openingName(board.history());
    const exp = explainMove(before.fen(), played, board, title);
    const swing = swingForMover(before, board, played.color);
    const quality = labelMoveQuality(swing);
    const safety = kingSafetySentence(board);
    const mistake = swing <= -140;
    plies.push({
      san: played.san,
      color: played.color,
      fen: board.fen(),
      beforeFen: before.fen(),
      from: played.from,
      to: played.to,
      quality,
      mistake,
      safety,
      text: [exp.text, quality, safety].filter(Boolean).join(" "),
      summary: exp.summary,
    });
  }

  return { ok: true, headers, plies, pgn: parsed.chess.pgn() };
}

/** Local engine idea — only for a finished-game review, never a live overlay. */
export function sandboxIdea(fen) {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;
  const move = pickMove(fen, "club", chess.history());
  if (!move) return null;
  return `A calmer try from here was ${move.san}.`;
}

export function pgnFromSans(sans) {
  const chess = new Chess();
  for (const san of sans) {
    if (!chess.move(san)) break;
  }
  return chess.pgn();
}
