import React, { useState } from 'react';
import { Trophy, Award, Sparkles, Calendar, Layers, Eye, HelpCircle, Workflow, ImageOff, CheckCircle2 } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';
import { calculateScoreBreakdown } from '../../lib/scoreUtils';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';
import { AdDetailModal } from '../ads/AdDetailModal';
import { BestAdCard } from '../ads/BestAdCard';

interface LeaderboardProps {
  ads: AdLeaderboardRow[];
  loading: boolean;
  onAskAboutAd: (ad: AdLeaderboardRow) => void;
  onRefresh: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  ads,
  loading,
  onAskAboutAd,
  onRefresh,
}) => {
  const [selectedAd, setSelectedAd] = useState<AdLeaderboardRow | null>(null);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  // REQUIRED HONEST EMPTY STATE (ZERO MOCK/FALLBACK DATA)
  if (!ads || ads.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center max-w-3xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Workflow className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          No ads analyzed yet.
        </h3>

        <p className="text-base font-semibold text-brand-700 max-w-xl mx-auto mb-6">
          Run the n8n workflow to fetch and analyze real MySivi advertisements from the Meta Ad Library.
        </p>

        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed mb-8">
          The leaderboard ranks advertisements dynamically once the n8n ingestion pipeline populates Supabase with live Meta Ad Library data and Gemini creative evaluations.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            How the Best Ad is Ranked (0-100 Score):
          </span>
          <div className="text-xs text-slate-600 font-mono space-y-1">
            <div>Composite Score (0-100) =</div>
            <div>&nbsp;&nbsp;+ 0.40 × Creative Quality × 100 (Max 40 pts; 5 subscores 0-10)</div>
            <div>&nbsp;&nbsp;+ 0.35 × Longevity × 100 (Max 35 pts; days active / 90)</div>
            <div>&nbsp;&nbsp;+ 0.25 × Iteration × 100 (Max 25 pts; variant testing)</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onRefresh}
            className="gradient-brand-btn px-6 py-3 rounded-full text-white text-sm font-bold shadow-md shadow-brand/20 hover:scale-105 transition-transform"
          >
            Check for New Live Data
          </button>
        </div>
      </div>
    );
  }

  const winner = ads[0];

  return (
    <div className="space-y-8">
      {/* Best Ad (Rank 1) Highlight Card - Renders nothing when there are 0 ads */}
      {winner && (
        <BestAdCard
          winner={winner}
          onInspect={(ad) => setSelectedAd(ad)}
          onAskArya={(ad) => onAskAboutAd(ad)}
        />
      )}

      {/* Visual Component Contribution Chart */}
      <ScoreBreakdownChart ads={ads} />

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ranked Ad Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              All active ads sorted deterministically by weighted composite score (0-100).
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full w-fit">
            {ads.length} live analyzed ads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-4">Creative & Hook</th>
                <th className="py-3.5 px-4">Longevity (35%)</th>
                <th className="py-3.5 px-4">Iteration (25%)</th>
                <th className="py-3.5 px-4">Creative Quality (40%)</th>
                <th className="py-3.5 px-6 text-right">Composite Score</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map((ad, idx) => {
                const rank = ad.rank || idx + 1;
                const score = calculateScoreBreakdown(ad);
                const hasCreativeUrl = Boolean(ad.creative_url && ad.creative_url.trim());

                return (
                  <tr
                    key={ad.library_id || idx}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 font-bold">
                      <div className="flex items-center gap-1.5">
                        {rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-extrabold border border-amber-300">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-extrabold border border-slate-300">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 flex items-center justify-center text-xs font-extrabold border border-amber-700/30">
                            🥉
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                            #{rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Creative & Hook */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center relative">
                          {hasCreativeUrl ? (
                            <img
                              src={ad.creative_url!}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-1 text-center"
                            style={{ display: hasCreativeUrl ? 'none' : 'flex' }}
                            title="Creative preview unavailable"
                          >
                            <ImageOff className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>

                        <div className="truncate space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {ad.is_mysivi_page ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>MySivi page</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                <span>Third-party page</span>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {ad.library_id}
                            </span>
                          </div>

                          <p className="font-bold text-slate-900 text-xs truncate">
                            "{ad.hook || 'Learn English with AI'}"
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Longevity */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-emerald-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ad.longevity_days} days</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold">
                        +{score.longevityPts.toFixed(1)} pts
                      </span>
                    </td>

                    {/* Iteration */}
                    <td className="py-4 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                        <Layers className="w-3 h-3" />
                        +{score.iterationPts.toFixed(1)} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {ad.has_multiple_versions ? 'Variants Active' : 'Single Variant'}
                      </span>
                    </td>

                    {/* Creative Quality */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 font-bold text-brand-800">
                        <Sparkles className="w-3.5 h-3.5 text-brand" />
                        <span>+{score.creativePts.toFixed(1)} pts</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Raw: {(score.creative01 * 10).toFixed(1)}/10
                      </span>
                    </td>

                    {/* Composite Score */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {score.composite100.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">/ 100</span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedAd(ad)}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-brand-50 transition-colors"
                        title="Inspect ad details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote on Leaderboard */}
        <div className="py-3 px-6 bg-slate-50/80 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
          Scores are a proxy from public Ad Library data. Impressions, CTR and ROAS are not public.
        </div>
      </div>

      {/* Detail Modal */}
      <AdDetailModal
        ad={selectedAd}
        onClose={() => setSelectedAd(null)}
        onAskAboutAd={(ad) => {
          setSelectedAd(null);
          onAskAboutAd(ad);
        }}
      />
    </div>
  );
};
