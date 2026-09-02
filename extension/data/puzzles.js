export const PUZZLES = [
  {
    id: "p01",
    theme: "mateIn1",
    title: "Back-rank finish",
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["Ra8#"],
    hint: "The king is boxed in by his own pawns. Use the open a-file.",
    explain: "Ra8 is mate because g8 and h8 are blocked by Black's pawns, and nothing can interpose on the eighth rank.",
  },
  {
    id: "p02",
    theme: "mateIn1",
    title: "Queen on the doorstep",
    fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qg7#"],
    hint: "Stand next to the king with the queen, supported by your own king.",
    explain: "Qg7# is the basic king-and-queen mate. White's king covers the escapes around h8.",
  },
  {
    id: "p03",
    theme: "mateIn1",
    title: "Smothered mate",
    fen: "6rk/6pp/8/4N3/8/8/8/4K3 w - - 0 1",
    solution: ["Nf7#"],
    hint: "A knight can mate a king buried under his own rook. Jump to f7.",
    explain: "Nf7# is smothered mate: g8, g7, and h7 are blocked by Black's own pieces, so the king has no flight square.",
  },
  {
    id: "p04",
    theme: "mateIn1",
    title: "Two-rook roller",
    fen: "4k3/R7/8/8/8/8/8/1R2K3 w - - 0 1",
    solution: ["Rb8#"],
    hint: "One rook already cuts the seventh rank. Put the other on the eighth.",
    explain: "The rook on a7 takes away d7, e7, and f7. Rb8# mates a king trapped on the edge.",
  },
  {
    id: "p05",
    theme: "mateIn1",
    title: "Scholar's strike",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["Qxf7#"],
    hint: "Bishop and queen both eye f7.",
    explain: "Qxf7# is scholar's mate, with the bishop on c4 protecting the queen. Learn the pattern so you can stop it with ...g6 or ...Qe7.",
  },
  {
    id: "p06",
    theme: "fork",
    title: "Royal fork",
    fen: "q3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
    solution: ["Nc7+"],
    hint: "Knights love c7. Check the king and glance at the queen.",
    explain: "Nc7+ forks king and queen. Black must step out of check, then Nxa8 wins the queen.",
  },
  {
    id: "p07",
    theme: "fork",
    title: "Knight in the hole",
    fen: "r3k2r/ppp2ppp/8/3N4/8/8/PPP2PPP/R3K2R w KQkq - 0 1",
    solution: ["Nc7+"],
    hint: "The d5 knight can jump into c7 with check.",
    explain: "Nc7+ forks the king and the rook on a8. A knight parked on d5 is often a monster.",
  },
  {
    id: "p08",
    theme: "fork",
    title: "Pawn fork",
    fen: "4k3/8/3n1n2/8/4P3/8/8/4K3 w - - 0 1",
    solution: ["e5"],
    hint: "Two black knights sit on the sixth rank. Advance the e-pawn.",
    explain: "e5 forks both knights. Pawns capture diagonally forward — picture those two attack squares before you push.",
  },
  {
    id: "p09",
    theme: "pin",
    title: "Pinned to the king",
    fen: "4k3/8/8/8/8/8/4n3/4R1K1 w - - 0 1",
    solution: ["Rxe2"],
    hint: "The knight cannot leave the e-file. Take it.",
    explain: "The knight is absolutely pinned to the king, so it cannot recapture in a useful way. Rxe2 wins a piece.",
  },
  {
    id: "p10",
    theme: "pin",
    title: "Pin and win",
    fen: "5k2/8/8/8/5n2/8/8/5RK1 w - - 0 1",
    solution: ["Rxf4"],
    hint: "The knight is stuck on the same file as its king.",
    explain: "Another absolute pin: the knight on f4 cannot legally move off the f-file, so the rook takes it for free.",
  },
  {
    id: "p11",
    theme: "skewer",
    title: "King in front of the queen",
    fen: "4k2q/8/8/8/8/8/R7/4K3 w - - 0 1",
    solution: ["Ra8+"],
    hint: "Check on the eighth rank. The queen is hiding behind the king.",
    explain: "A skewer attacks the valuable piece in front. After the king steps aside, Rxe8 — wait, the queen is on h8: Rxh8 wins her.",
  },
  {
    id: "p12",
    theme: "hanging",
    title: "Loose queen",
    fen: "4k3/8/8/8/8/2q5/8/2Q1K3 w - - 0 1",
    solution: ["Qxc3"],
    hint: "Is Black's queen defended?",
    explain: "The queen on c3 has no defender. Always scan for loose pieces before you look for combinations.",
  },
  {
    id: "p13",
    theme: "hanging",
    title: "Loose bishop",
    fen: "4k3/8/8/3b4/8/4N3/8/4K3 w - - 0 1",
    solution: ["Nxd5"],
    hint: "The bishop sits on d5 without a friend.",
    explain: "Nxd5 wins a bishop for nothing. Count attackers and defenders on every piece in the center.",
  },
  {
    id: "p14",
    theme: "mateIn1",
    title: "Corridor mate",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    solution: ["Re8#"],
    hint: "The rook wants the back rank. The king has no luft.",
    explain: "Re8# is back-rank mate. A pawn move like h6 would have given the king a flight square.",
  },
  {
    id: "p15",
    theme: "mateIn1",
    title: "Arabian mate",
    fen: "7k/6pp/5N2/8/8/8/8/R3K3 w - - 0 1",
    solution: ["Ra8#"],
    hint: "The knight already covers g8 and h7. Swing the rook to the eighth rank.",
    explain: "Ra8# is the Arabian mate pattern: rook on the back rank, knight covering the king's two flight squares.",
  },
  {
    id: "p16",
    theme: "fork",
    title: "Queen hits two",
    fen: "r3k3/1B6/2Q5/8/8/8/8/4K3 w - - 0 1",
    solution: ["Qc8+"],
    hint: "Check on the eighth rank. The rook on a8 is in the same line.",
    explain: "Qc8+ is protected by the bishop. Black must step out of check and the rook on a8 falls.",
  },
  {
    id: "p17",
    theme: "mateIn1",
    title: "King and rook",
    fen: "4k3/8/4K3/8/8/8/8/R7 w - - 0 1",
    solution: ["Ra8#"],
    hint: "Your king already takes the seventh rank. Swing the rook to the eighth.",
    explain: "With the kings in opposition, Ra8# is the basic king-and-rook mate: the rook checks on the edge and the king covers the escapes.",
  },
  {
    id: "p18",
    theme: "hanging",
    title: "Free rook",
    fen: "4k3/8/8/8/3r4/8/8/3QK3 w - - 0 1",
    solution: ["Qxd4"],
    hint: "Is the rook protected?",
    explain: "The rook on d4 has no defender. Qxd4 wins it. Grab the free stuff before you calculate a brilliancy.",
  },
  {
    id: "p19",
    theme: "mateIn1",
    title: "Queen on the long way",
    fen: "6k1/5ppp/8/8/8/8/8/5K1Q w - - 0 1",
    solution: ["Qa8#"],
    hint: "The long diagonal leads to the back rank.",
    explain: "Qa8# is another back-rank mate. The queen travels from h1 all the way to a8.",
  },
  {
    id: "p20",
    theme: "skewer",
    title: "Bishop skewer",
    fen: "8/8/8/2P5/8/2k5/5BK1/q7 w - - 0 1",
    solution: ["Bd4+"],
    hint: "Check on the long diagonal. The queen is hiding behind the king.",
    explain: "Bd4+ skewers king and queen. The pawn on c5 protects the bishop, so the king cannot capture it.",
  },
  {
    id: "p21",
    theme: "discovered",
    title: "Discovered mate",
    fen: "6k1/5ppp/8/8/8/4N3/8/4R1K1 w - - 0 1",
    solution: ["Nf5"],
    alt: ["Nd5", "Nc4", "Nc2", "Nd1", "Nf1", "Ng2", "Ng4"],
    hint: "The rook is aimed at the king. Move the knight off the e-file with tempo — or simply discover the mate.",
    explain: "Any knight move uncovers Re8# ideas. Nf5 is a clean choice; the uncovered rook mates on the e-file? King is on g8, not e8. Wait this is wrong if king is g8.",
    skip: true,
  },
  {
    id: "p22",
    theme: "discovered",
    title: "Open the file",
    fen: "4k3/8/4N3/8/8/8/8/4R1K1 w - - 0 1",
    solution: ["Nc7+"],
    hint: "The rook stares at the king. Jump the knight off the e-file with check.",
    explain: "Nc7+ is a double check: the knight checks from c7 and the rook is uncovered on the e-file. Double checks must be answered by the king.",
  },
];

export const THEMES = [
  { id: "all", label: "All themes" },
  { id: "mateIn1", label: "Mate in one" },
  { id: "fork", label: "Forks" },
  { id: "pin", label: "Pins" },
  { id: "skewer", label: "Skewers" },
  { id: "hanging", label: "Hanging pieces" },
  { id: "discovered", label: "Discovered checks" },
];

export function activePuzzles() {
  return PUZZLES.filter((p) => !p.skip);
}

export function puzzleById(id) {
  return activePuzzles().find((p) => p.id === id) || null;
}

export function dailyPuzzle() {
  const list = activePuzzles();
  const now = new Date();
  const seed = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
  return list[Math.abs(seed) % list.length];
}

export function puzzlesByTheme(theme) {
  const list = activePuzzles();
  if (!theme || theme === "all") return list;
  return list.filter((p) => p.theme === theme);
}
