# MySivi Ad Intelligence Platform — Full Implementation Package

**Goal:** Turn the assignment ("n8n workflow that scrapes MySivi's Facebook Ad Library ads, extracts hook/body/CTA, and finds the best ad") into a full **Ad Intelligence web app** — branded like mysivi.ai, with a real scoring engine and a RAG chatbot that can explain *why* an ad is the winner. Free to build, hosted on free tiers.

---

## 0. Reality Check — read this before building anything

This determines whether your "best ad" logic is credible, so get it straight before you write a line of code.

The **public Facebook Ad Library** (what you scrape without being the ad account owner) gives you, per ad:

| Available (scrape this) | NOT available (don't pretend you have it) |
|---|---|
| Ad creative (image/video URL) | Impressions / Reach numbers |
| Primary text (body copy) | Spend / CPM / CPC / CPA / CPL |
| Headline / link description | Click-through rate |
| CTA button text (e.g. "Install Now") | Video view rate, watch time, completion rate |
| Start date, "active" status | Shares, saves, comments count |
| Whether the ad "has multiple versions" | Conversion / add-to-cart / purchase rate |
| Advertiser page name, follower count, Library ID | ROAS |

Meta only exposes impressions/spend ranges for **political & social-issue ads**, or to the ad account owner in Ads Manager. A commercial app-install campaign like MySivi's won't show you those numbers through scraping — no actor, however good, can conjure numbers Meta doesn't publish.

**Why this actually helps you, not hurts you:** most candidates doing this assignment won't realize this and will either (a) hallucinate fake metrics, or (b) build a shallow "extract and list" tool. You're going to do neither. Instead:

1. **Be explicit in your deliverable** that impressions/CTR/ROAS require Meta Ads Manager (Marketing API) access, which only MySivi's own ad account has — and that your tool is designed to plug into that API the moment they grant access (this is a real, mature engineering observation that will impress a growth-marketing hiring manager).
2. **Build a legitimate proxy-scoring model** using two real signals Ad Library *does* give you, which growth marketers actually use as heuristics:
   - **Longevity** — how many days an ad has been running. Meta's algorithm de-prioritizes/kills underperforming ads fast; an ad still active after weeks is a strong real-world signal it's winning on cost-per-result.
   - **Iteration signal** — "this ad has multiple versions" means the team is actively testing variants of a working concept, another real signal of a keeper.
3. Combine those with an **AI creative-quality score** (Gemini grades the hook, clarity, CTA strength, visual appeal, offer strength of each ad from the actual creative+copy).
4. Your **composite score = weighted(Longevity, Iteration, Creative Quality)** is the "best ad" ranking. Document this methodology clearly in the PDF — it shows judgment, not just plumbing.

Keep the metrics list you were given (Hook Rate, CTR, ROAS, etc.) as a **"Metrics Framework" section** in your report/UI — labelled clearly as *"what we'd track once connected to Meta Ads Manager API"* — so you demonstrate you understand the full picture, without faking numbers you don't have.

---

## 1. What makes this "not the basic one everybody does"

- A **real, branded web app** (not just an n8n screenshot) — React + TS frontend styled after mysivi.ai's own indigo/purple, rounded-card aesthetic.
- A **RAG chatbot** on top of the analysed ads — ask "why is ad X the best?" or "compare ad 2 and ad 4" and get an answer grounded in the actual extracted data, not a generic LLM guess.
- An honest, documented **scoring methodology** instead of fabricated metrics (see §0) — a senior reviewer will notice this immediately.
- **n8n as the ingestion/automation layer**, Supabase as the system of record, Gemini as the reasoning layer, React as the presentation layer — a proper 4-tier architecture, not a single script.
- Deployed and demoable free (Vercel/Netlify + Supabase free tier + Gemini free tier + Apify free credits + n8n Cloud free trial or self-hosted via Docker).

---

## 2. System Architecture

```
                    ┌─────────────────────────┐
                    │   n8n Workflow           │
                    │  (scheduled / manual run) │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                  ▼
      [Apify Actor Node] [Gemini Node]     [Supabase Node]
      Scrape FB Ad        Extract hook/      Upsert ads,
      Library by "MySivi" body/CTA +         analysis, scores,
      keyword              score each ad     embeddings
              │                │                  │
              └────────────────┴──────────────────┘
                               │
                     ┌─────────▼─────────┐
                     │   Supabase (DB)    │
                     │  Postgres + pgvector│
                     └─────────┬──────────┘
                               │  (REST/RPC via Supabase JS client)
                     ┌─────────▼──────────┐
                     │  React + TS Frontend│
                     │  (mysivi.ai styled) │
                     │  - Ad gallery        │
                     │  - Leaderboard        │
                     │  - Metrics dashboard  │
                     │  - RAG chatbot        │
                     └─────────┬──────────┘
                               │
                     ┌─────────▼──────────┐
                     │ Supabase Edge Fn    │
                     │  /chat  → Gemini     │
                     │  (retrieval + answer)│
                     └────────────────────┘
```

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | fast, matches your stated stack |
| Styling | Tailwind CSS | fastest way to match mysivi.ai's clean rounded-card look |
| Backend / DB | Supabase (Postgres + pgvector + Auth + Edge Functions + Storage) | free tier, RAG-ready, no separate backend needed |
| Automation | n8n (Cloud free trial or self-hosted Docker, both $0) | required by the assignment |
| Scraper | Apify — a Facebook Ads Library actor (pay-per-result, but Apify gives $5/month free platform credit which covers a small MySivi-only run) | required by the assignment, no login needed |
| LLM | Google Gemini (`gemini-2.5-flash` for extraction/scoring, `gemini-embedding-001` for RAG) | free tier via Google AI Studio API key |
| Hosting | Vercel or Netlify (frontend, free) + Supabase (free) | zero cost |
| Deliverables | PDF (from the same repo, `docs/` folder → export), n8n workflow `.json` export, Loom recording | as requested |

> **Apify actor note:** at the time of writing there is no single "official" Meta actor — pick a well-rated community actor from the Apify Store, e.g. search "Facebook Ads Library Scraper" (several exist, ~$0.28–$5 per 1,000 results, pay-per-event, no subscription). Since you only need ~15–30 MySivi ads, this costs well under $1, and Apify's free monthly platform credit covers it. Confirm current pricing/actor availability in the Apify Store before you commit, since community actors change often.

---

## 4. Repository / File Structure

```
mysivi-ad-intelligence/
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css                     # Tailwind + MySivi design tokens
│   │   ├── lib/
│   │   │   ├── supabaseClient.ts
│   │   │   └── types.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx            # mirrors mysivi.ai nav (logo, links, Download now button)
│   │   │   │   └── Footer.tsx
│   │   │   ├── ads/
│   │   │   │   ├── AdCard.tsx            # single ad: creative, hook/body/CTA, score
│   │   │   │   ├── AdGallery.tsx         # grid of AdCards
│   │   │   │   └── AdDetailModal.tsx     # mirrors FB "Ad details" modal
│   │   │   ├── dashboard/
│   │   │   │   ├── Leaderboard.tsx       # ranked ads by composite score
│   │   │   │   ├── MetricsFramework.tsx  # the 5 metric categories, labelled "tracked once API-connected"
│   │   │   │   └── ScoreBreakdownChart.tsx
│   │   │   └── chat/
│   │   │       ├── ChatWidget.tsx        # floating RAG chatbot (styled like Arya on mysivi.ai)
│   │   │       └── ChatMessage.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx                  # hero mirrors mysivi.ai hero
│   │   │   ├── Ads.tsx
│   │   │   └── Dashboard.tsx
│   │   └── hooks/
│   │       ├── useAds.ts
│   │       └── useChat.ts
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── package.json
│   └── .env.local                        # see §5
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql                 # see §6 — paste into Supabase SQL editor OR CLI migration
│   └── functions/
│       └── chat/
│           └── index.ts                  # Edge Function: RAG retrieval + Gemini answer
│
├── n8n/
│   └── mysivi-ad-scraper-workflow.json   # exported workflow (deliverable #2)
│
├── docs/
│   ├── MySivi_Ad_Intelligence_Report.md  # source for the PDF deliverable
│   └── loom_script.md                    # talking points for the Loom demo
│
├── .env.example
└── README.md
```

---

## 5. Environment Variables

### `frontend/.env.local`
```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
Never put the Gemini key or the Supabase **service_role** key in the frontend — both stay server-side (n8n / Edge Function) only.

### `supabase/functions/chat/.env` (Edge Function secrets — set via `supabase secrets set`)
```bash
GEMINI_API_KEY=<your-google-ai-studio-key>
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side only, never exposed to browser
```

### n8n credentials (stored in n8n's credential manager, not a plain .env, but conceptually)
```bash
APIFY_API_TOKEN=<your-apify-token>
GEMINI_API_KEY=<your-google-ai-studio-key>
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### `.env.example` (commit this, not the real one)
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APIFY_API_TOKEN=
```

---

## 6. Supabase Database Schema (copy-paste into the SQL Editor)

Run this once as a migration. It sets up tables, the composite-score view, pgvector, and an RPC function the RAG chatbot calls.

```sql
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

-- 5. Chat history (optional, for showing conversation in the UI)
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
  a.started_running_on,
  a.has_multiple_versions,
  an.hook, an.body, an.cta, an.offer_details,
  an.creative_quality_score,
  s.longevity_days, s.composite_score, s.rank
from ads a
left join ad_analysis an on an.ad_id = a.id
left join ad_scores s on s.ad_id = a.id
order by s.rank asc nulls last;

-- 8. Row Level Security (enable read for anon, writes only via service_role from n8n/Edge Fn)
alter table advertisers enable row level security;
alter table ads enable row level security;
alter table ad_analysis enable row level security;
alter table ad_scores enable row level security;
alter table ad_embeddings enable row level security;
alter table chat_messages enable row level security;

create policy "public read ads" on ads for select using (true);
create policy "public read advertisers" on advertisers for select using (true);
create policy "public read ad_analysis" on ad_analysis for select using (true);
create policy "public read ad_scores" on ad_scores for select using (true);
create policy "public read metrics_framework" on metrics_framework for select using (true);
-- ad_embeddings and chat_messages: no public select policy — only accessed via
-- the Edge Function using the service_role key (bypasses RLS by design).
```

Seed `metrics_framework` (optional, for the UI's static "framework" panel):
```sql
insert into metrics_framework (category, metric_name, description, requires_api) values
('Attention', 'Hook Rate', '% who keep watching/reading past the first 3s / first line', true),
('Attention', '3s/5s Video View Rate', '% of impressions that watched 3s / 5s', true),
('Attention', 'CTR', 'Click-through rate on the ad', true),
('Engagement', 'Engagement Rate', 'Reactions+comments+shares / impressions', true),
('Engagement', 'Video Watch Time', 'Avg. seconds watched', true),
('Engagement', 'Video Completion Rate', '% who watched to the end', true),
('Engagement', 'Shares', 'Raw share count', true),
('Engagement', 'Saves', 'Raw save count', true),
('Engagement', 'Comments', 'Raw comment count', true),
('Conversion', 'Conversion Rate', '% of clicks that convert', true),
('Conversion', 'Add-to-Cart Rate', 'E-commerce only', true),
('Conversion', 'Lead Conversion Rate', 'Lead-gen only', true),
('Conversion', 'Purchase Rate', 'E-commerce only', true),
('Cost & ROI', 'CPM', 'Cost per 1,000 impressions', true),
('Cost & ROI', 'CPC', 'Cost per click', true),
('Cost & ROI', 'CPL', 'Cost per lead', true),
('Cost & ROI', 'CPA', 'Cost per acquisition', true),
('Cost & ROI', 'ROAS', 'Return on ad spend', true),
('Reach & Delivery', 'Reach', 'Unique people reached', true),
('Reach & Delivery', 'Impressions', 'Total impressions', true),
('Reach & Delivery', 'Frequency', 'Impressions / reach', true);
```

---

## 7. n8n Workflow — node by node

Build this exact chain, then export it as `mysivi-ad-scraper-workflow.json` (deliverable #2):

1. **Manual Trigger** (or Schedule Trigger, daily/weekly) — start node.
2. **HTTP Request / Apify node** — call your chosen Apify actor's `run-sync-get-dataset-items` endpoint with the MySivi Ad Library search URL as input; returns raw ad JSON array.
3. **Split In Batches** (batch size 1) — process ads one at a time so Gemini prompts stay small and errors are isolated.
4. **Function node — "Normalize"** — map each raw actor item to a consistent shape: `{ library_id, page_name, started_running_on, has_multiple_versions, platforms, creative_url, raw_text }`.
5. **HTTP Request node — Gemini "Extract"** — POST to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{GEMINI_API_KEY}}` with the extraction prompt from §8.1. Set `response_mime_type: application/json` so you get structured JSON straight back (hook, body, cta, offer_details, hashtags).
6. **HTTP Request node — Gemini "Score"** — a second Gemini call using the scoring prompt from §8.2, returns the 5 creative sub-scores + a one-line rationale (this rationale is what your RAG chatbot will quote later).
7. **Function node — "Compute Composite Score"** — pure JS: normalize `longevity_days` and `has_multiple_versions` into 0–10 scores, then:
   `composite = 0.4*creative_quality_score + 0.35*longevity_score + 0.25*iteration_score`
   (document these weights in your PDF — they're a judgment call, own it).
8. **Supabase node (or HTTP Request to REST API)** — upsert into `advertisers`, `ads`, `ad_analysis`, `ad_scores` (use `library_id` as the natural key for upsert/on-conflict).
9. **HTTP Request node — Gemini embeddings** — call `gemini-embedding-001` on the concatenated `hook + body + cta + analysis_notes` text for each ad, then insert into `ad_embeddings`. This is what powers the RAG chatbot.
10. **Loop back** to step 3 until all ads processed.
11. **Set node — "Rank"** (after the loop, one final pass) — either a Supabase RPC or a Function node that reads all `ad_scores` rows, sorts by `composite_score`, and writes back `rank`.
12. **No-Op / Respond** end node — optionally send yourself a Slack/email summary: "Run complete — 18 ads scored, best ad: Library ID X."

Keep runs small (10–20 ads) as the brief says you don't need to scrape everything — this also keeps Apify + Gemini free-tier usage at $0.

---

## 8. Gemini Prompts

### 8.1 Extraction prompt (per ad)
```
You are analyzing a Facebook ad for MySivi, an AI English-speaking app.
Given the raw ad text and metadata below, extract structured fields.
Return ONLY valid JSON matching this schema, no prose:

{
  "hook": "the first attention-grabbing line/phrase of the ad",
  "body": "the main body copy, excluding the hook and CTA",
  "cta": "the explicit or implied call to action (e.g. 'Start your trial now at just ₹1')",
  "offer_details": "any pricing/offer/urgency mentioned, or null",
  "hashtags": ["list", "of", "hashtags", "if", "any"]
}

Raw ad text:
"""
{{ $json.raw_text }}
"""
```

### 8.2 Scoring prompt (per ad, run after extraction)
```
You are a senior performance-marketing creative strategist grading a Facebook ad
for MySivi (an AI English-speaking app for the Indian market, price-sensitive,
competing on "learn English fast with AI").

Score the ad 0-10 on each dimension below. Be strict — most ads should NOT get 9-10.

Ad hook: {{ $json.hook }}
Ad body: {{ $json.body }}
Ad CTA: {{ $json.cta }}
Offer: {{ $json.offer_details }}
Creative has multiple versions being tested: {{ $json.has_multiple_versions }}
Days the ad has been running: {{ $json.longevity_days }}

Return ONLY valid JSON:
{
  "hook_score": 0-10,
  "clarity_score": 0-10,
  "cta_strength_score": 0-10,
  "visual_appeal_score": 0-10,     // infer from the described creative/visual context given
  "offer_strength_score": 0-10,
  "analysis_notes": "2-3 sentences explaining the score, written so it can be quoted directly to a marketer asking 'why is this ad good/bad'"
}
```

Keep `analysis_notes` conversational and specific — this is exactly what gets embedded and retrieved by the RAG chatbot, so vague notes make for vague chatbot answers.

---

## 9. "Best Ad" Composite Scoring — summary

```
composite_score =
    0.40 × creative_quality_score   (avg of the 5 Gemini sub-scores, 0-10)
  + 0.35 × longevity_score          (days_running normalized against the max in the set, 0-10)
  + 0.25 × iteration_score          (10 if has_multiple_versions, else 0)
```
Rank all ads by `composite_score` descending → the #1 ad is "the best ad in the list." Show the full breakdown (not just the final number) in both the UI leaderboard and the PDF, so the reasoning is auditable — that transparency is itself a selling point of your submission.

---

## 10. RAG Chatbot Design

**Flow:** user asks a question in the chat widget → frontend calls the Supabase Edge Function `/chat` → Edge Function embeds the question with `gemini-embedding-001` → calls `match_ad_embeddings` RPC (from §6) to retrieve the top 5 most relevant ad chunks → builds a grounded prompt with those chunks → calls `gemini-2.5-flash` to generate the final answer → returns it, and logs both messages to `chat_messages`.

### `supabase/functions/chat/index.ts` (Edge Function, Deno)
```ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;

async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  );
  const data = await res.json();
  return data.embedding.values;
}

serve(async (req) => {
  const { question, sessionId } = await req.json();

  const queryEmbedding = await embed(question);

  const { data: matches, error } = await supabase.rpc("match_ad_embeddings", {
    query_embedding: queryEmbedding,
    match_count: 5,
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const context = matches.map((m: any) => `- ${m.content}`).join("\n");

  const prompt = `You are the analytics assistant for MySivi's Facebook Ad Intelligence
dashboard. Answer the marketer's question using ONLY the ad data below. If the
data doesn't contain the answer, say so honestly instead of guessing.

Ad data:
${context}

Question: ${question}

Answer concisely, referencing specific ads by their hook or Library ID.`;

  const genRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const genData = await genRes.json();
  const answer = genData.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate an answer.";

  await supabase.from("chat_messages").insert([
    { session_id: sessionId, role: "user", content: question },
    { session_id: sessionId, role: "assistant", content: answer },
  ]);

  return new Response(JSON.stringify({ answer }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Deploy with:
```bash
supabase functions deploy chat
supabase secrets set GEMINI_API_KEY=xxx SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Frontend call:**
```ts
const { data, error } = await supabase.functions.invoke("chat", {
  body: { question: userInput, sessionId },
});
```

Sample questions your chatbot should be able to answer, because the data supports them: *"Which ad is the best and why?"*, *"Why isn't the ₹1 trial ad ranked #1?"*, *"Compare the hook strength of ad A and ad B"*, *"Which ads have been running the longest?"*.

---

## 11. UI/UX — matching mysivi.ai

From the screenshots you have: white background, indigo→purple gradient (`#4F46E5` → `#7C3AED`) as the accent/brand color, rounded 2xl cards with soft shadows, a bold black headline with the key phrase in gradient color, a clean top navbar with a pill-shaped primary button ("Download now" → yours becomes "View Report" / "Ask Arya"), and a 2-column feature grid with icon + title + 2-line description (exactly what §6/§10 map onto: "Meet Arya" → your chat widget can literally reuse the name "Arya" as the chatbot persona, which is a nice, on-brand touch).

Suggested Tailwind tokens (`tailwind.config.ts`):
```ts
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#4F46E5',
        light: '#818CF8',
        dark: '#3730A3',
      },
    },
    borderRadius: { '2xl': '1.25rem' },
    boxShadow: { card: '0 8px 24px -8px rgba(79,70,229,0.15)' },
  },
}
```
Reuse the same hero-headline pattern ("Master **English Speaking**…") for your dashboard hero, e.g. *"Find Your **Best Performing** Ad with AI"*, gradient on the key phrase, same font weight/size hierarchy as image 1.

---

## 12. Implementation Plan

| Phase | Tasks |
|---|---|
| 1. Setup | Supabase project, run §6 SQL, Apify account + pick actor, Gemini API key, n8n instance |
| 2. n8n workflow | Build & manually verify the 12-step chain from §7 on 3-5 ads first |
| 3. Full scrape run | Run against the real MySivi Ad Library URL, ~15-20 ads, verify data in Supabase |
| 4. Frontend scaffold | Vite+React+TS+Tailwind, Supabase client, routing, mysivi.ai-styled Navbar/Hero |
| 5. Ad Gallery + Leaderboard | AdCard, AdGallery, Leaderboard reading from `v_ad_leaderboard` |
| 6. Metrics Framework panel | Static section reading `metrics_framework` table, clearly labelled |
| 7. RAG chatbot | Deploy Edge Function, build ChatWidget, wire up embeddings from n8n step 9 |
| 8. Polish + deploy | Deploy frontend (Vercel), manual walkthrough pass, responsive check |
| 9. Deliverables | Export n8n JSON, write/export the PDF report (§14 doc is your source), record Loom |

---

## 13. Deliverables Checklist

- [ ] `mysivi-ad-scraper-workflow.json` — exported n8n workflow
- [ ] PDF report — methodology (§0, §9), architecture, screenshots of the app, leaderboard with scores, sample chatbot Q&A
- [ ] Loom video — live run of the n8n workflow start to finish, then a walkthrough of the deployed app (gallery → leaderboard → ask the chatbot "why is this the best ad")
- [ ] Deployed app link (Vercel/Netlify) so they can click around without you present
- [ ] GitHub repo link, clean README with setup instructions

---

## 14. THE PROMPT — paste this whole block into Antigravity

```
Build a full-stack web application called "MySivi Ad Intelligence" with the following exact specification.

CONTEXT
This app analyzes Facebook ads scraped from the public Meta Ad Library for the
brand "MySivi" (an AI English-speaking app, mysivi.ai). An external n8n workflow
handles scraping (via an Apify actor) and AI extraction/scoring (via Gemini),
then writes results into a Supabase Postgres database. This app is the
read/query layer + RAG chatbot on top of that data — it does NOT need to
implement the scraping itself.

TECH STACK (use exactly this)
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend/data: Supabase (Postgres, pgvector, Auth not required for MVP, Edge Functions for the chatbot)
- LLM: Google Gemini API (gemini-2.5-flash for chat generation, gemini-embedding-001 for embeddings)
- Hosting target: Vercel (frontend) + Supabase (backend), both free tier

DATABASE
Assume these Supabase tables/views already exist (create the migration file
anyway so it's reproducible): advertisers, ads, ad_analysis, ad_scores,
metrics_framework, ad_embeddings (vector(768)), chat_messages, and a view
v_ad_leaderboard joining ads + ad_analysis + ad_scores ordered by rank.
Also create a Postgres RPC function match_ad_embeddings(query_embedding
vector(768), match_count int) that does cosine-similarity search over
ad_embeddings. Use the exact SQL I will paste separately as the source of
truth for schema — generate a matching supabase/migrations/0001_init.sql file.

DESIGN LANGUAGE — must visually match mysivi.ai
- Primary brand gradient: #4F46E5 → #7C3AED (indigo to purple), used on key
  headline phrases and primary buttons.
- White background, black/near-black body text, generous whitespace.
- Rounded-2xl cards with soft indigo-tinted shadows.
- Clean top navbar: logo left, nav links center, one pill-shaped primary
  CTA button right.
- Bold hero headline pattern: plain text + gradient-colored key phrase,
  e.g. "Find Your <gradient>Best Performing</gradient> Ad."
- Feature-grid sections use icon + bold title + 2-line description, 2-column
  on desktop, matching the "Why Choose MySivi" section style.

PAGES / FEATURES
1. Home — hero mirroring the mysivi.ai hero pattern, but for this ad-analytics
   tool. CTA button scrolls to or links to the dashboard.
2. Ad Gallery — grid of AdCard components, each showing the ad creative image,
   extracted hook/body/CTA, and its composite score badge. Clicking a card
   opens an AdDetailModal (styled like Facebook's own "Ad details" panel:
   left column = ad content + platforms + library ID, right column = "About
   the advertiser" info) showing the full Gemini analysis_notes.
3. Leaderboard/Dashboard — ranked table/list of ads by composite_score
   (query the v_ad_leaderboard view), with a visible breakdown of the 3
   weighted components (creative quality / longevity / iteration) per ad,
   e.g. as small horizontal bar segments.
4. Metrics Framework panel — read from the metrics_framework table, grouped
   by category (Attention, Engagement, Conversion, Cost & ROI, Reach &
   Delivery), each clearly labelled "Tracked once connected to Meta Ads
   Manager API" since these are not available from public Ad Library data.
5. Chat widget ("Ask Arya") — floating bottom-right chat bubble using the
   name "Arya" (MySivi's own AI teacher persona) as the assistant. On open,
   shows a text input + message list. On submit, calls a Supabase Edge
   Function named "chat" via supabase.functions.invoke("chat", { body:
   { question, sessionId } }) and renders the streamed/returned answer.
   Generate the Edge Function too (supabase/functions/chat/index.ts, Deno)
   implementing: embed the question via gemini-embedding-001 → call
   match_ad_embeddings RPC for top 5 chunks → build a grounded prompt →
   call gemini-2.5-flash → return { answer } → log both messages to
   chat_messages.

ENV VARS
Frontend (.env.local): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY only —
never expose the Gemini key or service_role key to the browser.
Edge Function secrets: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

NON-FUNCTIONAL REQUIREMENTS
- Fully responsive (mobile through desktop).
- Loading and empty states on every data-fetching component.
- TypeScript types for every Supabase row shape, generated in
  src/lib/types.ts.
- Clean README.md with setup + run instructions, and a note that the n8n
  workflow (exported separately as JSON) is what populates the database.
- Do NOT write any automated tests (unit/integration/e2e) and do NOT create
  scratchpad, throwaway, or temporary exploration files — I will do all
  testing myself. Only produce the actual application source files.

DELIVERABLE
A complete, runnable repository with the folder structure:
frontend/, supabase/migrations/, supabase/functions/chat/, README.md,
.env.example. Do not fabricate ad data — the UI should simply show an
empty state until the n8n workflow has populated Supabase.
```

Paste the SQL from §6 as a follow-up message in Antigravity right after this prompt so it has the exact schema to scaffold against.

---

## 15. Loom Script Outline (for `docs/loom_script.md`)

1. (0:00) Show the assignment brief and the MySivi Ad Library link — state the goal.
2. (0:30) Open n8n, walk through the 12 nodes from §7, explain the Apify → Gemini → Supabase chain.
3. (2:00) Trigger a live run, show it completing, show new rows landing in Supabase Table Editor.
4. (3:00) Switch to the deployed app: Ad Gallery, click into an ad detail.
5. (3:45) Leaderboard — point out the #1 ad and read its composite score breakdown out loud.
6. (4:15) Open the chatbot, ask "Why is this the best ad?" live, read the grounded answer.
7. (5:00) Close with the honesty point from §0 — what real Meta Ads Manager metrics would add, and that the architecture is ready to plug those in.

---

*Everything above is designed to run at $0: Supabase free tier, Vercel free tier, Gemini free tier, n8n free (Cloud trial or self-hosted), Apify's monthly free platform credit covering the small MySivi-only scrape.*
