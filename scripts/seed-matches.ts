import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ws from 'ws'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  realtime: { transport: ws },
})

// All 104 WC2026 matches. kickoff_at is UTC.
// Source: NBC Sports / FIFA official schedule. Times converted from ET (EDT = UTC-4) to UTC.
// Fake api_fixture_ids (20260001-20260104) for idempotent upserts.
// Knockout stage home_team/away_team are null until teams are determined.
const matches = [
  // ── GROUP A ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260001, stage: 'group_md1', group_label: 'A', home_team: 'Mexico',               away_team: 'South Africa',       kickoff_at: '2026-06-11T19:00:00Z' },
  { api_fixture_id: 20260002, stage: 'group_md1', group_label: 'A', home_team: 'South Korea',           away_team: 'Czechia',            kickoff_at: '2026-06-12T02:00:00Z' },
  { api_fixture_id: 20260003, stage: 'group_md2', group_label: 'A', home_team: 'Czechia',               away_team: 'South Africa',       kickoff_at: '2026-06-18T16:00:00Z' },
  { api_fixture_id: 20260004, stage: 'group_md2', group_label: 'A', home_team: 'Mexico',               away_team: 'South Korea',        kickoff_at: '2026-06-19T01:00:00Z' },
  { api_fixture_id: 20260005, stage: 'group_md3', group_label: 'A', home_team: 'Czechia',               away_team: 'Mexico',             kickoff_at: '2026-06-25T01:00:00Z' },
  { api_fixture_id: 20260006, stage: 'group_md3', group_label: 'A', home_team: 'South Africa',          away_team: 'South Korea',        kickoff_at: '2026-06-25T01:00:00Z' },

  // ── GROUP B ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260007, stage: 'group_md1', group_label: 'B', home_team: 'Canada',                away_team: 'Bosnia and Herzegovina', kickoff_at: '2026-06-12T19:00:00Z' },
  { api_fixture_id: 20260008, stage: 'group_md1', group_label: 'B', home_team: 'Qatar',                 away_team: 'Switzerland',        kickoff_at: '2026-06-13T19:00:00Z' },
  { api_fixture_id: 20260009, stage: 'group_md2', group_label: 'B', home_team: 'Switzerland',           away_team: 'Bosnia and Herzegovina', kickoff_at: '2026-06-18T19:00:00Z' },
  { api_fixture_id: 20260010, stage: 'group_md2', group_label: 'B', home_team: 'Canada',                away_team: 'Qatar',              kickoff_at: '2026-06-18T22:00:00Z' },
  { api_fixture_id: 20260011, stage: 'group_md3', group_label: 'B', home_team: 'Switzerland',           away_team: 'Canada',             kickoff_at: '2026-06-24T19:00:00Z' },
  { api_fixture_id: 20260012, stage: 'group_md3', group_label: 'B', home_team: 'Bosnia and Herzegovina', away_team: 'Qatar',             kickoff_at: '2026-06-24T19:00:00Z' },

  // ── GROUP C ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260013, stage: 'group_md1', group_label: 'C', home_team: 'Brazil',               away_team: 'Morocco',            kickoff_at: '2026-06-13T22:00:00Z' },
  { api_fixture_id: 20260014, stage: 'group_md1', group_label: 'C', home_team: 'Haiti',                away_team: 'Scotland',           kickoff_at: '2026-06-14T01:00:00Z' },
  { api_fixture_id: 20260015, stage: 'group_md2', group_label: 'C', home_team: 'Scotland',             away_team: 'Morocco',            kickoff_at: '2026-06-19T22:00:00Z' },
  { api_fixture_id: 20260016, stage: 'group_md2', group_label: 'C', home_team: 'Brazil',               away_team: 'Haiti',              kickoff_at: '2026-06-20T01:00:00Z' },
  { api_fixture_id: 20260017, stage: 'group_md3', group_label: 'C', home_team: 'Scotland',             away_team: 'Brazil',             kickoff_at: '2026-06-24T22:00:00Z' },
  { api_fixture_id: 20260018, stage: 'group_md3', group_label: 'C', home_team: 'Morocco',              away_team: 'Haiti',              kickoff_at: '2026-06-24T22:00:00Z' },

  // ── GROUP D ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260019, stage: 'group_md1', group_label: 'D', home_team: 'USA',                  away_team: 'Paraguay',           kickoff_at: '2026-06-13T01:00:00Z' },
  { api_fixture_id: 20260020, stage: 'group_md1', group_label: 'D', home_team: 'Australia',            away_team: 'Türkiye',            kickoff_at: '2026-06-14T04:00:00Z' },
  { api_fixture_id: 20260021, stage: 'group_md2', group_label: 'D', home_team: 'USA',                  away_team: 'Australia',          kickoff_at: '2026-06-19T19:00:00Z' },
  { api_fixture_id: 20260022, stage: 'group_md2', group_label: 'D', home_team: 'Türkiye',              away_team: 'Paraguay',           kickoff_at: '2026-06-20T04:00:00Z' },
  { api_fixture_id: 20260023, stage: 'group_md3', group_label: 'D', home_team: 'Türkiye',              away_team: 'USA',                kickoff_at: '2026-06-26T02:00:00Z' },
  { api_fixture_id: 20260024, stage: 'group_md3', group_label: 'D', home_team: 'Paraguay',             away_team: 'Australia',          kickoff_at: '2026-06-26T02:00:00Z' },

  // ── GROUP E ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260025, stage: 'group_md1', group_label: 'E', home_team: 'Germany',              away_team: 'Curaçao',            kickoff_at: '2026-06-14T17:00:00Z' },
  { api_fixture_id: 20260026, stage: 'group_md1', group_label: 'E', home_team: 'Ivory Coast',          away_team: 'Ecuador',            kickoff_at: '2026-06-14T23:00:00Z' },
  { api_fixture_id: 20260027, stage: 'group_md2', group_label: 'E', home_team: 'Germany',              away_team: 'Ivory Coast',        kickoff_at: '2026-06-20T20:00:00Z' },
  { api_fixture_id: 20260028, stage: 'group_md2', group_label: 'E', home_team: 'Ecuador',              away_team: 'Curaçao',            kickoff_at: '2026-06-21T00:00:00Z' },
  { api_fixture_id: 20260029, stage: 'group_md3', group_label: 'E', home_team: 'Ecuador',              away_team: 'Germany',            kickoff_at: '2026-06-25T20:00:00Z' },
  { api_fixture_id: 20260030, stage: 'group_md3', group_label: 'E', home_team: 'Curaçao',              away_team: 'Ivory Coast',        kickoff_at: '2026-06-25T20:00:00Z' },

  // ── GROUP F ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260031, stage: 'group_md1', group_label: 'F', home_team: 'Netherlands',          away_team: 'Japan',              kickoff_at: '2026-06-14T20:00:00Z' },
  { api_fixture_id: 20260032, stage: 'group_md1', group_label: 'F', home_team: 'Sweden',               away_team: 'Tunisia',            kickoff_at: '2026-06-15T02:00:00Z' },
  { api_fixture_id: 20260033, stage: 'group_md2', group_label: 'F', home_team: 'Netherlands',          away_team: 'Sweden',             kickoff_at: '2026-06-20T17:00:00Z' },
  { api_fixture_id: 20260034, stage: 'group_md2', group_label: 'F', home_team: 'Tunisia',              away_team: 'Japan',              kickoff_at: '2026-06-21T04:00:00Z' },
  { api_fixture_id: 20260035, stage: 'group_md3', group_label: 'F', home_team: 'Japan',                away_team: 'Sweden',             kickoff_at: '2026-06-25T23:00:00Z' },
  { api_fixture_id: 20260036, stage: 'group_md3', group_label: 'F', home_team: 'Tunisia',              away_team: 'Netherlands',        kickoff_at: '2026-06-25T23:00:00Z' },

  // ── GROUP G ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260037, stage: 'group_md1', group_label: 'G', home_team: 'Belgium',              away_team: 'Egypt',              kickoff_at: '2026-06-15T19:00:00Z' },
  { api_fixture_id: 20260038, stage: 'group_md1', group_label: 'G', home_team: 'Iran',                 away_team: 'New Zealand',        kickoff_at: '2026-06-16T01:00:00Z' },
  { api_fixture_id: 20260039, stage: 'group_md2', group_label: 'G', home_team: 'Belgium',              away_team: 'Iran',               kickoff_at: '2026-06-21T19:00:00Z' },
  { api_fixture_id: 20260040, stage: 'group_md2', group_label: 'G', home_team: 'New Zealand',          away_team: 'Egypt',              kickoff_at: '2026-06-22T01:00:00Z' },
  { api_fixture_id: 20260041, stage: 'group_md3', group_label: 'G', home_team: 'Egypt',                away_team: 'Iran',               kickoff_at: '2026-06-27T03:00:00Z' },
  { api_fixture_id: 20260042, stage: 'group_md3', group_label: 'G', home_team: 'New Zealand',          away_team: 'Belgium',            kickoff_at: '2026-06-27T03:00:00Z' },

  // ── GROUP H ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260043, stage: 'group_md1', group_label: 'H', home_team: 'Spain',                away_team: 'Cape Verde',         kickoff_at: '2026-06-15T16:00:00Z' },
  { api_fixture_id: 20260044, stage: 'group_md1', group_label: 'H', home_team: 'Saudi Arabia',         away_team: 'Uruguay',            kickoff_at: '2026-06-15T22:00:00Z' },
  { api_fixture_id: 20260045, stage: 'group_md2', group_label: 'H', home_team: 'Spain',                away_team: 'Saudi Arabia',       kickoff_at: '2026-06-21T16:00:00Z' },
  { api_fixture_id: 20260046, stage: 'group_md2', group_label: 'H', home_team: 'Uruguay',              away_team: 'Cape Verde',         kickoff_at: '2026-06-21T22:00:00Z' },
  { api_fixture_id: 20260047, stage: 'group_md3', group_label: 'H', home_team: 'Cape Verde',           away_team: 'Saudi Arabia',       kickoff_at: '2026-06-27T00:00:00Z' },
  { api_fixture_id: 20260048, stage: 'group_md3', group_label: 'H', home_team: 'Uruguay',              away_team: 'Spain',              kickoff_at: '2026-06-27T00:00:00Z' },

  // ── GROUP I ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260049, stage: 'group_md1', group_label: 'I', home_team: 'France',               away_team: 'Senegal',            kickoff_at: '2026-06-16T19:00:00Z' },
  { api_fixture_id: 20260050, stage: 'group_md1', group_label: 'I', home_team: 'Iraq',                 away_team: 'Norway',             kickoff_at: '2026-06-16T22:00:00Z' },
  { api_fixture_id: 20260051, stage: 'group_md2', group_label: 'I', home_team: 'France',               away_team: 'Iraq',               kickoff_at: '2026-06-22T21:00:00Z' },
  { api_fixture_id: 20260052, stage: 'group_md2', group_label: 'I', home_team: 'Norway',               away_team: 'Senegal',            kickoff_at: '2026-06-23T00:00:00Z' },
  { api_fixture_id: 20260053, stage: 'group_md3', group_label: 'I', home_team: 'Norway',               away_team: 'France',             kickoff_at: '2026-06-26T19:00:00Z' },
  { api_fixture_id: 20260054, stage: 'group_md3', group_label: 'I', home_team: 'Senegal',              away_team: 'Iraq',               kickoff_at: '2026-06-26T19:00:00Z' },

  // ── GROUP J ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260055, stage: 'group_md1', group_label: 'J', home_team: 'Argentina',            away_team: 'Algeria',            kickoff_at: '2026-06-17T01:00:00Z' },
  { api_fixture_id: 20260056, stage: 'group_md1', group_label: 'J', home_team: 'Austria',              away_team: 'Jordan',             kickoff_at: '2026-06-17T04:00:00Z' },
  { api_fixture_id: 20260057, stage: 'group_md2', group_label: 'J', home_team: 'Argentina',            away_team: 'Austria',            kickoff_at: '2026-06-22T17:00:00Z' },
  { api_fixture_id: 20260058, stage: 'group_md2', group_label: 'J', home_team: 'Jordan',               away_team: 'Algeria',            kickoff_at: '2026-06-23T03:00:00Z' },
  { api_fixture_id: 20260059, stage: 'group_md3', group_label: 'J', home_team: 'Algeria',              away_team: 'Austria',            kickoff_at: '2026-06-28T02:00:00Z' },
  { api_fixture_id: 20260060, stage: 'group_md3', group_label: 'J', home_team: 'Jordan',               away_team: 'Argentina',          kickoff_at: '2026-06-28T02:00:00Z' },

  // ── GROUP K ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260061, stage: 'group_md1', group_label: 'K', home_team: 'Portugal',             away_team: 'DR Congo',           kickoff_at: '2026-06-17T17:00:00Z' },
  { api_fixture_id: 20260062, stage: 'group_md1', group_label: 'K', home_team: 'Uzbekistan',           away_team: 'Colombia',           kickoff_at: '2026-06-18T02:00:00Z' },
  { api_fixture_id: 20260063, stage: 'group_md2', group_label: 'K', home_team: 'Portugal',             away_team: 'Uzbekistan',         kickoff_at: '2026-06-23T17:00:00Z' },
  { api_fixture_id: 20260064, stage: 'group_md2', group_label: 'K', home_team: 'Colombia',             away_team: 'DR Congo',           kickoff_at: '2026-06-24T02:00:00Z' },
  { api_fixture_id: 20260065, stage: 'group_md3', group_label: 'K', home_team: 'Colombia',             away_team: 'Portugal',           kickoff_at: '2026-06-27T23:30:00Z' },
  { api_fixture_id: 20260066, stage: 'group_md3', group_label: 'K', home_team: 'DR Congo',             away_team: 'Uzbekistan',         kickoff_at: '2026-06-27T23:30:00Z' },

  // ── GROUP L ──────────────────────────────────────────────────────────
  { api_fixture_id: 20260067, stage: 'group_md1', group_label: 'L', home_team: 'England',              away_team: 'Croatia',            kickoff_at: '2026-06-17T20:00:00Z' },
  { api_fixture_id: 20260068, stage: 'group_md1', group_label: 'L', home_team: 'Ghana',                away_team: 'Panama',             kickoff_at: '2026-06-17T23:00:00Z' },
  { api_fixture_id: 20260069, stage: 'group_md2', group_label: 'L', home_team: 'England',              away_team: 'Ghana',              kickoff_at: '2026-06-23T20:00:00Z' },
  { api_fixture_id: 20260070, stage: 'group_md2', group_label: 'L', home_team: 'Panama',               away_team: 'Croatia',            kickoff_at: '2026-06-23T23:00:00Z' },
  { api_fixture_id: 20260071, stage: 'group_md3', group_label: 'L', home_team: 'Panama',               away_team: 'England',            kickoff_at: '2026-06-27T21:00:00Z' },
  { api_fixture_id: 20260072, stage: 'group_md3', group_label: 'L', home_team: 'Croatia',              away_team: 'Ghana',              kickoff_at: '2026-06-27T21:00:00Z' },

  // ── ROUND OF 32 (teams TBD after group stage) ─────────────────────────
  { api_fixture_id: 20260073, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-28T19:00:00Z' },
  { api_fixture_id: 20260074, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-29T20:30:00Z' },
  { api_fixture_id: 20260075, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-30T01:00:00Z' },
  { api_fixture_id: 20260076, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-29T17:00:00Z' },
  { api_fixture_id: 20260077, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-30T21:00:00Z' },
  { api_fixture_id: 20260078, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-06-30T17:00:00Z' },
  { api_fixture_id: 20260079, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-01T01:00:00Z' },
  { api_fixture_id: 20260080, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-01T16:00:00Z' },
  { api_fixture_id: 20260081, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-02T00:00:00Z' },
  { api_fixture_id: 20260082, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-01T20:00:00Z' },
  { api_fixture_id: 20260083, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-02T23:00:00Z' },
  { api_fixture_id: 20260084, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-02T19:00:00Z' },
  { api_fixture_id: 20260085, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-03T03:00:00Z' },
  { api_fixture_id: 20260086, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-03T22:00:00Z' },
  { api_fixture_id: 20260087, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-04T01:30:00Z' },
  { api_fixture_id: 20260088, stage: 'r32', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-03T18:00:00Z' },

  // ── ROUND OF 16 ──────────────────────────────────────────────────────
  { api_fixture_id: 20260089, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-04T21:00:00Z' },
  { api_fixture_id: 20260090, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-04T17:00:00Z' },
  { api_fixture_id: 20260091, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-05T20:00:00Z' },
  { api_fixture_id: 20260092, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-06T00:00:00Z' },
  { api_fixture_id: 20260093, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-06T19:00:00Z' },
  { api_fixture_id: 20260094, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-07T00:00:00Z' },
  { api_fixture_id: 20260095, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-07T16:00:00Z' },
  { api_fixture_id: 20260096, stage: 'r16', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-07T20:00:00Z' },

  // ── QUARTER-FINALS ───────────────────────────────────────────────────
  { api_fixture_id: 20260097, stage: 'qf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-09T20:00:00Z' },
  { api_fixture_id: 20260098, stage: 'qf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-10T19:00:00Z' },
  { api_fixture_id: 20260099, stage: 'qf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-11T21:00:00Z' },
  { api_fixture_id: 20260100, stage: 'qf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-12T01:00:00Z' },

  // ── SEMI-FINALS ──────────────────────────────────────────────────────
  { api_fixture_id: 20260101, stage: 'sf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-14T19:00:00Z' },
  { api_fixture_id: 20260102, stage: 'sf', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-15T19:00:00Z' },

  // ── THIRD PLACE ──────────────────────────────────────────────────────
  { api_fixture_id: 20260103, stage: 'third_place', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-18T21:00:00Z' },

  // ── FINAL ────────────────────────────────────────────────────────────
  { api_fixture_id: 20260104, stage: 'final', group_label: null, home_team: null, away_team: null, kickoff_at: '2026-07-19T19:00:00Z' },
]

async function main() {
  console.log(`Seeding ${matches.length} WC2026 matches...`)

  const { error, data } = await supabase
    .from('matches')
    .upsert(matches, { onConflict: 'api_fixture_id' })
    .select('id')

  if (error) {
    console.error('Supabase error:', error)
    process.exit(1)
  }

  console.log(`Done! Upserted ${data?.length ?? 0} matches.\n`)

  const breakdown = matches.reduce<Record<string, number>>((acc, m) => {
    acc[m.stage] = (acc[m.stage] ?? 0) + 1
    return acc
  }, {})
  console.log('Breakdown by stage:')
  Object.entries(breakdown).forEach(([stage, count]) => console.log(`  ${stage}: ${count}`))
}

main().catch(err => { console.error(err); process.exit(1) })
