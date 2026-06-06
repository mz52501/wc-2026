import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LoginPage } from '@/pages/LoginPage'
import { SetupPage } from '@/pages/SetupPage'
import { LeagueSetupPage } from '@/pages/LeagueSetupPage'
import { LeagueFormOverlay } from '@/components/LeagueFormOverlay'

export function RootLayout() {
  const { session, profile, activeLeague, leagues, switchLeague, loading } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [leagueAction, setLeagueAction] = useState<'create' | 'join' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!session) return <LoginPage />
  if (!profile) return <SetupPage />
  if (!activeLeague) return <LeagueSetupPage />

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <nav className="border-b border-border sticky top-0 bg-background z-10">
        <div className="mx-auto max-w-4xl px-4 flex items-center h-14">

          {/* League switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-1 font-semibold text-sm tracking-tight hover:text-muted-foreground transition-colors cursor-pointer"
            >
              {activeLeague.name}
              <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-md border border-border bg-background shadow-md z-50 py-1">
                {leagues.map(league => (
                  <button
                    key={league.id}
                    onClick={() => { switchLeague(league); setDropdownOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer flex items-center justify-between ${league.id === activeLeague.id ? 'font-semibold' : ''}`}
                  >
                    {league.name}
                    {league.id === activeLeague.id && <span className="text-xs text-muted-foreground">✓</span>}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { setLeagueAction('create'); setDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
                  >
                    + Create league
                  </button>
                  <button
                    onClick={() => { setLeagueAction('join'); setDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
                  >
                    Join with invite code
                  </button>
                  <button
                    onClick={() => { void navigate({ to: '/rules' }); setDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer text-muted-foreground sm:hidden"
                  >
                    Rules
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <div className="hidden sm:flex gap-4 ml-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              Matches
            </Link>
            <Link to="/standings" className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              Standings
            </Link>
            <Link to="/my-duels" className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              My Duels
            </Link>
            <Link to="/bonus" className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              Bonus
            </Link>
            <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              Rules
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{profile.display_name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Logout
            </Button>
          </div>

        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {leagueAction && (
        <LeagueFormOverlay mode={leagueAction} onClose={() => setLeagueAction(null)} />
      )}

      {/* Bottom tab bar - mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background sm:hidden z-10">
        <div className="flex">
          <Link
            to="/"
            className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
          >
            Matches
          </Link>
          <Link
            to="/standings"
            className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
          >
            Standings
          </Link>
          <Link
            to="/my-duels"
            className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
          >
            My Duels
          </Link>
          <Link
            to="/bonus"
            className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
          >
            Bonus
          </Link>
        </div>
      </nav>
    </div>
  )
}
