import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBonusPredictions, useSaveBonusPrediction, useSaveBonusAnswers } from '@/hooks/useMatches'
import { Button } from '@/components/ui/button'

// WC 2026 first kickoff June 11 19:00 UTC
const LOCK_AT = new Date('2026-06-11T19:00:00Z')

function isLocked() {
  return new Date() >= LOCK_AT
}

const FIELDS = [
  { key: 'winner', label: 'Tournament Winner' },
  { key: 'top_scorer', label: 'Top Scorer' },
  { key: 'best_player', label: 'Best Player' },
] as const

type Field = typeof FIELDS[number]['key']

export function BonusPage() {
  const { activeLeague, user } = useAuth()
  const { data, isLoading } = useBonusPredictions(activeLeague!.id)
  const savePred = useSaveBonusPrediction(activeLeague!.id)
  const saveAnswers = useSaveBonusAnswers()

  const [form, setForm] = useState({ winner: '', top_scorer: '', best_player: '' })
  const [adminForm, setAdminForm] = useState({ winner: '', top_scorer: '', best_player: '' })
  const [saved, setSaved] = useState(false)
  const [adminSaved, setAdminSaved] = useState(false)

  const myPred = data?.preds.get(user!.id)
  const answers = data?.answers
  const isAdmin = activeLeague!.created_by === user!.id
  const locked = isLocked()

  useEffect(() => {
    if (myPred) {
      setForm({
        winner: myPred.winner ?? '',
        top_scorer: myPred.top_scorer ?? '',
        best_player: myPred.best_player ?? '',
      })
    }
  }, [myPred])

  useEffect(() => {
    if (answers) {
      setAdminForm({
        winner: answers.winner ?? '',
        top_scorer: answers.top_scorer ?? '',
        best_player: answers.best_player ?? '',
      })
    }
  }, [answers])

  async function handleSave() {
    await savePred.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleAdminSave() {
    await saveAnswers.mutateAsync(adminForm)
    setAdminSaved(true)
    setTimeout(() => setAdminSaved(false), 2000)
  }

  function hit(field: Field) {
    if (!answers?.[field] || !myPred?.[field]) return null
    return myPred[field]?.toLowerCase().trim() === answers[field]?.toLowerCase().trim()
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-8">
      {/* My picks */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-1">Bonus Predictions</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {locked ? 'Predictions are locked.' : `Lock in your picks before Jun 11.`}
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {FIELDS.map(({ key, label }) => {
            const result = hit(key)
            return (
              <div key={key} className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-3">
                  {locked ? (
                    <p className="text-sm font-medium flex-1">{form[key] || <span className="text-muted-foreground italic">No pick</span>}</p>
                  ) : (
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder="Type your pick..."
                      className="flex-1 bg-transparent text-sm outline-none border-b border-border focus:border-foreground transition-colors py-0.5"
                    />
                  )}
                  {answers?.[key] && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Answer</p>
                      <p className={`text-sm font-semibold ${result ? 'text-green-600' : 'text-destructive'}`}>
                        {result ? '✓' : '✗'} {answers[key]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {!locked && (
          <Button
            className="mt-3 w-full sm:w-auto"
            onClick={handleSave}
            disabled={savePred.isPending}
          >
            {saved ? 'Saved!' : savePred.isPending ? 'Saving...' : 'Save picks'}
          </Button>
        )}
      </section>

      {/* League members' picks */}
      {data && data.members.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">League picks</h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Player</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Winner</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Top Scorer</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Best Player</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.members.map(m => {
                  const p = data.preds.get(m.user_id)
                  const showPicks = locked || m.user_id === user!.id
                  return (
                    <tr key={m.user_id} className={m.user_id === user!.id ? 'bg-muted/20' : ''}>
                      <td className="px-4 py-2.5 font-medium">{m.display_name}</td>
                      {FIELDS.map(({ key }) => (
                        <td key={key} className="px-4 py-2.5 text-muted-foreground">
                          {showPicks ? (p?.[key] ?? <span className="italic text-xs">-</span>) : <span className="text-xs">hidden</span>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Admin: set correct answers */}
      {isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Set correct answers (admin)</h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <input
                  type="text"
                  value={adminForm[key]}
                  onChange={e => setAdminForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="Enter correct answer..."
                  className="w-full bg-transparent text-sm outline-none border-b border-border focus:border-foreground transition-colors py-0.5"
                />
              </div>
            ))}
          </div>
          <Button
            className="mt-3 w-full sm:w-auto"
            onClick={handleAdminSave}
            disabled={saveAnswers.isPending}
          >
            {adminSaved ? 'Saved!' : saveAnswers.isPending ? 'Saving...' : 'Save answers'}
          </Button>
        </section>
      )}
    </div>
  )
}
