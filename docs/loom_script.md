# MySivi Ad Intelligence Platform — Loom Recording Script

**Target Video Duration:** 5:00 minutes  
**Presenter:** Growth & Performance Marketing Engineer  
**Screen Setup:** Browser tab with Meta Ad Library, n8n canvas tab, Supabase Table Editor tab, and the deployed MySivi Ad Intelligence web application.

---

### [0:00 – 0:45] Intro & The "Public Ad Library" Reality Check
* **Visual:** Meta Ad Library search results for "MySivi" ([mysivi.ai](https://mysivi.ai)) side-by-side with assignment brief.
* **Talking Points:**
  - "Hello! Welcome to the MySivi Ad Intelligence platform walkthrough. When given the task to build a scraper and discover MySivi's 'best ad', we started with an essential performance-marketing reality check:
  - The public Meta Ad Library gives us creative assets, body text, hooks, start dates, and variant tests — but Meta strictly hides private metrics like impressions, spend, CTR, and ROAS from public viewers.
  - Rather than fabricating synthetic numbers or building a trivial copy scraper, we engineered a production-grade 4-tier system featuring a transparent 3-signal proxy scoring model and a grounded RAG AI assistant."

---

### [0:45 – 2:00] The 12-Step n8n Pipeline & Gemini Engine
* **Visual:** Open n8n workflow canvas (`mysivi-ad-scraper-workflow.json`).
* **Talking Points:**
  - "Here is our 12-node ingestion and reasoning pipeline built in n8n.
  - First, Apify triggers the Meta Ad Library scraper for MySivi commercial campaigns in India.
  - We batch process each ad, normalize dates, and calculate active longevity in days.
  - Next, we call Google Gemini 2.5 Flash with strict JSON Schema output to extract structured fields: the opening hook, body copy, CTA button, and pricing offers.
  - A second Gemini step evaluates the creative across 5 dimensions: Hook strength, Clarity, CTA power, Visual appeal, and Offer strength.
  - We then compute our deterministic composite proxy score: 40% AI Creative Quality, 35% Longevity (since ads surviving weeks in Meta's auction are proven winners), and 25% Iteration signal (active A/B variants).
  - Finally, we vectorize the ad text using `gemini-embedding-001` and upsert both relational data and 768-dimensional embeddings atomically into Supabase."

---

### [2:00 – 2:45] Supabase System of Record
* **Visual:** Supabase Table Editor showing `ads`, `ad_analysis`, `ad_scores`, and `ad_embeddings`.
* **Talking Points:**
  - "In Supabase, we have our relational tables with Row Level Security enabled.
  - Notice the `v_ad_leaderboard` view that joins the creative details with the computed scores, pre-sorted by rank.
  - We also have `ad_embeddings` with an IVFFlat cosine similarity index, and our Deno Edge Function at `/chat` for lightning-fast retrieval."

---

### [2:45 – 3:45] The Branded React Frontend & Leaderboard
* **Visual:** Deployed MySivi Ad Intelligence web application (Home -> Ad Gallery -> Leaderboard).
* **Talking Points:**
  - "Here is our presentation layer — fully styled to match mysivi.ai's signature aesthetic: the indigo-to-purple gradient, soft-shadow cards, and clean typography.
  - In the Ad Gallery, each ad card shows the creative asset, the extracted hook, CTA, active duration, and composite score.
  - Clicking any ad opens our Facebook-style Ad Details modal, showing advertiser verification, platform distribution, and Gemini's detailed strategic rationale.
  - Moving to the Leaderboard: every ad's rank is transparently broken down into its 3 weighted components: Creative Quality, Longevity, and Iteration. Marketers can audit exactly why an ad is ranked #1."

---

### [3:45 – 4:30] Live Grounded RAG Chatbot ("Ask Arya")
* **Visual:** Click floating "Ask Arya" chat bubble in the bottom right corner.
* **Talking Points:**
  - "Meet Arya — MySivi's AI persona turned into an ad intelligence strategist.
  - Let's ask: *'Why is the top ranked ad beating the ₹1 trial variant?'*
  - Watch as Arya responds: the Edge Function generates an embedding, searches our Supabase vector database for matching ads, and Gemini answers strictly using the real scraped ad context.
  - Notice how Arya quotes the exact Library ID, compares longevity days, and explains the psychological hook strength without hallucinating."

---

### [4:30 – 5:00] Metrics Framework & Meta Ads Manager Roadmap
* **Visual:** Scroll to the Metrics Framework tab on the Dashboard.
* **Talking Points:**
  - "Finally, we have our Metrics Framework panel. Here, 20 growth metrics — from Hook Rate and Video Completion to CPA and ROAS — are clearly mapped out and tagged as 'Tracked once connected to Meta Ads Manager API'.
  - This demonstrates that our architecture is fully prepared to ingest real private conversion data the moment MySivi connects its ad account token.
  - Thank you! All code, migrations, n8n workflows, and documentation are included in the repository."
