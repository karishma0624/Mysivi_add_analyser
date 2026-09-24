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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embedding API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data?.embedding?.values) {
    throw new Error("No embedding values returned from Gemini");
  }
  return data.embedding.values;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, sessionId } = await req.json();

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

    // 1. Generate query embedding
    const queryEmbedding = await embed(question);

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
        JSON.stringify({ error: matchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check if we have real ad context
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

    // 4. Build grounded RAG prompt
    const context = matches.map((m: any, idx: number) => `Ad #${idx + 1}:\n${m.content}`).join("\n\n");

    const prompt = `You are Arya, the performance creative strategist and analytics assistant for MySivi's Facebook Ad Intelligence platform (mysivi.ai).
Answer the marketer's question using ONLY the retrieved real ad intelligence data below.
If the data does not contain the answer, say so honestly without guessing or fabricating numbers.
Always reference specific ads by their Library ID, Hook, or Rank when available.

REAL AD DATA FROM META AD LIBRARY & GEMINI SCORING:
"""
${context}
"""

MARKETER QUESTION: ${question}

Instructions:
1. Provide a sharp, executive-level answer.
2. Clearly explain *why* top ads succeed based on the 3 proxy signals: Longevity (days running), Iteration (testing multiple versions), and Gemini Creative Quality (Hook, Clarity, CTA, Visual Appeal, Offer Strength).
3. If asked about spend, CTR, or ROAS, clarify that those metrics require Meta Ads Manager API connection and are not available in public Ad Library data.`;

    // 5. Generate response with gemini-2.5-flash
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!genRes.ok) {
      const errText = await genRes.text();
      throw new Error(`Gemini generateContent error (${genRes.status}): ${errText}`);
    }

    const genData = await genRes.json();
    const answer =
      genData.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I was unable to generate an analysis. Please try asking again.";

    // 6. Log conversation to chat_messages
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
