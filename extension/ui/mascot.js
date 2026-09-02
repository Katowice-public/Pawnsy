export function mascotSvg(size = 72) {
  return `<svg class="mascot" width="${size}" height="${size}" viewBox="0 0 72 72" fill="none" aria-hidden="true">
    <circle cx="36" cy="36" r="34" fill="#241b12"/>
    <ellipse cx="36" cy="58" rx="18" ry="6" fill="#3a2a18"/>
    <path d="M18 54h36l-4-8H22l-4 8z" fill="#c9a227"/>
    <path d="M24 46c2-10 6-16 12-16s10 6 12 16H24z" fill="#e2c56a"/>
    <ellipse cx="36" cy="32" rx="11" ry="10" fill="#f3e6c8"/>
    <circle cx="36" cy="20" r="6.5" fill="#e2c56a"/>
    <circle cx="31.5" cy="31" r="2" fill="#2a2118"/>
    <circle cx="40.5" cy="31" r="2" fill="#2a2118"/>
    <circle cx="32.2" cy="30.3" r="0.6" fill="#f7f1e3"/>
    <circle cx="41.2" cy="30.3" r="0.6" fill="#f7f1e3"/>
    <path d="M32 36.5c1.4 2 6.6 2 8 0" stroke="#2a2118" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="29" cy="34.5" rx="2.2" ry="1.2" fill="#e3a08a" opacity=".85"/>
    <ellipse cx="43" cy="34.5" rx="2.2" ry="1.2" fill="#e3a08a" opacity=".85"/>
  </svg>`;
}

export function pawnsySays(text, extra = "") {
  return `<div class="speech">
    ${mascotSvg(56)}
    <div>
      <p class="speech-name">Pawnsy</p>
      <p class="speech-text">${text}</p>
      ${extra ? `<p class="speech-extra">${extra}</p>` : ""}
    </div>
  </div>`;
}
