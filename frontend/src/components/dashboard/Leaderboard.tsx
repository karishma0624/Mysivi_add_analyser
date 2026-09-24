import React, { useState } from 'react';
import { Trophy, Award, Sparkles, Calendar, Layers, Eye, HelpCircle, Workflow } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';
import { AdDetailModal } from '../ads/AdDetailModal';

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
            How the Best Ad is Ranked:
          </span>
          <div className="text-xs text-slate-600 font-mono space-y-1">
            <div>Composite Score =</div>
            <div>&nbsp;&nbsp;+ 0.40 × Gemini Creative Quality (Hook, Clarity, CTA, Visual, Offer)</div>
            <div>&nbsp;&nbsp;+ 0.35 × Longevity (Days survived in Meta auction)</div>
            <div>&nbsp;&nbsp;+ 0.25 × Iteration (Active variant testing signal)</div>
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
      {/* Winning Creative Hero Banner */}
      {winner && (
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-purple rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-brand-light/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Summary */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                <Trophy className="w-3.5 h-3.5 fill-current" />
                #1 Winning Ad in Active Campaign Set
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                "{winner.hook || 'Master English Speaking with AI'}"
              </h2>

              <p className="text-sm text-brand-100 line-clamp-2 leading-relaxed">
                {winner.body}
              </p>

              {/* Stat Chips */}
              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                  <span className="text-brand-200 block text-[10px]">Longevity</span>
                  <span className="font-bold text-white">{winner.longevity_days} Days Active</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                  <span className="text-brand-200 block text-[10px]">Creative Quality</span>
                  <span className="font-bold text-white">
                    {Number(winner.creative_quality_score || 0).toFixed(1)}/10
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                  <span className="text-brand-200 block text-[10px]">A/B Variants</span>
                  <span className="font-bold text-white">
                    {winner.has_multiple_versions ? 'Multiple Versions Active' : 'Single Version'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setSelectedAd(winner)}
                  className="px-5 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-brand-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Eye className="w-4 h-4 text-brand" />
                  <span>Inspect Winner Breakdown</span>
                </button>
                <button
                  onClick={() => onAskAboutAd(winner)}
                  className="px-5 py-2.5 rounded-xl bg-brand-700/80 hover:bg-brand-600 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask Arya: Why is this #1?</span>
                </button>
              </div>
            </div>

            {/* Right Score Badge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-200 mb-1">
                Composite Proxy Score
              </span>
              <div className="text-5xl font-black text-amber-300 tracking-tight">
                {Number(winner.composite_score || 0).toFixed(2)}
              </div>
              <span className="text-xs text-brand-200 font-medium mt-1">out of 10.0</span>
              <div className="mt-4 text-[11px] text-brand-100 bg-black/20 px-3 py-1 rounded-full font-mono">
                ID: {winner.library_id}
              </div>
            </div>
          </div>
        </div>
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
              All active ads sorted deterministically by weighted composite score.
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
                <th className="py-3.5 px-4">Longevity</th>
                <th className="py-3.5 px-4">Iteration</th>
                <th className="py-3.5 px-4">Creative Quality</th>
                <th className="py-3.5 px-6 text-right">Composite Score</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map((ad, idx) => {
                const rank = ad.rank || idx + 1;
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
                        <img
                          src={ad.creative_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            "{ad.hook || 'Learn English with AI'}"
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {ad.library_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Longevity */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-emerald-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ad.longevity_days} days</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Score: {Number(ad.longevity_score || 0).toFixed(1)}/10
                      </span>
                    </td>

                    {/* Iteration */}
                    <td className="py-4 px-4 text-xs">
                      {ad.has_multiple_versions ? (
                        <span className="inline-flex items-center gap-1 text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                          <Layers className="w-3 h-3" />
                          10.0 (Variants)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          0.0 (Single)
                        </span>
                      )}
                    </td>

                    {/* Creative Quality */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 font-bold text-brand-800">
                        <Sparkles className="w-3.5 h-3.5 text-brand" />
                        <span>{Number(ad.creative_quality_score || 0).toFixed(1)} / 10</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Gemini 2.5 Flash</span>
                    </td>

                    {/* Composite Score */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {Number(ad.composite_score || 0).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">/ 10.0</span>
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
