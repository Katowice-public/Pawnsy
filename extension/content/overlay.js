const ROOT_ID = "pawnsy-root";

export function mountOverlay() {
  let root = document.getElementById(ROOT_ID);
  if (root) return root;
  root = document.createElement("aside");
  root.id = ROOT_ID;
  root.setAttribute("aria-live", "polite");
  root.innerHTML = `
    <header class="pawnsy-head">
      <strong>Pawnsy</strong>
      <span class="pawnsy-site"></span>
      <button type="button" class="pawnsy-icon" data-act="mute" title="Mute">🔊</button>
      <button type="button" class="pawnsy-icon" data-act="min" title="Collapse">–</button>
    </header>
    <p class="pawnsy-status">Watching this board. I explain moves after they happen — I will not whisper engine lines during a live game.</p>
    <p class="pawnsy-line"></p>
    <div class="pawnsy-actions">
      <button type="button" data-act="repeat">Say that again</button>
      <button type="button" data-act="teach">What's happening?</button>
    </div>
  `;
  document.documentElement.appendChild(root);
  return root;
}

export function bindOverlay(root, handlers) {
  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "min") root.classList.toggle("is-min");
    else if (act === "mute") handlers.toggleMute?.();
    else if (act === "repeat") handlers.repeat?.();
    else if (act === "teach") handlers.teach?.();
  });
}

export function setOverlayText(root, { status, line, muted, site }) {
  if (status) root.querySelector(".pawnsy-status").textContent = status;
  if (line !== undefined) root.querySelector(".pawnsy-line").textContent = line;
  if (site) root.querySelector(".pawnsy-site").textContent = site;
  const mute = root.querySelector("[data-act=mute]");
  mute.textContent = muted ? "🔇" : "🔊";
  mute.title = muted ? "Unmute" : "Mute";
}
