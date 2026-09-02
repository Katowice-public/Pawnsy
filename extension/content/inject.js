import { startWatching } from "./watch.js";

const host = location.hostname;
if (/(^|\.)chess\.com$/.test(host) || /(^|\.)lichess\.org$/.test(host) || location.pathname.includes("coach-demo")) {
  startWatching();
}
