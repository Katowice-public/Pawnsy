chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("app/index.html") });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || !chrome.tts) return;
  if (message.type === "pawnsy-stop-speak") {
    chrome.tts.stop();
    return;
  }
  if (message.type === "pawnsy-speak" && message.text) {
    chrome.tts.stop();
    chrome.tts.speak(message.text, {
      rate: 1.05,
      enqueue: false,
      lang: "en-US",
    });
  }
});
