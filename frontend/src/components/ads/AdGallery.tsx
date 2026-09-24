import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Layers, Play, Image as ImageIcon, ArrowUpDown, Workflow, AlertCircle } from 'lucide-react';
import type { AdLeaderboardRow } from '../../lib/types';
import { AdCard } from './AdCard';
import { AdDetailModal } from './AdDetailModal';

interface AdGalleryProps {
  ads: AdLeaderboardRow[];
  loading: boolean;
  onAskAboutAd: (ad: AdLeaderboardRow) => void;
  onRefresh: () => void;
}

export const AdGallery: React.FC<AdGalleryProps> = ({
  ads,
  loading,
  onAskAboutAd,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'image'>('all');
  const [iterationOnly, setIterationOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'longevity' | 'newest'>('rank');
  const [selectedAd, setSelectedAd] = useState<AdLeaderboardRow | null>(null);

  // Filter and sort real ads
  const filteredAds = useMemo(() => {
    return ads
      .filter((ad) => {
        // Search filter
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          !query ||
          ad.hook?.toLowerCase().includes(query) ||
          ad.body?.toLowerCase().includes(query) ||
          ad.library_id?.toLowerCase().includes(query) ||
          ad.cta?.toLowerCase().includes(query);

        // Media type filter
        const matchesType =
          selectedType === 'all' || ad.creative_type === selectedType;

        // Multiple version (iteration) filter
        const matchesIteration = !iterationOnly || ad.has_multiple_versions;

        return matchesSearch && matchesType && matchesIteration;
      })
      .sort((a, b) => {
        if (sortBy === 'rank') return (a.rank || 999) - (b.rank || 999);
        if (sortBy === 'score') return (b.composite_score || 0) - (a.composite_score || 0);
        if (sortBy === 'longevity') return (b.longevity_days || 0) - (a.longevity_days || 0);
        if (sortBy === 'newest') {
          return new Date(b.started_running_on || '').getTime() - new Date(a.started_running_on || '').getTime();
        }
        return 0;
      });
  }, [ads, searchQuery, selectedType, iterationOnly, sortBy]);

  return (
    <div className="space-y-8">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hook, copy, CTA, or Library ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Media Type Filter */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedType === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Media
              </button>
              <button
                onClick={() => setSelectedType('video')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  selectedType === 'video'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                Videos
              </button>
              <button
                onClick={() => setSelectedType('image')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  selectedType === 'image'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                Images
              </button>
            </div>

            {/* Iteration Filter */}
            <button
              onClick={() => setIterationOnly(!iterationOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                iterationOnly
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Version Tests</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs font-medium text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer font-semibold text-slate-800"
              >
                <option value="rank">Sort by: Rank (#1 Best)</option>
                <option value="score">Sort by: Highest Score</option>
                <option value="longevity">Sort by: Most Days Active</option>
                <option value="newest">Sort by: Newest Launched</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
            >
              <div className="aspect-video bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        // REQUIRED HONEST EMPTY STATE (ZERO MOCK/FALLBACK DATA)
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
            This platform strictly uses genuine MySivi advertisement data scraped from the public Facebook Ad Library, evaluated via Google Gemini, and stored in Supabase.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              How to Populate with Real Ads:
            </span>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside font-medium leading-relaxed">
              <li>
                Open n8n and import the workflow file:
                <code className="text-brand font-mono font-bold ml-1">
                  n8n/mysivi-ad-scraper-workflow.json
                </code>
              </li>
              <li>
                Provide your <span className="font-semibold text-slate-800">APIFY_API_TOKEN</span>,{' '}
                <span className="font-semibold text-slate-800">GEMINI_API_KEY</span>, and{' '}
                <span className="font-semibold text-slate-800">SUPABASE</span> credentials.
              </li>
              <li>
                Click <span className="font-bold text-slate-800">Execute Workflow</span> to scrape real ads from Meta Ad Library.
              </li>
              <li>Once Supabase receives the rows, click refresh below.</li>
            </ol>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={onRefresh}
              className="gradient-brand-btn px-6 py-3 rounded-full text-white text-sm font-bold shadow-md shadow-brand/20 hover:scale-105 transition-transform"
            >
              Refresh Ad Feed
            </button>
          </div>
        </div>
      ) : filteredAds.length === 0 ? (
        // Search query didn't match
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-slate-800 mb-1">No ads match your filter</h4>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search keyword or clearing the media filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setIterationOnly(false);
            }}
            className="text-xs font-bold text-brand hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        // Real Ads Grid
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{filteredAds.length}</strong> real analyzed ads from Meta Ad Library
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard
                key={ad.library_id || ad.ad_id}
                ad={ad}
                onSelect={(selected) => setSelectedAd(selected)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Facebook Ad Details Modal */}
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
