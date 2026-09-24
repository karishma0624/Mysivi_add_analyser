import React from 'react';
import { Calendar, Layers, ExternalLink, Play, Eye, Sparkles, Award } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';

interface AdCardProps {
  ad: AdLeaderboardRow;
  onSelect: (ad: AdLeaderboardRow) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onSelect }) => {
  // Determine badge color based on rank
  const isTop3 = ad.rank && ad.rank <= 3;
  const rankBadgeColor =
    ad.rank === 1
      ? 'bg-amber-400 text-amber-950 border-amber-300'
      : ad.rank === 2
      ? 'bg-slate-200 text-slate-800 border-slate-300'
      : ad.rank === 3
      ? 'bg-amber-600/20 text-amber-900 border-amber-600/30'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner: Rank & Status */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {ad.rank && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${rankBadgeColor}`}
            >
              <Award className="w-3.5 h-3.5" />
              Rank #{ad.rank}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            ID: {ad.library_id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {ad.has_multiple_versions && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60"
              title="This ad has multiple versions (Active A/B variant test)"
            >
              <Layers className="w-3 h-3" />
              Multiple Versions
            </span>
          )}
        </div>
      </div>

      {/* Creative Media Preview */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group-hover:opacity-95 transition-opacity">
        <img
          src={ad.creative_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80'}
          alt={`MySivi Ad ${ad.library_id}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Graceful fallback to branded gradient placeholder if CDN media URL expired
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {ad.creative_type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-11 h-11 rounded-full bg-white/90 text-brand flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Longevity Pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-emerald-400" />
          <span>Active {ad.longevity_days} days</span>
        </div>

        {/* CTA preview tag */}
        {ad.cta && (
          <div className="absolute bottom-2.5 right-2.5 bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            {ad.cta}
          </div>
        )}
      </div>

      {/* Content & Hook */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Extracted Hook */}
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Extracted Hook
            </span>
            <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
              "{ad.hook || 'Improve your spoken English with AI conversations'}"
            </p>
          </div>

          {/* Body Copy snippet */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Primary Copy
            </span>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {ad.body}
            </p>
          </div>
        </div>

        {/* Score Breakdown Section */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Composite Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {Number(ad.composite_score || 0).toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 10</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500">Creative Quality</span>
              <div className="flex items-center justify-end gap-1 text-sm font-bold text-brand-700">
                <Sparkles className="w-3.5 h-3.5" />
                {Number(ad.creative_quality_score || 0).toFixed(1)}/10
              </div>
            </div>
          </div>

          {/* Mini 3-Signal Progress Bars */}
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Creative Quality (40%)</span>
                <span>{Number(ad.creative_quality_score || 0).toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full"
                  style={{ width: `${Math.min(100, (ad.creative_quality_score || 0) * 10)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Longevity Signal (35%)</span>
                <span>{Number(ad.longevity_score || 0).toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (ad.longevity_score || 0) * 10)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Iteration Signal (25%)</span>
                <span>{ad.has_multiple_versions ? '10.0' : '0.0'}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-purple h-full rounded-full"
                  style={{ width: `${ad.has_multiple_versions ? 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => onSelect(ad)}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand border border-slate-200 hover:border-brand-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Inspect Full Ad Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
