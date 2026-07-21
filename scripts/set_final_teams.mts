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

const FINAL: Array<{ api_fixture_id: number; home_team: string; away_team: string }> = [
  { api_fixture_id: 20260103, home_team: 'France', away_team: 'England' },
  { api_fixture_id: 20260104, home_team: 'Spain',  away_team: 'Argentina' },
]

for (const r of FINAL) {
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

console.log(`\nDone. Updated ${FINAL.length} final-stage rows.`)
