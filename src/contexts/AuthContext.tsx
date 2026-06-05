import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type League = Database['public']['Tables']['leagues']['Row']

const STORAGE_KEY = 'activeLeagueId'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  activeLeague: League | null
  leagues: League[]
  switchLeague: (league: League) => void
  refetchAndSwitch: (newLeagueId: number) => Promise<void>
  loading: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [activeLeague, setActiveLeague] = useState<League | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async (userId: string) => {
    const [{ data: profileData }, { data: memberData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('league_members').select('leagues(*)').eq('user_id', userId),
    ])

    setProfile(profileData ?? null)

    const allLeagues = (memberData ?? [])
      .map(m => (Array.isArray(m.leagues) ? m.leagues[0] : m.leagues))
      .filter(Boolean) as League[]

    setLeagues(allLeagues)

    const savedId = Number(localStorage.getItem(STORAGE_KEY))
    const saved = allLeagues.find(l => l.id === savedId)
    setActiveLeague(saved ?? allLeagues[0] ?? null)

    setLoading(false)
  }, [])

  const refetch = useCallback(async () => {
    if (session?.user) await fetchUserData(session.user.id)
  }, [session, fetchUserData])

  const refetchAndSwitch = useCallback(async (newLeagueId: number) => {
    localStorage.setItem(STORAGE_KEY, String(newLeagueId))
    if (session?.user) await fetchUserData(session.user.id)
  }, [session, fetchUserData])

  function switchLeague(league: League) {
    setActiveLeague(league)
    localStorage.setItem(STORAGE_KEY, String(league.id))
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchUserData(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setProfile(null)
        setLeagues([])
        setActiveLeague(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, activeLeague, leagues, switchLeague, refetchAndSwitch, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
