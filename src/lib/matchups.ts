export function circleMatchups(
  leagueId: number,
  playerIds: string[],
  matchIds: number[],
): Array<{ league_id: number; match_id: number; player_a: string; player_b: string }> {
  const players = [...playerIds]
  if (players.length % 2 !== 0) players.push('BYE')

  const n = players.length
  const fixed = players[0]
  const circle = players.slice(1) // n-1 elements, these rotate
  const numRounds = n - 1
  const halfN = n / 2

  // Build one full cycle of rounds
  const rounds: Array<Array<[string, string]>> = []
  for (let r = 0; r < numRounds; r++) {
    const pairs: Array<[string, string]> = []
    for (let j = 0; j < halfN; j++) {
      const a = j === 0 ? fixed : circle[(r + j - 1) % numRounds]
      const b = circle[(r - j - 1 + numRounds * 2) % numRounds]
      pairs.push([a, b])
    }
    rounds.push(pairs)
  }

  const result: Array<{ league_id: number; match_id: number; player_a: string; player_b: string }> = []
  for (let i = 0; i < matchIds.length; i++) {
    const round = rounds[i % numRounds]
    for (const [a, b] of round) {
      if (a === 'BYE' || b === 'BYE') continue
      result.push({ league_id: leagueId, match_id: matchIds[i], player_a: a, player_b: b })
    }
  }

  return result
}
