import { pickMove } from "../lib/search.js";

let worker = null;
let nextId = 1;

try {
  worker = new Worker(new URL("../lib/engine-worker.js", import.meta.url), { type: "module" });
} catch {
  worker = null;
}

export function think(fen, level = "club") {
  return new Promise((resolve) => {
    if (!worker) {
      resolve(pickMove(fen, level));
      return;
    }
    const id = nextId;
    nextId += 1;
    const timer = setTimeout(() => {
      worker.removeEventListener("message", onMessage);
      resolve(pickMove(fen, level));
    }, 4500);
    const onMessage = (event) => {
      if (event.data.id !== id) return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      resolve(event.data.move || pickMove(fen, level));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, fen, level });
  });
}
