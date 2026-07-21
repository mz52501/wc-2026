function normalize(s: string) {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
}

// Croatian/Spanish/other-language country names → canonical English lowercase.
// Applied after normalize (so diacritics are already stripped).
const COUNTRY_ALIASES: Record<string, string> = {
  // Croatian
  spanjolska: 'spain',
  francuska: 'france',
  engleska: 'england',
  njemacka: 'germany',
  italija: 'italy',
  nizozemska: 'netherlands',
  belgija: 'belgium',
  portugalska: 'portugal',
  hrvatska: 'croatia',
  srbija: 'serbia',
  poljska: 'poland',
  ceska: 'czech republic',
  ceska republika: 'czech republic',
  svicarska: 'switzerland',
  svedska: 'sweden',
  danska: 'denmark',
  norveska: 'norway',
  madjarska: 'hungary',
  madarska: 'hungary',
  austrija: 'austria',
  slovacka: 'slovakia',
  slovenija: 'slovenia',
  rumunjska: 'romania',
  bugarska: 'bulgaria',
  grcka: 'greece',
  turska: 'turkey',
  ukrajina: 'ukraine',
  rusija: 'russia',
  brazil: 'brazil',
  brasil: 'brazil',
  argentina: 'argentina',
  urugvaj: 'uruguay',
  kolumbija: 'colombia',
  ekvador: 'ecuador',
  cile: 'chile',
  meksiko: 'mexico',
  kanada: 'canada',
  amerika: 'usa',
  sad: 'usa',
  'united states': 'usa',
  'united states of america': 'usa',
  japan: 'japan',
  koreja: 'south korea',
  'juzna koreja': 'south korea',
  iran: 'iran',
  'saudijska arabija': 'saudi arabia',
  australija: 'australia',
  maroko: 'morocco',
  tunis: 'tunisia',
  egipat: 'egypt',
  senegal: 'senegal',
  gana: 'ghana',
  kamerun: 'cameroon',
  'juznoafricka republika': 'south africa',

  // Spanish
  espana: 'spain',
  alemania: 'germany',
  francia: 'france',
  inglaterra: 'england',
  italia: 'italy',
  paises bajos: 'netherlands',
  belgica: 'belgium',
  suiza: 'switzerland',
  suecia: 'sweden',
  dinamarca: 'denmark',
  noruega: 'norway',
  polonia: 'poland',
  grecia: 'greece',
  turquia: 'turkey',
  rusia: 'russia',
  estados unidos: 'usa',
  japon: 'japan',
  corea del sur: 'south korea',
  marruecos: 'morocco',
  camerun: 'cameroon',
}

function canonical(s: string): string {
  const n = normalize(s)
  return COUNTRY_ALIASES[n] ?? n
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1]
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function fuzzyEq(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length < 3 || b.length < 3) return false
  const threshold = Math.max(1, Math.floor(Math.max(a.length, b.length) / 5))
  return levenshtein(a, b) <= threshold
}

function tokensSubset(small: string[], large: string[]): boolean {
  return small.every(t => large.some(u => fuzzyEq(t, u)))
}

// Matches on: exact, small typos, country aliases (Španjolska ~ Spain),
// and partial names via token subset (Kane ~ Harry Kane, Yamal ~ Lamine Yamal).
export function fuzzyMatch(userPick: string, answer: string): boolean {
  const a = canonical(userPick)
  const b = canonical(answer)
  if (a === b) return true
  if (fuzzyEq(a, b)) return true

  const at = a.split(' ').filter(Boolean)
  const bt = b.split(' ').filter(Boolean)
  if (at.length !== bt.length) {
    const [small, large] = at.length < bt.length ? [at, bt] : [bt, at]
    if (tokensSubset(small, large)) return true
  }
  return false
}

export const BONUS_PTS = { winner: 15, top_scorer: 10, best_player: 5 } as const
export type BonusField = keyof typeof BONUS_PTS

export function calcBonusPoints(
  pred: { winner: string | null; top_scorer: string | null; best_player: string | null } | undefined,
  answers: { winner: string | null; top_scorer: string | null; best_player: string | null } | null,
): number {
  if (!pred || !answers) return 0
  let pts = 0
  for (const field of Object.keys(BONUS_PTS) as BonusField[]) {
    const userPick = pred[field]
    const answer = answers[field]
    if (userPick && answer && fuzzyMatch(userPick, answer)) {
      pts += BONUS_PTS[field]
    }
  }
  return pts
}
