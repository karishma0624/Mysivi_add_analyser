# MySivi Ad Intelligence Platform — Assignment Submission

---

## Problem Statement

Build an n8n workflow for Facebook Ad Library Scraping and analyse running ads. Extract hook, body, CTA from each ad. Find out the best ad in the list. Ad Library Link: https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&is_targeted_country=false&media_type=all&q=%22MySivi%22&search_type=keyword_exact_phrase&sort_data[direction]=desc&sort_data[mode]=total_impressions

---

## Links

- **GitHub Repository**: https://github.com/karishma0624/Mysivi_add_analyser.git
- **Live Deployed App**: https://mysivi-add-analyser.vercel.app/
- **n8n Workflow JSON**: https://drive.google.com/file/d/1YLi4GY0wZFX91vw1OgFMj3vtN1mNFKo_/view?usp=sharing
- **Loom Video Walkthrough**: https://drive.google.com/file/d/1e6pWpN1Ji88Q2ibs9DmSUSxVpqU8tt38/view?usp=sharing

---

## Approach

Apify scrapes the exact assignment Ad Library URL, n8n normalizes and routes each ad through Gemini for hook/body/CTA extraction and creative scoring, computes a 3-signal composite proxy score, stores everything in Supabase with vector embeddings, and surfaces results through a React dashboard with a grounded RAG chatbot (Arya).

---

## Scoring Model

- **Composite Score Formula**: $\text{Composite} = 40\% \times \text{Creative Quality} + 35\% \times \text{Longevity} + 25\% \times \text{Iteration Signal}$.
- **Rationale for Proxy Signals**: Public Meta Ad Library data does not expose private auction metrics (impressions, click-through rate / CTR, cost per click / CPC, CPM, or spend) for commercial app-install campaigns, requiring this deterministic proxy heuristic to identify proven winners.

---

<div style="page-break-before: always;"></div>

## Result

- **Total Real Ads Analyzed**: **28 active advertisements** scraped from the Meta Ad Library and stored in Supabase with pgvector embeddings.
- **Rank #1 Best Ad**:
  - **Library ID**: `1647671449602821`
  - **Composite Score**: **88.8 / 100** (0.888 / 1.0)
  - **Extracted Hook**: *"हुशारीनं शिका, कष्ट न करता!"* (Marathi vernacular hook: smart learning over hard work)
  - **Primary Body Copy**: *"MySivi AI सोबत खरी English बोलायची प्रॅक्टिस करा."*
  - **Call to Action (CTA)**: `आजच ट्रायल सुरू करा`
  - **Offer Details**: `₹1/- ला` (₹1 trial incentive lowering entry barriers)
  - **Auction Longevity**: Active for **186 days** continuously in Meta's auction (earning the max 1.0 / 35.0 pts longevity score).
  - **Variant Testing**: Multiple versions active (`has_multiple_versions: true`, earning 25.0 pts iteration score).
  - **AI Creative Quality**: Evaluated at 7.2/10 (28.8 pts) by Gemini across hook, clarity, CTA strength, visual framing, and offer strength.

---

## Limitations

- **Proxy Scoring vs. Private Metrics**: Scores reflect auction survival and copy persuasion rather than internal revenue attribution or ROAS.
- **No Public Delivery Data**: Public Meta Ad Library data withholds impressions, spend, CPM, and CTR for commercial app campaigns.
- **Expiring Facebook CDN URLs**: Media URLs served by Meta's CDN expire over time, requiring periodic re-scrapes to maintain asset links.
- **Text-Inferred Visual Scoring**: Visual appeal is inferred by Gemini from copy framing and layout metadata rather than direct video computer vision.

---

## Future Enhancements

- **Real Meta Ads Manager API Integration**: Authenticate with Meta Marketing API once ad account access is granted to validate proxy scores against true CTR and spend.
- **Content-Hash Caching**: Implement SHA-256 copy hashing in n8n to skip redundant Gemini extraction calls for unchanged ad copy on re-runs while preserving dynamic longevity updates.
- **Historical Score Tracking**: Monitor weekly performance trajectory and score changes per ad to automatically detect creative fatigue.
- **Multimodal Visual Scoring**: Ingest raw video frames and creative image assets into Gemini multimodal vision for computer-vision creative audits.
