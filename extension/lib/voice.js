import {
  clampPitch,
  clampRate,
  humanizeForSpeech,
  pickBestVoice,
  splitSentences,
} from "./voice-style.js";

const PIECE_WORDS = { N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };

export function speakableSan(san) {
  if (!san) return "";
  const check = /#$/.test(san) ? ", checkmate" : /\+$/.test(san) ? ", check" : "";
  let body = san.replace(/[+#]/g, "");
  if (body === "O-O") return `castles short${check}`;
  if (body === "O-O-O") return `castles long${check}`;
  body = body.replace(/=([QRBN])/g, (_, p) => ` promoting to ${PIECE_WORDS[p]}`);
  if (/^[NBRQK]/.test(body)) {
    const piece = PIECE_WORDS[body[0]];
    const rest = body.slice(1).replace(/^([a-h1-8])x/, " on $1 takes ").replace(/x/g, " takes ");
    return `${piece} ${rest.replace(/([a-h])([1-8])/g, "$1$2")}${check}`.replace(/\s+/g, " ").trim();
  }
  body = body.replace(/^([a-h])x/, "pawn takes ").replace(/x/g, " takes ");
  return `${body}${check}`;
}

export function forVoice(text) {
  if (!text) return "";
  return humanizeForSpeech(
    text
      .replace(/\bO-O-O\b/g, "castles long")
      .replace(/\bO-O\b/g, "castles short")
      .replace(/\b([NBRQK][a-h1-8x=QRBN]*[a-h][1-8](?:=[QRBN])?[+#]?)\b/g, (san) => speakableSan(san)),
  ).slice(0, 480);
}

export function speakCoach(text, options = {}) {
  const spoken = forVoice(text);
  if (!spoken) return;
  const payload = {
    type: "pawnsy-speak",
    text: spoken,
    lang: options.lang || "en-US",
    rate: clampRate(options.rate || 0.9),
    pitch: clampPitch(options.pitch ?? 1.05),
    volume: options.volume ?? 0.96,
    gender: options.gender || "female",
  };
  if (globalThis.chrome?.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage(payload);
      return;
    } catch {
      /* fall through to page speech */
    }
  }
  speakLocal(spoken, payload);
}

export function stopSpeaking() {
  if (globalThis.chrome?.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: "pawnsy-stop-speak" });
    } catch {
      /* ignore */
    }
  }
  if (globalThis.speechSynthesis) speechSynthesis.cancel();
}

function loadWebVoices() {
  const now = speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 500);
  });
}

function makeUtterance(chunk, options, voice) {
  const utter = new SpeechSynthesisUtterance(chunk);
  utter.lang = options.lang || "en-US";
  utter.rate = clampRate(options.rate || 0.9);
  utter.pitch = clampPitch(options.pitch ?? 1.05);
  utter.volume = Math.min(1, Math.max(0, Number(options.volume ?? 0.96)));
  if (voice) utter.voice = voice;
  return utter;
}

export async function speakLocal(text, options = {}) {
  if (!globalThis.speechSynthesis) return;
  speechSynthesis.cancel();
  await new Promise((resolve) => window.setTimeout(resolve, 40));
  const voices = await loadWebVoices();
  const pick = pickBestVoice(voices, { lang: options.lang || "en-US", gender: options.gender || "female" });
  const chosen = pick ? voices.find((v) => (v.voiceName || v.name) === pick.name) : null;
  const chunks = splitSentences(text);
  let index = 0;
  const next = () => {
    if (index >= chunks.length) return;
    const utter = makeUtterance(chunks[index], options, chosen);
    const drift = index % 3 === 1 ? 0.04 : index % 3 === 2 ? -0.03 : 0;
    utter.pitch = clampPitch((options.pitch ?? 1.05) + drift);
    index += 1;
    utter.onend = () => window.setTimeout(next, 90);
    speechSynthesis.speak(utter);
  };
  next();
}
