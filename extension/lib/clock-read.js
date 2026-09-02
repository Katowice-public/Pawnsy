function parseClock(text) {
  const trimmed = String(text || "").trim();
  const mmss = trimmed.match(/(\d{1,2}):(\d{2})(?:\.(\d+))?/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const secs = trimmed.match(/^(\d{1,3}(?:\.\d+)?)$/);
  if (secs && Number(secs[1]) < 60) return Number(secs[1]);
  return null;
}

export function lowestClockSeconds(root = document) {
  const nodes = root.querySelectorAll(
    ".clock-time-monospace, .clock-component, .time, .rclock, [class*='clock']",
  );
  let min = Infinity;
  for (const el of nodes) {
    const sec = parseClock(el.textContent);
    if (sec !== null && sec < min) min = sec;
  }
  return Number.isFinite(min) ? min : null;
}

export function looksLikeBullet(url = globalThis.location) {
  const blob = `${url?.pathname || ""} ${url?.search || ""} ${document?.title || ""}`.toLowerCase();
  return /bullet|1\+0|1\+1|2\+0|2\+1/.test(blob);
}

export function shouldSilenceClock(settings, root = document) {
  if (!settings?.clockSilence) return false;
  if (looksLikeBullet()) return true;
  const sec = lowestClockSeconds(root);
  return sec !== null && sec <= 15;
}
