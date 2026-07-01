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

const R32: Array<{ api_fixture_id: number; home_team: string; away_team: string }> = [
  { api_fixture_id: 20260073, home_team: 'South Africa',           away_team: 'Canada' },
  { api_fixture_id: 20260074, home_team: 'Germany',                away_team: 'Paraguay' },
  { api_fixture_id: 20260075, home_team: 'Netherlands',            away_team: 'Morocco' },
  { api_fixture_id: 20260076, home_team: 'Brazil',                 away_team: 'Japan' },
  { api_fixture_id: 20260077, home_team: 'France',                 away_team: 'Sweden' },
  { api_fixture_id: 20260078, home_team: 'Ivory Coast',            away_team: 'Norway' },
  { api_fixture_id: 20260079, home_team: 'Mexico',                 away_team: 'Ecuador' },
  { api_fixture_id: 20260080, home_team: 'England',                away_team: 'DR Congo' },
  { api_fixture_id: 20260081, home_team: 'USA',                    away_team: 'Bosnia and Herzegovina' },
  { api_fixture_id: 20260082, home_team: 'Belgium',                away_team: 'Senegal' },
  { api_fixture_id: 20260083, home_team: 'Portugal',               away_team: 'Croatia' },
  { api_fixture_id: 20260084, home_team: 'Spain',                  away_team: 'Austria' },
  { api_fixture_id: 20260085, home_team: 'Switzerland',            away_team: 'Algeria' },
  { api_fixture_id: 20260086, home_team: 'Argentina',              away_team: 'Cape Verde' },
  { api_fixture_id: 20260087, home_team: 'Colombia',               away_team: 'Ghana' },
  { api_fixture_id: 20260088, home_team: 'Australia',              away_team: 'Egypt' },
]

for (const r of R32) {
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

console.log(`\nDone. Updated ${R32.length} R32 rows.`)
