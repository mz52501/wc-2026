import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'choose' | 'create' | 'join'

export function LeagueSetupPage() {
  const { user, refetch } = useAuth()
  const [mode, setMode] = useState<Mode>('choose')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createLeague(e: React.FormEvent) {
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

    await refetch()
  }

  async function joinLeague(e: React.FormEvent) {
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

    await refetch()
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Join a league</h1>
            <p className="text-muted-foreground text-sm">Create a new group or join one with an invite code</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setMode('create')} className="w-full">Create a league</Button>
            <Button onClick={() => setMode('join')} variant="outline" className="w-full">Join with invite code</Button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={createLeague} className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Create a league</h1>
            <p className="text-muted-foreground text-sm">Give your group a name</p>
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
            <Button type="button" variant="outline" onClick={() => { setMode('choose'); setError(null) }} className="flex-1">Back</Button>
            <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={joinLeague} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Join a league</h1>
          <p className="text-muted-foreground text-sm">Enter the invite code your friend shared</p>
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
          <Button type="button" variant="outline" onClick={() => { setMode('choose'); setError(null) }} className="flex-1">Back</Button>
          <Button type="submit" disabled={loading || code.trim().length < 6} className="flex-1">
            {loading ? 'Joining...' : 'Join'}
          </Button>
        </div>
      </form>
    </div>
  )
}
