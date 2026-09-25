import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  Workflow,
  Cpu,
  Database,
  ExternalLink,
  MessageSquare,
  Award,
} from 'lucide-react';
import type { AdLeaderboardRow } from '../lib/types';
import { BestAdCard } from '../components/ads/BestAdCard';

interface HomeProps {
  onExploreLeaderboard: () => void;
  onExploreGallery: () => void;
  onOpenChat: () => void;
  adCount: number;
  winner: AdLeaderboardRow | null;
  onAskAboutAd?: (ad: AdLeaderboardRow) => void;
}

export const Home: React.FC<HomeProps> = ({
  onExploreLeaderboard,
  onExploreGallery,
  onOpenChat,
  adCount,
  winner,
  onAskAboutAd,
}) => {
  return (
    <div className="space-y-24">
      {/* Hero Section — Designed to mirror mysivi.ai hero layout */}
      <section className="relative pt-6 pb-12 overflow-hidden text-center">
        {/* Soft background glow circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-purple/10 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>AI-Powered Meta Ad Library Intelligence</span>
          </div>

          {/* Headline matching mysivi.ai display hierarchy */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Find Your <span className="gradient-brand-text">Best Performing</span> Ad with AI-Powered Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Scrape public Facebook Ad Library ads for <strong>MySivi</strong>, extract winning hooks and CTAs, and discover top creatives using our transparent 3-signal proxy scoring model and Arya RAG AI.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreLeaderboard}
              className="gradient-brand-btn w-full sm:w-auto px-8 py-4 rounded-full text-white font-extrabold text-sm shadow-lg shadow-brand/30 flex items-center justify-center gap-2 group"
            >
              <span>Explore Ad Leaderboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenChat}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Ask Arya AI</span>
            </button>
          </div>

          {/* Real Count Stats Bar */}
          <div className="pt-10 max-w-2xl mx-auto grid grid-cols-3 divide-x divide-slate-200 text-center border-t border-slate-200/60">
            <div className="px-2 sm:px-4">
              <span className="block text-2xl sm:text-3xl font-black text-slate-900">
                {adCount} {adCount === 1 ? 'Real Ad' : 'Real Ads'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {adCount === 0 ? 'Analyzed in Database' : 'Meta Ad Library Ingested'}
              </span>
            </div>
            <div className="px-2 sm:px-4">
              <span className="block text-2xl sm:text-3xl font-black text-brand">
                3 Signals
              </span>
              <span className="text-xs font-medium text-slate-500">
                Proxy Scoring Heuristic
              </span>
            </div>
            <div className="px-2 sm:px-4">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-600">
                $0 / Free
              </span>
              <span className="text-xs font-medium text-slate-500">
                Zero-Cost Cloud Stack
              </span>
            </div>
          </div>
        </div>

        {/* Floating Mockup Widgets (matching mysivi.ai floating card aesthetic) */}
        <div className="relative max-w-5xl mx-auto mt-12 px-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Card 1: Longevity signal */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  35%
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Longevity Signal</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ads that survive for weeks in Meta's auction are empirical winners that convert on cost-per-result.
                </p>
              </div>

              {/* Card 2: Iteration signal */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center font-bold text-xs">
                  25%
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Iteration Signal</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Active A/B variant testing ("Multiple versions") indicates the growth team has found a winning core concept.
                </p>
              </div>

              {/* Card 3: Gemini Creative Quality */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  40%
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Gemini AI Quality</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Multi-dimensional rubric scoring the opening Hook, Message Clarity, CTA Power, Visual Appeal, and Offer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Ad (Rank 1) Highlight Section - Render nothing when there are 0 ads */}
      {adCount > 0 && winner && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Rank #1 Top Performing Creative
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Current Campaign Winner
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Top advertisement in the active campaign set ranked deterministically by our 3-signal proxy model.
            </p>
          </div>

          <BestAdCard
            winner={winner}
            onInspect={() => onExploreLeaderboard()}
            onAskArya={() => (onAskAboutAd ? onAskAboutAd(winner) : onOpenChat())}
          />
        </section>
      )}

      {/* Honest Empty State when 0 ads */}
      {adCount === 0 && (
        <section className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Workflow className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              No ads analyzed yet (0 in database)
            </h3>

            <p className="text-sm font-semibold text-brand-700 max-w-lg mx-auto mb-3">
              Run the n8n workflow to fetch and analyze real MySivi advertisements from the Meta Ad Library.
            </p>

            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
              This platform strictly evaluates genuine scraped ad creatives using Google Gemini. Once data is ingested into Supabase, the Rank #1 Best Ad highlight card and gallery will appear here automatically.
            </p>

            <button
              onClick={onExploreLeaderboard}
              className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              View Leaderboard Status
            </button>
          </div>
        </section>
      )}

      {/* 2-Column Feature Grid (mirrors mysivi.ai's "Why Choose MySivi" section) */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Engineered for Modern Growth Teams
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why This Intelligence Platform Stands Out
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A real 4-tier architecture delivering transparent heuristic reasoning instead of fabricated impressions or basic scraper scripts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-200 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Hallucinated Metrics — Pure Real Data
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Meta hides impressions, spend, and ROAS for commercial app campaigns in the public Ad Library. We tell the truth, calculate a credible 3-signal proxy score, and maintain a dedicated API roadmap.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-200 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Grounded RAG Chatbot ("Arya")
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ask Arya why an ad won, compare hook strengths between variants, or search ads by topic. Answers are grounded in real Supabase pgvector embeddings and Gemini reasoning.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-200 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand flex items-center justify-center shadow-xs">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Automated 14-Item n8n Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our exportable n8n workflow orchestrates the entire lifecycle: Apify Meta Ad Library scraping, Gemini extraction & scoring, deterministic math, and vector embeddings in Supabase.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-200 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand flex items-center justify-center shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Meta Ads Manager API Readiness
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The platform defines 20 strategic performance KPIs across Attention, Engagement, Conversion, and Cost, architected to ingest live private data once an OAuth ad account token is supplied.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
