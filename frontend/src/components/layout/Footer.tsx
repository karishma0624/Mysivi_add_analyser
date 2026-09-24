import React from 'react';
import { ExternalLink, Database, Cpu, Workflow, BarChart3, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-brand-purple flex items-center justify-center text-white font-bold text-sm shadow-sm">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                MySivi Ad Intelligence
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Automated Meta Ad Library scraping, Gemini creative evaluation, and RAG-powered performance discovery for MySivi.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Free-Tier Architecture ($0 Cost)
            </div>
          </div>

          {/* Architecture Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              4-Tier Tech Stack
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-brand" />
                <span>n8n (Scraper Orchestrator)</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand" />
                <span>Gemini 2.5 Flash (Creative Reasoning)</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand" />
                <span>Supabase (pgvector & Edge Functions)</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand" />
                <span>React 18 + Vite (Tailwind UI)</span>
              </li>
            </ul>
          </div>

          {/* Methodology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Proxy Scoring Model
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-800">40%</span> Gemini Creative Quality
              </li>
              <li>
                <span className="font-semibold text-slate-800">35%</span> Ad Longevity (Survival heuristic)
              </li>
              <li>
                <span className="font-semibold text-slate-800">25%</span> Active Iteration Signal
              </li>
              <li className="pt-2 text-xs text-slate-400">
                Audited against public Meta Ad Library constraints.
              </li>
            </ul>
          </div>

          {/* Official MySivi Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              MySivi Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://mysivi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand flex items-center gap-1.5 transition-colors"
                >
                  mysivi.ai Homepage
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&q=MySivi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand flex items-center gap-1.5 transition-colors"
                >
                  Meta Ad Library for MySivi
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <span className="text-xs text-slate-400 block pt-2">
                  Designed for performance marketing leaders & engineering reviewers.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MySivi Ad Intelligence Platform. Real data analysis.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Grounded RAG Assistant (Arya)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
