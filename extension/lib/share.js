function toB64(text) {
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(text)));
  }
  return Buffer.from(text, "utf8").toString("base64");
}

function fromB64(text) {
  if (typeof atob === "function") {
    return decodeURIComponent(escape(atob(text)));
  }
  return Buffer.from(text, "base64").toString("utf8");
}

export function encodeClassroom({ fen, prompt }) {
  const json = JSON.stringify({ v: 1, fen, prompt: prompt || "" });
  return `PWN1.${toB64(json)}`;
}

export function decodeClassroom(code) {
  const raw = String(code || "").trim();
  const body = raw.startsWith("PWN1.") ? raw.slice(5) : raw;
  try {
    const data = JSON.parse(fromB64(body));
    if (!data?.fen) return null;
    return { fen: data.fen, prompt: data.prompt || "" };
  } catch {
    return null;
  }
}

export function shareText(fen, sentence) {
  return `Pawnsy: ${sentence || "Have a look at this position."}\n${fen}`;
}

export async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
