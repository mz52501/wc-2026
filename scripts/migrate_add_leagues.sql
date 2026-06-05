-- ============================================================
-- Migration: add multi-league support
-- Run this in Supabase SQL Editor (once, on the existing schema)
-- ============================================================

-- ------------------------------------------------------------
-- 1. NEW TABLES
-- ------------------------------------------------------------

create table leagues (
  id          bigserial primary key,
  name        text not null,
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  created_by  uuid not null references profiles (id) on delete restrict,
  created_at  timestamptz not null default now()
);

create table league_members (
  league_id  bigint not null references leagues (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- ------------------------------------------------------------
-- 2. ADD league_id TO matchups
-- ------------------------------------------------------------

alter table matchups
  add column league_id bigint references leagues (id) on delete cascade;

-- drop old unique constraint, replace with league-scoped one
alter table matchups
  drop constraint matchups_match_id_player_a_player_b_key;

alter table matchups
  add constraint matchups_league_match_players_key
  unique (league_id, match_id, player_a, player_b);

-- make league_id NOT NULL after adding (table should be empty at this point)
alter table matchups
  alter column league_id set not null;

-- ------------------------------------------------------------
-- 3. UPDATED VIEWS (drop then recreate — can't reorder columns in place)
-- ------------------------------------------------------------

drop view if exists standings;
drop view if exists duel_results;

-- duel_results: now league-scoped
create view duel_results as
select
  mu.league_id,
  mu.match_id,
  mu.player_a,
  mu.player_b,
  coalesce(psa.points, 0)            as points_a,
  coalesce(psb.points, 0)            as points_b,
  (m.home_score is not null)         as played,
  case
    when m.home_score is null then null
    when coalesce(psa.points, 0) > coalesce(psb.points, 0) then mu.player_a
    when coalesce(psa.points, 0) < coalesce(psb.points, 0) then mu.player_b
    else null
  end as winner
from matchups mu
join matches m on m.id = mu.match_id
left join prediction_scores psa
  on psa.match_id = mu.match_id and psa.user_id = mu.player_a
left join prediction_scores psb
  on psb.match_id = mu.match_id and psb.user_id = mu.player_b;

-- standings: now league-scoped
create view standings as
with rows as (
  select
    dr.league_id,
    dr.player_a as user_id,
    dr.played,
    case when not dr.played then 0
         when dr.winner = dr.player_a then 3
         when dr.winner is null then 1
         else 0 end as pts,
    case when dr.played and dr.winner = dr.player_a then 1 else 0 end as w,
    case when dr.played and dr.winner is null       then 1 else 0 end as d,
    case when dr.played and dr.winner = dr.player_b then 1 else 0 end as l,
    case when dr.played then dr.points_a else 0 end as pred_pts
  from duel_results dr
  union all
  select
    dr.league_id,
    dr.player_b,
    dr.played,
    case when not dr.played then 0
         when dr.winner = dr.player_b then 3
         when dr.winner is null then 1
         else 0 end,
    case when dr.played and dr.winner = dr.player_b then 1 else 0 end,
    case when dr.played and dr.winner is null       then 1 else 0 end,
    case when dr.played and dr.winner = dr.player_a then 1 else 0 end,
    case when dr.played then dr.points_b else 0 end
  from duel_results dr
)
select
  r.league_id,
  r.user_id,
  p.display_name,
  sum(r.pts)      as points,
  sum(r.w)        as wins,
  sum(r.d)        as draws,
  sum(r.l)        as losses,
  sum(r.pred_pts) as prediction_points
from rows r
join profiles p on p.id = r.user_id
group by r.league_id, r.user_id, p.display_name
order by r.league_id, points desc, wins desc, prediction_points desc;

-- ------------------------------------------------------------
-- 4. RLS
-- ------------------------------------------------------------

alter table leagues       enable row level security;
alter table league_members enable row level security;

-- leagues: anyone authenticated can read; only creator can insert/update
create policy "leagues readable" on leagues
  for select to authenticated using (true);

create policy "leagues insert" on leagues
  for insert to authenticated
  with check (created_by = auth.uid());

create policy "leagues update" on leagues
  for update to authenticated
  using (created_by = auth.uid());

-- league_members: you can see members of leagues you belong to
create policy "league_members readable" on league_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or league_id in (
      select league_id from league_members where user_id = auth.uid()
    )
  );

-- anyone authenticated can join a league (invite_code check happens in app logic)
create policy "league_members join" on league_members
  for insert to authenticated
  with check (user_id = auth.uid());

-- you can only remove yourself
create policy "league_members leave" on league_members
  for delete to authenticated
  using (user_id = auth.uid());
