# MySivi Ad Intelligence Platform — Technical Methodology & Executive Report

**Executive Summary:** A 4-tier, zero-cost Ad Intelligence platform built for **MySivi** ([mysivi.ai](https://mysivi.ai)), an AI English-speaking app. The platform ingests public Facebook Ad Library data via an automated **n8n** pipeline (14-item sequence), executes structured extraction and heuristic evaluation with **Google Gemini 3.5 Flash Lite** (with `thinkingLevel: "minimal"`), persists relational data and 768-dimensional vector embeddings in **Supabase** (Postgres + pgvector with HNSW indexing), and presents interactive performance rankings and a grounded RAG chatbot ("Arya") via a modern **React + Vite + Tailwind** frontend.

---

## Links
- GitHub Repository: https://github.com/karishma0624/Mysivi_add_analyser
- n8n Workflow File: n8n/mysivi-ad-scraper-workflow.json (submitted alongside this report)
- Loom Video Walkthrough: https://drive.google.com/file/d/1e6pWpN1Ji88Q2ibs9DmSUSxVpqU8tt38/view?usp=sharing

---

## 1. Reality Check: Public Meta Ad Library vs. Meta Ads Manager API

A critical requirement of professional growth marketing and performance engineering is **data integrity**. 

### 1.1 The Meta Data Boundary

When querying the **public Meta Ad Library** (without authenticated ad account ownership), Meta provides:
- Creative media assets (image / video URLs)
- Primary text / caption body copy
- Headline & link descriptions
- Call-to-action (CTA) button label (e.g., "Install Now", "Learn More")
- Campaign start date (`started_running_on`) & active status
- Variant flag: "This ad has multiple versions" and collation count
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

The winning ad is determined through a mathematical composite formula combining Meta algorithm survival signals with multi-dimensional AI creative analysis. All three component signals are normalized to the **same 0–1 scale**, producing a transparent **0–1 composite score**:

$$\text{Composite Score} = (0.40 \times \text{Creative Quality}) + (0.35 \times \text{Longevity}) + (0.25 \times \text{Iteration})$$

### 2.1 Signal 1: Longevity Score (Weight: 35%)
- **Rationale:** Meta's auction algorithm rapidly throttles or pauses ad variants that have high cost-per-result or low engagement. An ad that has remained active for weeks or months is an empirical market signal that the advertiser is generating positive return on ad spend.
- **Normalization (0–1 scale):** 
  $$\text{Longevity Score} = \min\left(1.0, \frac{\text{Days Active}}{90}\right)$$
  An ad running for 90+ days earns the maximum normalized longevity score of 1.0.

### 2.2 Signal 2: Iteration Score (Weight: 25%)
- **Rationale:** When Meta Ad Library displays *"This ad has multiple versions"*, it indicates the growth marketing team has identified a winning core concept and is actively dynamic-testing copy variants, aspect ratios, or localized audio. In performance marketing, active iteration signals a proven "keeper."
- **Normalization (0–1 scale):**
  Prefers Apify `collationCount` when available from the Ad Library:
  $$\text{Iteration Score} = \min\left(1.0, \max\left(0, \frac{\text{collationCount} - 1}{4}\right)\right)$$
  - 1 version $\to$ 0.0
  - 5+ versions $\to$ 1.0
  If `collationCount` is unavailable, falls back to `has_multiple_versions` as 1.0 (true) or 0.0 (false).

### 2.3 Signal 3: AI Creative Quality Score (Weight: 40%)
Evaluated by **Google Gemini 3.5 Flash Lite** (configured with `thinkingLevel: "minimal"`) using strict performance creative criteria across 5 sub-scores (each graded strictly on a **0–10 scale**):
1. **Hook Strength (0–10):** Attention and relevance of the opening hook.
2. **Clarity (0–10):** How clearly the value proposition is communicated for English learners.
3. **CTA Strength (0–10):** Clarity and pull of the call to action.
4. **Visual Appeal (0–10):** Inferred strictly from copy framing, headline alignment, and metadata (no visual hallucination).
5. **Offer Strength (0–10):** How compelling, specific, and credible the offer or trial incentive is.

The sub-scores are averaged and normalized to the **0–1 scale**:
$$\text{Creative Quality Score} = \frac{\text{Hook} + \text{Clarity} + \text{CTA} + \text{Visual} + \text{Offer}}{5 \times 10}$$

---

## 3. System Architecture

The platform is designed as a **4-tier decoupled pipeline**, operating completely on **$0 free tiers**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. INGESTION & AUTOMATION: n8n Workflow (14 Items)           │
 │    • Trigger: Manual Run (Weekly Schedule optional/disabled)│
 │    • Apify: Scrape Meta Ad Library (keyword_exact_phrase)   │
 │    • Normalize Ad Payload: Dates, longevity, variants       │
 │    • If Node: Skip ads without text (nothing invented)      │
 │    • Gemini Extract Hook/Body/CTA (gemini-3.5-flash-lite)   │
 │    • Parse Extracted JSON (strict validation & error flag)  │
 │    • Gemini Score Creative (gemini-3.5-flash-lite)          │
 │    • Compute Composite Proxy Score (0-1 normalized engine)  │
 │    • Gemini Embedding: gemini-embedding-001 (768-dim)       │
 │      (taskType: RETRIEVAL_DOCUMENT, outputDimensionality:768)│
 │    • Verify Embedding Dimension (skips non-768-dim vectors) │
 │    • Supabase Upsert Ad & Scores (28 parameters)            │
 │    • Supabase Store Vector Embedding (ad_embeddings)        │
 │    • Supabase Recalculate Leaderboard Ranks (Execute Once)  │
 │    • Summarize Run: Real run statistics (no fake metrics)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 2. REASONING & EMBEDDING: Google Gemini API                  │
 │    • n8n reasoning: gemini-3.5-flash-lite (thinking: minimal)│
 │    • n8n embeddings: taskType RETRIEVAL_DOCUMENT (dim: 768) │
 │    • Edge Function chat: Model set in Edge Function         │
 │    • Edge Function embeddings: taskType RETRIEVAL_QUERY     │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 3. PERSISTENCE & VECTOR STORE: Supabase                     │
 │    • Postgres Tables: advertisers, ads, ad_analysis, scores │
 │    • pgvector: ad_embeddings with HNSW cosine ops index     │
 │    • Idempotent RPCs: upsert_ad_pipeline_record (28 params) │
 │    • View: v_ad_leaderboard (exposing is_mysivi_page flag)  │
 │    • Edge Function: /chat (RAG retrieval & Gemini response) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 4. PRESENTATION: React 18 + TypeScript + Vite + Tailwind    │
 │    • Brand-matching mysivi.ai design aesthetics             │
 │    • Rank #1 "Best Ad" highlight card (Home + Leaderboard)  │
 │    • Ad Gallery with Meta-style Ad Details Modal            │
 │    • Leaderboard with 3-component score visualizers         │
 │    • Neutral "Creative preview unavailable" onError tile    │
 │    • Metrics Framework panel (API Roadmap)                  │
 │    • Arya RAG Chatbot: Grounded question answering          │
 └─────────────────────────────────────────────────────────────┘
```

---

## 4. System Limitations & Methodological Constraints

In the spirit of honest performance engineering, key methodological constraints must be understood:

1. **Proxy Scoring vs. Direct Attribution:**
   Because Meta withholds private conversion events, the ranking is an empirical proxy heuristic (Longevity + Iteration + Creative Quality) rather than direct revenue or ROAS attribution. It identifies ads that Meta's auction has sustained the longest and that growth marketers have tested most aggressively.
2. **No Public Delivery or Financial Metrics:**
   Public Meta Ad Library data does not expose impressions, reach, frequency, ad spend, CPM, CPC, or CTR for commercial mobile app campaigns. Any platform claiming to scrape these numbers from public commercial ads is hallucinating.
3. **Ads Without Text Are Not Scored:**
   The workflow explicitly routes items through an `If` condition that skips ads with missing or whitespace-only text. No fake hooks, bodies, or synthetic scores are invented for them.
4. **Gemini Free-Tier Rate Limits:**
   Handled gracefully with 7-second batching intervals (`batchInterval: 7000`) and automatic retries (`retryOnFail: true`, `maxTries: 5`, `waitBetweenTries: 5000`) to remain strictly within Google AI Studio quota limits.
5. **Keyword Exact Phrase Search & Third-Party Pages:**
   The Apify scraper searches for `"MySivi"` using `keyword_exact_phrase` in India. Consequently, legitimate third-party pages or affiliates mentioning MySivi can appear in the results. The system detects page ownership and labels every ad with a clear badge: `"MySivi page"` vs. `"Third-party page"`.
6. **Expiring Creative Media URLs:**
   Creative media URLs served by Facebook CDN (`fbcdn.net`) are signed with temporary security tokens that expire after several hours or days. When older links expire, the frontend does not show a fake fallback image; instead, it renders a neutral `"Creative preview unavailable"` tile.
7. **Visual Subscore Inferred from Copy and Metadata:**
   Under free-tier execution, Gemini grades visual appeal using ad copy framing, creative type (`image` vs. `video`), headline alignment, and snapshot metadata rather than full-frame multimodal video rendering.

---

## 5. The #1 "Best Ad" (Live Run Case Study)

The platform deterministically ranks advertisements by composite score. Populate the fields below directly from your live workflow execution output:

### Live Ingestion Summary
- **Total Real Ads Ingested:** `28`
- **Active Ingested Set:** `28 active`
- **Evaluation Date:** `2026-09-25`

### Rank #1 Winning Creative Profile
- **Library ID:** `1647671449602821`
- **Advertiser Page:** `MySivi`
- **Page Ownership:** `MySivi page` (`is_mysivi_page: true`)
- **Winning Hook:** `"हुशारीनं शिका, कष्ट न करता!"`
- **Primary Body Copy:** `"MySivi AI सोबत खरी English बोलायची प्रॅक्टिस करा."`
- **Call to Action (CTA):** `आजच ट्रायल सुरू करा`
- **Pricing / Offer Details:** `₹1/- ला`
- **Active Longevity:** `186` days in auction
- **Variant Testing:** `Multiple versions active` (`has_multiple_versions: true`)

### Score Breakdown
- **Composite Proxy Score (0–1):** `0.8900` (89.0 / 100, Rank #1)
  - **Creative Quality Component (40% weight, 0–1):** `0.7200`
    - Hook Strength (0–10): `7.0` / 10
    - Message Clarity (0–10): `8.0` / 10
    - CTA Strength (0–10): `7.0` / 10
    - Visual Appeal (0–10): `5.0` / 10
    - Offer Strength (0–10): `9.0` / 10
  - **Longevity Component (35% weight, 0–1):** `1.0000` (`186` days active / 90)
  - **Iteration Component (25% weight, 0–1):** `1.0000` (Multiple versions active)

### Gemini Strategic Evaluation Rationale
> `"The Marathi hook effectively targets a pain point by promising smart learning over hard work, driving good local relevance. The value proposition and AI-driven English practice are clearly articulated in the body text. The ₹1 trial offer is exceptionally compelling and lowers the barrier to entry significantly, while the CTA is direct and actionable."`

### Why This Ad Won
Ad `1647671449602821` secured Rank #1 by combining exceptional longevity (186 days active in Meta's auction, yielding a capped 1.0 longevity score) and active variant iteration (1.0 iteration score) with a strong 0.72 creative quality score driven by an exceptional 9/10 offer strength (₹1 trial) and an engaging Marathi vernacular hook ("हुशारीनं शिका, कष्ट न करता!"). Under the 3-signal proxy formula ($0.40 \times 0.72 + 0.35 \times 1.0 + 0.25 \times 1.0$), it produced the highest composite proxy score of 0.8900 (89.0/100).

---

## 6. RAG Chatbot Architecture ("Ask Arya")

The floating conversational agent is styled after **Arya**, MySivi's proprietary AI teacher persona:

1. **User Query:** Marketer asks a question in the UI (e.g., *"Why is ad 123456 winning over other variants?"*).
2. **Supabase Edge Function (`/chat`):**
   - Vectorizes incoming query via `gemini-embedding-001` using `taskType: "RETRIEVAL_QUERY"` and `outputDimensionality: 768`. (Note: The ingestion workflow in n8n uses `taskType: "RETRIEVAL_DOCUMENT"`, aligning with asymmetric semantic search best practices).
   - Executes `match_ad_embeddings` cosine similarity search over `ad_embeddings` using the HNSW index in PostgreSQL.
   - Retrieves matched ads and joins structured scores from `v_ad_leaderboard`.
3. **Grounded Generation:**
   - Feeds retrieved real ad metadata (Library ID, Hook, CTA, Composite Score, Longevity, Iteration, Analysis Notes) into the generation model set in the Edge Function (`gemini-2.5-flash`).
   - Strictly mandates citing Library ID, Hook, and Composite Score.
   - Forbids stating or hallucinating impressions, CTR, CPC, or spend.
   - Writes conversation history to `chat_messages` via Supabase service role.
4. **Honest Empty State:** When no ads are present in the database, Arya returns the exact message:
   > *"No analyzed MySivi ads found in the database. Please run the n8n workflow to scrape and analyze real advertisements from Meta Ad Library first."*

---

## 7. The Final n8n Workflow — Step-by-Step Node List (14 Items)

The exportable workflow ([n8n/mysivi-ad-scraper-workflow.json](file:///c:/Users/karis/Desktop/Mysivi_add_analyser/n8n/mysivi-ad-scraper-workflow.json)) orchestrates the end-to-end ingestion, AI reasoning, embedding verification, and persistence pipeline.

### 7.1 Architecture & Flow Highlights
- **Exact Assignment Scrape URL:** The Apify input targets the exact assignment search query URL: a `keyword_exact_phrase` search for `"MySivi"`, country `"IN"`, ad type `"all"`, status `"active"`, and max 25 results. This discovers all active campaigns mentioning MySivi across the public library rather than artificially restricting to a single hardcoded advertiser page ID.
- **Model Configuration:** n8n uses **`gemini-3.5-flash-lite`** with `thinkingLevel: "minimal"` for extraction and creative scoring (`gemini-2.5-flash-lite` is closed to new users). The RAG chat uses the model configured in the Edge Function.
- **Asymmetric Vector Embeddings:** Generated using `gemini-embedding-001` with `outputDimensionality: 768`. In n8n, embeddings are produced with `taskType: "RETRIEVAL_DOCUMENT"`, while the Edge Function searches queries using `taskType: "RETRIEVAL_QUERY"`.
- **Embedding Dimension Verification:** A dedicated verification node validates that every returned embedding vector strictly matches 768 dimensions before sending to Supabase, skipping any vector that is not 768-dim to guarantee vector store compatibility.
- **Rate Limit Protection:** Built-in 7-second batching intervals (`batchInterval: 7000`) and up to 5 automatic retries (`retryOnFail: true`, `maxTries: 5`, `waitBetweenTries: 5000`) handle Gemini free-tier rate limits reliably.

### 7.2 Complete 14-Item Step-by-Step Node Sequence

1. **Manual Run Trigger** (`manualTrigger`):
   - Initiates execution on-demand. *(A `scheduleTrigger` node is also present for optional weekly runs, disabled by default).*
2. **Apify: Scrape Meta Ad Library** (`httpRequest`):
   - Invokes the Apify Facebook Ads Scraper actor with the exact assignment query URL (`keyword_exact_phrase` search for `"MySivi"` with active status in India).
3. **Normalize Ad Payload** (`code`):
   - Standardizes fields, parses dates, calculates active longevity in days (`longevity_days`), identifies creative types (`image` vs `video`), checks `collationCount`, and preserves raw snapshot JSON.
4. **If** (`if`):
   - Filters out any ads without valid text copy (`raw_text`). Ads without copy are skipped so that nothing is fabricated or invented for them.
5. **Gemini: Extract Hook, Body, CTA** (`httpRequest`):
   - Calls `gemini-3.5-flash-lite` (with `thinkingLevel: "minimal"`) with strict JSON schema constraints. Paced via 7-second batch intervals with 5 retries.
6. **Parse Extracted JSON** (`code`):
   - Sanitizes and parses the extracted JSON. If extraction failed, flags the item with `parse_error: true` without inventing synthetic fields.
7. **Gemini: Evaluate Creative Scores** (`httpRequest`):
   - Prompts `gemini-3.5-flash-lite` (with `thinkingLevel: "minimal"`) to grade 5 creative dimensions (Hook, Clarity, CTA, Visual Appeal, Offer Strength on 0–10 scale) and produce an executive evaluation rationale. Paced via 7-second batching.
8. **Compute Composite Proxy Score** (`code`):
   - Normalizes components to 0–1:
     - $\text{Creative Quality} = \text{avg}(\text{subscores}) / 10$
     - $\text{Longevity} = \min(\text{days} / 90, 1)$
     - $\text{Iteration} = \min((\text{collationCount} - 1) / 4, 1)$ or `has_multiple_versions` (1 or 0)
     - $\text{Composite} = 0.40 \times \text{creative} + 0.35 \times \text{longevity} + 0.25 \times \text{iteration}$
9. **Gemini: Generate Embedding** (`httpRequest`):
   - Generates document vector embeddings via `gemini-embedding-001` with `taskType: "RETRIEVAL_DOCUMENT"` and `outputDimensionality: 768`.
10. **Verify Embedding Dimension** (`code`):
    - Asserts that received embeddings are valid arrays with exactly 768 dimensions. Skips any vector that is not 768-dim to guarantee vector store compatibility.
11. **Supabase: Upsert Ad & Scores** (`httpRequest`):
    - Calls `public.upsert_ad_pipeline_record` passing all 28 parameters to upsert advertisers, ads, analysis, and scores idempotently.
12. **Supabase: Store Vector Embedding** (`httpRequest`):
    - Calls `public.upsert_ad_embedding` to upsert the verified 768-dim vector into `ad_embeddings` keyed on `library_id`.
13. **Supabase: Recalculate Leaderboard Ranks** (`httpRequest`):
    - Calls `public.recalculate_ad_ranks` to refresh dense ranks across all active ads. Configured with `executeOnce: true` so it runs once per pipeline execution.
14. **Summarize Run** (`code`):
    - Compiles real execution statistics: total ads processed, count failed, and top-ranked ad profile. Never invents impressions, CTR, or spend metrics.

---

## 8. Metrics Framework (Meta Ads Manager API Connection Roadmap)

The application includes a dedicated **Metrics Framework** detailing the 20 critical KPIs across 5 categories ready for activation once MySivi connects its authenticated Meta Marketing API token:

| Category | Metric | Definition & Growth Strategy |
|---|---|---|
| **Attention** | Hook Rate | % watching past first 3s or first copy sentence. Measures initial thumb-stopping power. |
| **Attention** | 3s/5s Video View Rate | Identifies drop-off speed before the core value proposition is spoken. |
| **Attention** | Outbound CTR | Click-through rate to Google Play / App Store page. |
| **Engagement** | Engagement Rate | (Reactions + Comments + Shares) / Impressions. Indicates cultural resonance. |
| **Engagement** | Video Watch Time | Average continuous duration engaged with spoken English dialogue. |
| **Engagement** | Video Completion Rate | % who finish the video creative. High completion correlates with highest install intent. |
| **Engagement** | Shares & Saves | Organic advocacy and bookmark signals. |
| **Conversion** | Install Rate | App store page conversion rate from ad click. |
| **Conversion** | Install-to-Trial Rate | % of installers initiating the ₹1 trial or initial conversation with Arya. |
| **Conversion** | Purchase Rate | % converting to paid recurring monthly/annual subscription. |
| **Cost & ROI** | CPM | Cost per 1,000 impressions across target tier-1/tier-2 demographic cohorts. |
| **Cost & ROI** | CPC & CPA | Outbound cost per click and blended cost per validated trial user. |
| **Cost & ROI** | ROAS | Return on Ad Spend: gross revenue generated divided by ad spend. |
| **Reach** | Reach & Frequency | Unique individuals reached and ad repetition fatigue index. |

---

## 9. Verification & Free-Tier Deployment ($0 Cost)

- **Frontend:** Deployable in 1 click to **Vercel** or **Netlify** with `npm run build` using free static hosting.
- **Backend & Database:** Deployable to **Supabase** free tier (Postgres, pgvector with HNSW cosine indexing, and Edge Functions).
- **AI Processing:** Google AI Studio free tier for Gemini 3.5 Flash Lite and 768-dim embeddings.
- **Automation:** n8n self-hosted via Docker or free cloud trial, consuming free Apify platform monthly credits for MySivi query batches.
