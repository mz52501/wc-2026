import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SetupPage() {
  const { user, refetch } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      display_name: username.trim(),
    })
    if (error) { setError(error.message); setLoading(false); return }
    await refetch()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Pick a username</h1>
          <p className="text-muted-foreground text-sm">This is how you'll appear in standings and duels</p>
        </div>
        <Input
          placeholder="e.g. Zlatko"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={2}
          maxLength={30}
          autoFocus
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !username.trim()}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </div>
  )
}
