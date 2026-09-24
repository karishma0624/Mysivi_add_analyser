# MySivi Ad Intelligence Platform

> A full-stack, 4-tier Ad Intelligence web application branded after **[mysivi.ai](https://mysivi.ai)**.
> Engineered with an automated **n8n** scraping pipeline, **Google Gemini 2.5 Flash** creative evaluation, a **3-Signal Proxy Scoring Model**, **Supabase pgvector** storage, and a grounded **RAG chatbot ("Arya")**.
> **100% Free-Tier Architecture ($0 to deploy and operate).**

---

## Architecture Overview

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
                     │  - Ad Gallery        │
                     │  - Leaderboard        │
                     │  - Metrics Framework │
                     │  - Arya RAG Chatbot  │
                     └─────────┬──────────┘
                               │
                     ┌─────────▼──────────┐
                     │ Supabase Edge Fn    │
                     │  /chat  → Gemini     │
                     │  (retrieval + answer)│
                     └────────────────────┘
```

---

## Key Features

1. **Brand-Aligned UI/UX**: Matches [mysivi.ai](https://mysivi.ai)'s clean rounded aesthetic, royal indigo `#4F46E5` to purple `#7C3AED` gradients, and subtle micro-interactions.
2. **Honest 3-Signal Proxy Scoring Model**:
   $$\text{Composite} = 0.40 \times \text{Creative Quality} + 0.35 \times \text{Longevity} + 0.25 \times \text{Iteration}$$
   - **Longevity (35%)**: Ads that survive in Meta's auction for weeks are proven converters.
   - **Iteration (25%)**: Ads testing multiple versions signal a winning concept actively optimized by the team.
   - **Creative Quality (40%)**: Evaluated by Gemini 2.5 Flash across Hook, Clarity, CTA, Visual Appeal, and Offer.
3. **Pure Real Data Flow (Zero Fake Data)**:
   - Only displays ads scraped from Meta Ad Library and stored in Supabase.
   - If the database is not yet populated, displays the explicit instruction:
     > *"No ads analyzed yet. Run the n8n workflow to fetch and analyze real MySivi advertisements from the Meta Ad Library."*
4. **"Ask Arya" RAG Chatbot**:
   - Floating AI assistant styled after MySivi's proprietary tutor persona ("Arya").
   - Embeds queries via `gemini-embedding-001`, searches Supabase with `match_ad_embeddings` cosine similarity RPC, and generates grounded answers citing specific Library IDs and hooks.
5. **Meta Ads Manager Metrics Framework**:
   - Dedicated dashboard panel presenting 20 growth metrics across Attention, Engagement, Conversion, Cost & ROI, and Reach, clearly labeled *"Tracked once connected to Meta Ads Manager API"*.

---

## Repository Structure

```
mysivi-ad-intelligence/
├── frontend/                                # React 18 + TS + Vite + Tailwind web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                      # Navbar & Footer matching mysivi.ai
│   │   │   ├── ads/                         # AdCard, AdGallery, AdDetailModal
│   │   │   ├── dashboard/                   # Leaderboard, MetricsFramework, ScoreBreakdownChart
│   │   │   └── chat/                        # ChatWidget ("Ask Arya") & ChatMessage
│   │   ├── pages/                           # Home, Ads, Dashboard
│   │   ├── hooks/                           # useAds (Supabase query), useChat (Edge Fn invoke)
│   │   └── lib/                             # supabaseClient, types
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql                    # Postgres schema, pgvector, RPC, views & seed
│   └── functions/
│       └── chat/
│           └── index.ts                     # Deno Edge Function (RAG similarity + Gemini 2.5)
│
├── n8n/
│   └── mysivi-ad-scraper-workflow.json      # 12-node workflow ready for n8n import
│
├── docs/
│   ├── MySivi_Ad_Intelligence_Report.md     # Source markdown for PDF deliverable
│   └── loom_script.md                       # 5-minute video presentation script
│
├── .env.example                             # Environment variable template
└── README.md
```

---

## Quickstart & Setup Guide

### 1. Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** &rarr; **New Query**.
3. Paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and click **Run**.
4. Deploy the Edge Function:
   ```bash
   supabase functions deploy chat
   supabase secrets set GEMINI_API_KEY=your-gemini-key SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. Automation Setup (n8n)
1. In n8n (Cloud or self-hosted Docker), click **Add Workflow** &rarr; **Import from File**.
2. Select [`n8n/mysivi-ad-scraper-workflow.json`](n8n/mysivi-ad-scraper-workflow.json).
3. Set your environment variables in n8n Settings:
   - `APIFY_API_TOKEN`
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Test step** or **Execute Workflow** on the *Manual Run Trigger* node. Real MySivi ads will be scraped, analyzed, scored, and upserted into Supabase.

### 3. Frontend Web App Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env.local` using `.env.example`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Start local development server:
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
- **Database & RAG:** Supabase (Free Tier: 500MB DB, 50k MAU, pgvector included)
- **AI Models:** Google AI Studio Gemini API (`gemini-2.5-flash` & `gemini-embedding-001` free tier)
- **Scraper:** Apify ($5/month free platform credit covers ~1,000 ad records)
- **Automation:** n8n Cloud (Free trial) or Self-Hosted Docker ($0)
