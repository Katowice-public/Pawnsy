const NAMES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen" };

export function addJournalEntry(progress, entry) {
  progress.journal = progress.journal || [];
  const fen = entry.fen;
  if (progress.journal.some((item) => item.fen === fen && item.theme === entry.theme)) {
    return progress;
  }
  progress.journal.push({
    id: `j${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    fen,
    theme: entry.theme || "hanging",
    note: entry.note || "",
    san: entry.san || "",
    at: Date.now(),
  });
  if (progress.journal.length > 80) progress.journal = progress.journal.slice(-80);
  if (progress.journal.length >= 5) {
    progress.badges["journal-5"] = progress.badges["journal-5"] || Date.now();
  }
  return progress;
}

export function journalThemes(journal = []) {
  const counts = {};
  for (const item of journal) {
    const theme = item.theme || "hanging";
    counts[theme] = (counts[theme] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count }));
}

export function ankiTsv(journal = []) {
  const lines = ["# Question\tAnswer\tFEN"];
  for (const item of journal) {
    const q = (item.note || `Find the ${item.theme} idea.`).replace(/\t/g, " ");
    const a = `${item.theme}${item.san ? ` after ${item.san}` : ""}`.replace(/\t/g, " ");
    lines.push(`${q}\t${a}\t${item.fen}`);
  }
  return lines.join("\n");
}

export function hangingNote(pieceType, square) {
  return `The ${NAMES[pieceType] || "piece"} on ${square} was left hanging.`;
}
