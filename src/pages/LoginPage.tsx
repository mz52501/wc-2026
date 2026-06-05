import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'signin' | 'signup' | 'reset'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) setError(error.message)
      else setResetSent(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground text-sm">Password reset link sent to <strong>{email}</strong></p>
          <button className="text-sm underline cursor-pointer" onClick={() => { setMode('signin'); setResetSent(false) }}>
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Reset password</h1>
            <p className="text-muted-foreground text-sm">Enter your email and we'll send a reset link</p>
          </div>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : 'Send reset link'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <button type="button" className="underline cursor-pointer" onClick={() => { setMode('signin'); setError(null) }}>
              Back to sign in
            </button>
          </p>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">WC 2026 Predictions</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
        <div className="flex justify-between text-sm text-muted-foreground">
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
          {mode === 'signin' && (
            <button
              type="button"
              className="underline cursor-pointer"
              onClick={() => { setMode('reset'); setError(null) }}
            >
              Forgot password?
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
