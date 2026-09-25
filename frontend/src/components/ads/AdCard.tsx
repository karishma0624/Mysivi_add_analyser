import React, { useState } from 'react';
import { Calendar, Layers, ExternalLink, Play, Eye, Sparkles, Award, ImageOff, CheckCircle2, X } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';
import { calculateScoreBreakdown } from '../../lib/scoreUtils';

interface AdCardProps {
  ad: AdLeaderboardRow;
  onSelect: (ad: AdLeaderboardRow) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const score = calculateScoreBreakdown(ad);

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

  const hasCreativeUrl = Boolean(ad.creative_url && ad.creative_url.trim());
  const canPlayVideo = Boolean(ad.video_url && !videoError);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner: Rank, Page Type & Status */}
      <div className="p-4 pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {ad.rank && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${rankBadgeColor}`}
            >
              <Award className="w-3.5 h-3.5" />
              Rank #{ad.rank}
            </span>
          )}

          {/* Small MySivi page / Third-party page badge */}
          {ad.is_mysivi_page ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>MySivi page</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              <span>Third-party page</span>
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

      {/* Creative Media Preview with Interactive Video Playback */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {isPlaying && canPlayVideo ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              src={ad.video_url!}
              poster={ad.creative_url || undefined}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              onError={() => {
                setVideoError(true);
                setIsPlaying(false);
              }}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
              }}
              className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-full z-20 transition-transform hover:scale-110 shadow-lg border border-white/20"
              title="Close Video"
              aria-label="Close Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : imgError || !hasCreativeUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center select-none">
            <ImageOff className="w-7 h-7 mb-1.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Creative preview unavailable</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Meta CDN URL expired</span>
          </div>
        ) : (
          <div
            className={`relative w-full h-full ${canPlayVideo ? 'cursor-pointer group/media' : ''}`}
            onClick={() => {
              if (canPlayVideo) setIsPlaying(true);
            }}
          >
            <img
              src={ad.creative_url!}
              alt={`MySivi Ad ${ad.library_id}`}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />

            {canPlayVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/media:bg-black/45 transition-colors">
                <div className="w-13 h-13 rounded-full bg-white/95 text-brand flex items-center justify-center shadow-xl group-hover/media:scale-115 transition-transform group-hover/media:bg-white ring-4 ring-white/20">
                  <Play className="w-6 h-6 fill-current ml-0.5 text-brand-600" />
                </div>
                <div className="absolute bottom-10 bg-black/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity shadow-lg">
                  Click to Play Video
                </div>
              </div>
            )}

            {/* Longevity Pill */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Active {ad.longevity_days} days</span>
            </div>

            {/* CTA preview tag */}
            {ad.cta && (
              <div className="absolute bottom-2.5 right-2.5 bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                {ad.cta}
              </div>
            )}
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
                  {score.composite100.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500">Creative Points</span>
              <div className="flex items-center justify-end gap-1 text-sm font-bold text-brand-700">
                <Sparkles className="w-3.5 h-3.5" />
                {score.creativePts.toFixed(1)} pts
              </div>
            </div>
          </div>

          {/* Mini 3-Signal Progress Bars: points out of 100 summing to composite */}
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Creative Quality (40% max)</span>
                <span className="font-bold text-slate-700">{score.creativePts.toFixed(1)} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full"
                  style={{ width: `${(score.creativePts / 40) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Longevity Signal (35% max)</span>
                <span className="font-bold text-slate-700">{score.longevityPts.toFixed(1)} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(score.longevityPts / 35) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-0.5">
                <span>Iteration Signal (25% max)</span>
                <span className="font-bold text-slate-700">{score.iterationPts.toFixed(1)} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-purple h-full rounded-full"
                  style={{ width: `${(score.iterationPts / 25) * 100}%` }}
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
