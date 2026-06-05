import { useAuth } from '@/contexts/AuthContext'
import { useMyDuels } from '@/hooks/useMatches'

const STAGE_LABELS: Record<string, string> = {
  group_md1: 'MD1', group_md2: 'MD2', group_md3: 'MD3',
  r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF',
  third_place: '3rd place', final: 'Final',
}

function isLocked(kickoffAt: string) {
  return new Date() >= new Date(new Date(kickoffAt).getTime() - 60 * 60 * 1000)
}


function UpcomingMeta({ d }: { d: { match: { group_label: string | null, stage: string, kickoff_at: string, home_team: string | null, away_team: string | null } | null, matchId: number, opponentName: string, myPred: string | null } }) {
  const m = d.match
  const stageLabel = m ? `${m.group_label ? `Group ${m.group_label} · ` : ''}${STAGE_LABELS[m.stage] ?? m.stage}` : ''
  const kickoff = m ? new Date(m.kickoff_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) : ''
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{stageLabel} · {kickoff}</p>
      <p className="text-sm font-medium truncate">{m ? `${m.home_team ?? 'TBD'} vs ${m.away_team ?? 'TBD'}` : `Match #${d.matchId}`}</p>
      <p className="text-sm text-muted-foreground">vs {d.opponentName}</p>
      {d.myPred && (
        <p className="text-xs text-muted-foreground mt-0.5">
          Your prediction: <span className="font-bold text-foreground">{d.myPred}</span>
        </p>
      )}
    </div>
  )
}

export function MyDuelsPage() {
  const { activeLeague, user } = useAuth()
  const { data: duels, isLoading } = useMyDuels(activeLeague!.id, user!.id)

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading duels...</p>
  if (!duels?.length) return <p className="text-muted-foreground text-sm">No duels yet — matchups are generated before the tournament starts.</p>

  const played = duels.filter(d => d.played)
  const locked = duels.filter(d => !d.played && d.match && isLocked(d.match.kickoff_at))
  const upcoming = duels.filter(d => !d.played && (!d.match || !isLocked(d.match.kickoff_at)))

  return (
    <div className="space-y-8">
      {played.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Played</h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {played.map(d => {
              const m = d.match
              const stageLabel = m ? `${m.group_label ? `Group ${m.group_label} · ` : ''}${STAGE_LABELS[m.stage] ?? m.stage}` : ''
              const kickoff = m ? new Date(m.kickoff_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) : ''
              const matchResult = m ? `${m.home_team ?? 'TBD'} ${m.home_score ?? '?'} – ${m.away_score ?? '?'} ${m.away_team ?? 'TBD'}` : `Match #${d.matchId}`
              const outcomeColor = d.iWon ? 'text-green-600' : d.iLost ? 'text-destructive' : 'text-muted-foreground'
              return (
                <div key={d.matchId} className="px-4 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{stageLabel} · {kickoff}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">You</p>
                      <p className="text-lg font-bold tabular-nums">{d.myPred ?? '?'}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground truncate">{matchResult}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${outcomeColor}`}>
                        {d.iWon ? 'WIN +3' : d.isDraw ? 'DRAW +1' : 'LOSS +0'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">{d.opponentName}</p>
                      <p className="text-lg font-bold tabular-nums">{d.theirPred ?? '?'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">In progress</h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {locked.map(d => {
              const m = d.match
              const stageLabel = m ? `${m.group_label ? `Group ${m.group_label} · ` : ''}${STAGE_LABELS[m.stage] ?? m.stage}` : ''
              const kickoff = m ? new Date(m.kickoff_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) : ''
              const matchLabel = m ? `${m.home_team ?? 'TBD'} vs ${m.away_team ?? 'TBD'}` : `Match #${d.matchId}`
              return (
                <div key={d.matchId} className="px-4 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{stageLabel} · {kickoff}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">You</p>
                      <p className="text-lg font-bold tabular-nums">{d.myPred ?? '?'}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground truncate">{matchLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">{d.opponentName}</p>
                      <p className="text-lg font-bold tabular-nums">{d.theirPred ?? '?'}</p>
                    </div>
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
            {upcoming.map(d => (
              <div key={d.matchId} className="flex items-center gap-4 px-4 py-3">
                <UpcomingMeta d={d} />
                <p className="text-xs text-muted-foreground shrink-0">upcoming</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
