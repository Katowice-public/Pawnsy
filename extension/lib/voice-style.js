export const VOICE_GENDERS = [
  { id: "female", label: "Woman" },
  { id: "male", label: "Man" },
];

export const VOICE_TONES = [
  { id: "warm", label: "Warm" },
  { id: "calm", label: "Calm" },
  { id: "bright", label: "Bright" },
  { id: "hype", label: "Hype" },
  { id: "coach", label: "Firm coach" },
];

const TONE_STYLE = {
  warm: { rate: 0.9, pitchFemale: 1.06, pitchMale: 0.84, volume: 0.96 },
  calm: { rate: 0.84, pitchFemale: 1.0, pitchMale: 0.78, volume: 0.9 },
  bright: { rate: 1.0, pitchFemale: 1.16, pitchMale: 0.94, volume: 1 },
  hype: { rate: 1.1, pitchFemale: 1.2, pitchMale: 1.0, volume: 1 },
  coach: { rate: 0.92, pitchFemale: 0.96, pitchMale: 0.74, volume: 1 },
};

const FEMALE_HINT =
  /female|woman|girl|samantha|victoria|karen|moira|tessa|fiona|veena|zira|hazel|susan|vicki|allison|ava|kate|serena|nicky|aria|jenny|emma|sonia|sara|heera|linda|catherine|martha|eva|flo|amelia|helena|anna|paulina|monica|luciana|siri|google uk english female|microsoft aria|microsoft jenny|microsoft ana|microsoft michelle/i;

const MALE_HINT =
  /male|man|boy|david|mark|daniel|alex(?!a)|fred|tom\b|george|james|ravi|guy\b|davis|andrew|ryan|brian|matthew|arthur|thomas|nathan|eric|richard|google uk english male|microsoft guy|microsoft davis|microsoft andrew|microsoft steffan|microsoft ryan|microsoft brian/i;

const NATURAL_HINT =
  /natural|neural|google|premium|enhanced|wavenet|studio|samantha|aria|jenny|guy|davis|andrew|daniel|siri|offline \(natural\)|microsoft/i;

const ROBOT_HINT =
  /compact|espeak|dummy|silent|zarvox|trinoids|boing|cellos|deranged|hysterical|bad news|good news|whisper|junior|albert|bubbles|bahh|pipe organ|novelty|robot|cartoon|belinda compact|en-us-x-sfg/i;

export function styleFromSettings(settings = {}) {
  const gender = settings.voiceGender === "male" ? "male" : "female";
  const tone = TONE_STYLE[settings.persona] ? settings.persona : "warm";
  const style = TONE_STYLE[tone];
  const langMap = { en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE" };
  const loc = settings.voiceLocale || "en";
  return {
    lang: langMap[loc] || "en-US",
    gender,
    tone,
    rate: style.rate,
    pitch: gender === "male" ? style.pitchMale : style.pitchFemale,
    volume: style.volume,
  };
}

export function previewLine(settings = {}) {
  const gender = settings.voiceGender === "male" ? "male" : "female";
  const tone = settings.persona || "warm";
  if (gender === "male" && tone === "hype") {
    return "Hey. I'm Pawnsy. That was a real idea, not just a random piece shuffle. Let's keep going.";
  }
  if (gender === "male" && tone === "coach") {
    return "I'm Pawnsy. Look at the center, then the king. Do not rush the first move that looks shiny.";
  }
  if (gender === "male") {
    return "Hi. I'm Pawnsy. I'll talk you through what just happened, slowly enough to hear the idea.";
  }
  if (tone === "hype") {
    return "Hi, I'm Pawnsy! That move had a point. Stay with the idea, not a pile of numbers.";
  }
  if (tone === "coach") {
    return "I'm Pawnsy. Center, develop, king safety. Say the idea out loud before you touch a piece.";
  }
  if (tone === "bright") {
    return "Hi, I'm Pawnsy. I'll keep this light and clear, and tell you what the move actually did.";
  }
  if (tone === "calm") {
    return "Hello. I'm Pawnsy. I'll speak quietly, and explain the move after it happens.";
  }
  return "Hi. I'm Pawnsy. I'll talk you through the ideas, like a person sitting next to the board.";
}

export function humanizeForSpeech(text) {
  if (!text) return "";
  return String(text)
    .replace(/[—–]/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/\s*:/g, ",")
    .replace(/\s*\(\s*/g, ", ")
    .replace(/\s*\)\s*/g, ". ")
    .replace(/;/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\.\s*\./g, ".")
    .trim();
}

export function splitSentences(text) {
  const clean = humanizeForSpeech(text);
  if (!clean) return [];
  const parts = clean
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1 && clean.length > 140) {
    return clean.split(/,(?=\s)/).reduce((acc, bit) => {
      const piece = bit.trim().replace(/,?$/, "") + ( /[.!?]$/.test(bit.trim()) ? "" : ".");
      if (!acc.length || acc[acc.length - 1].length > 90) acc.push(piece);
      else acc[acc.length - 1] = `${acc[acc.length - 1].replace(/\.$/, "")}, ${piece}`;
      return acc;
    }, []);
  }
  return parts.length ? parts : [clean];
}

export function normalizeVoice(voice) {
  return {
    id: voice.voiceName || voice.name || "",
    name: voice.voiceName || voice.name || "",
    lang: voice.lang || "",
    gender: voice.gender || "",
    remote: Boolean(voice.remote) || voice.localService === false,
  };
}

export function guessVoiceGender(voice) {
  const n = normalizeVoice(voice);
  const blob = `${n.name} ${n.gender}`;
  if (n.gender === "female" || FEMALE_HINT.test(blob)) return "female";
  if (n.gender === "male" || MALE_HINT.test(blob)) return "male";
  return "unknown";
}

export function scoreVoice(voice, { lang = "en-US", gender = "female" } = {}) {
  const n = normalizeVoice(voice);
  if (!n.name) return -100;
  const name = n.name.toLowerCase();
  let score = 0;
  const want = String(lang).toLowerCase();
  const have = n.lang.toLowerCase();
  if (have && have.replace("_", "-") === want.replace("_", "-")) score += 10;
  else if (have.slice(0, 2) === want.slice(0, 2)) score += 5;
  else score -= 2;

  const guessed = guessVoiceGender(n);
  if (gender === "female") {
    if (guessed === "female") score += 14;
    else if (guessed === "male") score -= 12;
  } else {
    if (guessed === "male") score += 14;
    else if (guessed === "female") score -= 12;
  }

  if (NATURAL_HINT.test(name)) score += 8;
  if (n.remote) score += 3;
  if (ROBOT_HINT.test(name)) score -= 20;
  if (/english/i.test(n.name) && want.startsWith("en")) score += 1;
  return score;
}

export function pickBestVoice(voices, prefs = {}) {
  const list = (voices || []).map(normalizeVoice).filter((v) => v.name);
  if (!list.length) return null;
  let best = list[0];
  let bestScore = -Infinity;
  for (const voice of list) {
    const score = scoreVoice(voice, prefs);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return bestScore < -5 ? null : best;
}

export function clampPitch(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(2, Math.max(0, n));
}

export function clampRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(2, Math.max(0.3, n));
}
