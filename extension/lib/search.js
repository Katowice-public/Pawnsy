import { Chess } from "../vendor/chess.js";
import { evaluate, MATE_SCORE, PIECE_VALUE } from "./eval.js";
import { bookReply } from "../data/openings.js";

const LEVELS = {
  beginner: { depth: 1, maxMs: 120, random: 0.32, useBook: false },
  club: { depth: 2, maxMs: 350, random: 0, useBook: true },
  coach: { depth: 3, maxMs: 700, random: 0, useBook: true },
};

function moveScore(move) {
  let score = 0;
  if (move.captured) score += 10 * PIECE_VALUE[move.captured] - PIECE_VALUE[move.piece];
  if (move.promotion) score += PIECE_VALUE[move.promotion];
  return score;
}

function orderedMoves(chess) {
  const moves = chess.moves({ verbose: true });
  moves.sort((a, b) => moveScore(b) - moveScore(a));
  return moves;
}

function play(chess, move) {
  const payload = { from: move.from, to: move.to };
  if (move.promotion) payload.promotion = move.promotion;
  return chess.move(payload);
}

function quiesce(chess, alpha, beta, qply, deadline) {
  const stand = evaluate(chess);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (qply <= 0 || Date.now() > deadline) return alpha;

  for (const move of orderedMoves(chess)) {
    if (!move.captured && !move.promotion) continue;
    play(chess, move);
    const score = -quiesce(chess, -beta, -alpha, qply - 1, deadline);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(chess, depth, alpha, beta, ply, deadline) {
  if (Date.now() > deadline) return evaluate(chess);
  if (chess.isCheckmate()) return -MATE_SCORE + ply;
  if (chess.isDraw()) return 0;
  if (depth <= 0) return quiesce(chess, alpha, beta, 4, deadline);

  let best = -MATE_SCORE * 2;
  const moves = orderedMoves(chess);
  if (moves.length === 0) return evaluate(chess);

  for (const move of moves) {
    play(chess, move);
    const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1, deadline);
    chess.undo();
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

function searchRoot(chess, depth, deadline) {
  const moves = orderedMoves(chess);
  let best = moves[0];
  let bestScore = -MATE_SCORE * 2;
  let alpha = -MATE_SCORE * 2;
  const beta = MATE_SCORE * 2;

  for (const move of moves) {
    play(chess, move);
    const score = -negamax(chess, depth - 1, -beta, -alpha, 1, deadline);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
    if (score > alpha) alpha = score;
    if (Date.now() > deadline) break;
  }
  return { move: best, score: bestScore };
}

function pickRandom(chess) {
  const moves = chess.moves({ verbose: true });
  const captures = moves.filter((m) => m.captured);
  const pool = captures.length && Math.random() < 0.55 ? captures : moves;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickMove(fen, level = "club", history = []) {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const cfg = LEVELS[level] || LEVELS.club;
  if (cfg.useBook) {
    const reply = bookReply(history);
    if (reply && chess.moves().some((san) => san.replace(/[+#]/g, "") === reply.replace(/[+#]/g, ""))) {
      const played = chess.move(reply);
      if (played) {
        return {
          from: played.from,
          to: played.to,
          promotion: played.promotion,
          san: played.san,
          score: 0,
          book: true,
        };
      }
    }
  }

  if (cfg.random > 0 && Math.random() < cfg.random) {
    const move = pickRandom(chess);
    return { from: move.from, to: move.to, promotion: move.promotion, san: move.san, score: 0, book: false };
  }

  const deadline = Date.now() + cfg.maxMs;
  let chosen = searchRoot(chess, 1, deadline);
  for (let depth = 2; depth <= cfg.depth; depth += 1) {
    if (Date.now() > deadline - 30) break;
    chosen = searchRoot(chess, depth, deadline);
  }

  const move = chosen.move;
  return {
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    san: move.san,
    score: chosen.score,
    book: false,
  };
}

export { LEVELS };
