import { useRef, useEffect, useState } from 'react'
import { useMatches, useUpdateMatchResult } from '@/hooks/useMatches'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']

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

function ResultRow({ match }: { match: Match }) {
  const hasResult = match.home_score !== null && match.away_score !== null
  const [home, setHome] = useState(match.home_score?.toString() ?? '')
  const [away, setAway] = useState(match.away_score?.toString() ?? '')
  const [editing, setEditing] = useState(!hasResult)
  const [savedBriefly, setSavedBriefly] = useState(false)
  const { mutate: save, isPending } = useUpdateMatchResult()

  useEffect(() => {
    setHome(match.home_score?.toString() ?? '')
    setAway(match.away_score?.toString() ?? '')
    setEditing(match.home_score === null || match.away_score === null)
  }, [match.home_score, match.away_score])

  function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    save(
      { matchId: match.id, homeScore: h, awayScore: a },
      {
        onSuccess: () => {
          setSavedBriefly(true)
          setEditing(false)
          setTimeout(() => setSavedBriefly(false), 2000)
        },
      },
    )
  }

  function handleClear() {
    save(
      { matchId: match.id, homeScore: null, awayScore: null },
      {
        onSuccess: () => {
          setHome('')
          setAway('')
          setEditing(true)
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

  const isValidInput = home !== '' && away !== '' && parseInt(home) >= 0 && parseInt(away) >= 0

  const scoreDisplay = (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-sm font-bold w-5 text-center">{match.home_score}</span>
      <span className="text-muted-foreground text-xs">-</span>
      <span className="text-sm font-bold w-5 text-center">{match.away_score}</span>
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
        placeholder="?"
      />
      <span className="text-muted-foreground text-xs">-</span>
      <Input
        type="number"
        min={0}
        max={99}
        value={away}
        onChange={e => setAway(e.target.value)}
        className="w-12 h-8 text-center text-sm px-1"
        placeholder="?"
      />
    </div>
  )

  const actionButton = editing ? (
    <Button
      size="sm"
      variant={savedBriefly ? 'outline' : 'default'}
      className="h-8 text-xs"
      disabled={!isValidInput || isPending}
      onClick={handleSave}
    >
      {isPending ? '...' : savedBriefly ? 'Saved' : hasResult ? 'Update' : 'Save'}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="h-8 text-xs"
      onClick={() => setEditing(true)}
    >
      Edit
    </Button>
  )

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-36 shrink-0">
          <p className="text-xs text-muted-foreground">{stageLabel}</p>
          <p className="text-xs font-medium">{kickoffTime}</p>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-right flex-1 truncate">{homeTeam}</span>
          {editing ? scoreInputs : scoreDisplay}
          <span className="text-sm font-medium flex-1 truncate">{awayTeam}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {actionButton}
          {hasResult && editing && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={handleClear}
              disabled={isPending}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{kickoffTime}</p>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-medium truncate">{homeTeam}</span>
            <span className="text-xs text-muted-foreground shrink-0">v</span>
            <span className="text-sm font-medium truncate">{awayTeam}</span>
          </div>
          <div className="mt-1.5">{editing ? scoreInputs : scoreDisplay}</div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {actionButton}
          {hasResult && editing && (
            <button
              onClick={handleClear}
              disabled={isPending}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ResultsPage() {
  const { user } = useAuth()
  const { data: matches, isLoading } = useMatches()
  const firstMissingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && firstMissingRef.current) {
      const top = firstMissingRef.current.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [isLoading])

  if (!isAdmin(user?.email)) {
    return <p className="text-muted-foreground text-sm">Not authorized.</p>
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading matches...</p>
  }

  if (!matches?.length) {
    return <p className="text-muted-foreground text-sm">No matches found.</p>
  }

  const grouped = groupByDate(matches)
  const firstMissingGroupIndex = grouped.findIndex(([, dayMatches]) =>
    dayMatches.some(m => m.home_score === null || m.away_score === null)
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Enter match results</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Admin only. Save the final score for matches that have been played.
        </p>
      </div>
      {grouped.map(([dateKey, dayMatches], index) => (
        <div key={dateKey} ref={index === firstMissingGroupIndex ? firstMissingRef : undefined}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            {localDateLabel(dayMatches[0].kickoff_at)}
          </h2>
          <div className="rounded-lg border border-border bg-card px-4">
            {dayMatches.map(match => (
              <ResultRow key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
