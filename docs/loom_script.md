# MySivi Ad Intelligence Platform — Loom Recording Script

**Target Video Duration:** 5:00 minutes  
**Presenter:** Growth & Performance Marketing Engineer  
**Screen Setup:** Browser tab with Meta Ad Library, n8n canvas tab, Supabase Table Editor tab, and the deployed MySivi Ad Intelligence web application.

---

## Pre-Recording Checklist: "Best Ad" Live Run Placeholders
*Fill these values from your live n8n workflow execution before hitting record (do not invent numbers):*

- **Total Ingested Real Ads:** `28`
- **Rank #1 Ad Library ID:** `1647671449602821`
- **Advertiser Page & Badge:** `MySivi (MySivi page)`
- **Winning Hook:** `"हुशारीनं शिका, कष्ट न करता!"`
- **Primary Body Copy:** `"MySivi AI सोबत खरी English बोलायची प्रॅक्टिस करा."`
- **Call to Action (CTA):** `आजच ट्रायल सुरू करा`
- **Offer / Pricing:** `₹1/- ला`
- **Active Longevity:** `186` days active
- **Composite Proxy Score (0–1):** `0.8900` (Rank #1)
  - Creative Quality Component (40%, 0–1): `0.7200` (from 5 subscores: Hook 7, Clarity 8, CTA 7, Visual 5, Offer 9)
  - Longevity Component (35%, 0–1): `1.0000` (`186` days / 90)
  - Iteration Component (25%, 0–1): `1.0000` (Multiple versions active)
- **Gemini Strategic Rationale:** `"The Marathi hook effectively targets a pain point by promising smart learning over hard work, driving good local relevance. The value proposition and AI-driven English practice are clearly articulated in the body text. The ₹1 trial offer is exceptionally compelling and lowers the barrier to entry significantly, while the CTA is direct and actionable."`

---

## Timed Video Script

### [0:00 – 0:45] 1. Intro & The "Public Ad Library" Reality Check
* **Visual:** Meta Ad Library search results for "MySivi" ([mysivi.ai](https://mysivi.ai)) side-by-side with assignment brief.
* **Talking Points:**
  - "Hello! Welcome to the MySivi Ad Intelligence platform walkthrough. When tasked with building an automated scraper to identify MySivi's 'best ad', we started with an essential performance-marketing reality check:
  - The public Meta Ad Library provides creative assets, primary text, hooks, CTAs, start dates, and variant indicators — but Meta strictly hides private metrics like impressions, spend, CTR, and ROAS from public commercial viewers.
  - Rather than fabricating synthetic numbers or building a trivial copy scraper, we engineered a production-grade 4-tier system featuring a transparent 3-signal proxy scoring model and a grounded RAG AI assistant."

---

### [0:45 – 2:00] 2. The True n8n Pipeline & Final 14-Item Sequence
* **Visual:** Open n8n workflow canvas (`mysivi-ad-scraper-workflow.json`).
* **Talking Points:**
  - "Here is our complete ingestion, reasoning, and vector indexing pipeline built in n8n.
  - **Exact Assignment Scrape URL:** Apify triggers the Meta Ad Library scraper using the exact assignment query: a `keyword_exact_phrase` search for 'MySivi' in India with active status, rather than locking to a single page ID. This discovers all active campaigns mentioning MySivi across the public library.
  - **Model Architecture:** In n8n we use `gemini-3.5-flash-lite` configured with `thinkingLevel: 'minimal'` for both structured extraction and creative scoring, as `gemini-2.5-flash-lite` is closed to new users. RAG chat in the frontend uses the model configured in the Edge Function.
  - **Asymmetric 768-Dim Embeddings:** n8n generates document embeddings using `gemini-embedding-001` with `taskType: RETRIEVAL_DOCUMENT` and `outputDimensionality: 768`. Our Edge Function will later query these using `taskType: RETRIEVAL_QUERY`.
  - **Rate Limiting & Safety:** HTTP nodes use 7-second batching intervals and 5 retries to remain strictly within Gemini free-tier quotas.
  - **The Final 14-Item Flow Sequence:**
    1. *Manual Run Trigger* (Weekly Schedule optional, disabled by default).
    2. *Apify Scrape Node*: Queries the exact assignment URL.
    3. *Normalize Ad Payload*: Cleans fields, dates, and longevity.
    4. *If Node*: Filters and skips any ads with no copy; nothing is invented or hallucinated for them.
    5. *Gemini Extract Hook/Body/CTA*: Uses `gemini-3.5-flash-lite` with schema enforcement and 7s batching.
    6. *Parse Extracted JSON*: Sanitizes extracted copy and flags parse failures without inventing data.
    7. *Gemini Evaluate Creative Scores*: Grades 5 sub-scores on a 0–10 scale and writes an executive evaluation rationale.
    8. *Compute Composite Proxy Score*: Normalizes all 3 components to a 0–1 scale (40% Creative = avg/10, 35% Longevity = min(days/90, 1), 25% Iteration = min((collationCount-1)/4, 1) or has_multiple_versions).
    9. *Gemini Generate Embedding*: Produces 768-dim embeddings with `taskType: RETRIEVAL_DOCUMENT`.
    10. *Verify Embedding Dimension*: Verifies vector arrays strictly match 768 dimensions and skips any malformed vectors.
    11. *Supabase Upsert Ad & Scores*: Calls `public.upsert_ad_pipeline_record` passing all 28 parameters and sets the `is_mysivi_page` flag.
    12. *Supabase Store Vector Embedding*: Upserts verified 768-dim vectors into `ad_embeddings`.
    13. *Supabase Recalculate Leaderboard Ranks*: Calls `public.recalculate_ad_ranks` configured with Execute Once to refresh dense ranks.
    14. *Summarize Run*: Compiles real run counts (total processed, failed, top-ranked ad) with zero synthetic performance metrics."

---

### [2:00 – 2:45] 3. Supabase System of Record & HNSW Vector Store
* **Visual:** Supabase Table Editor showing `ads`, `ad_analysis`, `ad_scores`, and `ad_embeddings`.
* **Talking Points:**
  - "In Supabase, our schema enforces strict integrity: `ads.library_id` and `ad_embeddings.ad_id` are unique, ensuring zero duplicates on workflow re-runs.
  - Notice the `is_mysivi_page` column, dynamically derived from the advertiser's page name and exposed through our `v_ad_leaderboard` view.
  - For vector search, we replaced the standard IVFFlat index with an HNSW graph index on 768-dim embeddings using `vector_cosine_ops`, ensuring high recall even with our initial set of ~25 ads.
  - Strict Row Level Security prevents any public/anon writes, while our `/chat` Edge Function executes grounded vector retrieval."

---

### [2:45 – 3:30] 4. The Branded React Frontend & "Best Ad" Showcase
* **Visual:** Deployed MySivi Ad Intelligence web application (Home -> Leaderboard).
* **Talking Points:**
  - "Here is our presentation layer — fully styled to match mysivi.ai's signature aesthetic: royal indigo and purple gradients, rounded cards, and clean typography.
  - On both Home and Leaderboard, we feature our **Rank #1 Best Ad highlight card**:
    *(Read from live run)*:
    - Library ID: `1647671449602821`
    - Hook: `"हुशारीनं शिका, कष्ट न करता!"`
    - Composite Score: `0.8900` (89.0 / 100)
    - Strategic Rationale: `"The Marathi hook effectively targets a pain point by promising smart learning over hard work, driving good local relevance..."`
  - If 0 ads are in the database, the card cleanly renders nothing and the home counter displays an honest empty state with zero fabricated counts.
  - Notice the image handling: if Meta's CDN URLs expire, our cards render a neutral 'Creative preview unavailable' tile instead of falling back to fake Unsplash placeholders.
  - Each ad also displays a clean 'MySivi page' or 'Third-party page' badge."

---

### [3:30 – 4:15] 5. Leaderboard Audit & "Ask Arya" Grounded Chatbot
* **Visual:** Navigate to Leaderboard table, point to footnote, then open Arya chat widget.
* **Talking Points:**
  - "Looking at the Leaderboard table: notice the clear footnote at the bottom: *'Scores are a proxy from public Ad Library data. Impressions, CTR and ROAS are not public.'*
  - Now let's open **Arya**, MySivi's AI persona turned into an ad intelligence strategist.
  - Let's ask: *'Why is ad 1647671449602821 winning over other variants?'*
  - Arya retrieves matching ads via 768-dim embeddings (`taskType: RETRIEVAL_QUERY`), cites the exact Library ID, Hook, and Composite Score, and explains the win using only stored proxy signals and rationale — never guessing impressions or spend."

---

### [4:15 – 5:00] 6. System Limitations & Meta Ads Manager API Roadmap
* **Visual:** Scroll to the Metrics Framework tab on the Dashboard.
* **Talking Points:**
  - "To conclude, we are fully transparent about our **System Limitations**:
    1. **Proxy Scoring**: Rankings reflect algorithmic survival and creative quality heuristics, not direct attribution or ROAS.
    2. **No Impressions or Spend**: Private commercial ad metrics are strictly withheld by Meta.
    3. **Ads Without Text Are Not Scored**: The If node skips ads lacking text copy; nothing is invented or assumed for them.
    4. **Rate Limit Handling**: Gemini free-tier rate limits are handled through 7-second batching intervals and automatic retries.
    5. **Exact Phrase Keyword Search**: Searching for 'MySivi' means third-party or affiliate pages can appear; they are clearly flagged with a distinct badge.
    6. **Expiring Creative URLs**: Facebook CDN signed URLs expire over time, handled safely via neutral error states.
    7. **Visual Subscore**: Graded by Gemini from ad copy framing and metadata rather than raw multimodal video processing.
  - That's why we built this **Metrics Framework** panel: 20 private growth KPIs — from Hook Rate and Video Completion to CPA and ROAS — architected to activate the moment MySivi connects its authenticated Meta Ads Manager API token.
  - Thank you! All migrations, n8n workflows, report documentation, and frontend code are fully committed in the repository."
