import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ws from 'ws'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws as any } },
)

const R16: Array<{ api_fixture_id: number; home_team: string; away_team: string }> = [
  { api_fixture_id: 20260089, home_team: 'Paraguay',    away_team: 'France' },
  { api_fixture_id: 20260090, home_team: 'Canada',      away_team: 'Morocco' },
  { api_fixture_id: 20260091, home_team: 'Brazil',      away_team: 'Norway' },
  { api_fixture_id: 20260092, home_team: 'Mexico',      away_team: 'England' },
  { api_fixture_id: 20260093, home_team: 'Portugal',    away_team: 'Spain' },
  { api_fixture_id: 20260094, home_team: 'USA',         away_team: 'Belgium' },
  { api_fixture_id: 20260095, home_team: 'Argentina',   away_team: 'Egypt' },
  { api_fixture_id: 20260096, home_team: 'Switzerland', away_team: 'Colombia' },
]

for (const r of R16) {
  const { error } = await supabase
    .from('matches')
    .update({ home_team: r.home_team, away_team: r.away_team })
    .eq('api_fixture_id', r.api_fixture_id)
  if (error) {
    console.error(`Failed ${r.api_fixture_id}:`, error)
    process.exit(1)
  }
  console.log(`✓ ${r.api_fixture_id}  ${r.home_team} vs ${r.away_team}`)
}

console.log(`\nDone. Updated ${R16.length} R16 rows.`)
