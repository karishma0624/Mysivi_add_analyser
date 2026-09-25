import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AdGallery } from './components/ads/AdGallery';
import { Leaderboard } from './components/dashboard/Leaderboard';
import { MetricsFramework } from './components/dashboard/MetricsFramework';
import { Methodology } from './pages/Methodology';
import { ChatWidget } from './components/chat/ChatWidget';
import { useAds } from './hooks/useAds';
import type { AdLeaderboardRow } from './lib/types';
import { AlertCircle, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';

import { calculateScoreBreakdown } from './lib/scoreUtils';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'gallery' | 'leaderboard' | 'metrics' | 'methodology'
  >('overview');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string>('');

  const { ads, metrics, loading, error, isConfigured, refetch } = useAds();

  const handleAskAboutAd = (ad: AdLeaderboardRow) => {
    const score = calculateScoreBreakdown(ad);
    setInitialQuestion(
      `Please explain why ad ID ${ad.library_id} with hook "${ad.hook}" received a composite score of ${score.composite100.toFixed(1)}/100. What are its strengths and weaknesses?`
    );
    setIsChatOpen(true);
  };

  const winner = ads && ads.length > 0 ? ads[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
        adCount={ads.length}
      />

      {/* Supabase Configuration Banner (if credentials not provided in .env.local) */}
      {!isConfigured && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 text-amber-900 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Supabase credentials not configured in frontend/.env.local:</strong> Set{' '}
                <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">
                  VITE_SUPABASE_URL
                </code>{' '}
                and{' '}
                <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{' '}
                to connect to your live database.
              </span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-amber-950 flex items-center gap-1 flex-shrink-0"
            >
              Supabase Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <Home
            onExploreLeaderboard={() => setActiveTab('leaderboard')}
            onExploreGallery={() => setActiveTab('gallery')}
            onOpenChat={() => setIsChatOpen(true)}
            adCount={ads.length}
            winner={winner}
            onAskAboutAd={handleAskAboutAd}
          />
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  MySivi Facebook Ad Gallery
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Public Meta Ad Library creatives analyzed by Google Gemini.
                </p>
              </div>

              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync with Supabase</span>
              </button>
            </div>

            <AdGallery
              ads={ads}
              loading={loading}
              onAskAboutAd={handleAskAboutAd}
              onRefresh={refetch}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Ad Performance Leaderboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Ranked by 3-Signal Proxy Model (40% Creative + 35% Longevity + 25% Iteration).
                </p>
              </div>

              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Leaderboard</span>
              </button>
            </div>

            <Leaderboard
              ads={ads}
              loading={loading}
              onAskAboutAd={handleAskAboutAd}
              onRefresh={refetch}
            />
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Meta Ads Manager Metrics Framework
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                20 growth metrics prepared for authentication with MySivi's Meta Marketing API.
              </p>
            </div>

            <MetricsFramework metrics={metrics} />
          </div>
        )}

        {activeTab === 'methodology' && <Methodology />}
      </main>

      {/* Floating Grounded RAG Chatbot */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        initialQuestion={initialQuestion}
        onClearInitialQuestion={() => setInitialQuestion('')}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
