import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  mode: 'create' | 'join'
  onClose: () => void
}

export function LeagueFormOverlay({ mode, onClose }: Props) {
  const { user, refetchAndSwitch } = useAuth()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const { data: league, error: leagueErr } = await supabase
      .from('leagues')
      .insert({ name: name.trim(), created_by: user.id })
      .select('id')
      .single()

    if (leagueErr || !league) { setError(leagueErr?.message ?? 'Failed to create league'); setLoading(false); return }

    const { error: memberErr } = await supabase
      .from('league_members')
      .insert({ league_id: league.id, user_id: user.id })

    if (memberErr) { setError(memberErr.message); setLoading(false); return }

    await refetchAndSwitch(league.id)
    onClose()
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const { data: league, error: leagueErr } = await supabase
      .from('leagues')
      .select('id')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle()

    if (leagueErr || !league) { setError('League not found. Check the invite code.'); setLoading(false); return }

    const { error: memberErr } = await supabase
      .from('league_members')
      .insert({ league_id: league.id, user_id: user.id })

    if (memberErr) { setError(memberErr.message); setLoading(false); return }

    await refetchAndSwitch(league.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-background rounded-lg border border-border w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Create a league</h2>
              <p className="text-sm text-muted-foreground">Give your group a name</p>
            </div>
            <Input
              placeholder="e.g. Ekipa s faksa"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Join a league</h2>
              <p className="text-sm text-muted-foreground">Enter the invite code your friend shared</p>
            </div>
            <Input
              placeholder="e.g. A3F7C2B1"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading || code.trim().length < 6} className="flex-1">
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
