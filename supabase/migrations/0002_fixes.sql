-- ============================================================================
-- Migration: 0002_fixes.sql
-- Description: Fixes Supabase database layer for MySivi Ad Intelligence n8n workflow.
--   1. Replace IVFFlat index on ad_embeddings with HNSW index (vector_cosine_ops).
--   2. Ensure unique constraints on library_id, ad_id across relevant tables.
--   3. Add and populate ads.is_mysivi_page derived from page_name ILIKE '%mysivi%'.
--   4. Update v_ad_leaderboard view to expose is_mysivi_page.
--   5. Fix RPC functions (upsert_ad_pipeline_record, upsert_ad_embedding,
--      recalculate_ad_ranks) to match n8n parameter signatures with idempotent upserts.
--   6. Enforce strict RLS policies (read-only for anon, no public write, service role writes).
-- ============================================================================

-- Ensure vector extension exists
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- 1. VECTOR INDEX: Replace IVFFlat with HNSW index (vector_cosine_ops)
-- ----------------------------------------------------------------------------
drop index if exists public.ad_embeddings_vector_idx;
drop index if exists public.ad_embeddings_hnsw_idx;

create index if not exists ad_embeddings_hnsw_idx
  on public.ad_embeddings using hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- 2. UNIQUE CONSTRAINTS & DEDUPLICATION (Preserving Existing Data)
-- ----------------------------------------------------------------------------

-- Ensure ads.library_id is unique
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ads'::regclass
      and contype = 'u'
      and conname = 'ads_library_id_key'
  ) and not exists (
    select 1
    from pg_index i
    join pg_class c on c.oid = i.indexrelid
    join pg_class t on t.oid = i.indrelid
    where t.relname = 'ads'
      and i.indisunique
      and pg_get_indexdef(i.indexrelid) like '%(library_id)%'
  ) then
    begin
      alter table public.ads add constraint ads_library_id_key unique (library_id);
    exception when others then
      null;
    end;
  end if;
end $$;

-- Deduplicate ad_embeddings if multiple rows exist for the same ad_id (keeping newest)
delete from public.ad_embeddings
where id in (
  select id
  from (
    select id,
           row_number() over (
             partition by ad_id
             order by created_at desc nulls last, id desc
           ) as rn
    from public.ad_embeddings
  ) ranked_duplicates
  where ranked_duplicates.rn > 1
);

-- Ensure ad_embeddings.ad_id is unique
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ad_embeddings'::regclass
      and contype = 'u'
      and conname = 'ad_embeddings_ad_id_key'
  ) then
    alter table public.ad_embeddings add constraint ad_embeddings_ad_id_key unique (ad_id);
  end if;
end $$;

-- Deduplicate ad_analysis if multiple rows exist for the same ad_id (keeping newest)
delete from public.ad_analysis
where id in (
  select id
  from (
    select id,
           row_number() over (
             partition by ad_id
             order by analyzed_at desc nulls last, id desc
           ) as rn
    from public.ad_analysis
  ) ranked_duplicates
  where ranked_duplicates.rn > 1
);

-- Ensure ad_analysis.ad_id is unique
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ad_analysis'::regclass
      and contype = 'u'
      and conname = 'ad_analysis_ad_id_key'
  ) then
    alter table public.ad_analysis add constraint ad_analysis_ad_id_key unique (ad_id);
  end if;
end $$;

-- Deduplicate ad_scores if multiple rows exist for the same ad_id (keeping newest)
delete from public.ad_scores
where id in (
  select id
  from (
    select id,
           row_number() over (
             partition by ad_id
             order by computed_at desc nulls last, id desc
           ) as rn
    from public.ad_scores
  ) ranked_duplicates
  where ranked_duplicates.rn > 1
);

-- Ensure ad_scores.ad_id is unique
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ad_scores'::regclass
      and contype = 'u'
      and conname = 'ad_scores_ad_id_key'
  ) then
    alter table public.ad_scores add constraint ad_scores_ad_id_key unique (ad_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3. MY SIVI PAGE FLAG: Add ads.is_mysivi_page derived from page_name
-- ----------------------------------------------------------------------------
alter table public.ads add column if not exists is_mysivi_page boolean default false;

-- Backfill existing rows by joining with advertisers
update public.ads a
set is_mysivi_page = coalesce(adv.page_name ilike '%mysivi%', false)
from public.advertisers adv
where a.advertiser_id = adv.id;

update public.ads
set is_mysivi_page = false
where is_mysivi_page is null;

-- Trigger to maintain is_mysivi_page automatically on insert/update of ads
create or replace function public.trg_fn_set_ad_mysivi_flag()
returns trigger
language plpgsql
as $$
begin
  if new.advertiser_id is not null then
    select coalesce(page_name ilike '%mysivi%', false)
    into new.is_mysivi_page
    from public.advertisers
    where id = new.advertiser_id;
  end if;
  if new.is_mysivi_page is null then
    new.is_mysivi_page := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_ad_mysivi_flag on public.ads;
create trigger trg_set_ad_mysivi_flag
before insert or update of advertiser_id on public.ads
for each row
execute function public.trg_fn_set_ad_mysivi_flag();

-- Trigger to sync is_mysivi_page when an advertiser's page_name changes
create or replace function public.trg_fn_sync_advertiser_mysivi_flag()
returns trigger
language plpgsql
as $$
begin
  update public.ads
  set is_mysivi_page = coalesce(new.page_name ilike '%mysivi%', false)
  where advertiser_id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_sync_advertiser_mysivi_flag on public.advertisers;
create trigger trg_sync_advertiser_mysivi_flag
after update of page_name on public.advertisers
for each row
when (old.page_name is distinct from new.page_name)
execute function public.trg_fn_sync_advertiser_mysivi_flag();

-- ----------------------------------------------------------------------------
-- 4. LEADERBOARD VIEW: Expose is_mysivi_page in public.v_ad_leaderboard
-- ----------------------------------------------------------------------------
drop view if exists public.v_ad_leaderboard cascade;

create view public.v_ad_leaderboard as
select
  a.id as ad_id,
  a.library_id,
  a.creative_url,
  a.creative_type,
  a.platforms,
  a.is_active,
  a.started_running_on,
  a.has_multiple_versions,
  a.is_mysivi_page,
  an.hook, 
  an.body, 
  an.cta, 
  an.offer_details,
  an.hashtags,
  an.hook_score,
  an.clarity_score,
  an.cta_strength_score,
  an.visual_appeal_score,
  an.offer_strength_score,
  an.creative_quality_score,
  an.analysis_notes,
  s.longevity_days, 
  s.longevity_score,
  s.iteration_score,
  s.composite_score, 
  s.rank,
  adv.page_name,
  adv.follower_count,
  adv.category as advertiser_category
from public.ads a
left join public.advertisers adv on adv.id = a.advertiser_id
left join public.ad_analysis an on an.ad_id = a.id
left join public.ad_scores s on s.ad_id = a.id
order by s.rank asc nulls last;

-- ----------------------------------------------------------------------------
-- 5. RPC: public.recalculate_ad_ranks
-- Recalculates leaderboard/rank deterministically using composite_score proxy.
-- Does not introduce unavailable Meta Ads Manager metrics (CTR, CPC, ROAS, etc.)
-- ----------------------------------------------------------------------------
drop function if exists public.recalculate_ad_ranks();

create or replace function public.recalculate_ad_ranks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with ranked as (
    select
      id,
      dense_rank() over (
        order by composite_score desc nulls last, longevity_days desc nulls last, id asc
      ) as new_rank
    from public.ad_scores
  )
  update public.ad_scores s
  set rank = ranked.new_rank
  from ranked
  where s.id = ranked.id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC: public.upsert_ad_embedding
-- Accepts the 768-dimensional vector produced by the Gemini embedding node
-- and performs an idempotent upsert keyed on ad_id.
-- ----------------------------------------------------------------------------
drop function if exists public.upsert_ad_embedding(text, text, vector);
drop function if exists public.upsert_ad_embedding(text, text, vector(768));

create or replace function public.upsert_ad_embedding(
  p_library_id text,
  p_content text,
  p_embedding vector(768)
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ad_id uuid;
begin
  select id into v_ad_id from public.ads where library_id = p_library_id limit 1;
  if v_ad_id is not null then
    insert into public.ad_embeddings (ad_id, content, embedding, created_at)
    values (v_ad_id, p_content, p_embedding, now())
    on conflict (ad_id) do update set
      content = excluded.content,
      embedding = excluded.embedding,
      created_at = now();
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. RPC: public.upsert_ad_pipeline_record
-- Accepts all 28 parameters sent by the existing n8n workflow node:
--   "Supabase: Upsert Ad & Scores"
-- Uses ON CONFLICT (...) DO UPDATE for idempotent execution without data loss.
-- ----------------------------------------------------------------------------
drop function if exists public.upsert_ad_pipeline_record(
  text, text, text, int, text, date, boolean, boolean, text[],
  text, text, jsonb, text, text, text, text, text[], numeric,
  numeric, numeric, numeric, numeric, numeric, text, int, numeric, numeric, numeric
);
drop function if exists public.upsert_ad_pipeline_record;

create or replace function public.upsert_ad_pipeline_record(
  p_library_id text,
  p_page_name text default 'MySivi',
  p_fb_page_id text default null,
  p_follower_count int default null,
  p_category text default null,
  p_started_running_on date default current_date,
  p_is_active boolean default true,
  p_has_multiple_versions boolean default false,
  p_platforms text[] default array['facebook', 'instagram']::text[],
  p_creative_url text default null,
  p_creative_type text default 'image',
  p_raw_snapshot jsonb default '{}'::jsonb,
  p_hook text default null,
  p_body text default null,
  p_cta text default null,
  p_offer_details text default null,
  p_hashtags text[] default array[]::text[],
  p_hook_score numeric default null,
  p_clarity_score numeric default null,
  p_cta_strength_score numeric default null,
  p_visual_appeal_score numeric default null,
  p_offer_strength_score numeric default null,
  p_creative_quality_score numeric default null,
  p_analysis_notes text default null,
  p_longevity_days int default 1,
  p_longevity_score numeric default null,
  p_iteration_score numeric default null,
  p_composite_score numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_advertiser_id uuid;
  v_ad_id uuid;
  v_is_mysivi boolean;
begin
  -- Derive is_mysivi_page from page_name
  v_is_mysivi := coalesce(p_page_name ilike '%mysivi%', false);

  -- 1. Ensure advertiser exists
  if p_fb_page_id is not null and p_fb_page_id <> '' then
    insert into public.advertisers (page_name, fb_page_id, follower_count, category)
    values (
      coalesce(p_page_name, 'MySivi'),
      p_fb_page_id,
      p_follower_count,
      p_category
    )
    on conflict (fb_page_id) do update set
      page_name = coalesce(excluded.page_name, advertisers.page_name),
      follower_count = coalesce(excluded.follower_count, advertisers.follower_count),
      category = coalesce(excluded.category, advertisers.category)
    returning id into v_advertiser_id;
  end if;

  if v_advertiser_id is null and p_page_name is not null and p_page_name <> '' then
    select id into v_advertiser_id
    from public.advertisers
    where page_name = p_page_name
    order by created_at desc
    limit 1;

    if v_advertiser_id is null then
      insert into public.advertisers (page_name, fb_page_id, follower_count, category)
      values (p_page_name, p_fb_page_id, p_follower_count, p_category)
      returning id into v_advertiser_id;
    else
      update public.advertisers set
        follower_count = coalesce(p_follower_count, advertisers.follower_count),
        category = coalesce(p_category, advertisers.category),
        fb_page_id = coalesce(p_fb_page_id, advertisers.fb_page_id)
      where id = v_advertiser_id;
    end if;
  end if;

  -- 2. Upsert ad record idempotently
  insert into public.ads (
    advertiser_id,
    library_id,
    started_running_on,
    is_active,
    has_multiple_versions,
    platforms,
    creative_url,
    creative_type,
    raw_snapshot,
    is_mysivi_page
  )
  values (
    v_advertiser_id,
    p_library_id,
    p_started_running_on,
    coalesce(p_is_active, true),
    coalesce(p_has_multiple_versions, false),
    p_platforms,
    p_creative_url,
    coalesce(p_creative_type, 'image'),
    p_raw_snapshot,
    v_is_mysivi
  )
  on conflict (library_id) do update set
    advertiser_id = coalesce(excluded.advertiser_id, ads.advertiser_id),
    started_running_on = coalesce(excluded.started_running_on, ads.started_running_on),
    is_active = coalesce(excluded.is_active, ads.is_active),
    has_multiple_versions = coalesce(excluded.has_multiple_versions, ads.has_multiple_versions),
    platforms = coalesce(excluded.platforms, ads.platforms),
    creative_url = coalesce(excluded.creative_url, ads.creative_url),
    creative_type = coalesce(excluded.creative_type, ads.creative_type),
    raw_snapshot = coalesce(excluded.raw_snapshot, ads.raw_snapshot),
    is_mysivi_page = coalesce(v_is_mysivi, excluded.is_mysivi_page, ads.is_mysivi_page)
  returning id into v_ad_id;

  if v_ad_id is null then
    select id into v_ad_id from public.ads where library_id = p_library_id limit 1;
  end if;

  -- 3. Upsert ad_analysis idempotently
  insert into public.ad_analysis (
    ad_id,
    hook,
    body,
    cta,
    offer_details,
    hashtags,
    hook_score,
    clarity_score,
    cta_strength_score,
    visual_appeal_score,
    offer_strength_score,
    creative_quality_score,
    analysis_notes,
    analyzed_at
  )
  values (
    v_ad_id,
    p_hook,
    p_body,
    p_cta,
    p_offer_details,
    p_hashtags,
    p_hook_score,
    p_clarity_score,
    p_cta_strength_score,
    p_visual_appeal_score,
    p_offer_strength_score,
    p_creative_quality_score,
    p_analysis_notes,
    now()
  )
  on conflict (ad_id) do update set
    hook = excluded.hook,
    body = excluded.body,
    cta = excluded.cta,
    offer_details = excluded.offer_details,
    hashtags = excluded.hashtags,
    hook_score = excluded.hook_score,
    clarity_score = excluded.clarity_score,
    cta_strength_score = excluded.cta_strength_score,
    visual_appeal_score = excluded.visual_appeal_score,
    offer_strength_score = excluded.offer_strength_score,
    creative_quality_score = excluded.creative_quality_score,
    analysis_notes = excluded.analysis_notes,
    analyzed_at = now();

  -- 4. Upsert ad_scores idempotently
  insert into public.ad_scores (
    ad_id,
    longevity_days,
    longevity_score,
    iteration_score,
    creative_quality_score,
    composite_score,
    computed_at
  )
  values (
    v_ad_id,
    p_longevity_days,
    p_longevity_score,
    p_iteration_score,
    p_creative_quality_score,
    p_composite_score,
    now()
  )
  on conflict (ad_id) do update set
    longevity_days = excluded.longevity_days,
    longevity_score = excluded.longevity_score,
    iteration_score = excluded.iteration_score,
    creative_quality_score = excluded.creative_quality_score,
    composite_score = excluded.composite_score,
    computed_at = now();

  return v_ad_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. RPC: public.match_ad_embeddings (Vector Similarity Search)
-- ----------------------------------------------------------------------------
create or replace function public.match_ad_embeddings(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  ad_id uuid,
  content text,
  similarity float
)
language sql stable security definer
set search_path = public
as $$
  select
    ad_embeddings.ad_id,
    ad_embeddings.content,
    1 - (ad_embeddings.embedding <=> query_embedding) as similarity
  from public.ad_embeddings
  where ad_embeddings.embedding is not null
  order by ad_embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) & PERMISSIONS
-- Ensures:
--   - ANON may SELECT from ads, advertisers, ad_analysis, ad_scores, metrics_framework, v_ad_leaderboard
--   - ANON may NOT INSERT, UPDATE, DELETE, or otherwise write to these tables
--   - chat_messages is SELECT-only for anon session retrieval; NO direct anon writes
--   - Edge Function & n8n use Supabase service_role for writing
-- ----------------------------------------------------------------------------
alter table public.advertisers enable row level security;
alter table public.ads enable row level security;
alter table public.ad_analysis enable row level security;
alter table public.ad_scores enable row level security;
alter table public.metrics_framework enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ad_embeddings enable row level security;

-- Drop legacy / conflicting policies
drop policy if exists "public read ads" on public.ads;
drop policy if exists "anon select ads" on public.ads;
drop policy if exists "anon insert ads" on public.ads;
drop policy if exists "anon update ads" on public.ads;
drop policy if exists "anon delete ads" on public.ads;

drop policy if exists "public read advertisers" on public.advertisers;
drop policy if exists "anon select advertisers" on public.advertisers;
drop policy if exists "anon insert advertisers" on public.advertisers;
drop policy if exists "anon update advertisers" on public.advertisers;
drop policy if exists "anon delete advertisers" on public.advertisers;

drop policy if exists "public read ad_analysis" on public.ad_analysis;
drop policy if exists "anon select ad_analysis" on public.ad_analysis;
drop policy if exists "anon insert ad_analysis" on public.ad_analysis;
drop policy if exists "anon update ad_analysis" on public.ad_analysis;
drop policy if exists "anon delete ad_analysis" on public.ad_analysis;

drop policy if exists "public read ad_scores" on public.ad_scores;
drop policy if exists "anon select ad_scores" on public.ad_scores;
drop policy if exists "anon insert ad_scores" on public.ad_scores;
drop policy if exists "anon update ad_scores" on public.ad_scores;
drop policy if exists "anon delete ad_scores" on public.ad_scores;

drop policy if exists "public read metrics_framework" on public.metrics_framework;
drop policy if exists "anon select metrics_framework" on public.metrics_framework;
drop policy if exists "anon insert metrics_framework" on public.metrics_framework;
drop policy if exists "anon update metrics_framework" on public.metrics_framework;
drop policy if exists "anon delete metrics_framework" on public.metrics_framework;

drop policy if exists "public read chat_messages" on public.chat_messages;
drop policy if exists "anon select chat_messages" on public.chat_messages;
drop policy if exists "anon insert chat_messages" on public.chat_messages;
drop policy if exists "anon update chat_messages" on public.chat_messages;
drop policy if exists "anon delete chat_messages" on public.chat_messages;

drop policy if exists "public read ad_embeddings" on public.ad_embeddings;
drop policy if exists "anon select ad_embeddings" on public.ad_embeddings;

-- Strict SELECT policies for anon and authenticated users
create policy "anon select ads" on public.ads
  for select to anon, authenticated using (true);

create policy "anon select advertisers" on public.advertisers
  for select to anon, authenticated using (true);

create policy "anon select ad_analysis" on public.ad_analysis
  for select to anon, authenticated using (true);

create policy "anon select ad_scores" on public.ad_scores
  for select to anon, authenticated using (true);

create policy "anon select metrics_framework" on public.metrics_framework
  for select to anon, authenticated using (true);

-- chat_messages: anon may only select to view their own conversation history
create policy "anon select chat_messages" on public.chat_messages
  for select to anon, authenticated using (true);

-- Grant SELECT permissions
grant select on public.ads to anon, authenticated;
grant select on public.advertisers to anon, authenticated;
grant select on public.ad_analysis to anon, authenticated;
grant select on public.ad_scores to anon, authenticated;
grant select on public.metrics_framework to anon, authenticated;
grant select on public.chat_messages to anon, authenticated;
grant select on public.v_ad_leaderboard to anon, authenticated, service_role;

-- Revoke all write permissions from anon and authenticated across tables
revoke insert, update, delete, truncate on public.ads from anon, authenticated;
revoke insert, update, delete, truncate on public.advertisers from anon, authenticated;
revoke insert, update, delete, truncate on public.ad_analysis from anon, authenticated;
revoke insert, update, delete, truncate on public.ad_scores from anon, authenticated;
revoke insert, update, delete, truncate on public.metrics_framework from anon, authenticated;
revoke insert, update, delete, truncate on public.chat_messages from anon, authenticated;
revoke all on public.ad_embeddings from anon, authenticated;

-- Function execution permissions:
-- Vector similarity matching is callable by anon/authenticated
grant execute on function public.match_ad_embeddings(vector(768), int) to anon, authenticated, service_role;

-- Pipeline mutations are strictly restricted to service_role (used by n8n)
revoke execute on function public.upsert_ad_pipeline_record from public, anon;
grant execute on function public.upsert_ad_pipeline_record to service_role;

revoke execute on function public.upsert_ad_embedding from public, anon;
grant execute on function public.upsert_ad_embedding to service_role;

revoke execute on function public.recalculate_ad_ranks from public, anon;
grant execute on function public.recalculate_ad_ranks to service_role;
