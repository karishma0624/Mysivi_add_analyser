import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

// Chat model constant read from env GEMINI_CHAT_MODEL with default "gemini-3.5-flash-lite"
const CHAT_MODEL = Deno.env.get("GEMINI_CHAT_MODEL") || "gemini-3.5-flash-lite";
const FALLBACK_CHAT_MODEL = "gemini-2.5-flash";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function embed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 768,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Embedding API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data?.embedding?.values) {
    throw new Error("No embedding values returned from Gemini API");
  }
  return data.embedding.values;
}

async function callGeminiGenerate(model: string, apiKey: string, promptText: string): Promise<Response> {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    }
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { question, sessionId } = body || {};

    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "question is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!geminiApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Edge Function is missing required environment secrets: GEMINI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Generate query embedding with taskType: RETRIEVAL_QUERY and outputDimensionality: 768
    const queryEmbedding = await embed(question, geminiApiKey);

    // 2. Vector similarity search against real ad embeddings
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_ad_embeddings",
      {
        query_embedding: queryEmbedding,
        match_count: 5,
      }
    );

    if (matchError) {
      console.error("Vector match error:", matchError);
      return new Response(
        JSON.stringify({ error: `Supabase vector match failed: ${matchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check if we have real ad context; keep exact empty-database message
    if (!matches || matches.length === 0) {
      const fallbackAnswer =
        "No analyzed MySivi ads found in the database. Please run the n8n workflow to scrape and analyze real advertisements from Meta Ad Library first.";

      if (sessionId) {
        await supabase.from("chat_messages").insert([
          { session_id: sessionId, role: "user", content: question },
          { session_id: sessionId, role: "assistant", content: fallbackAnswer },
        ]);
      }

      return new Response(
        JSON.stringify({ answer: fallbackAnswer, matches: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Retrieve structured ad details for the matched ads to ensure accurate citation of library_id, hook, composite score
    const adIds = matches.map((m: any) => m.ad_id).filter(Boolean);
    const { data: adsData, error: adsError } = await supabase
      .from("v_ad_leaderboard")
      .select("*")
      .in("ad_id", adIds);

    if (adsError) {
      console.warn("Could not fetch v_ad_leaderboard rows:", adsError.message);
    }

    let contextText = "";
    if (adsData && adsData.length > 0) {
      const sortedAds = [...adsData].sort(
        (a, b) => (Number(b.composite_score) || 0) - (Number(a.composite_score) || 0)
      );
      contextText = sortedAds
        .map((ad: any, idx: number) => {
          const comp = Number(ad.composite_score || 0);
          const compDisplay = comp <= 1 ? (comp * 100).toFixed(1) : comp.toFixed(1);
          return `Ad #${idx + 1}:
- Library ID: ${ad.library_id}
- Hook: "${ad.hook || 'N/A'}"
- Body: "${ad.body || 'N/A'}"
- Call To Action (CTA): "${ad.cta || 'N/A'}"
- Offer Details: "${ad.offer_details || 'None'}"
- Composite Score: ${compDisplay} / 100 (Rank #${ad.rank || idx + 1})
- Creative Quality Score: ${Number(ad.creative_quality_score || 0).toFixed(4)} (Hook: ${ad.hook_score}/10, Clarity: ${ad.clarity_score}/10, CTA Strength: ${ad.cta_strength_score}/10, Visual Appeal: ${ad.visual_appeal_score}/10, Offer Strength: ${ad.offer_strength_score}/10)
- Longevity: ${ad.longevity_days || 0} days active (Longevity Score: ${ad.longevity_score})
- Multiple Variants/Testing: ${ad.has_multiple_versions ? 'Yes (Multiple active variants)' : 'No (Single variant)'}
- Stored Evaluation Rationale: ${ad.analysis_notes || 'N/A'}`;
        })
        .join("\n\n");
    } else {
      contextText = matches
        .map((m: any, idx: number) => `Ad #${idx + 1}:\n${m.content}`)
        .join("\n\n");
    }

    // 5. Build grounded prompt requiring citation of library_id, hook, composite score, and forbidding impressions/CTR/spend
    const prompt = `You are Arya, the performance creative strategist and analytics assistant for MySivi's Facebook Ad Intelligence platform (mysivi.ai).
Answer the marketer's question using ONLY the retrieved real ad intelligence data below.

REAL AD DATA STORED IN DATABASE:
"""
${contextText}
"""

MARKETER QUESTION: ${question}

MANDATORY INSTRUCTIONS:
1. Always cite the Library ID, Hook, and Composite Score for every ad retrieved or referenced in your analysis.
2. Explain why the top ad ranks best using ONLY the stored proxy scores (Composite Score = 40% Gemini Creative Quality + 35% Longevity + 25% Iteration signal) and the stored strategic evaluation rationale.
3. NEVER state, estimate, invent, or mention impressions, click-through rate (CTR), cost per click (CPC), cost per mille (CPM), spend, conversions, or return on ad spend (ROAS). Public Meta Ad Library data does not disclose these internal auction metrics for commercial app-install campaigns.
4. Keep the explanation sharp, objective, and strictly grounded in the database data.`;

    // 6. Generate response with CHAT_MODEL; retry once with FALLBACK_CHAT_MODEL on 503 or 404
    let modelUsed = CHAT_MODEL;
    let genRes: Response;
    let shouldRetry = false;

    try {
      genRes = await callGeminiGenerate(modelUsed, geminiApiKey, prompt);
      if (genRes.status === 503 || genRes.status === 404) {
        shouldRetry = true;
      }
    } catch (fetchErr) {
      console.warn(`Fetch exception with primary model ${modelUsed}:`, fetchErr);
      shouldRetry = true;
      genRes = new Response(JSON.stringify({ error: String(fetchErr) }), { status: 503 });
    }

    if (shouldRetry && modelUsed !== FALLBACK_CHAT_MODEL) {
      console.warn(
        `Gemini API returned status ${genRes.status} for ${modelUsed}. Retrying once with fallback model ${FALLBACK_CHAT_MODEL}...`
      );
      modelUsed = FALLBACK_CHAT_MODEL;
      try {
        genRes = await callGeminiGenerate(modelUsed, geminiApiKey, prompt);
      } catch (retryErr) {
        console.error(`Fetch exception with fallback model ${modelUsed}:`, retryErr);
        return new Response(
          JSON.stringify({
            error: `AI analysis service error: both ${CHAT_MODEL} and ${FALLBACK_CHAT_MODEL} failed. ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!genRes.ok) {
      const errText = await genRes.text();
      console.error(`Gemini generateContent error (${genRes.status}) using model ${modelUsed}:`, errText);
      return new Response(
        JSON.stringify({
          error: `AI analysis service error: both models failed. Last attempted model (${modelUsed}) returned HTTP ${genRes.status}.`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const genData = await genRes.json();
    const answer =
      genData.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I was unable to generate an analysis. Please try asking again.";

    // 7. Log conversation to chat_messages via service role
    if (sessionId) {
      await supabase.from("chat_messages").insert([
        { session_id: sessionId, role: "user", content: question },
        { session_id: sessionId, role: "assistant", content: answer },
      ]);
    }

    return new Response(JSON.stringify({ answer, matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Chat Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
