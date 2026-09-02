import { Chess } from "../vendor/chess.js";
import { Board, kingSquare } from "../ui/board.js";
import { pawnsySays } from "../ui/mascot.js";
import { legalDests, needsPromotion, hangingPieces } from "../lib/coach.js";
import { reviewPlies, sandboxIdea } from "../lib/review-game.js";
import { speakCoach } from "../lib/voice.js";
import { voiceOptions, withPersona } from "../lib/i18n.js";
import { addJournalEntry, ankiTsv, journalThemes } from "../lib/journal.js";
import { copyText, decodeClassroom, encodeClassroom, shareText } from "../lib/share.js";
import { dailyThreePlan, ensureDailyThree, estimateRating } from "../lib/daily.js";
import { COURSE } from "../data/course.js";
import { GUESS_GAMES } from "../data/guess-games.js";
import { VISION } from "../data/vision.js";
import { LESSONS } from "../data/lessons.js";
import { OPENINGS } from "../data/openings.js";
import { activePuzzles, puzzleById } from "../data/puzzles.js";
import { addXp, awardBadge, logPrivacy, touchStreak } from "../ui/storage.js";

function voice(ctx, text) {
  if (!text || ctx.progress.settings?.voice === false) return;
  speakCoach(withPersona(text, ctx.progress.settings), voiceOptions(ctx.progress.settings));
}

export function renderLab(root, ctx) {
  const rating = estimateRating(ctx.progress);
  const misses = journalThemes(ctx.progress.journal);
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Practice lab</p>
        <h1>Extra boards for real games</h1>
        <p>Review, rush, guess master moves, drill vision, and keep a private journal. Puzzle rating estimate: <strong>${rating}</strong>.</p>
      </header>
      <div class="card-grid">
        <a class="card" href="#/today"><span class="card-kicker">Daily</span><strong>Today's three</strong><span>One lesson step, one puzzle, one opening ply.</span></a>
        <a class="card" href="#/review"><span class="card-kicker">After the game</span><strong>PGN review</strong><span>Paste a finished game. Human labels, optional sandbox — never during a live game.</span></a>
        <a class="card" href="#/journal"><span class="card-kicker">${ctx.progress.journal.length} saved</span><strong>Mistake journal</strong><span>${misses[0] ? `Mostly ${misses[0].id}.` : "Hang a piece, save it, quiz it later."} Anki export included.</span></a>
        <a class="card" href="#/rush"><span class="card-kicker">3 minutes</span><strong>Puzzle rush-lite</strong><span>Best ${ctx.progress.rushBest}. Fast tactics, same ideas.</span></a>
        <a class="card" href="#/guess"><span class="card-kicker">Masters</span><strong>Guess the move</strong><span>${ctx.progress.guessScore.correct} correct · ${ctx.progress.guessScore.played} tried.</span></a>
        <a class="card" href="#/vision"><span class="card-kicker">Eyes</span><strong>Board vision</strong><span>Click every square a piece attacks.</span></a>
        <a class="card" href="#/course"><span class="card-kicker">14 days</span><strong>First tournament</strong><span>A short course before you sit down with a clock.</span></a>
        <a class="card" href="#/classroom"><span class="card-kicker">Share</span><strong>Classroom code</strong><span>Encode a FEN + prompt. No server.</span></a>
        <a class="card" href="#/privacy"><span class="card-kicker">Local</span><strong>Privacy log</strong><span>What Pawnsy stored on this machine — never the moves themselves.</span></a>
        <a class="card" href="#/academy"><span class="card-kicker">Offline pack</span><strong>Academy + traps</strong><span>Lessons live in the extension. No network once it's loaded.</span></a>
      </div>
    </section>
  `;
}

export function renderToday(root, ctx) {
  const plan = dailyThreePlan();
  const state = ensureDailyThree(ctx.progress);
  ctx.save();
  const items = [
    { done: state.lesson, href: `#/academy/${plan.lesson.id}`, kicker: "Lesson", title: plan.lesson.title, blurb: plan.lesson.blurb },
    { done: state.puzzle, href: `#/tactics/${plan.puzzle.id}`, kicker: "Puzzle", title: plan.puzzle.title, blurb: "One tactic. Same clock as the daily puzzle." },
    { done: state.opening, href: `#/openings/${plan.opening.id}`, kicker: "Opening ply", title: plan.opening.name, blurb: plan.opening.summary },
  ];
  const n = items.filter((i) => i.done).length;
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Today · ${plan.date}</p>
        <h1>Three small things</h1>
        <p>${n}/3 done. A lesson step, a puzzle, and an opening drill — enough to keep the streak honest.</p>
      </header>
      <div class="card-grid">
        ${items
          .map(
            (item) => `<a class="card ${item.done ? "is-done" : ""}" href="${item.href}">
            <span class="card-kicker">${item.done ? "Done" : item.kicker}</span>
            <strong>${item.title}</strong>
            <span>${item.blurb}</span>
          </a>`,
          )
          .join("")}
      </div>
      <p class="muted">Bookmark this page if you like a morning dashboard. Pawnsy will not hijack your browser's new tab unless you choose a bookmark yourself.</p>
    </section>
  `;
}

export function renderReview(root, ctx) {
  const pending = ctx.progress.pendingPgn || "";
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Post-game review</p>
        <h1>Talk through a finished PGN</h1>
        <p>Human labels only — “this loses a pawn,” never “−1.7”. The local sandbox can suggest a calmer try <em>after</em> the game, never while a live rated game is running.</p>
      </header>
      <label class="field">
        <span>Paste PGN</span>
        <textarea id="pgn-in" rows="8" placeholder="1. e4 e5 2. Nf3 ...">${escapeHtml(pending)}</textarea>
      </label>
      <div class="lesson-actions">
        <button type="button" class="btn" id="pgn-load">Review with voice</button>
        <button type="button" class="btn ghost" id="pgn-sandbox" hidden>Ask the sandbox (finished game)</button>
      </div>
      <section class="lesson-layout" id="review-board-wrap" hidden>
        <div>
          <div class="board-well" id="review-board"></div>
          <div class="play-toolbar">
            <button type="button" class="btn ghost" id="rev-prev">Back</button>
            <button type="button" class="btn" id="rev-next">Next ply</button>
          </div>
        </div>
        <aside class="lesson-side">
          <p class="step-meter" id="rev-meter"></p>
          <div id="rev-speech"></div>
          <p class="muted" id="rev-quality"></p>
        </aside>
      </section>
    </section>
  `;

  const area = root.querySelector("#pgn-in");
  const wrap = root.querySelector("#review-board-wrap");
  const speech = root.querySelector("#rev-speech");
  const meter = root.querySelector("#rev-meter");
  const quality = root.querySelector("#rev-quality");
  const sandboxBtn = root.querySelector("#pgn-sandbox");
  let plies = [];
  let index = -1;
  let board;

  function paint() {
    if (!board) return;
    const ply = plies[index];
    const game = new Chess(ply ? ply.fen : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.setPiecesFromBoard(game.board());
    board.setLastMove(ply?.from, ply?.to);
    board.setCheck(game.inCheck() ? kingSquare(game, game.turn()) : null);
    meter.textContent = ply ? `Ply ${index + 1} / ${plies.length} · ${ply.san}` : "Start position";
    const line = ply ? ply.text : "Loaded. Step through each move.";
    speech.innerHTML = pawnsySays(line);
    quality.textContent = ply ? ply.quality : "";
    sandboxBtn.hidden = !ply;
    if (ply) voice(ctx, line);
  }

  root.querySelector("#pgn-load").addEventListener("click", () => {
    const result = reviewPlies(area.value);
    if (!result.ok) {
      speech.innerHTML = pawnsySays(result.error || "Could not read that PGN.");
      wrap.hidden = false;
      return;
    }
    plies = result.plies;
    index = plies.length ? 0 : -1;
    ctx.progress.pendingPgn = "";
    logPrivacy(ctx.progress, "review_open");
    ctx.save();
    wrap.hidden = false;
    if (!board) {
      board = new Board(root.querySelector("#review-board"), { interactive: false });
    }
    paint();
  });

  root.querySelector("#rev-next").addEventListener("click", () => {
    if (!plies.length) return;
    index = Math.min(plies.length - 1, index + 1);
    paint();
  });
  root.querySelector("#rev-prev").addEventListener("click", () => {
    if (!plies.length) return;
    index = Math.max(0, index - 1);
    paint();
  });
  sandboxBtn.addEventListener("click", () => {
    const ply = plies[index];
    if (!ply) return;
    const idea = sandboxIdea(ply.beforeFen);
    const line = idea || "The sandbox is quiet here — the game may already be over.";
    speech.innerHTML = pawnsySays(line, "This suggestion exists only because the PGN is finished.");
    voice(ctx, line);
  });

  if (pending.trim()) root.querySelector("#pgn-load").click();
}

export function renderJournal(root, ctx) {
  const list = ctx.progress.journal || [];
  if (!list.length) {
    root.innerHTML = `
      <section class="page">
        <header class="page-head">
          <p class="eyebrow">Mistake journal</p>
          <h1>No misses saved yet</h1>
          <p>When you hang a piece in Play or on Chess.com/Lichess, Pawnsy can store the position here. Quiz it later. Export to Anki whenever you like.</p>
        </header>
        <a class="btn" href="#/play">Play vs Pawnsy</a>
      </section>`;
    return;
  }

  const themes = journalThemes(list);
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Mistake journal</p>
        <h1>${list.length} positions</h1>
        <p>Theme weight: ${themes.map((t) => `${t.id} (${t.count})`).join(" · ")}. Tactics gym leans toward these when you tap “Your misses”.</p>
      </header>
      <div class="lesson-actions">
        <button type="button" class="btn" id="journal-quiz">Quiz a miss</button>
        <button type="button" class="btn ghost" id="journal-anki">Download Anki TSV</button>
      </div>
      <div class="card-grid" id="journal-grid">
        ${list
          .slice()
          .reverse()
          .map(
            (item) => `<div class="card static">
            <span class="card-kicker">${item.theme}${item.san ? ` · ${item.san}` : ""}</span>
            <strong>${item.note || "Saved position"}</strong>
            <span>${item.fen}</span>
          </div>`,
          )
          .join("")}
      </div>
      <section class="lesson-layout" id="quiz-wrap" hidden>
        <div>
          <div class="board-well" id="quiz-board"></div>
        </div>
        <aside class="lesson-side">
          <div id="quiz-speech"></div>
        </aside>
      </section>
    </section>
  `;

  root.querySelector("#journal-anki").addEventListener("click", () => {
    const tsv = ankiTsv(list);
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pawnsy-journal.tsv";
    a.click();
    URL.revokeObjectURL(url);
    logPrivacy(ctx.progress, "anki_export");
    ctx.save();
  });

  root.querySelector("#journal-quiz").addEventListener("click", () => {
    const item = list[Math.floor(Math.random() * list.length)];
    const wrap = root.querySelector("#quiz-wrap");
    wrap.hidden = false;
    const speech = root.querySelector("#quiz-speech");
    const game = new Chess(item.fen);
    const hanging = hangingPieces(game, game.turn());
    const want = new Set(hanging.map((h) => h.sq));
    speech.innerHTML = pawnsySays("Click the hanging piece (or every hanging square), then check.", item.note);
    const board = new Board(root.querySelector("#quiz-board"), { onSquare() {} });
    board.setPiecesFromBoard(game.board());
    board.setMode("select");
    board.setInteractive(true);
    const check = document.createElement("button");
    check.className = "btn";
    check.textContent = "Check squares";
    speech.after(check);
    check.addEventListener("click", () => {
      const got = new Set(board.selectedPicked());
      const ok = want.size && [...want].every((sq) => got.has(sq));
      speech.innerHTML = pawnsySays(ok ? "That's the loose piece. The pattern will show up again." : "Not quite. Look for a piece with attackers and no equal defenders.");
      if (ok) {
        addXp(ctx.progress, 4);
        touchStreak(ctx.progress);
        ctx.save();
      }
    });
  });
}

export function renderRush(root, ctx) {
  const pool = activePuzzles().filter((p) => p.solution?.length === 1);
  let score = 0;
  let left = 180;
  let current = null;
  let timer = null;
  let game;
  let board;
  let live = false;

  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/lab">Lab</a> · Rush-lite</p>
        <h1>3 minutes</h1>
        <div class="board-well" id="rush-board"></div>
      </div>
      <aside class="lesson-side">
        <p class="step-meter"><span id="rush-clock">3:00</span> · score <span id="rush-score">0</span> · best ${ctx.progress.rushBest}</p>
        <div id="rush-speech"></div>
        <div class="lesson-actions">
          <button type="button" class="btn" id="rush-start">Start</button>
          <a class="btn ghost" href="#/lab">Back</a>
        </div>
      </aside>
    </section>
  `;

  const speech = root.querySelector("#rush-speech");
  const clockEl = root.querySelector("#rush-clock");
  const scoreEl = root.querySelector("#rush-score");
  speech.innerHTML = pawnsySays("Mate-in-ones and one-movers. Clock starts when you tap Start.");

  board = new Board(root.querySelector("#rush-board"), {
    onSelect(square) {
      if (!live || !game) return;
      board.setDests(legalDests(game, square));
    },
    onMove({ from, to }) {
      if (!live || !game) return;
      if (needsPromotion(game, from, to)) {
        board.askPromotion(game.turn(), (promotion) => tryRush(from, to, promotion));
        return;
      }
      tryRush(from, to);
    },
  });
  board.setInteractive(false);

  function showClock() {
    const m = Math.floor(left / 60);
    const s = String(left % 60).padStart(2, "0");
    clockEl.textContent = `${m}:${s}`;
  }

  function nextPuzzle() {
    current = pool[Math.floor(Math.random() * pool.length)];
    game = new Chess(current.fen);
    board.setOrientation(game.turn() === "w" ? "white" : "black");
    board.setPiecesFromBoard(game.board());
    board.clearSelection();
    board.setInteractive(true);
    speech.innerHTML = pawnsySays(`${game.turn() === "w" ? "White" : "Black"} to move.`);
  }

  function tryRush(from, to, promotion) {
    const played = game.move({ from, to, promotion: promotion || "q" });
    if (!played) return;
    const want = current.solution[0].replace(/[+#]/g, "");
    const got = played.san.replace(/[+#]/g, "");
    board.setPiecesFromBoard(game.board());
    if (got === want || played.san === current.solution[0]) {
      score += 1;
      scoreEl.textContent = String(score);
      nextPuzzle();
    } else {
      speech.innerHTML = pawnsySays("Miss. Next!");
      nextPuzzle();
    }
  }

  function finish() {
    live = false;
    window.clearInterval(timer);
    board.setInteractive(false);
    ctx.progress.rushBest = Math.max(ctx.progress.rushBest || 0, score);
    if (score >= 5) awardBadge(ctx.progress, "rush-5");
    addXp(ctx.progress, score);
    touchStreak(ctx.progress);
    logPrivacy(ctx.progress, "rush_finish");
    ctx.save();
    speech.innerHTML = pawnsySays(`Time. You scored ${score}. Best is ${ctx.progress.rushBest}.`);
    voice(ctx, `Time. You scored ${score}.`);
  }

  root.querySelector("#rush-start").addEventListener("click", () => {
    score = 0;
    left = 180;
    live = true;
    scoreEl.textContent = "0";
    showClock();
    nextPuzzle();
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      left -= 1;
      showClock();
      if (left <= 0) finish();
    }, 1000);
  });
}

export function renderGuess(root, ctx, id) {
  const gameData = GUESS_GAMES.find((g) => g.id === id) || null;
  if (!gameData) {
    root.innerHTML = `
      <section class="page">
        <header class="page-head">
          <p class="eyebrow">Guess the move</p>
          <h1>Play the master's next ply</h1>
          <p>You sit in their chair. Score a point when you match the game.</p>
        </header>
        <div class="card-grid">
          ${GUESS_GAMES.map(
            (g) => `<a class="card" href="#/guess/${g.id}">
            <span class="card-kicker">Master game</span>
            <strong>${g.title}</strong>
            <span>${g.blurb}</span>
          </a>`,
          ).join("")}
        </div>
      </section>`;
    return;
  }

  const parsed = new Chess();
  parsed.loadPgn(gameData.pgn, { strict: false });
  const line = parsed.history();
  let ply = 0;
  let game = new Chess();
  let correct = 0;

  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/guess">Guess</a></p>
        <h1>${gameData.title}</h1>
        <div class="board-well" id="guess-board"></div>
      </div>
      <aside class="lesson-side">
        <div id="guess-speech"></div>
        <p class="muted" id="guess-score">0 / 0</p>
        <div class="lesson-actions">
          <button type="button" class="btn ghost" id="guess-show">Show the move</button>
          <a class="btn" href="#/guess">Other games</a>
        </div>
      </aside>
    </section>
  `;

  const speech = root.querySelector("#guess-speech");
  const scoreEl = root.querySelector("#guess-score");
  const board = new Board(root.querySelector("#guess-board"), {
    onSelect(square) {
      board.setDests(legalDests(game, square));
    },
    onMove({ from, to }) {
      if (needsPromotion(game, from, to)) {
        board.askPromotion(game.turn(), (promotion) => tryGuess(from, to, promotion));
        return;
      }
      tryGuess(from, to);
    },
  });

  function paint(last) {
    board.setPiecesFromBoard(game.board());
    board.setLastMove(last?.from, last?.to);
    board.setCheck(game.inCheck() ? kingSquare(game, game.turn()) : null);
    board.clearSelection();
    scoreEl.textContent = `${correct} / ${ply} matched`;
  }

  function ask() {
    if (ply >= line.length) {
      board.setInteractive(false);
      ctx.progress.guessScore.played += ply;
      ctx.progress.guessScore.correct += correct;
      if (ctx.progress.guessScore.correct >= 10) awardBadge(ctx.progress, "guess-10");
      addXp(ctx.progress, correct);
      touchStreak(ctx.progress);
      ctx.save();
      speech.innerHTML = pawnsySays(`That's the fragment. You matched ${correct} of ${line.length} moves.`);
      voice(ctx, `You matched ${correct} of ${line.length} moves.`);
      return;
    }
    const side = game.turn() === "w" ? "White" : "Black";
    speech.innerHTML = pawnsySays(`${side} to play. What did the master choose?`);
  }

  function tryGuess(from, to, promotion) {
    if (ply >= line.length) return;
    const played = game.move({ from, to, promotion: promotion || "q" });
    if (!played) return;
    const want = line[ply].replace(/[+#]/g, "");
    const got = played.san.replace(/[+#]/g, "");
    const match = got === want || played.san === line[ply];
    ply += 1;
    if (match) {
      correct += 1;
      paint(played);
      speech.innerHTML = pawnsySays(`Yes — ${played.san}.`);
      window.setTimeout(ask, 400);
      return;
    }
    game.undo();
    const actual = game.move(line[ply - 1]);
    paint(actual);
    speech.innerHTML = pawnsySays(`The game went ${actual.san}. Yours was ${played.san}.`);
    window.setTimeout(ask, 700);
  }

  root.querySelector("#guess-show").addEventListener("click", () => {
    if (ply >= line.length) return;
    speech.innerHTML = pawnsySays(`The move was ${line[ply]}. Play it to continue.`);
  });

  paint();
  ask();
}

export function renderVision(root, ctx, id) {
  const drill = VISION.find((v) => v.id === id) || null;
  if (!drill) {
    root.innerHTML = `
      <section class="page">
        <header class="page-head">
          <p class="eyebrow">Board vision</p>
          <h1>See every square a piece hits</h1>
        </header>
        <div class="card-grid">
          ${VISION.map(
            (v) => `<a class="card" href="#/vision/${v.id}">
            <span class="card-kicker">Drill</span>
            <strong>${v.title}</strong>
            <span>${v.prompt}</span>
          </a>`,
          ).join("")}
        </div>
      </section>`;
    return;
  }

  const game = new Chess(drill.fen);
  root.innerHTML = `
    <section class="lesson-layout">
      <div>
        <p class="eyebrow"><a href="#/vision">Vision</a></p>
        <h1>${drill.title}</h1>
        <div class="board-well" id="vis-board"></div>
      </div>
      <aside class="lesson-side">
        <div id="vis-speech"></div>
        <div class="lesson-actions">
          <button type="button" class="btn" id="vis-check">Check squares</button>
          <a class="btn ghost" href="#/vision">More drills</a>
        </div>
      </aside>
    </section>
  `;
  const speech = root.querySelector("#vis-speech");
  speech.innerHTML = pawnsySays(drill.prompt);
  const board = new Board(root.querySelector("#vis-board"), { onSquare() {} });
  board.setPiecesFromBoard(game.board());
  board.setHighlights([drill.square]);
  board.setMode("select");
  board.setInteractive(true);

  root.querySelector("#vis-check").addEventListener("click", () => {
    const want = new Set(drill.answers);
    const got = new Set(board.selectedPicked());
    const ok = want.size === got.size && [...want].every((sq) => got.has(sq));
    speech.innerHTML = pawnsySays(ok ? "Clean vision. That scan is how you stop hanging pieces." : "Count again — include empty squares and captures.");
    if (ok) {
      addXp(ctx.progress, 5);
      touchStreak(ctx.progress);
      ctx.save();
    }
    voice(ctx, ok ? "Clean vision." : "Count again.");
  });
}

export function renderClassroom(root, ctx) {
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Classroom</p>
        <h1>Share a position without a server</h1>
        <p>The code is just a FEN and a prompt, encoded in the link. Nothing leaves this browser until you copy it.</p>
      </header>
      <label class="field"><span>FEN</span><input id="cls-fen" value="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" /></label>
      <label class="field"><span>Prompt</span><input id="cls-prompt" value="What is the plan for the side to move?" /></label>
      <div class="lesson-actions">
        <button type="button" class="btn" id="cls-make">Make code</button>
        <button type="button" class="btn ghost" id="cls-copy-share">Copy FEN + sentence</button>
      </div>
      <p class="muted" id="cls-code"></p>
      <label class="field"><span>Paste a code</span><input id="cls-in" placeholder="PWN1.…" /></label>
      <button type="button" class="btn ghost" id="cls-open">Open code</button>
      <div class="board-well" id="cls-board" style="max-width:360px;margin-top:16px"></div>
      <div id="cls-speech"></div>
    </section>
  `;
  const board = new Board(root.querySelector("#cls-board"), { interactive: false });
  const start = new Chess();
  board.setPiecesFromBoard(start.board());

  root.querySelector("#cls-make").addEventListener("click", () => {
    const fen = root.querySelector("#cls-fen").value.trim();
    const prompt = root.querySelector("#cls-prompt").value.trim();
    try {
      const chess = new Chess(fen);
      board.setPiecesFromBoard(chess.board());
      const code = encodeClassroom({ fen, prompt });
      root.querySelector("#cls-code").textContent = code;
      logPrivacy(ctx.progress, "classroom_encode");
      ctx.save();
    } catch {
      root.querySelector("#cls-code").textContent = "That FEN did not load.";
    }
  });

  root.querySelector("#cls-copy-share").addEventListener("click", async () => {
    const fen = root.querySelector("#cls-fen").value.trim();
    const prompt = root.querySelector("#cls-prompt").value.trim();
    const ok = await copyText(shareText(fen, prompt));
    root.querySelector("#cls-code").textContent = ok ? "Copied the position and sentence." : shareText(fen, prompt);
  });

  root.querySelector("#cls-open").addEventListener("click", () => {
    const decoded = decodeClassroom(root.querySelector("#cls-in").value);
    const speech = root.querySelector("#cls-speech");
    if (!decoded) {
      speech.innerHTML = pawnsySays("That code did not decode.");
      return;
    }
    try {
      const chess = new Chess(decoded.fen);
      board.setPiecesFromBoard(chess.board());
      root.querySelector("#cls-fen").value = decoded.fen;
      root.querySelector("#cls-prompt").value = decoded.prompt;
      speech.innerHTML = pawnsySays(decoded.prompt || "Have a look.");
    } catch {
      speech.innerHTML = pawnsySays("The FEN inside that code is illegal.");
    }
  });
}

export function renderPrivacy(root, ctx) {
  const log = (ctx.progress.privacyLog || []).slice().reverse();
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">Privacy</p>
        <h1>What stays on this machine</h1>
        <p>Pawnsy does not send your moves to a server. This log records only event names — never FEN, PGN, or clocks.</p>
      </header>
      <ul class="idea-list">
        ${log.length ? log.map((e) => `<li>${new Date(e.t).toLocaleString()} · ${e.kind}</li>`).join("") : "<li>Nothing recorded yet.</li>"}
      </ul>
      <p class="muted">Site coach, journal, and review write to chrome.storage (or localStorage in the web preview). Clear progress from the Progress page anytime.</p>
    </section>
  `;
}

export function renderCourse(root, ctx) {
  const done = ctx.progress.courseDone || {};
  const finished = COURSE.filter((d) => done[d.day]).length;
  root.innerHTML = `
    <section class="page">
      <header class="page-head">
        <p class="eyebrow">14-day course</p>
        <h1>First tournament</h1>
        <p>${finished}/14 days. Arrive early, write your moves, castle before you attack, and breathe on the clock.</p>
      </header>
      <div class="card-grid">
        ${COURSE.map((day) => {
          const lesson = LESSONS.find((l) => l.id === day.lesson);
          const opening = day.opening ? OPENINGS.find((o) => o.id === day.opening) : null;
          const puzzle = day.puzzle ? puzzleById(day.puzzle) : null;
          const isDone = Boolean(done[day.day]);
          return `<div class="card static ${isDone ? "is-done" : ""}">
            <span class="card-kicker">Day ${day.day}${isDone ? " · done" : ""}</span>
            <strong>${day.title}</strong>
            <span>${day.note}</span>
            <span>${[
              lesson ? `<a href="#/academy/${lesson.id}">${lesson.title}</a>` : "",
              puzzle ? `<a href="#/tactics/${puzzle.id}">${puzzle.title}</a>` : "",
              opening ? `<a href="#/openings/${opening.id}">${opening.name}</a>` : "",
            ]
              .filter(Boolean)
              .join(" · ")}</span>
            <button type="button" class="btn ghost" data-day="${day.day}">${isDone ? "Undo" : "Mark done"}</button>
          </div>`;
        }).join("")}
      </div>
    </section>
  `;
  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-day]");
    if (!btn) return;
    const day = Number(btn.dataset.day);
    if (ctx.progress.courseDone[day]) delete ctx.progress.courseDone[day];
    else ctx.progress.courseDone[day] = Date.now();
    const count = Object.keys(ctx.progress.courseDone).length;
    if (count >= 7) awardBadge(ctx.progress, "course-week");
    if (count >= 14) awardBadge(ctx.progress, "course-done");
    addXp(ctx.progress, 3);
    touchStreak(ctx.progress);
    ctx.save();
    renderCourse(root, ctx);
  });
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export { addJournalEntry };
