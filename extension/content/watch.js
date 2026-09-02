import { Chess } from "../vendor/chess.js";
import { explainMove } from "../lib/coach.js";
import { openingName } from "../data/openings.js";
import { findMoveMatching, loadFromMap } from "../lib/board-read.js";
import { explainPosition } from "../lib/position-talk.js";
import { readSiteSnapshot } from "../lib/site-board.js";
import { speakCoach, stopSpeaking } from "../lib/voice.js";
import { loadProgress, saveProgress } from "../ui/storage.js";
import { bindOverlay, mountOverlay, setOverlayText } from "./overlay.js";

export async function startWatching() {
  const progress = await loadProgress();
  const settings = progress.settings || {};
  if (settings.siteCoach === false) return null;

  const root = mountOverlay();
  const site = location.hostname.replace(/^www\./, "");
  let muted = settings.voice === false;
  let lastLine = "";
  let game = null;
  let lastPlacement = "";

  setOverlayText(root, {
    site,
    muted,
    status: "Watching this board. I explain moves after they happen — I will not whisper engine lines during a live game.",
    line: "Make a move and I will talk you through it.",
  });

  const say = (text, speak = true) => {
    lastLine = text;
    setOverlayText(root, { line: text, muted });
    if (speak && !muted) speakCoach(text);
  };

  bindOverlay(root, {
    toggleMute() {
      muted = !muted;
      progress.settings = { ...settings, ...progress.settings, voice: !muted };
      saveProgress(progress);
      setOverlayText(root, { muted });
      if (muted) stopSpeaking();
    },
    repeat() {
      if (lastLine && !muted) speakCoach(lastLine);
    },
    teach() {
      const snap = readSiteSnapshot();
      if (!snap) {
        say("I cannot see a board on this page yet.", false);
        return;
      }
      const fen = game ? game.fen() : snap.fen || `${snap.placement} ${snap.turn} - - 0 1`;
      try {
        say(explainPosition(fen));
      } catch {
        say("That position looks incomplete. Try this on a standard game board.");
      }
    },
  });

  const tick = () => {
    const snap = readSiteSnapshot();
    if (!snap?.placement) return;
    if (snap.placement === lastPlacement) return;
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
      return;
    }

    const move = findMoveMatching(game, snap.placement);
    if (!move) {
      game = snap.map ? loadFromMap(snap.map, snap.turn) : game;
      if (previous) {
        setOverlayText(root, { status: "New position — I will coach from here." });
      }
      return;
    }

    const before = game.fen();
    const played = game.move(move);
    if (!played) return;
    const title = openingName(game.history());
    const exp = explainMove(before, played, game, title);
    say(exp.text);
  };

  tick();
  const timer = window.setInterval(tick, 320);
  return () => window.clearInterval(timer);
}
