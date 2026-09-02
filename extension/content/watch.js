import { Chess } from "../vendor/chess.js";
import { explainMove } from "../lib/coach.js";
import { openingName } from "../data/openings.js";
import { findMoveMatching, loadFromMap } from "../lib/board-read.js";
import { explainPosition } from "../lib/position-talk.js";
import { boardOrientation, readSiteSnapshot } from "../lib/site-board.js";
import { speakCoach, stopSpeaking } from "../lib/voice.js";
import { awardBadge, loadProgress, logPrivacy, saveProgress } from "../ui/storage.js";
import { bindOverlay, mountOverlay, setOverlayText } from "./overlay.js";
import { t, voiceOptions, withPersona } from "../lib/i18n.js";
import { isStudyPage } from "../lib/page-kind.js";
import { shouldSilenceClock } from "../lib/clock-read.js";
import { kingSafetySentence } from "../lib/king-safety.js";
import { humanPositionLabel, labelMoveQuality, swingForMover } from "../lib/human-eval.js";
import { addJournalEntry, hangingNote } from "../lib/journal.js";
import { copyText, shareText } from "../lib/share.js";
import { pgnFromSans } from "../lib/review-game.js";
import { hangingPieces } from "../lib/coach.js";

export async function startWatching() {
  const progress = await loadProgress();
  const settings = { ...progress.settings };

  if (settings.siteCoach === false) return null;

  const study = isStudyPage();
  if (study && !settings.studyPages) return null;

  const root = mountOverlay();
  const site = location.hostname.replace(/^www\./, "");
  let muted = settings.voice === false;
  let lastLine = "";
  let lastFen = "";
  let game = null;
  let lastPlacement = "";
  let sans = [];
  let misses = 0;
  let sessionNoted = false;
  let gameOver = false;

  const labels = {
    repeat: t(settings, "repeat"),
    teach: t(settings, "teach"),
    retry: t(settings, "retry"),
    share: t(settings, "share"),
    review: t(settings, "review"),
  };

  setOverlayText(root, {
    site,
    muted,
    captions: settings.captions !== false,
    fairplay: t(settings, "fairplay"),
    status: study ? t(settings, "study") : t(settings, "watching"),
    line: t(settings, "makeMove"),
    labels,
    gameOver: false,
    lost: false,
  });

  const speakOpts = () => voiceOptions(progress.settings || settings);

  const say = (text, speak = true, extra = {}) => {
    lastLine = text;
    setOverlayText(root, { line: text, muted, gameOver, lost: false });
    const silence = shouldSilenceClock(progress.settings);
    if (speak && !muted && !silence) {
      speakCoach(withPersona(text, progress.settings, extra), speakOpts());
    }
  };

  function playerColor() {
    return boardOrientation() === "black" ? "b" : "w";
  }

  function ownMove(played) {
    return played.color === playerColor();
  }

  function resetReader() {
    game = null;
    lastPlacement = "";
    sans = [];
    misses = 0;
    gameOver = false;
    setOverlayText(root, { lost: false, gameOver: false, status: study ? t(settings, "study") : t(settings, "watching") });
  }

  function noteSession() {
    if (sessionNoted) return;
    sessionNoted = true;
    progress.siteSessions = (progress.siteSessions || 0) + 1;
    awardBadge(progress, "site-coach");
    if (progress.siteSessions >= 5) awardBadge(progress, "site-games-5");
    logPrivacy(progress, "site_session");
    saveProgress(progress);
  }

  function maybeJournal(played, after) {
    const hung = hangingPieces(after, played.color);
    if (!hung.length) return;
    const worst = hung[0];
    addJournalEntry(progress, {
      fen: after.fen(),
      theme: "hanging",
      san: played.san,
      note: hangingNote(worst.piece.type, worst.sq),
    });
    saveProgress(progress);
  }

  bindOverlay(root, {
    toggleMute() {
      muted = !muted;
      progress.settings = { ...progress.settings, voice: !muted };
      saveProgress(progress);
      setOverlayText(root, { muted });
      if (muted) stopSpeaking();
    },
    repeat() {
      if (lastLine && !muted && !shouldSilenceClock(progress.settings)) {
        speakCoach(withPersona(lastLine, progress.settings), speakOpts());
      }
    },
    teach() {
      const snap = readSiteSnapshot();
      if (!snap) {
        say(t(settings, "noBoard"), false);
        return;
      }
      const fen = game ? game.fen() : snap.fen || `${snap.placement} ${snap.turn} - - 0 1`;
      lastFen = fen;
      try {
        const bits = [explainPosition(fen)];
        const chess = new Chess(fen);
        const safety = kingSafetySentence(chess);
        if (safety) bits.push(safety);
        if (study) bits.push(humanPositionLabel(chess));
        say(bits.join(" "));
      } catch {
        say(t(settings, "incomplete"));
      }
    },
    retry() {
      resetReader();
      say(t(settings, "makeMove"), false);
    },
    async share() {
      const fen = lastFen || game?.fen() || readSiteSnapshot()?.fen || "";
      if (!fen) {
        say(t(settings, "noBoard"), false);
        return;
      }
      const text = shareText(fen, lastLine);
      const ok = await copyText(text);
      say(ok ? "Copied the position and my last sentence." : text, false);
    },
    review() {
      if (!sans.length) return;
      progress.pendingPgn = pgnFromSans(sans);
      logPrivacy(progress, "review_open");
      saveProgress(progress);
      if (globalThis.chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: "pawnsy-open", hash: "#/review" });
      }
    },
  });

  const tick = () => {
    try {
      const snap = readSiteSnapshot();
      if (!snap?.placement) {
        misses += 1;
        if (misses >= 8) {
          setOverlayText(root, { lost: true, status: t(settings, "lost") });
        }
        return;
      }
      misses = 0;
      if (snap.placement === lastPlacement) {
        if (game?.isGameOver() && !gameOver) {
          gameOver = true;
          setOverlayText(root, { gameOver: true });
        }
        return;
      }
      const previous = lastPlacement;
      lastPlacement = snap.placement;

      if (!game) {
        game = snap.map ? loadFromMap(snap.map, snap.turn) : null;
        if (!game && snap.placement) {
          try {
            game = new Chess(`${snap.placement} ${snap.turn} - - 0 1`);
          } catch {
            game = null;
          }
        }
        lastFen = game?.fen() || "";
        return;
      }

      const move = findMoveMatching(game, snap.placement);
      if (!move) {
        game = snap.map ? loadFromMap(snap.map, snap.turn) : game;
        sans = [];
        if (previous) {
          setOverlayText(root, { status: t(settings, "newPos") });
        }
        lastFen = game?.fen() || "";
        return;
      }

      const before = new Chess(game.fen());
      const played = game.move(move);
      if (!played) return;
      sans.push(played.san);
      lastFen = game.fen();
      noteSession();

      const title = openingName(game.history());
      const exp = explainMove(before.fen(), played, game, title);
      const safety = kingSafetySentence(game);
      const swing = swingForMover(before, game, played.color);
      const quality = labelMoveQuality(swing);
      const mine = ownMove(played);
      const talkMore = progress.settings.talkOwnMovesMore !== false;
      let text = exp.text;
      if (safety) text = `${text} ${safety}`;
      if (mine || study || swing <= -140 || swing >= 140) {
        text = `${text} ${quality}`;
      }
      if (talkMore && !mine && !game.inCheck() && swing > -140) {
        text = [exp.summary, safety].filter(Boolean).join(" ");
      }

      maybeJournal(played, game);
      gameOver = game.isGameOver();
      setOverlayText(root, { gameOver, lost: false });
      say(text, true, { ownMove: mine });
    } catch {
      misses += 1;
      if (misses >= 8) {
        setOverlayText(root, { lost: true, status: t(settings, "lost") });
      }
    }
  };

  tick();
  const timer = window.setInterval(tick, 320);
  return () => window.clearInterval(timer);
}
