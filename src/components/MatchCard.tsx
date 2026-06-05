import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSavePrediction } from '@/hooks/useMatches'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']
type Score = Database['public']['Views']['prediction_scores']['Row']

const STAGE_LABELS: Record<string, string> = {
  group_md1: 'MD1',
  group_md2: 'MD2',
  group_md3: 'MD3',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third_place: 'Third-place',
  final: 'Final',
}

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  score?: Score
}

export function MatchCard({ match, prediction, score }: MatchCardProps) {
  const isLocked = new Date() >= new Date(new Date(match.kickoff_at).getTime() - 60 * 60 * 1000)
  const hasResult = match.home_score !== null && match.away_score !== null

  const [home, setHome] = useState(prediction?.pred_home?.toString() ?? '0')
  const [away, setAway] = useState(prediction?.pred_away?.toString() ?? '0')
  const [savedBriefly, setSavedBriefly] = useState(false)

  const { mutate: save, isPending } = useSavePrediction()

  useEffect(() => {
    setHome(prediction?.pred_home?.toString() ?? '0')
    setAway(prediction?.pred_away?.toString() ?? '0')
  }, [prediction])

  function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    save(
      { matchId: match.id, predHome: h, predAway: a },
      {
        onSuccess: () => {
          setSavedBriefly(true)
          setTimeout(() => setSavedBriefly(false), 2000)
        },
      },
    )
  }

  const kickoffTime = new Date(match.kickoff_at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const stageLabel = match.group_label
    ? `Group ${match.group_label} · ${STAGE_LABELS[match.stage] ?? match.stage}`
    : (STAGE_LABELS[match.stage] ?? match.stage)

  const homeTeam = match.home_team ?? 'TBD'
  const awayTeam = match.away_team ?? 'TBD'

  const isValidInput = parseInt(home) >= 0 && parseInt(away) >= 0

  const lockedRight = (
    <div className="text-right">
      {prediction ? (
        <>
          <p className="text-xs text-muted-foreground leading-none mb-0.5">your pick</p>
          <p className="text-sm font-semibold tabular-nums">
            {prediction.pred_home}–{prediction.pred_away}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">no pick</p>
      )}
      {score?.points !== null && score?.points !== undefined && (
        <p className="text-xs text-muted-foreground">
          {score.points} pt{score.points !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )

  const saveButton = (
    <Button
      size="sm"
      variant={savedBriefly ? 'outline' : 'default'}
      className="h-8 text-xs"
      disabled={!isValidInput || isPending}
      onClick={handleSave}
    >
      {isPending ? '...' : savedBriefly ? 'Saved' : 'Save'}
    </Button>
  )

  const scoreDisplay = (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-sm font-bold w-5 text-center">
        {hasResult ? match.home_score : '?'}
      </span>
      <span className="text-muted-foreground text-xs">-</span>
      <span className="text-sm font-bold w-5 text-center">
        {hasResult ? match.away_score : '?'}
      </span>
    </div>
  )

  const scoreInputs = (
    <div className="flex items-center gap-1 shrink-0">
      <Input
        type="number"
        min={0}
        max={99}
        value={home}
        onChange={e => setHome(e.target.value)}
        className="w-12 h-8 text-center text-sm px-1"
        placeholder="0"
      />
      <span className="text-muted-foreground text-xs">-</span>
      <Input
        type="number"
        min={0}
        max={99}
        value={away}
        onChange={e => setAway(e.target.value)}
        className="w-12 h-8 text-center text-sm px-1"
        placeholder="0"
      />
    </div>
  )

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* ── Desktop layout ── */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-36 shrink-0">
          <p className="text-xs text-muted-foreground">{stageLabel}</p>
          <p className="text-xs font-medium">{kickoffTime}</p>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-right flex-1 truncate">{homeTeam}</span>
          {isLocked ? scoreDisplay : scoreInputs}
          <span className="text-sm font-medium flex-1 truncate">{awayTeam}</span>
        </div>
        <div className="w-20 shrink-0 flex justify-end">
          {isLocked ? lockedRight : saveButton}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex sm:hidden items-center gap-3">
        {/* Left: teams + score stacked */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-medium truncate">{homeTeam}</span>
            <span className="text-xs text-muted-foreground shrink-0">v</span>
            <span className="text-sm font-medium truncate">{awayTeam}</span>
          </div>
          <div className="mt-1.5">{isLocked ? scoreDisplay : scoreInputs}</div>
        </div>
        {/* Right: save or points */}
        <div className="shrink-0">{isLocked ? lockedRight : saveButton}</div>
      </div>
    </div>
  )
}
