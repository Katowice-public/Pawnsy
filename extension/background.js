import { clampPitch, clampRate, pickBestVoice, splitSentences } from "./lib/voice-style.js";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("app/index.html") });
  }
});

let cachedVoices = null;

function listVoices() {
  if (cachedVoices?.length) return Promise.resolve(cachedVoices);
  return new Promise((resolve) => {
    const finish = (list) => {
      cachedVoices = list || [];
      resolve(cachedVoices);
    };
    try {
      const result = chrome.tts.getVoices((list) => finish(list || []));
      if (result && typeof result.then === "function") {
        result.then((list) => finish(list || [])).catch(() => finish([]));
      }
    } catch {
      finish([]);
    }
  });
}

async function speakNatural(message) {
  const lang = message.lang || "en-US";
  const gender = message.gender || "female";
  const rate = clampRate(message.rate || 0.9);
  const pitch = clampPitch(message.pitch ?? 1.05);
  const volume = Math.min(1, Math.max(0, Number(message.volume ?? 0.96)));
  const chunks = splitSentences(message.text);
  if (!chunks.length) return;

  const voices = await listVoices();
  const pick = pickBestVoice(voices, { lang, gender });

  chrome.tts.stop();
  chunks.forEach((chunk, index) => {
    const drift = index % 3 === 1 ? 0.04 : index % 3 === 2 ? -0.03 : 0;
    const options = {
      enqueue: index > 0,
      lang,
      rate,
      pitch: clampPitch(pitch + drift),
      volume,
    };
    if (pick?.name) options.voiceName = pick.name;
    else options.gender = gender;
    chrome.tts.speak(chunk, options);
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message) return;
  if (message.type === "pawnsy-open") {
    const hash = message.hash || "#/";
    chrome.tabs.create({ url: chrome.runtime.getURL(`app/index.html${hash}`) });
    return;
  }
  if (!chrome.tts) return;
  if (message.type === "pawnsy-stop-speak") {
    chrome.tts.stop();
    return;
  }
  if (message.type === "pawnsy-speak" && message.text) {
    speakNatural(message);
  }
});
