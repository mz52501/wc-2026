function normalize(s: string) {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
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

// Allows 1 typo per 5 characters (min 1). Handles accents, case, extra spaces.
// "brazil" ~ "brasil", "mbappe" ~ "mbape", "argentina" ~ "argentyna"
export function fuzzyMatch(userPick: string, answer: string): boolean {
  const a = normalize(userPick)
  const b = normalize(answer)
  if (a === b) return true
  const threshold = Math.max(1, Math.floor(Math.max(a.length, b.length) / 5))
  return levenshtein(a, b) <= threshold
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
