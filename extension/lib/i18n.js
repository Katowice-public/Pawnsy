export const VOICE_LANG = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

const STRINGS = {
  en: {
    watching: "Watching this board. I explain moves after they happen — I will not whisper engine lines during a live game.",
    study: "Study board. Deeper hints are on. Still no live-game engine lines.",
    makeMove: "Make a move and I will talk you through it.",
    fairplay: "Teaching only. No engine best-moves on live rated games.",
    repeat: "Say that again",
    teach: "What's happening?",
    retry: "Retry board",
    share: "Share position",
    review: "Review this game",
    lost: "I lost the board. Hit Retry when the pieces are back.",
    muted: "Voice is off. Captions stay on.",
    newPos: "New position — I will coach from here.",
    noBoard: "I cannot see a board on this page yet.",
    incomplete: "That position looks incomplete. Try this on a standard game board.",
  },
  es: {
    watching: "Mirando este tablero. Explico las jugadas después de que ocurren — no susurro líneas de motor en partidas en vivo.",
    study: "Tablero de estudio. Hay pistas más profundas. Sigue sin líneas de motor en vivo.",
    makeMove: "Haz una jugada y te la cuento.",
    fairplay: "Solo enseñanza. Sin mejores jugadas de motor en partidas clasificadas en vivo.",
    repeat: "Repetir",
    teach: "¿Qué pasa?",
    retry: "Reintentar tablero",
    share: "Compartir posición",
    review: "Repasar esta partida",
    lost: "Perdí el tablero. Pulsa Reintentar cuando vuelvan las piezas.",
    muted: "Voz apagada. Los subtítulos siguen.",
    newPos: "Nueva posición — sigo desde aquí.",
    noBoard: "Aún no veo un tablero en esta página.",
    incomplete: "Esa posición parece incompleta. Prueba en un tablero de partida.",
  },
  fr: {
    watching: "Je regarde cet échiquier. J'explique les coups après qu'ils soient joués — pas de lignes de moteur en partie live.",
    study: "Plateau d'étude. Indices plus profonds. Toujours pas de lignes de moteur en live.",
    makeMove: "Jouez un coup, je le commente.",
    fairplay: "Enseignement seulement. Pas de meilleurs coups moteur en parties classées live.",
    repeat: "Répéter",
    teach: "Que se passe-t-il ?",
    retry: "Réessayer le plateau",
    share: "Partager la position",
    review: "Revoir cette partie",
    lost: "J'ai perdu le plateau. Réessayez quand les pièces sont là.",
    muted: "Voix coupée. Les sous-titres restent.",
    newPos: "Nouvelle position — je continue d'ici.",
    noBoard: "Je ne vois pas encore de plateau sur cette page.",
    incomplete: "Position incomplète. Essayez sur un vrai plateau de partie.",
  },
  de: {
    watching: "Ich schaue auf dieses Brett. Ich erkläre Züge, nachdem sie geschehen — keine Engine-Linien im Live-Spiel.",
    study: "Analysebrett. Tiefere Hinweise. Weiterhin keine Engine-Linien im Live-Spiel.",
    makeMove: "Mach einen Zug, dann erkläre ich ihn.",
    fairplay: "Nur Unterricht. Keine Engine-Bestzüge in gewerteten Live-Partien.",
    repeat: "Nochmal sagen",
    teach: "Was passiert?",
    retry: "Brett neu lesen",
    share: "Stellung teilen",
    review: "Diese Partie prüfen",
    lost: "Brett verloren. Neu lesen, wenn die Figuren wieder da sind.",
    muted: "Stimme aus. Untertitel bleiben.",
    newPos: "Neue Stellung — ich coache ab hier.",
    noBoard: "Ich sehe auf dieser Seite noch kein Brett.",
    incomplete: "Die Stellung sieht unvollständig aus. Versuch ein normales Partiebrett.",
  },
};

export function localeOf(settings) {
  const code = settings?.voiceLocale || "en";
  return STRINGS[code] ? code : "en";
}

export function t(settings, key) {
  const loc = localeOf(settings);
  return STRINGS[loc][key] || STRINGS.en[key] || key;
}

export function voiceOptions(settings) {
  const loc = localeOf(settings);
  const persona = settings?.persona || "calm";
  return {
    lang: VOICE_LANG[loc] || "en-US",
    rate: persona === "hype" ? 1.14 : 0.96,
  };
}

export function withPersona(text, settings, { ownMove } = {}) {
  if (!text) return text;
  const persona = settings?.persona || "calm";
  if (persona === "hype" && ownMove) {
    const pep = ["Nice find.", "Yes!", "That has bite.", "Keep going."];
    return `${text} ${pep[text.length % pep.length]}`;
  }
  if (persona === "calm") return text.replace(/!\s*$/, ".");
  return text;
}
