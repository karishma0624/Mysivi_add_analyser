import React, { useState } from 'react';
import { Trophy, Sparkles, Calendar, Layers, Eye, Play, ImageOff, CheckCircle2, Award } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';
import { calculateScoreBreakdown } from '../../lib/scoreUtils';

interface BestAdCardProps {
  winner: AdLeaderboardRow | null;
  onInspect?: (ad: AdLeaderboardRow) => void;
  onAskArya?: (ad: AdLeaderboardRow) => void;
}

export const BestAdCard: React.FC<BestAdCardProps> = ({
  winner,
  onInspect,
  onAskArya,
}) => {
  const [imgError, setImgError] = useState(false);

  // Render nothing when there are 0 ads
  if (!winner) {
    return null;
  }

  const score = calculateScoreBreakdown(winner);
  const hasCreativeUrl = Boolean(winner.creative_url && winner.creative_url.trim());

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-purple rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-light/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/15">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            <span>Best Ad (Rank #1)</span>
          </div>

          {/* MySivi page / Third-party page badge */}
          {winner.is_mysivi_page ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>MySivi page</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
              <span>Third-party page</span>
            </span>
          )}

          <span className="text-[11px] font-mono text-brand-100 bg-black/25 px-2.5 py-0.5 rounded-full border border-white/10">
            ID: {winner.library_id}
          </span>
        </div>

        {winner.page_name && (
          <span className="text-xs text-brand-200 font-medium">
            Advertiser: <strong className="text-white">{winner.page_name}</strong>
          </span>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Creative Asset */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/20 flex items-center justify-center">
            {imgError || !hasCreativeUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 text-slate-300 p-4 text-center select-none">
                <ImageOff className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">Creative preview unavailable</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Public Meta CDN link expired</span>
              </div>
            ) : (
              <>
                <img
                  src={winner.creative_url!}
                  alt={`Best Ad ${winner.library_id}`}
                  className="w-full h-full object-cover object-center"
                  onError={() => setImgError(true)}
                />
                {winner.creative_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-brand flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Active longevity tag on creative */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{winner.longevity_days} days active</span>
            </div>

            {/* Creative type pill */}
            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {winner.creative_type?.toUpperCase() || 'IMAGE'}
            </div>
          </div>

          {/* CTA Display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
            <span className="text-brand-200">Call to Action:</span>
            <span className="px-3 py-1 rounded-lg bg-white text-brand-900 font-extrabold shadow-sm">
              {winner.cta || 'Learn More'}
            </span>
          </div>
        </div>

        {/* Right Column: Hook, Body, Scores, Rationale */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200 block mb-1">
              Winning Hook
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug text-white">
              "{winner.hook || 'Improve Spoken English Fluency with AI'}"
            </h2>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200 block mb-1">
              Primary Body Copy
            </span>
            <p className="text-xs sm:text-sm text-brand-100 line-clamp-3 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/10">
              {winner.body}
            </p>
          </div>

          {/* Composite Score + 3 Weighted Components */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200 block">
                  Overall Composite Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-amber-300">
                    {score.composite100.toFixed(1)}
                  </span>
                  <span className="text-xs text-brand-200">/ 100</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-brand-200">
                <span className="font-semibold text-white">Rank #{winner.rank || 1}</span>
                <div className="text-[10px] text-brand-300">Deterministic Proxy Heuristic</div>
              </div>
            </div>

            {/* The 3 Weighted Components: points out of 100 summing to composite */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15 text-xs">
              {/* Component 1: Creative Quality 40% */}
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-brand-200 text-[10px]">
                  <span>Creative (40% max)</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </div>
                <div className="font-extrabold text-white text-sm">
                  {score.creativePts.toFixed(1)} pts
                </div>
                <div className="text-[9px] text-brand-300">Raw Quality: {(score.creative01 * 10).toFixed(1)}/10</div>
              </div>

              {/* Component 2: Longevity 35% */}
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-brand-200 text-[10px]">
                  <span>Longevity (35% max)</span>
                  <Calendar className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-extrabold text-white text-sm">
                  {score.longevityPts.toFixed(1)} pts
                </div>
                <div className="text-[9px] text-brand-300">{winner.longevity_days}d in auction</div>
              </div>

              {/* Component 3: Iteration 25% */}
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-brand-200 text-[10px]">
                  <span>Iteration (25% max)</span>
                  <Layers className="w-3 h-3 text-brand-200" />
                </div>
                <div className="font-extrabold text-white text-sm">
                  {score.iterationPts.toFixed(1)} pts
                </div>
                <div className="text-[9px] text-brand-300">
                  {winner.has_multiple_versions ? 'Variants Active' : 'Single Variant'}
                </div>
              </div>
            </div>
          </div>

          {/* Gemini Rationale */}
          {winner.analysis_notes && (
            <div className="p-4 rounded-xl bg-black/25 border border-white/15 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Strategic Rationale</span>
              </div>
              <p className="text-xs text-brand-100 leading-relaxed italic">
                "{winner.analysis_notes}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onInspect && (
              <button
                onClick={() => onInspect(winner)}
                className="px-4 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-brand-50 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Eye className="w-4 h-4 text-brand" />
                <span>Inspect Winner Breakdown</span>
              </button>
            )}

            {onAskArya && (
              <button
                onClick={() => onAskArya(winner)}
                className="px-4 py-2.5 rounded-xl bg-brand-700/90 hover:bg-brand-600 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask Arya: Why is this #1?</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
