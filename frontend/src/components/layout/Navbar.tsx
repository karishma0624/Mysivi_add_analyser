import React from 'react';
import { MessageSquareText, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'gallery' | 'leaderboard' | 'metrics' | 'methodology';
  setActiveTab: (tab: 'overview' | 'gallery' | 'leaderboard' | 'metrics' | 'methodology') => void;
  onOpenChat: () => void;
  adCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  adCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching mysivi.ai */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zM8 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand transition-colors">
                MySivi
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                Ad Intelligence
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Facebook Ad Library Analysis & RAG Engine
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Ad Gallery
            {adCount > 0 && (
              <span className="px-1.5 py-0.2 bg-brand-100 text-brand-700 text-xs rounded-full font-bold">
                {adCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'metrics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Metrics Framework
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'methodology'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Methodology
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:border-brand-300 hover:text-brand bg-white hover:bg-brand-50/50 shadow-sm transition-all"
            title="Ask Arya about MySivi ad creatives"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Ask Arya</span>
          </button>

          <a
            href="https://mysivi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-brand-btn hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md shadow-brand/25"
          >
            <span>mysivi.ai</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      </div>
    </header>
  );
};
