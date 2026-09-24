import React from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Layers,
  Award,
  Sparkles,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Tag,
  TrendingUp,
  Brain,
} from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';

interface AdDetailModalProps {
  ad: AdLeaderboardRow | null;
  onClose: () => void;
  onAskAboutAd: (ad: AdLeaderboardRow) => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  ad,
  onClose,
  onAskAboutAd,
}) => {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Meta Ad Details
            </span>
            <span className="text-xs font-mono font-medium text-slate-500">
              Library ID: {ad.library_id}
            </span>
            {ad.rank && (
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Rank #{ad.rank}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAboutAd(ad)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand bg-brand-50 hover:bg-brand-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Arya About This Ad</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns (Facebook Ad Details pattern) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Ad Creative & Raw Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Creative Asset Container */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative aspect-video flex items-center justify-center">
              <img
                src={ad.creative_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80'}
                alt={`Creative for ad ${ad.library_id}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                Type: {ad.creative_type?.toUpperCase() || 'IMAGE'}
              </div>
            </div>

            {/* Extracted Hook */}
            <div className="bg-gradient-to-r from-brand-50 to-indigo-50/50 p-5 rounded-2xl border border-brand-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Extracted Hook (Attention Capture)
                </span>
                <span className="text-xs font-bold text-brand-800 bg-white px-2 py-0.5 rounded-full border border-brand-200">
                  Hook Score: {ad.hook_score || 0}/10
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 leading-snug">
                "{ad.hook || 'Practice speaking English without fear using AI'}"
              </p>
            </div>

            {/* Primary Text / Body */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Primary Ad Copy
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {ad.body}
              </div>
            </div>

            {/* CTA & Offer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Call To Action (CTA)
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand text-white font-bold text-xs shadow-sm">
                  {ad.cta || 'Learn More'}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Offer / Pricing Details
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {ad.offer_details || 'Standard App Access / ₹1 Trial'}
                </span>
              </div>
            </div>

            {/* Hashtags */}
            {ad.hashtags && ad.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {ad.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Advertiser Info & Gemini Strategic Analysis */}
          <div className="lg:col-span-5 space-y-6">
            {/* About the Advertiser Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Advertiser
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand to-brand-purple text-white flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {ad.page_name || 'MySivi'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-brand fill-brand-100" />
                  </div>
                  <p className="text-xs text-slate-500">
                    {ad.advertiser_category || 'Education & Language Learning'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(ad.follower_count || 120000).toLocaleString()} followers
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Started Running</span>
                  <span className="font-semibold text-slate-800">
                    {ad.started_running_on || 'Recent'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Longevity</span>
                  <span className="font-semibold text-emerald-600">
                    {ad.longevity_days} days active
                  </span>
                </div>
              </div>
            </div>

            {/* Gemini Creative Evaluation (5 Subscores) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-brand" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Gemini Creative Quality
                  </h4>
                </div>
                <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  Avg: {Number(ad.creative_quality_score || 0).toFixed(1)}/10
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Hook Strength</span>
                    <span className="font-bold">{ad.hook_score || 0}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${(ad.hook_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Message Clarity</span>
                    <span className="font-bold">{ad.clarity_score || 0}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${(ad.clarity_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>CTA Strength</span>
                    <span className="font-bold">{ad.cta_strength_score || 0}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${(ad.cta_strength_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Visual Appeal</span>
                    <span className="font-bold">{ad.visual_appeal_score || 0}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${(ad.visual_appeal_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Offer Strength</span>
                    <span className="font-bold">{ad.offer_strength_score || 0}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${(ad.offer_strength_score || 0) * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini Strategic Analysis Notes (Quoted by RAG) */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-brand-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Strategic Performance Rationale</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{ad.analysis_notes || 'Strong direct-response messaging addressing language learners with immediate conversational relevance.'}"
              </p>
              <span className="text-[10px] text-slate-400 block pt-1">
                Embedded as vector and quoted directly by Arya during RAG queries.
              </span>
            </div>

            {/* Composite Score Formula Box */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Composite Proxy Formula</span>
                <span className="text-lg font-black text-slate-900">
                  {Number(ad.composite_score || 0).toFixed(2)} / 10
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                <div>0.40 × Creative ({Number(ad.creative_quality_score || 0).toFixed(1)}) = {(0.40 * (ad.creative_quality_score || 0)).toFixed(2)}</div>
                <div>0.35 × Longevity ({Number(ad.longevity_score || 0).toFixed(1)}) = {(0.35 * (ad.longevity_score || 0)).toFixed(2)}</div>
                <div>0.25 × Iteration ({ad.has_multiple_versions ? '10.0' : '0.0'}) = {(0.25 * (ad.has_multiple_versions ? 10 : 0)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href={`https://www.facebook.com/ads/library/?id=${ad.library_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-brand flex items-center gap-1.5 transition-colors"
          >
            <span>View in Meta Ad Library</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onAskAboutAd(ad)}
            className="gradient-brand-btn px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Arya to Compare This Ad</span>
          </button>
        </div>
      </div>
    </div>
  );
};
