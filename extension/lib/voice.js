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
  return text
    .replace(/\bO-O-O\b/g, "castles long")
    .replace(/\bO-O\b/g, "castles short")
    .replace(/\b([NBRQK][a-h1-8x=QRBN]*[a-h][1-8](?:=[QRBN])?[+#]?)\b/g, (san) => speakableSan(san))
    .replace(/\s+/g, " ")
    .trim();
}

export function speakCoach(text) {
  const spoken = forVoice(text).slice(0, 420);
  if (!spoken) return;
  if (globalThis.chrome?.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: "pawnsy-speak", text: spoken });
      return;
    } catch {
      /* fall through to page speech */
    }
  }
  speakLocal(spoken);
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

export function speakLocal(text) {
  if (!globalThis.speechSynthesis) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.02;
  utter.pitch = 1.04;
  const voices = speechSynthesis.getVoices();
  const pick =
    voices.find((v) => /en[-_]?US/i.test(v.lang) && /natural|google|samantha|female/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang));
  if (pick) utter.voice = pick;
  speechSynthesis.speak(utter);
}
