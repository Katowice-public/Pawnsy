import { pickMove } from "./search.js";

self.onmessage = (event) => {
  const { id, fen, level } = event.data;
  try {
    const move = pickMove(fen, level);
    self.postMessage({ id, ok: true, move });
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error) });
  }
};
