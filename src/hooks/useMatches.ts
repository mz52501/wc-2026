import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { circleMatchups } from '@/lib/matchups'

export function useStandings(leagueId: number) {
  return useQuery({
    queryKey: ['standings', leagueId],
    queryFn: async () => {
      const [
        { data: standingsData, error: standingsErr },
        { data: members, error: membersErr },
      ] = await Promise.all([
        supabase
          .from('standings')
          .select('user_id, display_name, points, wins, draws, losses')
          .eq('league_id', leagueId),
        supabase
          .from('league_members')
          .select('user_id, profiles(display_name)')
          .eq('league_id', leagueId),
      ])
      if (standingsErr) throw standingsErr
      if (membersErr) throw membersErr

      const standingsMap = new Map((standingsData ?? []).map(s => [s.user_id, s]))

      return (members ?? []).map(m => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
        const existing = standingsMap.get(m.user_id)
        return existing ?? {
          user_id: m.user_id,
          display_name: profile?.display_name ?? 'Unknown',
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
        }
      }).sort((a, b) => b.points - a.points || b.wins - a.wins)
    },
  })
}

export function useMyDuels(leagueId: number, userId: string) {
  return useQuery({
    queryKey: ['duels', leagueId, userId],
    queryFn: async () => {
      const [
        { data: duels, error: duelsErr },
        { data: matches, error: matchesErr },
        { data: profiles, error: profilesErr },
      ] = await Promise.all([
        supabase
          .from('duel_results')
          .select('*')
          .eq('league_id', leagueId)
          .or(`player_a.eq.${userId},player_b.eq.${userId}`),
        supabase
          .from('matches')
          .select('id, home_team, away_team, kickoff_at, stage, group_label, home_score, away_score')
          .order('kickoff_at'),
        supabase.from('profiles').select('id, display_name'),
      ])
      if (duelsErr) throw duelsErr
      if (matchesErr) throw matchesErr
      if (profilesErr) throw profilesErr

      const matchIds = (duels ?? []).map(d => d.match_id)
      const { data: predictions } = matchIds.length
        ? await supabase.from('predictions').select('user_id, match_id, pred_home, pred_away').in('match_id', matchIds)
        : { data: [] }

      const matchMap = new Map((matches ?? []).map(m => [m.id, m]))
      const profileMap = new Map((profiles ?? []).map(p => [p.id, p.display_name]))
      const predMap = new Map((predictions ?? []).map(p => [`${p.user_id}_${p.match_id}`, p]))

      return (duels ?? [])
        .map(duel => {
          const match = matchMap.get(duel.match_id) ?? null
          const isPlayerA = duel.player_a === userId
          const opponentId = isPlayerA ? duel.player_b : duel.player_a
          const myPoints = isPlayerA ? duel.points_a : duel.points_b
          const theirPoints = isPlayerA ? duel.points_b : duel.points_a
          const iWon = duel.winner === userId
          const theyWon = duel.winner === opponentId
          const myPred = predMap.get(`${userId}_${duel.match_id}`)
          const theirPred = predMap.get(`${opponentId}_${duel.match_id}`)
          return {
            matchId: duel.match_id,
            match,
            opponentName: profileMap.get(opponentId) ?? 'Unknown',
            myPoints,
            theirPoints,
            myPred: myPred ? `${myPred.pred_home}-${myPred.pred_away}` : null,
            theirPred: theirPred ? `${theirPred.pred_home}-${theirPred.pred_away}` : null,
            played: duel.played,
            iWon,
            isDraw: duel.played && duel.winner === null,
            iLost: theyWon,
          }
        })
        .sort((a, b) => {
          if (!a.match || !b.match) return 0
          return new Date(a.match.kickoff_at).getTime() - new Date(b.match.kickoff_at).getTime()
        })
    },
  })
}

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('kickoff_at')
      if (error) throw error
      return data
    },
  })
}

export function useMyPredictions() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['predictions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user!.id)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useMyScores() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['scores', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prediction_scores')
        .select('*')
        .eq('user_id', user!.id)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useSavePrediction() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      matchId,
      predHome,
      predAway,
    }: {
      matchId: number
      predHome: number
      predAway: number
    }) => {
      const { error } = await supabase.from('predictions').upsert(
        { user_id: user!.id, match_id: matchId, pred_home: predHome, pred_away: predAway },
        { onConflict: 'user_id,match_id' },
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['scores', user?.id] })
    },
  })
}

export function useMatchupsExist(leagueId: number) {
  return useQuery({
    queryKey: ['matchups-exist', leagueId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('matchups')
        .select('id', { count: 'exact', head: true })
        .eq('league_id', leagueId)
      if (error) throw error
      return (count ?? 0) > 0
    },
  })
}

export function useGenerateMatchups(leagueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberIds: string[]) => {
      // Fetch all match IDs ordered by kickoff
      const { data: matches, error: matchesErr } = await supabase
        .from('matches')
        .select('id')
        .order('kickoff_at')
      if (matchesErr) throw matchesErr

      const matchIds = (matches ?? []).map(m => m.id)
      const matchups = circleMatchups(leagueId, memberIds, matchIds)

      // Clear existing matchups for this league
      const { error: deleteErr } = await supabase
        .from('matchups')
        .delete()
        .eq('league_id', leagueId)
      if (deleteErr) throw deleteErr

      // Insert in batches of 500 to stay within request limits
      for (let i = 0; i < matchups.length; i += 500) {
        const { error: insertErr } = await supabase
          .from('matchups')
          .insert(matchups.slice(i, i + 500))
        if (insertErr) throw insertErr
      }

      return matchups.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duels', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['matchups-exist', leagueId] })
    },
  })
}
