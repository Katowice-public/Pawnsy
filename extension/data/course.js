export const COURSE = [
  { day: 1, title: "Meet the board", lesson: "board", puzzle: "p01", note: "Light square on the right. Name three squares out loud." },
  { day: 2, title: "Pawn soul", lesson: "pawns", puzzle: "p08", note: "Play a 5-minute game thinking only about the center pawns." },
  { day: 3, title: "The jumper", lesson: "knights", puzzle: "p06", note: "Look for knight forks in a tactics set." },
  { day: 4, title: "Long diagonals", lesson: "bishops", puzzle: "p09", note: "Notice which bishop is 'good' vs your pawn chain." },
  { day: 5, title: "Open files", lesson: "rooks", puzzle: "p04", note: "In Play, try to put a rook on an open file." },
  { day: 6, title: "The queen's manners", lesson: "queen", puzzle: "p02", note: "Do not bring the queen out before move 6 unless you take something." },
  { day: 7, title: "King first", lesson: "king", puzzle: "p01", note: "Castle in every training game this week." },
  { day: 8, title: "Special moves", lesson: "special", puzzle: "p05", note: "Review en passant once so it never surprises you." },
  { day: 9, title: "Opening principles", lesson: "principles", opening: "italian", note: "Drill the Italian skeleton once." },
  { day: 10, title: "Tactics: forks", lesson: "forks", puzzle: "p07", note: "Add any hung-piece miss to your journal." },
  { day: 11, title: "Tactics: pins", lesson: "pins", puzzle: "p09", note: "Name a pin in a master game (guess-the-move)." },
  { day: 12, title: "Back-rank nerves", lesson: "back-rank", puzzle: "p01", note: "Make luft (h3/h6) in a Play game." },
  { day: 13, title: "Stop scholar's mate", lesson: "scholars", puzzle: "p05", opening: "italian", note: "Play ...Nc6 and ...Nf6, never panic." },
  { day: 14, title: "First tournament kit", lesson: "opposition", puzzle: "p02", opening: "caro", note: "Pack: arrive early, write moves, offer draws clearly, breathe." },
];

export function courseByDay(day) {
  return COURSE.find((item) => item.day === Number(day)) || null;
}
