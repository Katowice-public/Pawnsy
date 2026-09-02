chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("app/index.html") });
  }
});

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
    chrome.tts.stop();
    chrome.tts.speak(message.text, {
      rate: Number(message.rate) || 1.05,
      enqueue: false,
      lang: message.lang || "en-US",
    });
  }
});
