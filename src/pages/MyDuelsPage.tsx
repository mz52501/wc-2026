import { useAuth } from '@/contexts/AuthContext'
import { useMyDuels } from '@/hooks/useMatches'

const STAGE_LABELS: Record<string, string> = {
  group_md1: 'MD1', group_md2: 'MD2', group_md3: 'MD3',
  r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF',
  third_place: '3rd place', final: 'Final',
}

export function MyDuelsPage() {
  const { activeLeague, user } = useAuth()
  const { data: duels, isLoading } = useMyDuels(activeLeague!.id, user!.id)

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading duels...</p>
  if (!duels?.length) return <p className="text-muted-foreground text-sm">No duels yet — matchups are generated before the tournament starts.</p>

  const played = duels.filter(d => d.played)
  const upcoming = duels.filter(d => !d.played)

  return (
    <div className="space-y-8">
      {played.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Played</h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {played.map(d => {
              const m = d.match
              const stageLabel = m
                ? `${m.group_label ? `Group ${m.group_label} · ` : ''}${STAGE_LABELS[m.stage] ?? m.stage}`
                : ''
              const matchLabel = m
                ? `${m.home_team ?? 'TBD'} ${m.home_score ?? '?'} – ${m.away_score ?? '?'} ${m.away_team ?? 'TBD'}`
                : `Match #${d.matchId}`
              const kickoff = m
                ? new Date(m.kickoff_at).toLocaleString(undefined, {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  })
                : ''

              return (
                <div key={d.matchId} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{stageLabel} · {kickoff}</p>
                    <p className="text-sm font-medium truncate">{matchLabel}</p>
                    <p className="text-xs text-muted-foreground">vs {d.opponentName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {d.myPoints} – {d.theirPoints}
                    </p>
                    <p className={`text-xs font-medium ${d.iWon ? 'text-green-600' : d.iLost ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {d.iWon ? 'WIN +3' : d.isDraw ? 'DRAW +1' : 'LOSS +0'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Upcoming</h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {upcoming.map(d => {
              const m = d.match
              const stageLabel = m
                ? `${m.group_label ? `Group ${m.group_label} · ` : ''}${STAGE_LABELS[m.stage] ?? m.stage}`
                : ''
              const matchLabel = m
                ? `${m.home_team ?? 'TBD'} vs ${m.away_team ?? 'TBD'}`
                : `Match #${d.matchId}`
              const kickoff = m
                ? new Date(m.kickoff_at).toLocaleString(undefined, {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  })
                : ''

              return (
                <div key={d.matchId} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{stageLabel} · {kickoff}</p>
                    <p className="text-sm font-medium truncate">{matchLabel}</p>
                    <p className="text-xs text-muted-foreground">vs {d.opponentName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">upcoming</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
