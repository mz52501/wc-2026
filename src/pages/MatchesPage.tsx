import { useMatches, useMyPredictions, useMyScores } from '@/hooks/useMatches'
import { MatchCard } from '@/components/MatchCard'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']

function localDateKey(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
}

function localDateLabel(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupByDate(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const key = localDateKey(m.kickoff_at)
    const existing = map.get(key) ?? []
    existing.push(m)
    map.set(key, existing)
  }
  return Array.from(map.entries())
}

export function MatchesPage() {
  const { activeLeague } = useAuth()
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: predictions, isLoading: predsLoading } = useMyPredictions()
  const { data: scores } = useMyScores()

  if (matchesLoading || predsLoading) {
    return <p className="text-muted-foreground text-sm">Loading matches...</p>
  }

  if (!matches?.length) {
    return <p className="text-muted-foreground text-sm">No matches found.</p>
  }

  const predMap = new Map((predictions ?? []).map(p => [p.match_id, p]))
  const scoreMap = new Map((scores ?? []).map(s => [s.match_id, s]))

  const grouped = groupByDate(matches)

  return (
    <div className="space-y-8">
      {grouped.map(([dateKey, dayMatches]) => (
        <div key={dateKey}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            {localDateLabel(dayMatches[0].kickoff_at)}
          </h2>
          <div className="rounded-lg border border-border bg-card px-4">
            {dayMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predMap.get(match.id)}
                score={scoreMap.get(match.id)}
                leagueId={activeLeague?.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
