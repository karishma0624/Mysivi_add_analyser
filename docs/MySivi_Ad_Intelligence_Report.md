# MySivi Ad Intelligence Platform — Technical Methodology & Executive Report

**Executive Summary:** A 4-tier, zero-cost Ad Intelligence platform built for **MySivi** ([mysivi.ai](https://mysivi.ai)), an AI English-speaking app. The platform ingests public Facebook Ad Library data via an **n8n** automation pipeline, executes structured extraction and heuristic evaluation with **Google Gemini 2.5 Flash**, persists relational and vector embeddings in **Supabase** (Postgres + pgvector), and presents interactive performance rankings and a grounded RAG chatbot ("Arya") via a modern **React + Vite + Tailwind** frontend.

---

## 1. Reality Check: Public Meta Ad Library vs. Meta Ads Manager API

A critical requirement of professional growth marketing and performance engineering is **data integrity**. 

### 1.1 The Meta Data Boundary

When scraping the **public Meta Ad Library** (without authenticated ad account ownership), Meta provides:
- Creative media assets (image / video URLs)
- Primary text / caption body copy
- Headline & link descriptions
- Call-to-action (CTA) button label (e.g., "Install Now", "Learn More")
- Campaign start date (`started_running_on`) & active status
- Variant flag: "This ad has multiple versions"
- Advertiser page metadata (page name, follower count, category, Library ID)

Conversely, Meta **strictly withholds** private performance metrics from commercial app-install advertisers:
- Impressions, reach, frequency
- Ad spend, CPM, CPC, CPL, CPA
- Click-through rate (CTR), outbound link clicks
- Video 3s/5s hook rates, average watch time, completion rate
- On-page conversion, trial signup, purchase rate, and ROAS

> **Engineering Note:** Meta only publishes impressions and spend ranges for political and social-issue ads. For a commercial mobile app like MySivi, no public scraper can ethically or technically access private ad account data.

### 1.2 Our Strategic Engineering Approach
Rather than fabricating synthetic numbers or building a trivial "read-only copy dumper," this platform implements a **transparent, production-grade 3-Signal Proxy Scoring Model** based on the empirical heuristics growth marketers use to identify winning creatives. Furthermore, the platform establishes a formalized **Metrics Framework** architecture ready to activate the instant MySivi connects its authenticated Meta Ads Manager (Marketing API) token.

---

## 2. The 3-Signal Proxy Scoring Engine

The winning ad is determined through a mathematical composite formula combining Meta algorithm survival signals with multi-dimensional AI creative analysis:

$$\text{Composite Score} = (0.40 \times \text{Creative Quality}) + (0.35 \times \text{Longevity Score}) + (0.25 \times \text{Iteration Score})$$

### 2.1 Signal 1: Longevity Score (Weight: 35%)
- **Rationale:** Meta's auction algorithm rapidly throttles or pauses ad variants that have high cost-per-result or low engagement. An ad that has remained active for weeks or months is an empirical market signal that the advertiser is generating positive return on ad spend.
- **Normalization:** 
  $$\text{Longevity Score} = \min\left(10, \frac{\text{Days Active}}{30} \times 10\right)$$
  An ad running for 30+ days earns the maximum 10.0 score.

### 2.2 Signal 2: Iteration Signal (Weight: 25%)
- **Rationale:** When Meta Ad Library displays *"This ad has multiple versions"*, it indicates the growth marketing team has identified a winning core concept and is actively dynamic-testing copy variants, aspect ratios, or localized audio. In performance marketing, active iteration signals a proven "keeper."
- **Scoring:** 
  $$\text{Iteration Score} = \begin{cases} 10.0 & \text{if has\_multiple\_versions is true} \\ 0.0 & \text{if single variant} \end{cases}$$

### 2.3 Signal 3: AI Creative Quality Score (Weight: 40%)
Evaluated by **Google Gemini 2.5 Flash** using strict performance creative criteria (0–10 scale across 5 dimensions):
1. **Hook Strength (0–10):** Evaluates the first 3 seconds or opening sentence for curiosity, pattern interruption, or problem identification.
2. **Clarity (0–10):** How quickly the learner understands what MySivi does (AI-powered spoken English practice).
3. **CTA Strength (0–10):** Compelling, low-friction next step (e.g., "Start ₹1 trial now", "Talk to Arya today").
4. **Visual Appeal (0–10):** Relevance of visual creative, UI framing, and thumbnail readability.
5. **Offer Strength (0–10):** Clear value proposition, pricing incentive, or risk reversal.

$$\text{Creative Quality Score} = \frac{\text{Hook} + \text{Clarity} + \text{CTA} + \text{Visual} + \text{Offer}}{5}$$

---

## 3. System Architecture

The platform is designed as a **4-tier decoupled pipeline**, operating completely on **$0 free tiers**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. INGESTION & AUTOMATION: n8n Workflow                      │
 │    • Trigger: Manual or Scheduled                           │
 │    • Apify Actor: Scrapes public Meta Ad Library            │
 │    • JavaScript Normalization: Cleans fields & dates        │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 2. REASONING & EMBEDDING: Google Gemini API                  │
 │    • gemini-2.5-flash: Structured Hook/Body/CTA extraction  │
 │    • gemini-2.5-flash: 5-dimensional heuristic scoring     │
 │    • gemini-embedding-001: 768-dim vector embeddings        │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 3. PERSISTENCE & VECTOR STORE: Supabase                     │
 │    • Postgres Tables: advertisers, ads, ad_analysis, scores │
 │    • pgvector: ad_embeddings with IVFFlat cosine indexing   │
 │    • View: v_ad_leaderboard (ranked ads query)              │
 │    • Edge Function: /chat (RAG retrieval & Gemini response) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 4. PRESENTATION: React 18 + TypeScript + Vite + Tailwind    │
 │    • Brand-matching mysivi.ai design aesthetics             │
 │    • Ad Gallery with Meta-style Ad Details Modal            │
 │    • Leaderboard with 3-component score visualizers         │
 │    • Metrics Framework panel (API Roadmap)                  │
 │    • Arya RAG Chatbot: Grounded question answering          │
 └─────────────────────────────────────────────────────────────┘
```

---

## 4. The 12-Step n8n Pipeline

The exportable workflow (`n8n/mysivi-ad-scraper-workflow.json`) orchestrates the pipeline:

1. **Manual / Scheduled Trigger:** Initiates automated batch ingestion.
2. **Apify Scraper Node:** Calls Facebook Ads Scraper actor for keyword `"MySivi"` in target country `"IN"`.
3. **Split in Batches:** Processes items one-by-one to isolate errors and stay within Gemini rate limits.
4. **Data Normalization (Code Node):** Standardizes date formats, computes active days (`longevity_days`), extracts creative URLs, and handles media types.
5. **Gemini Extraction (HTTP Node):** Sends raw copy to `gemini-2.5-flash` with JSON Schema constraint to cleanly isolate `hook`, `body`, `cta`, `offer_details`, and `hashtags`.
6. **Parse Extracted JSON (Code Node):** Sanitizes and validates structured fields.
7. **Gemini Scoring (HTTP Node):** Evaluates the ad against performance benchmarks, generating the 5 subscores and a 2–3 sentence executive rationale (`analysis_notes`).
8. **Compute Composite Score (Code Node):** Calculates weighted scores (40/35/25) deterministically.
9. **Supabase Upsert (HTTP Node):** Atomically writes records into `advertisers`, `ads`, `ad_analysis`, and `ad_scores` via PostgreSQL stored procedure.
10. **Gemini Embedding (HTTP Node):** Calls `gemini-embedding-001` on the combined copy and strategic notes text chunk.
11. **Supabase Vector Storage (HTTP Node):** Inserts 768-dimension vector into `ad_embeddings`.
12. **Leaderboard Rank Recalculation (HTTP Node):** Runs dense rank recalculation across the active ad set.

---

## 5. RAG Chatbot Architecture ("Ask Arya")

The floating conversational agent is styled after **Arya**, MySivi's proprietary AI teacher persona:

1. **User Query:** Marketer asks a question in the UI (e.g., *"Why is the top ad winning over the ₹1 trial variant?"*).
2. **Supabase Edge Function (`/chat`):**
   - Vectorizes the incoming query with `gemini-embedding-001`.
   - Executes `match_ad_embeddings` cosine similarity search over `ad_embeddings` in PostgreSQL.
   - Retrieves the top 5 most relevant ad chunks.
3. **Grounded Generation:**
   - Feeds retrieved real ad snippets into `gemini-2.5-flash` with a strict grounding prompt.
   - Generates an evidence-based answer quoting specific Library IDs, hooks, and longevity metrics.
   - Writes conversation turns to `chat_messages` for auditability.
4. **Zero Hallucination Guarantee:** If no ads match or if the database is unpopulated, Arya transparently states that no data exists rather than inventing answers.

---

## 6. Metrics Framework (Meta Ads Manager API Connection Roadmap)

To demonstrate comprehensive performance marketing fluency, the application includes a dedicated **Metrics Framework** detailing the 20 critical KPIs grouped into 5 categories that will be activated the moment MySivi connects its authenticated Meta Ads Manager Marketing API token:

| Category | Metric | Definition & Growth Strategy |
|---|---|---|
| **Attention** | Hook Rate | % watching past first 3s or first copy sentence. Measures initial thumb-stopping power. |
| **Attention** | 3s/5s Video View Rate | Identifies drop-off speed before the core value proposition is spoken. |
| **Attention** | Outbound CTR | Click-through rate to Google Play / App Store page. |
| **Engagement** | Engagement Rate | (Reactions + Comments + Shares) / Impressions. Indicates cultural resonance. |
| **Engagement** | Video Watch Time | Average continuous duration engaged with spoken English dialogue. |
| **Engagement** | Video Completion Rate | % who finish the video creative. High completion correlates with highest install intent. |
| **Conversion** | Install Rate | App store page conversion rate from ad click. |
| **Conversion** | Install-to-Trial Rate | % of installers initiating the ₹1 trial or initial conversation with Arya. |
| **Conversion** | Purchase Rate | % converting to paid recurring monthly/annual subscription. |
| **Cost & ROI** | CPM | Cost per 1,000 impressions across target tier-1/tier-2 demographic cohorts. |
| **Cost & ROI** | CPC & CPA | Outbound cost per click and blended cost per validated trial user. |
| **Cost & ROI** | ROAS | Return on Ad Spend: gross revenue generated divided by ad spend. |
| **Reach** | Reach & Frequency | Unique individuals reached and ad repetition fatigue index. |

---

## 7. Verification & Deployment Guide ($0 Cost)

- **Frontend:** Deployable in 1 click to **Vercel** or **Netlify** with `npm run build` using free static hosting.
- **Backend & Database:** Deployable to **Supabase** free tier (500MB database, 50,000 monthly active users, 500k Edge Function invocations).
- **AI Processing:** Google AI Studio free tier for Gemini 2.5 Flash and text embeddings.
- **Automation:** n8n self-hosted via Docker or free cloud trial, consuming free Apify platform monthly credits for MySivi query batches.
