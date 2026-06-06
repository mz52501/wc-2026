export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          full_name?: string | null
          created_at?: string
        }
      }
      leagues: {
        Row: {
          id: number
          name: string
          invite_code: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          invite_code?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          invite_code?: string
          created_by?: string
          created_at?: string
        }
      }
      league_members: {
        Row: {
          league_id: number
          user_id: string
          joined_at: string
        }
        Insert: {
          league_id: number
          user_id: string
          joined_at?: string
        }
        Update: {
          league_id?: number
          user_id?: string
          joined_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          api_fixture_id: number | null
          stage: string
          group_label: string | null
          home_team: string | null
          away_team: string | null
          kickoff_at: string
          home_score: number | null
          away_score: number | null
          advancing_team: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          api_fixture_id?: number | null
          stage: string
          group_label?: string | null
          home_team?: string | null
          away_team?: string | null
          kickoff_at: string
          home_score?: number | null
          away_score?: number | null
          advancing_team?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          api_fixture_id?: number | null
          stage?: string
          group_label?: string | null
          home_team?: string | null
          away_team?: string | null
          kickoff_at?: string
          home_score?: number | null
          away_score?: number | null
          advancing_team?: string | null
          status?: string
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: number
          user_id: string
          match_id: number
          pred_home: number
          pred_away: number
          pred_advancing: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          match_id: number
          pred_home: number
          pred_away: number
          pred_advancing?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          match_id?: number
          pred_home?: number
          pred_away?: number
          pred_advancing?: string | null
          updated_at?: string
        }
      }
      matchups: {
        Row: {
          id: number
          league_id: number
          match_id: number
          player_a: string
          player_b: string
        }
        Insert: {
          id?: number
          league_id: number
          match_id: number
          player_a: string
          player_b: string
        }
        Update: {
          id?: number
          league_id?: number
          match_id?: number
          player_a?: string
          player_b?: string
        }
      }
      bonus_predictions: {
        Row: {
          user_id: string
          league_id: number
          winner: string | null
          top_scorer: string | null
          best_player: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          league_id: number
          winner?: string | null
          top_scorer?: string | null
          best_player?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          league_id?: number
          winner?: string | null
          top_scorer?: string | null
          best_player?: string | null
          updated_at?: string
        }
      }
      standings_snapshot: {
        Row: {
          league_id: number
          user_id: string
          position: number
          snapped_at: string
        }
        Insert: {
          league_id: number
          user_id: string
          position: number
          snapped_at?: string
        }
        Update: {
          league_id?: number
          user_id?: string
          position?: number
          snapped_at?: string
        }
      }
      bonus_answers: {
        Row: {
          id: number
          winner: string | null
          top_scorer: string | null
          best_player: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          winner?: string | null
          top_scorer?: string | null
          best_player?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          winner?: string | null
          top_scorer?: string | null
          best_player?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      prediction_scores: {
        Row: {
          user_id: string
          match_id: number
          points: number | null
        }
      }
      duel_results: {
        Row: {
          league_id: number
          match_id: number
          player_a: string
          player_b: string
          points_a: number
          points_b: number
          played: boolean
          winner: string | null
        }
      }
      standings: {
        Row: {
          league_id: number
          user_id: string
          display_name: string
          points: number
          wins: number
          draws: number
          losses: number
          prediction_points: number
        }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Functions: {
      prediction_points: {
        Args: {
          p_home: number
          p_away: number
          a_home: number
          a_away: number
        }
        Returns: number | null
      }
    }
  }
}
