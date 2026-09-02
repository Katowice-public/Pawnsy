export const VISION = [
  {
    id: "v1",
    title: "Knight from e4",
    fen: "4k3/8/8/8/4N3/8/8/4K3 w - - 0 1",
    square: "e4",
    prompt: "Click every square this knight can jump to.",
    answers: ["c3", "c5", "d2", "d6", "f2", "f6", "g3", "g5"],
  },
  {
    id: "v2",
    title: "Bishop on the long diagonal",
    fen: "4k3/8/8/8/8/8/8/B3K3 w - - 0 1",
    square: "a1",
    prompt: "Click every square this bishop attacks.",
    answers: ["b2", "c3", "d4", "e5", "f6", "g7", "h8"],
  },
  {
    id: "v3",
    title: "Rook on an open file",
    fen: "4k3/8/8/8/8/8/8/4KR2 w - - 0 1",
    square: "f1",
    prompt: "Click every square this rook can move to.",
    answers: ["f2", "f3", "f4", "f5", "f6", "f7", "f8", "g1", "h1"],
  },
  {
    id: "v4",
    title: "Queen in the corner",
    fen: "4k3/8/8/8/8/8/8/Q3K3 w - - 0 1",
    square: "a1",
    prompt: "Click the squares this queen controls on the a-file and the long diagonal (not the first rank).",
    answers: ["a2", "a3", "a4", "a5", "a6", "a7", "a8", "b2", "c3", "d4", "e5", "f6", "g7", "h8"],
  },
];
