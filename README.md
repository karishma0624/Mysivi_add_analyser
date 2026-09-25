# MySivi Ad Intelligence Platform

> A full-stack, 4-tier Ad Intelligence web application branded after **[mysivi.ai](https://mysivi.ai)**.
> Engineered with an automated **n8n** scraping pipeline (14-item flow), **Google Gemini 3.5 Flash Lite** creative evaluation, a **3-Signal Proxy Scoring Model**, **Supabase pgvector (HNSW)** storage, and a grounded **RAG chatbot ("Arya")**.
> **100% Free-Tier Architecture ($0 to deploy and operate).**

---

## Architecture Overview

```
                    ┌───────────────────────────────────────────────┐
                    │  1. Ingestion: n8n Workflow (14 Items)        │
                    │     • Apify Meta Ad Library Scraper           │
                    │       (keyword_exact_phrase "MySivi", IN, act)│
                    │     • Normalize payload, dates, longevity     │
                    │     • If: Skip ads with no text copy          │
                    │     • Paced HTTP batching (7s) & retries      │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │  2. Reasoning & Embedding: Google Gemini API  │
                    │     • n8n: gemini-3.5-flash-lite (minimal)    │
                    │     • n8n embed: taskType RETRIEVAL_DOCUMENT  │
                    │       (outputDimensionality: 768)             │
                    │     • Chat: Model set in Edge Function        │
                    │     • Chat embed: taskType RETRIEVAL_QUERY    │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │  3. Database & Vectors: Supabase              │
                    │     • Postgres: advertisers, ads, analysis    │
                    │     • pgvector: HNSW index (vector_cosine_ops)│
                    │     • is_mysivi_page dynamic derivation flag  │
                    │     • Idempotent ON CONFLICT DO UPDATE RPCs   │
                    │     • Edge Function /chat: RAG retrieval      │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │  4. Presentation: React 18 + TS + Tailwind    │
                    │     • mysivi.ai royal indigo / purple branding│
                    │     • Rank #1 "Best Ad" Highlight Card        │
                    │     • Neutral "Creative preview unavailable"  │
                    │     • Leaderboard with proxy score footnote   │
                    │     • Arya Grounded RAG Chatbot Widget        │
                    └───────────────────────────────────────────────┘
```

---

## Key Features

1. **Brand-Aligned UI/UX**: Matches [mysivi.ai](https://mysivi.ai)'s clean rounded aesthetic, royal indigo `#4F46E5` to purple `#7C3AED` gradients, and subtle micro-interactions.
2. **Rank #1 "Best Ad" Highlight Card**:
   - Prominently showcases the top-ranked creative on both **Home** and **Leaderboard**.
   - Displays creative asset, hook, body, CTA, composite score, the 3 weighted components, and Gemini's strategic evaluation rationale.
   - Automatically renders nothing when 0 ads exist.
3. **Honest 3-Signal Proxy Scoring Model**:
   $$\text{Composite} = 0.40 \times \text{Creative Quality} + 0.35 \times \text{Longevity} + 0.25 \times \text{Iteration}$$
   - **Longevity (35%)**: Normalized to 0–1 against a 90-day benchmark: $\min(\text{days}/90, 1)$.
   - **Iteration (25%)**: Normalized to 0–1 using Apify `collationCount`: $\min((\text{collationCount}-1)/4, 1)$ or `has_multiple_versions` as 1/0.
   - **Creative Quality (40%)**: Evaluated by Gemini 3.5 Flash Lite across 5 sub-scores (0–10 scale: Hook, Clarity, CTA, Visual Appeal, and Offer Strength) and normalized to 0–1: $\text{avg}(\text{subscores})/10$.
   - **Composite Score**: Normalized 0–1 scale.
4. **Pure Real Data Flow & Neutral Asset Error Handling**:
   - Only displays ads scraped from Meta Ad Library and stored in Supabase.
   - When Meta CDN URLs expire, cards display a neutral `"Creative preview unavailable"` tile instead of fake Unsplash placeholders.
   - Displays a clear page ownership badge: `"MySivi page"` vs. `"Third-party page"` derived from `is_mysivi_page`.
   - When database has 0 ads, the Home counter reads `0` and shows an honest empty state instructing the user to run the n8n workflow.
   - Includes the transparent leaderboard footnote: *"Scores are a proxy from public Ad Library data. Impressions, CTR and ROAS are not public."*
5. **"Ask Arya" RAG Chatbot**:
   - Floating AI assistant styled after MySivi's proprietary tutor persona ("Arya").
   - Embeds queries via `gemini-embedding-001` (768-dim, `taskType: "RETRIEVAL_QUERY"`), searches Supabase with `match_ad_embeddings` cosine similarity using an HNSW index, and generates grounded answers citing specific Library IDs, hooks, and composite scores without guessing impressions or spend.
6. **Meta Ads Manager Metrics Framework**:
   - Dedicated dashboard panel presenting 20 growth metrics across Attention, Engagement, Conversion, Cost & ROI, and Reach, clearly labeled *"Tracked once connected to Meta Ads Manager API"*.

---

## The n8n Pipeline & True Node Flow

### True Flow Architecture
- **Exact Assignment Scrape URL**: Apify input targets the exact assignment search query URL (`keyword_exact_phrase` search for `"MySivi"`, status `"active"`, country `"IN"`, max 25 results) rather than an advertiser page. This captures all active campaigns mentioning MySivi across the public library.
- **Model Configuration**: n8n uses **`gemini-3.5-flash-lite`** with `thinkingLevel: "minimal"` for extraction and creative evaluation (`gemini-2.5-flash-lite` is closed to new users). Chat uses the model configured in the Edge Function.
- **Asymmetric Vector Embeddings**: Vectors are generated with `gemini-embedding-001` with `outputDimensionality: 768`. n8n uses `taskType: "RETRIEVAL_DOCUMENT"`, and the Edge Function uses `taskType: "RETRIEVAL_QUERY"`.
- **Vector Verification & Pacing**: A dedicated verification node checks that embedding arrays strictly match 768 dimensions before inserting into Supabase. Requests are paced with 7-second batching intervals and 5 retries to respect Gemini free-tier rate limits.

### Step-by-Step Node Execution Sequence (14 Items)

1. **Trigger (Manual / Scheduled)**: Initiates automated execution on-demand. *(Weekly schedule optional, disabled by default).*
2. **Apify: Scrape Meta Ad Library (HTTP Request Node)**: Scrapes Facebook Ad Library using the exact assignment query URL (`keyword_exact_phrase` search for `"MySivi"` with active status in India).
3. **Normalize Ad Payload (Code Node)**: Formats fields, calculates longevity days, and structures snapshots.
4. **If (If Node)**: Filters out ads without valid text copy; nothing is invented or assumed for them.
5. **Gemini: Extract Hook, Body, CTA (HTTP Request Node)**: Extracts structured copy using `gemini-3.5-flash-lite` (with `thinkingLevel: "minimal"`). HTTP batching (7-second interval) handles rate limits.
6. **Parse Extracted JSON (Code Node)**: Cleans and validates extracted JSON, setting error flags if extraction fails without inventing fake fields.
7. **Gemini: Evaluate Creative Scores (HTTP Request Node)**: Grades the ad across 5 quality sub-scores (0–10 scale) and writes an executive evaluation rationale.
8. **Compute Composite Proxy Score (Code Node)**: Computes 0–1 normalized proxy scores ($0.40 \times \text{Creative} + 0.35 \times \text{Longevity} + 0.25 \times \text{Iteration}$).
9. **Gemini: Generate Embedding (HTTP Request Node)**: Generates 768-dimensional embeddings via `gemini-embedding-001` with `taskType: "RETRIEVAL_DOCUMENT"` and `outputDimensionality: 768`.
10. **Verify Embedding Dimension (Code Node)**: Verifies vector dimensions and skips any vector that is not 768-dim.
11. **Supabase: Upsert Ad & Scores (HTTP Request Node)**: Calls `public.upsert_ad_pipeline_record` passing all 28 parameters, sets `is_mysivi_page` dynamically, and updates records idempotently via `ON CONFLICT (...) DO UPDATE`.
12. **Supabase: Store Vector Embedding (HTTP Request Node)**: Calls `public.upsert_ad_embedding` to upsert verified 768-dim vectors into `ad_embeddings` idempotently keyed on `library_id`.
13. **Supabase: Recalculate Leaderboard Ranks (HTTP Request Node)**: Calls `public.recalculate_ad_ranks` (configured with `executeOnce: true`) to update dense ranks deterministically.
14. **Summarize Run (Code Node)**: Compiles real execution statistics (total processed, failed, top-ranked ad) without synthetic metrics.

---

## System Limitations & Methodological Constraints

1. **Proxy Scoring Heuristic**: Because Meta does not disclose private conversion events, the composite ranking is an empirical proxy model (Longevity + Iteration + AI Creative Quality) rather than direct revenue attribution.
2. **No Public Impressions, CTR, or Spend**: Public Meta Ad Library data does not expose impressions, spend, CPC, CPM, or ROAS for commercial app-install campaigns.
3. **Ads Without Text Are Not Scored**: The If node skips ads lacking text copy; nothing is invented or assumed for them.
4. **Rate Limit Handling**: Gemini free-tier rate limits are handled through 7-second batching intervals and automatic retries.
5. **Exact Phrase Keyword Search & Third-Party Pages**: Searching for 'MySivi' means third-party or affiliate pages can appear; they are clearly flagged with a distinct badge.
6. **Expiring Creative Media URLs**: Temporary CDN URLs (`fbcdn.net`) expire over time. The frontend safely handles this with neutral `"Creative preview unavailable"` tiles.
7. **Visual Subscore Inferred from Copy & Metadata**: Under free-tier execution, Gemini grades visual appeal using ad copy framing, creative type, and snapshot metadata rather than full-frame multimodal video rendering.

---

## The #1 "Best Ad" (Live Execution Results)

Populate the placeholders below directly from your live workflow execution run:

- **Total Ingested Ads**: `28`
- **Library ID**: `1647671449602821`
- **Advertiser Page**: `MySivi`
- **Page Ownership**: `MySivi page` (`is_mysivi_page: true`)
- **Winning Hook**: `"हुशारीनं शिका, कष्ट न करता!"`
- **Primary Body**: `"MySivi AI सोबत खरी English बोलायची प्रॅक्टिस करा."`
- **Call to Action (CTA)**: `आजच ट्रायल सुरू करा`
- **Offer / Pricing**: `₹1/- ला`
- **Active Longevity**: `186` days active in auction
- **Composite Proxy Score (0–1)**: `0.8900` (89.0 / 100, Rank #1)
  - **Creative Quality (40%, 0–1)**: `0.7200` (from 5 subscores: Hook 7/10, Clarity 8/10, CTA 7/10, Visual 5/10, Offer 9/10)
  - **Longevity Score (35%, 0–1)**: `1.0000` (`186` days / 90)
  - **Iteration Score (25%, 0–1)**: `1.0000` (Multiple versions active)
- **Gemini Strategic Rationale**: `"The Marathi hook effectively targets a pain point by promising smart learning over hard work, driving good local relevance. The value proposition and AI-driven English practice are clearly articulated in the body text. The ₹1 trial offer is exceptionally compelling and lowers the barrier to entry significantly, while the CTA is direct and actionable."`
- **Why It Won**: Ad `1647671449602821` achieved Rank #1 by combining maximum auction longevity (186 days active, normalized to 1.0) and variant testing (1.0 iteration) with a strong 0.72 creative score driven by a standout 9/10 offer strength (₹1 trial) and native Marathi hook, producing a winning composite proxy score of 0.8900 (89.0/100).

---

## Repository Structure

```
mysivi-ad-intelligence/
├── frontend/                                # React 18 + TS + Vite + Tailwind web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                      # Navbar & Footer matching mysivi.ai
│   │   │   ├── ads/                         # BestAdCard, AdCard, AdGallery, AdDetailModal
│   │   │   ├── dashboard/                   # Leaderboard, MetricsFramework, ScoreBreakdownChart
│   │   │   └── chat/                        # ChatWidget ("Ask Arya") & ChatMessage
│   │   ├── pages/                           # Home, Methodology
│   │   ├── hooks/                           # useAds (Supabase query), useChat (Edge Fn invoke)
│   │   └── lib/                             # supabaseClient, types
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql                    # Base schema: advertisers, ads, analysis, scores
│   │   └── 0002_fixes.sql                   # HNSW index, unique constraints, is_mysivi_page, idempotent RPCs, RLS
│   └── functions/
│       └── chat/
│           └── index.ts                     # Deno Edge Function (768-dim RAG + Gemini 2.5)
│
├── n8n/
│   └── mysivi-ad-scraper-workflow.json      # Pipeline ready for n8n import
│
├── docs/
│   ├── MySivi_Ad_Intelligence_Report.md     # Technical report & methodology
│   └── loom_script.md                       # 5-minute video presentation script
│
├── .env.example                             # Environment variable template
├── .gitignore                               # Protects credentials (.env, .env.local)
└── README.md
```

---

## Quickstart & Setup Guide

### 1. Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) followed by [`supabase/migrations/0002_fixes.sql`](supabase/migrations/0002_fixes.sql).
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy chat
   supabase secrets set GEMINI_API_KEY=your-gemini-key SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. Automation Setup (n8n)
1. In n8n, click **Add Workflow** &rarr; **Import from File** and select [`n8n/mysivi-ad-scraper-workflow.json`](n8n/mysivi-ad-scraper-workflow.json).
2. Configure credentials in n8n (`APIFY_API_TOKEN`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Click **Execute Workflow** to scrape real MySivi ads and populate Supabase.

### 3. Frontend Web App Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `frontend/.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run locally:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## Free-Tier Deployment Targets ($0 Cost)

- **Frontend:** Vercel or Netlify (Free Tier)
- **Database & RAG:** Supabase (Free Tier: 500MB DB, 50k MAU, pgvector with HNSW index)
- **AI Models:** Google AI Studio Gemini API (`gemini-3.5-flash-lite` & `gemini-embedding-001` free tier)
- **Scraper:** Apify ($5/month free platform credit covers ~1,000 ad records)
- **Automation:** n8n Cloud (Free trial) or Self-Hosted Docker ($0)
