export function isStudyPage(url = globalThis.location) {
  if (!url) return false;
  const path = `${url.pathname || ""} ${url.hash || ""}`.toLowerCase();
  const host = String(url.hostname || "").replace(/^www\./, "");
  if (/analysis|study|broadcast|editor|library|tools|practice/.test(path)) return true;
  if (host.endsWith("lichess.org") && /^\/(analysis|study|broadcast|editor|tv|training)/.test(url.pathname || "")) {
    return true;
  }
  if (host.endsWith("chess.com") && /\/(analysis|library|daily-chess|computer)/.test(url.pathname || "")) {
    return true;
  }
  return false;
}

export function isDemoPage(url = globalThis.location) {
  return Boolean(url?.pathname?.includes("coach-demo") || url?.pathname?.includes("/content/demo"));
}
