export const LESSONS = [
  {
    id: "board",
    chapter: "Getting started",
    title: "The board",
    minutes: 4,
    blurb: "Files, ranks, and why the light square belongs on your right.",
    steps: [
      {
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        text: "A chessboard is 64 squares in an 8×8 grid. Columns are files (a–h). Rows are ranks (1–8). We name squares by file then rank: the bottom-right corner from White's side is h1.",
        extra: "Pawnsy rule: set the board so a light square sits at each player's right-hand corner. 'Light on the right.'",
        highlights: ["h1", "a1", "a8", "h8"],
      },
      {
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        text: "Each player has a light square in the near right corner. For White that square is h1. Click h1 to show you found it.",
        task: { type: "select", squares: ["h1"], prompt: "Select h1" },
      },
      {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "White sits on ranks 1–2, Black on 7–8. The queen starts on her own color: White's queen on d1 (light), Black's queen on d8 (dark). Remember: queen on her color.",
        highlights: ["d1", "d8", "e1", "e8"],
      },
    ],
  },
  {
    id: "pawns",
    chapter: "The pieces",
    title: "The pawn",
    minutes: 6,
    blurb: "One step forward, two on the first move, captures diagonally.",
    steps: [
      {
        fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1",
        text: "Pawns are the infantry. A pawn moves straight ahead, never backward. From its starting rank it may step one or two squares. This e-pawn can go to e3 or e4.",
        arrows: [
          ["e2", "e3"],
          ["e2", "e4"],
        ],
        highlights: ["e2"],
      },
      {
        fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1",
        text: "Advance the pawn two squares to e4. That's the most common first idea in chess: take a bite of the center.",
        task: { type: "move", from: "e2", to: "e4", success: "Nice. That pawn now controls d5 and f5." },
      },
      {
        fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
        text: "Pawns capture differently from how they move. They step forward, but they capture one square diagonally forward. The e-pawn can take the d5-pawn.",
        arrows: [["e4", "d5"]],
        task: { type: "move", from: "e4", to: "d5", success: "Exactly. Forward for walking, diagonal for capturing." },
      },
      {
        fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1",
        text: "If a pawn reaches the other end of the board, it promotes — usually to a queen. We'll practice that in Special moves. For now, treat pawns as the soul of the opening: they claim space for the bigger pieces.",
      },
    ],
  },
  {
    id: "knights",
    chapter: "The pieces",
    title: "The knight",
    minutes: 5,
    blurb: "The only jumper. An L-shape: two then one.",
    steps: [
      {
        fen: "4k3/8/8/8/4N3/8/8/4K3 w - - 0 1",
        text: "Knights move in an L: two squares in one direction, then one to the side. They can jump over anything. From e4 a knight can land on eight squares if the board allows.",
        highlights: ["e4", "d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"],
      },
      {
        fen: "4k3/8/8/8/4N3/8/8/4K3 w - - 0 1",
        text: "Click every square this knight can move to. There are eight.",
        extra: "Tip: knights always change the color of their square.",
        task: {
          type: "select",
          squares: ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"],
          prompt: "Select all knight hops from e4",
        },
      },
      {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "In the starting position the knight on g1 can jump to f3 or h3. f3 is the useful one — it watches d4 and e5. Play Nf3.",
        task: { type: "move", from: "g1", to: "f3", success: "That's the most common developing move in chess." },
      },
    ],
  },
  {
    id: "bishops",
    chapter: "The pieces",
    title: "The bishop",
    minutes: 4,
    blurb: "Long diagonals, one color for life.",
    steps: [
      {
        fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1",
        text: "Bishops slide any number of squares diagonally, but they cannot jump. Each bishop is born on one color and stays on that color forever. This one lives on light squares.",
        highlights: ["d4"],
        arrows: [
          ["d4", "a7"],
          ["d4", "h8"],
          ["d4", "a1"],
          ["d4", "g1"],
        ],
      },
      {
        fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1",
        text: "Slide the bishop to a7 — a long light-square diagonal.",
        task: { type: "move", from: "d4", to: "a7", success: "Bishops love open positions with pawns on both sides of the board." },
      },
      {
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
        text: "After 1.e4 the bishop on f1 can come out. Bc4 is the Italian idea: it aims at Black's f7 pawn. Play Bc4.",
        task: { type: "move", from: "f1", to: "c4", success: "f7 is Black's weakest square at the start — only the king defends it." },
      },
    ],
  },
  {
    id: "rooks",
    chapter: "The pieces",
    title: "The rook",
    minutes: 4,
    blurb: "Files and ranks. Rooks want open lines.",
    steps: [
      {
        fen: "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1",
        text: "Rooks move any number of squares horizontally or vertically. They cannot jump. A rook on an open file (no pawns in the way) is a long-range weapon.",
        arrows: [
          ["a1", "a8"],
          ["a1", "h1"],
        ],
      },
      {
        fen: "6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1",
        text: "If the enemy king is stuck on the back rank behind its own pawns, a rook check can be mate. Deliver mate with Ra8.",
        extra: "This pattern is called back-rank mate. We'll meet it again.",
        task: { type: "move", from: "a1", to: "a8", success: "The king has no flight square — his own pawns block g8 and h8." },
      },
      {
        fen: "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
        text: "Rooks also castle with the king. That's coming in Special moves. Until then: put rooks on open or half-open files, and connect them once the king is safe.",
        highlights: ["a1", "h1", "e1"],
      },
    ],
  },
  {
    id: "queen",
    chapter: "The pieces",
    title: "The queen",
    minutes: 4,
    blurb: "Bishop plus rook. The strongest piece — and a juicy target.",
    steps: [
      {
        fen: "4k3/8/8/8/4Q3/8/8/4K3 w - - 0 1",
        text: "The queen combines rook and bishop: any number of squares along ranks, files, and diagonals. From the center she radiates power. She is worth about nine pawns.",
        highlights: ["e4"],
      },
      {
        fen: "4k3/8/8/8/4Q3/8/8/4K3 w - - 0 1",
        text: "Park the queen on h7, deep in Black's kingside. (In a real game the king would often be there — here the board is empty so you can feel the range.)",
        task: { type: "move", from: "e4", to: "h7", success: "Long-range pieces need open lines. Pawns in the way shrink a queen." },
      },
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        text: "Beginners love to sprint the queen out (Qh5, Qf3). Sometimes it works. Often the queen gets chased and you lose time. Develop knights and bishops first; let the queen follow.",
        extra: "A good mantra: don't bring the queen out too early.",
        highlights: ["d1"],
      },
    ],
  },
  {
    id: "king",
    chapter: "The pieces",
    title: "The king, check, and mate",
    minutes: 6,
    blurb: "The king walks one square. Protect him — checkmate ends the game.",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/4K3 w - - 0 1",
        text: "The king moves one square in any direction. He is slow, so in the opening we hide him. In the endgame he becomes a fighting piece.",
        highlights: ["e1", "d1", "d2", "e2", "f2", "f1"],
      },
      {
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        text: "Walk the king to e2.",
        task: { type: "move", from: "e1", to: "e2", success: "The king cannot move into check — a square attacked by the enemy." },
      },
      {
        fen: "4k3/8/8/8/8/8/4R3/4K3 w - - 0 1",
        text: "Check means the king is attacked right now. Black is in check from the rook. There are three answers: move the king, capture the checker, or block the line (not against a knight).",
        extra: "You may never leave your own king in check. Illegal moves are simply not allowed.",
        highlights: ["e8", "e2"],
      },
      {
        fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
        text: "Checkmate is check with no legal escape. Play Qg7 and the king on h8 has nowhere to go.",
        task: { type: "move", from: "f7", to: "g7", success: "The queen checks from g7 and covers h6, h7, h8, g8. That's mate." },
      },
    ],
  },
  {
    id: "special",
    chapter: "How games work",
    title: "Castling, promotion, en passant",
    minutes: 7,
    blurb: "Three special moves that feel like exceptions — and show up constantly.",
    steps: [
      {
        fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
        text: "Castling is the only move where two pieces move at once. The king steps two squares toward a rook, and the rook hops to the other side. You may castle if the king and that rook have not moved, the squares between them are empty, and the king is not in check and does not pass through check.",
        arrows: [
          ["e1", "g1"],
          ["e1", "c1"],
        ],
      },
      {
        fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
        text: "Castle short (kingside). Drag the king from e1 to g1 — the rook will come along.",
        task: { type: "move", from: "e1", to: "g1", success: "King on g1, rook on f1. This is the safest house in most openings." },
      },
      {
        fen: "4k3/P7/8/8/8/8/8/4K3 w - - 0 1",
        text: "A pawn that reaches the last rank must promote. Choose a queen — the usual choice.",
        task: {
          type: "move",
          from: "a7",
          to: "a8",
          promotion: "q",
          success: "A new queen. Underpromotion to a knight is rare, but sometimes it is the only mate.",
        },
      },
      {
        fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
        text: "En passant: if an enemy pawn jumps two squares and lands beside yours, you may capture it as if it had moved only one square — but only on the very next move. Capture exd6.",
        extra: "The captured pawn is on d5; your pawn lands on d6.",
        task: { type: "move", from: "e5", to: "d6", success: "That's en passant. Miss the one-move window and the chance is gone." },
      },
    ],
  },
  {
    id: "principles",
    chapter: "How games work",
    title: "Opening principles",
    minutes: 6,
    blurb: "Center, development, king safety. Three ideas that beat a bag of memorized moves.",
    steps: [
      {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Principle 1 — the center. Pawns on e4 and d4 (or e5 and d5) give your pieces more squares and cramp the opponent. Open with a central pawn.",
        task: { type: "move", from: "e2", to: "e4", success: "e4 also frees the queen and the f1-bishop." },
      },
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        text: "Principle 2 — develop. Knights and bishops should come off the back rank toward the center. Play Nf3.",
        task: { type: "move", from: "g1", to: "f3", success: "You develop and attack e5. Two jobs, one move." },
      },
      {
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        text: "Principle 3 — king safety. Castle once the knights and bishops are out of the way. First bring the bishop out: Bc4.",
        task: { type: "move", from: "f1", to: "c4", success: "Now the path is clear to castle." },
      },
      {
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        text: "Tuck the king away. Castle short.",
        task: { type: "move", from: "e1", to: "g1", success: "If you remember only three words from Pawnsy: center, develop, castle." },
      },
    ],
  },
  {
    id: "forks",
    chapter: "Tactics",
    title: "Forks",
    minutes: 5,
    blurb: "One piece attacks two at once. Knights are born to fork.",
    steps: [
      {
        fen: "q3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
        text: "A fork is a double attack. Knights are famous for it because they jump and check from odd angles. This knight on d5 can hop to c7, checking the king and attacking the queen.",
        arrows: [
          ["d5", "c7"],
          ["c7", "a8"],
          ["c7", "e8"],
        ],
      },
      {
        fen: "q3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
        text: "Play Nc7+ and fork king and queen. Black must step out of check and the queen falls next.",
        task: { type: "move", from: "d5", to: "c7", success: "Royal fork — when one of the targets is the king, the other piece is often free." },
      },
      {
        fen: "4k3/8/8/2p5/3P4/8/8/4K3 w - - 0 1",
        text: "Pawns fork too. If two enemy pieces sit diagonally in front of a pawn, one step can hit both. Here d4 can capture on c5 — in a real game there might be two pieces on c5 and e5.",
        extra: "Always glance: does my move attack two things?",
        task: { type: "move", from: "d4", to: "c5", success: "When you scan a position, look for every piece that attacks more than one target." },
      },
    ],
  },
  {
    id: "pins",
    chapter: "Tactics",
    title: "Pins",
    minutes: 5,
    blurb: "A piece that cannot (or should not) move because something bigger sits behind it.",
    steps: [
      {
        fen: "4k3/8/8/8/8/8/4n3/4R1K1 w - - 0 1",
        text: "An absolute pin: the knight on e2 cannot move, because it would leave the king in check from the rook. Illegal. The knight is stuck.",
        highlights: ["e1", "e2", "e8"],
        extra: "The rook, knight, and king line up on the e-file. Alignment is the clue.",
      },
      {
        fen: "4k3/8/8/8/8/8/4n3/4R1K1 w - - 0 1",
        text: "You can pile up on a pinned piece. The knight cannot run. But here the simplest idea is already on the board: the rook stares through it at the king. For this lesson, just take the hanging knight — wait, the knight isn't hanging from e1? The rook already attacks it. Capture it.",
        extra: "Pinned pieces are poor defenders. They look like they guard a square, but they may not be able to recapture.",
        task: { type: "move", from: "e1", to: "e2", success: "The king could not recapture because the rook would check. That's the pin doing its job." },
      },
      {
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2",
        text: "A relative pin: the piece can legally move, but doing so would lose a more valuable piece behind it (often the queen). Bishops on g5 pinning a knight to a queen are a classic.",
        highlights: ["c4", "d5"],
      },
    ],
  },
  {
    id: "back-rank",
    chapter: "Checkmates",
    title: "Back-rank mate",
    minutes: 4,
    blurb: "A rook or queen checks on the eighth rank and the king is boxed in by his own pawns.",
    steps: [
      {
        fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
        text: "Black's king looks safe behind three pawns. Those pawns are also a cage: g8 and h8 are blocked. A rook on the eighth rank mates.",
        arrows: [["a1", "a8"]],
      },
      {
        fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
        text: "Play Ra8#.",
        task: { type: "move", from: "a1", to: "a8", success: "Give your own king a 'luft' — a flight square like h3 — so this does not happen to you." },
      },
      {
        fen: "6k1/5ppp/8/8/8/7P/5PP1/R5K1 w - - 0 1",
        text: "White has already made luft with h3. If it were Black to check on the first rank, the king could step to h2. When you castle, a timely h3 or g3 (carefully) prevents back-rank accidents.",
        highlights: ["h3", "g1", "h2"],
      },
    ],
  },
  {
    id: "scholars",
    chapter: "Checkmates",
    title: "Scholar's mate — and how to stop it",
    minutes: 5,
    blurb: "The four-move mate everyone tries. Learn it so you never fall for it.",
    steps: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2",
        text: "Scholar's mate aims at f7 with bishop and queen: 1.e4 e5 2.Bc4, then Qh5 or Qf3. The threat is Qxf7 mate. It works only if Black defends poorly.",
        highlights: ["c4", "f7"],
      },
      {
        fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3",
        text: "White has lined up Qh5 and Bc4. The threat is Qxf7#. Black should not panic. The calm move is 3...g6, kicking the queen and covering f7. You are Black. Play g6.",
        task: { type: "move", from: "g7", to: "g6", success: "The queen is attacked and f7 is safe. White will lose time retreating." },
      },
      {
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
        text: "If instead Black plays a careless ...Nf6??, White mates on the spot. See it from White's side: Qxf7#.",
        extra: "Never copy this as your whole opening repertoire. Strong players stop it in one move, and your queen gets hunted.",
        task: { type: "move", from: "h5", to: "f7", success: "Mate. You now know the pattern — and the antidote (g6 or Qe7/Qf6)." },
      },
    ],
  },
  {
    id: "opposition",
    chapter: "Endgames",
    title: "Opposition",
    minutes: 6,
    blurb: "Kings face each other with one square between. The side that does not have to step aside often shepherds a pawn home.",
    steps: [
      {
        fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
        text: "Kings are in opposition when they face each other with one square in between. Here White can take the opposition by stepping to e4 — then Black will have to give way.",
        highlights: ["e3", "e4", "e6"],
      },
      {
        fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
        text: "Take the opposition. Play Ke4.",
        extra: "Whoever must move their king aside loses the 'face-off' and lets the other king advance.",
        task: { type: "move", from: "e3", to: "e4", success: "That's opposition. Black's king must now step left or right, and White can shoulder in." },
      },
      {
        fen: "8/8/4k3/8/4K3/8/8/8 b - - 0 1",
        text: "Now White already has the opposition and it is Black to move. Black must step aside. You will use this picture every time a king and pawn race to promotion.",
        highlights: ["e4", "e5", "e6"],
      },
    ],
  },
  {
    id: "lucena",
    chapter: "Endgames",
    title: "Lucena — building a bridge",
    minutes: 7,
    blurb: "The winning rook-and-pawn method: park the king, check the enemy away, then hide behind a rook 'bridge'.",
    steps: [
      {
        fen: "1K6/1P6/2k5/8/8/8/8/R7 w - - 0 1",
        text: "Lucena-style: White's pawn is one step from promoting, but the Black king shoulders the White king. The recipe is a bridge — the rook checks, then steps to the fourth rank so the king can come out.",
        highlights: ["b8", "b7", "c6", "a1"],
      },
      {
        fen: "1K6/1P6/2k5/8/8/8/8/R7 w - - 0 1",
        text: "First, check the Black king away from the pawn. Play Ra6+.",
        extra: "After the king steps back, the rook can swing to a fourth-rank square (the 'bridge') so checks from behind no longer matter.",
        task: { type: "move", from: "a1", to: "a6", success: "The king is driven off. Next you would build the bridge — rook to the fourth rank — then walk the king out and promote." },
      },
      {
        fen: "1K6/1P6/8/1k6/8/R7/8/8 w - - 0 1",
        text: "The rook on a3 is ready to become the shield. In a real Lucena you drop it to the fourth rank so when the king comes out, a check from behind is blocked. Remember the picture: pawn on 7th, rook builds a bridge, king escapes, pawn queens.",
        highlights: ["a3", "b7", "b8"],
      },
    ],
  },
  {
    id: "philidor",
    chapter: "Endgames",
    title: "Philidor — the drawing rook",
    minutes: 6,
    blurb: "King on the sixth rank, rook on the third. Keep the enemy king in front of its pawn and you hold the draw.",
    steps: [
      {
        fen: "8/8/4k3/4p3/8/8/4R3/4K3 b - - 0 1",
        text: "Philidor idea: the defending rook sits on the third rank (here e2, looking at the sixth from Black's view it's the other way). The drawing plan is to keep the attacking king from crossing the sixth rank until the pawn arrives — then check from behind.",
        highlights: ["e2", "e6", "e5"],
      },
      {
        fen: "8/8/4k3/4p3/8/8/4R3/4K3 w - - 0 1",
        text: "White is the defender. Keep the rook on the third rank for now. A useful waiting idea is Re3, still cutting the king off.",
        extra: "When the pawn reaches the sixth, abandon the rank and check the king from the rear — it cannot hide.",
        task: { type: "move", from: "e2", to: "e3", success: "That's the Philidor cut. The Black king cannot cross e3. Wait until the pawn comes closer, then check from behind." },
      },
      {
        fen: "8/8/4k3/4p3/8/4R3/8/4K3 w - - 0 1",
        text: "Hold this picture: rook on the third, king in front of the pawn. It is one of the few endgames every tournament player should be able to draw in their sleep.",
        highlights: ["e3", "e5", "e6"],
      },
    ],
  },
  {
    id: "legal-trap",
    chapter: "Traps",
    title: "Legal's mate",
    minutes: 5,
    blurb: "A famous queen sacrifice that mates with two knights and a bishop. Don't grab the queen.",
    steps: [
      {
        fen: "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
        text: "After 1.e4 e5 2.Nf3 d6, White often develops Bc4. If Black pins with ...Bg4 too casually, Legal's trap appears: knights jump, the queen is 'hanging', and mate follows on f7.",
        highlights: ["f3", "d6", "e4", "e5"],
      },
      {
        fen: "rn1qkbnr/ppp2ppp/3p4/4N3/2B1P1b1/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
        text: "White has just taken on e5. The bishop on g4 'wins' the queen on d1 — but taking it is suicide. You are Black. Do not take the queen. Play dxe5 instead, the honest recapture.",
        extra: "If 4...Bxd1?? White mates with Bxf7+ Ke7 Nd5#.",
        task: { type: "move", from: "d6", to: "e5", success: "That's the antidote. You took the knight, not the bait queen." },
      },
    ],
  },
  {
    id: "fishing-pole",
    chapter: "Traps",
    title: "The fishing pole",
    minutes: 5,
    blurb: "A rook-file trap: the knight on g4 looks loose, then h5 supports it and the h-file opens onto an uncastled or castled king.",
    steps: [
      {
        fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        text: "From a Ruy Lopez, Black can play ...Ng4 later and support it with ...h5. The knight looks hanging. If White grabs it, the h-file opens against the king.",
        highlights: ["f6", "b5", "e5"],
      },
      {
        fen: "r1bqkb1r/pppp1pp1/2n5/1B2p2p/4P1n1/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 7",
        text: "Black's knight on g4 is the bait, h5 the pole. White should not take on g4. Develop instead — a calm idea is h3, asking the knight to prove it. You are White. Play h3.",
        extra: "If hxg4 hxg4, the rook on h8 suddenly stares at h2.",
        task: { type: "move", from: "h2", to: "h3", success: "You asked the question. Traps work on greed — decline the gift and keep developing." },
      },
    ],
  },
  {
    id: "elephant-trap",
    chapter: "Traps",
    title: "The elephant trap",
    minutes: 5,
    blurb: "Queen's Gambit Declined: White thinks they win a pawn with Qa4+; Black's bishop recapture wins a piece.",
    steps: [
      {
        fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
        text: "QGD with ...Bb4. A greedy try is 4.Qa4+ to 'win' the bishop after cxd5. That is the elephant trap: Black recaptures on d5 with the pawn, then ...Bd7 hits the queen and the knight on c3 is pinned.",
        highlights: ["b4", "c3", "d5"],
      },
      {
        fen: "rnbqk1nr/ppp2ppp/4p3/3P4/1b1P4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4",
        text: "White has taken on d5. Recapture with the pawn — not the queen — so the bishop on b4 still pins the knight.",
        task: { type: "move", from: "e6", to: "d5", success: "Now ...Bd7 will harass a queen if it came to a4, and the pinned knight cannot recapture safely." },
      },
    ],
  },
];

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

export function chapterGroups() {
  const groups = [];
  const seen = new Map();
  for (const lesson of LESSONS) {
    if (!seen.has(lesson.chapter)) {
      const group = { chapter: lesson.chapter, lessons: [] };
      seen.set(lesson.chapter, group);
      groups.push(group);
    }
    seen.get(lesson.chapter).lessons.push(lesson);
  }
  return groups;
}
