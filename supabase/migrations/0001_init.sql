-- 1. Extensions
create extension if not exists vector;

-- 2. Core tables
create table if not exists advertisers (
  id uuid primary key default gen_random_uuid(),
  page_name text not null,
  fb_page_id text unique,
  follower_count int,
  category text,
  created_at timestamptz default now()
);

create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid references advertisers(id) on delete cascade,
  library_id text unique not null,
  started_running_on date,
  is_active boolean default true,
  has_multiple_versions boolean default false,
  platforms text[],                     -- e.g. {facebook, instagram, messenger}
  creative_url text,                    -- image/video asset
  creative_type text,                   -- 'image' | 'video'
  raw_snapshot jsonb,                   -- full raw scrape payload, for audit
  scraped_at timestamptz default now()
);

create table if not exists ad_analysis (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid references ads(id) on delete cascade,
  hook text,
  body text,
  cta text,
  offer_details text,                   -- e.g. "₹1 trial"
  hashtags text[],
  hook_score numeric(4,2),              -- 0-10, Gemini-graded
  clarity_score numeric(4,2),
  cta_strength_score numeric(4,2),
  visual_appeal_score numeric(4,2),
  offer_strength_score numeric(4,2),
  creative_quality_score numeric(4,2),  -- weighted avg of the 5 above
  analysis_notes text,                  -- Gemini's short rationale, used by RAG
  analyzed_at timestamptz default now()
);

create table if not exists ad_scores (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid references ads(id) on delete cascade,
  longevity_days int,
  longevity_score numeric(4,2),         -- normalized 0-10
  iteration_score numeric(4,2),         -- 10 if has_multiple_versions else 0
  creative_quality_score numeric(4,2),
  composite_score numeric(5,2),         -- weighted final score
  rank int,
  computed_at timestamptz default now()
);

-- 3. Metrics framework reference table (static, for the UI section that shows
--    "what we'll track once connected to Meta Ads Manager API")
create table if not exists metrics_framework (
  id serial primary key,
  category text not null,               -- Attention / Engagement / Conversion / Cost & ROI / Reach & Delivery
  metric_name text not null,
  description text,
  requires_api boolean default true
);

-- 4. RAG: embeddings table
create table if not exists ad_embeddings (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid references ads(id) on delete cascade,
  content text not null,                -- the text chunk that was embedded
  embedding vector(768),                -- gemini-embedding-001 dimension
  created_at timestamptz default now()
);

create index if not exists ad_embeddings_vector_idx
  on ad_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 50);

-- 5. Chat history
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null,                   -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- 6. RPC for vector similarity search (called by the Edge Function)
create or replace function match_ad_embeddings(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  ad_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    ad_embeddings.ad_id,
    ad_embeddings.content,
    1 - (ad_embeddings.embedding <=> query_embedding) as similarity
  from ad_embeddings
  order by ad_embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- 7. Convenience view: full ad leaderboard for the frontend in one query
create or replace view v_ad_leaderboard as
select
  a.id as ad_id,
  a.library_id,
  a.creative_url,
  a.creative_type,
  a.platforms,
  a.is_active,
  a.started_running_on,
  a.has_multiple_versions,
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
from ads a
left join advertisers adv on adv.id = a.advertiser_id
left join ad_analysis an on an.ad_id = a.id
left join ad_scores s on s.ad_id = a.id
order by s.rank asc nulls last;

-- 8. Row Level Security
alter table advertisers enable row level security;
alter table ads enable row level security;
alter table ad_analysis enable row level security;
alter table ad_scores enable row level security;
alter table metrics_framework enable row level security;
alter table chat_messages enable row level security;
alter table ad_embeddings enable row level security;

create policy "public read ads" on ads for select using (true);
create policy "public read advertisers" on advertisers for select using (true);
create policy "public read ad_analysis" on ad_analysis for select using (true);
create policy "public read ad_scores" on ad_scores for select using (true);
create policy "public read metrics_framework" on metrics_framework for select using (true);
create policy "public read chat_messages" on chat_messages for select using (true);

-- 9. Seed static metrics framework (20 metrics across 5 categories)
insert into metrics_framework (category, metric_name, description, requires_api) values
('Attention', 'Hook Rate', '% of users who keep watching/reading past the first 3 seconds or opening line', true),
('Attention', '3s/5s Video View Rate', '% of total impressions that watched at least 3s or 5s of the video creative', true),
('Attention', 'Click-Through Rate (CTR)', 'Clicks divided by impressions (outbound clicks to app store landing page)', true),
('Engagement', 'Engagement Rate', 'Sum of reactions, comments, and shares divided by total impressions', true),
('Engagement', 'Video Watch Time', 'Average continuous seconds watched per user playback', true),
('Engagement', 'Video Completion Rate', '% of viewers who watched the full video creative to the end', true),
('Engagement', 'Shares', 'Total number of organic shares generated by the ad creative', true),
('Engagement', 'Saves', 'Total number of bookmarks/saves on the ad post', true),
('Engagement', 'Comments', 'Total public comment count reflecting audience discussion and sentiment', true),
('Conversion', 'Conversion Rate', '% of landing page or ad clicks that result in an app install', true),
('Conversion', 'Install-to-Trial Rate', '% of app installers who initiate the ₹1 trial or free onboarding lesson', true),
('Conversion', 'Lead Conversion Rate', '% of users submitting contact details or completing registration', true),
('Conversion', 'Purchase Rate', '% of trial users converting into paid recurring English learning subscribers', true),
('Cost & ROI', 'Cost Per Mille (CPM)', 'Cost per 1,000 ad impressions delivered in target geography', true),
('Cost & ROI', 'Cost Per Click (CPC)', 'Average spend per outbound click to the MySivi app store page', true),
('Cost & ROI', 'Cost Per Lead (CPL)', 'Average cost incurred to acquire an email or phone registration', true),
('Cost & ROI', 'Cost Per Acquisition (CPA)', 'Blended cost to acquire one validated new app trial user', true),
('Cost & ROI', 'Return on Ad Spend (ROAS)', 'Gross revenue generated divided by ad spend (key scaling compass)', true),
('Reach & Delivery', 'Reach', 'Unique individuals who saw the ad creative at least once', true),
('Reach & Delivery', 'Impressions', 'Total number of times the ad was displayed on screen', true),
('Reach & Delivery', 'Frequency', 'Average number of times each unique person was shown the ad', true)
on conflict do nothing;

-- 10. Pipeline Helper Procedures (Atomic n8n Upserts)
create or replace function upsert_ad_pipeline_record(
  p_library_id text,
  p_page_name text,
  p_fb_page_id text,
  p_follower_count int,
  p_category text,
  p_started_running_on date,
  p_is_active boolean,
  p_has_multiple_versions boolean,
  p_platforms text[],
  p_creative_url text,
  p_creative_type text,
  p_raw_snapshot jsonb,
  p_hook text,
  p_body text,
  p_cta text,
  p_offer_details text,
  p_hashtags text[],
  p_hook_score numeric,
  p_clarity_score numeric,
  p_cta_strength_score numeric,
  p_visual_appeal_score numeric,
  p_offer_strength_score numeric,
  p_creative_quality_score numeric,
  p_analysis_notes text,
  p_longevity_days int,
  p_longevity_score numeric,
  p_iteration_score numeric,
  p_composite_score numeric
)
returns uuid
language plpgsql
as $$
declare
  v_advertiser_id uuid;
  v_ad_id uuid;
begin
  -- 1. Ensure advertiser exists
  insert into advertisers (page_name, fb_page_id, follower_count, category)
  values (p_page_name, p_fb_page_id, p_follower_count, p_category)
  on conflict (fb_page_id) do update set
    follower_count = coalesce(excluded.follower_count, advertisers.follower_count),
    category = coalesce(excluded.category, advertisers.category)
  returning id into v_advertiser_id;

  if v_advertiser_id is null then
    select id into v_advertiser_id from advertisers where fb_page_id = p_fb_page_id limit 1;
  end if;

  -- 2. Upsert ad record
  insert into ads (
    advertiser_id, library_id, started_running_on, is_active,
    has_multiple_versions, platforms, creative_url, creative_type, raw_snapshot
  )
  values (
    v_advertiser_id, p_library_id, p_started_running_on, p_is_active,
    p_has_multiple_versions, p_platforms, p_creative_url, p_creative_type, p_raw_snapshot
  )
  on conflict (library_id) do update set
    started_running_on = excluded.started_running_on,
    is_active = excluded.is_active,
    has_multiple_versions = excluded.has_multiple_versions,
    platforms = excluded.platforms,
    creative_url = excluded.creative_url,
    creative_type = excluded.creative_type,
    raw_snapshot = excluded.raw_snapshot
  returning id into v_ad_id;

  -- 3. Upsert ad_analysis
  insert into ad_analysis (
    ad_id, hook, body, cta, offer_details, hashtags,
    hook_score, clarity_score, cta_strength_score, visual_appeal_score,
    offer_strength_score, creative_quality_score, analysis_notes
  )
  values (
    v_ad_id, p_hook, p_body, p_cta, p_offer_details, p_hashtags,
    p_hook_score, p_clarity_score, p_cta_strength_score, p_visual_appeal_score,
    p_offer_strength_score, p_creative_quality_score, p_analysis_notes
  )
  on conflict (id) do nothing; -- or update if already linked
  -- Ensure unique ad_id per analysis
  delete from ad_analysis where ad_id = v_ad_id and id <> (
    select id from ad_analysis where ad_id = v_ad_id order by analyzed_at desc limit 1
  );

  -- 4. Upsert ad_scores
  insert into ad_scores (
    ad_id, longevity_days, longevity_score, iteration_score,
    creative_quality_score, composite_score
  )
  values (
    v_ad_id, p_longevity_days, p_longevity_score, p_iteration_score,
    p_creative_quality_score, p_composite_score
  );
  delete from ad_scores where ad_id = v_ad_id and id <> (
    select id from ad_scores where ad_id = v_ad_id order by computed_at desc limit 1
  );

  return v_ad_id;
end;
$$;

create or replace function upsert_ad_embedding(
  p_library_id text,
  p_content text,
  p_embedding vector(768)
)
returns void
language plpgsql
as $$
declare
  v_ad_id uuid;
begin
  select id into v_ad_id from ads where library_id = p_library_id limit 1;
  if v_ad_id is not null then
    delete from ad_embeddings where ad_id = v_ad_id;
    insert into ad_embeddings (ad_id, content, embedding)
    values (v_ad_id, p_content, p_embedding);
  end if;
end;
$$;

create or replace function recalculate_ad_ranks()
returns void
language sql
as $$
  with ranked as (
    select id, dense_rank() over (order by composite_score desc nulls last) as new_rank
    from ad_scores
  )
  update ad_scores
  set rank = ranked.new_rank
  from ranked
  where ad_scores.id = ranked.id;
$$;

