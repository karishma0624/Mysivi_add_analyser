import React from 'react';
import type { AdLeaderboardRow } from '../../lib/types';
import { calculateScoreBreakdown } from '../../lib/scoreUtils';

interface ScoreBreakdownChartProps {
  ads: AdLeaderboardRow[];
}

export const ScoreBreakdownChart: React.FC<ScoreBreakdownChartProps> = ({ ads }) => {
  if (!ads || ads.length === 0) return null;

  // Take top 5 ads for comparative chart
  const topAds = ads.slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Top Performing Ads — 3-Signal Proxy Composition (0-100 Scale)
          </h3>
          <p className="text-xs text-slate-500">
            Auditing the exact weighted points (out of 100) that determine the #1 winning ad.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brand" />
            <span className="text-slate-600">Creative Quality (40% / 40 pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-slate-600">Longevity (35% / 35 pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brand-purple" />
            <span className="text-slate-600">Iteration (25% / 25 pts)</span>
          </div>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-4">
        {topAds.map((ad, index) => {
          const score = calculateScoreBreakdown(ad);

          return (
            <div key={ad.library_id || index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 w-16">
                    Rank #{ad.rank || index + 1}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px] truncate max-w-[200px] sm:max-w-md">
                    "{ad.hook || `Ad ${ad.library_id}`}"
                  </span>
                </div>
                <div className="font-bold text-slate-900">
                  {score.composite100.toFixed(1)}{' '}
                  <span className="text-slate-400 font-normal">/ 100</span>
                </div>
              </div>

              {/* Stacked Bar Container (Points out of 100 total width) */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {/* Creative Quality Segment */}
                <div
                  className="bg-brand transition-all duration-500 hover:brightness-110"
                  style={{ width: `${score.creativePts}%` }}
                  title={`Creative Quality: +${score.creativePts.toFixed(1)} pts (Raw: ${(score.creative01 * 10).toFixed(1)}/10)`}
                />
                {/* Longevity Segment */}
                <div
                  className="bg-emerald-500 transition-all duration-500 hover:brightness-110"
                  style={{ width: `${score.longevityPts}%` }}
                  title={`Longevity: +${score.longevityPts.toFixed(1)} pts (${ad.longevity_days} active days)`}
                />
                {/* Iteration Segment */}
                <div
                  className="bg-brand-purple transition-all duration-500 hover:brightness-110"
                  style={{ width: `${score.iterationPts}%` }}
                  title={`Iteration: +${score.iterationPts.toFixed(1)} pts (${ad.has_multiple_versions ? 'Active variants tested' : 'Single variant'})`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
