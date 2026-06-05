import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useStandings, useGenerateMatchups, useMatchupsExist } from '@/hooks/useMatches'
import { Button } from '@/components/ui/button'

export function StandingsPage() {
  const { activeLeague, user } = useAuth()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(activeLeague!.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const { data: standings, isLoading } = useStandings(activeLeague!.id)
  const { mutate: generate, isPending, error } = useGenerateMatchups(activeLeague!.id)
  const { data: matchupsExist } = useMatchupsExist(activeLeague!.id)

  const isAdmin = user?.id === activeLeague?.created_by

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading standings...</p>
  if (!standings?.length) return null

  function handleGenerate() {
    const confirmed = window.confirm(
      `This will generate H2H matchups for ${standings!.length} players across all 104 matches.\n\nAny existing matchups will be cleared and regenerated.\n\nProceed?`
    )
    if (!confirmed) return
    generate(standings!.map(s => s.user_id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">{activeLeague!.name}</h1>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors cursor-pointer"
        >
          <span className="font-mono font-semibold tracking-widest">{activeLeague!.invite_code}</span>
          <span className="text-muted-foreground">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-8">#</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Username</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-10">W</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-10">D</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-10">L</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-12">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.user_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{row.display_name}</p>
                  {row.full_name && <p className="text-xs text-muted-foreground">{row.full_name}</p>}
                </td>
                <td className="px-3 py-3 text-center">{row.wins}</td>
                <td className="px-3 py-3 text-center">{row.draws}</td>
                <td className="px-3 py-3 text-center">{row.losses}</td>
                <td className="px-3 py-3 text-center font-semibold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Admin</p>
          <p className="text-sm text-muted-foreground mb-3">
            {standings.length} member{standings.length !== 1 ? 's' : ''} in this league.
            {standings.length < 2 && ' Need at least 2 members to generate matchups.'}
          </p>
          {matchupsExist ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-green-600">Matchups generated.</p>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending || standings.length < 2}
                onClick={handleGenerate}
              >
                {isPending ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || standings.length < 2}
              onClick={handleGenerate}
            >
              {isPending ? 'Generating...' : 'Generate matchups'}
            </Button>
          )}
          {error && (
            <p className="text-xs text-destructive mt-2">{(error as Error).message}</p>
          )}
        </div>
      )}
    </div>
  )
}
