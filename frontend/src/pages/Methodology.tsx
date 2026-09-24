import React from 'react';
import { ShieldCheck, Award, Layers, Calendar, Sparkles, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand">
          Transparency & Engineering Rigor
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Scoring Methodology & Meta Data Boundaries
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Why our "best ad" algorithm is credible, honest, and grounded in real-world performance marketing heuristics.
        </p>
      </div>

      {/* Section 0 Reality Check Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            Meta Ad Library vs. Meta Ads Manager API
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            What Public Meta Scraping Gives vs. What is Private
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Meta only exposes spend and impressions for political and social-issue ads. For commercial app-install advertisers like MySivi, Meta deliberately conceals private conversion and auction metrics from public scrapers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-emerald-700">Available (Scraped from Meta Library)</th>
                <th className="py-3 px-4 text-rose-700">NOT Available (Requires Ads Manager API)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Ad creative asset (image / video preview URL)</span>
                </td>
                <td className="py-3 px-4">Impressions / Reach numbers</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Primary text (body copy) & headlines</span>
                </td>
                <td className="py-3 px-4">Ad Spend / CPM / CPC / CPA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>CTA button text (e.g. "Install Now")</span>
                </td>
                <td className="py-3 px-4">Click-Through Rate (CTR)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Start date (`started_running_on`) & Active status</span>
                </td>
                <td className="py-3 px-4">Video 3s Hook Rate, Watch Time, Completion Rate</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Variant test flag ("This ad has multiple versions")</span>
                </td>
                <td className="py-3 px-4">Shares, Saves, and Comments counts</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Advertiser page name, follower count, Library ID</span>
                </td>
                <td className="py-3 px-4">App installs, trial start rate, and ROAS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 3-Signal Proxy Model */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            Mathematical Composite Scoring Formula
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            How the "Best Ad" is Proven Without Fabricating Metrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Growth marketers evaluate public ad libraries using two empirical survival signals combined with AI creative evaluation:
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-loose">
          <strong>Composite Score =</strong><br />
          &nbsp;&nbsp;<strong>0.40 × Creative Quality Score</strong> (Gemini 2.5 Flash rubric: Hook, Clarity, CTA, Visual, Offer)<br />
          &nbsp;&nbsp;<strong>+ 0.35 × Longevity Score</strong> (Normalized days active in Meta's auction: survival heuristic)<br />
          &nbsp;&nbsp;<strong>+ 0.25 × Iteration Score</strong> (10.0 if testing multiple versions, else 0.0)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-brand font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>40% Creative Quality</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini 2.5 Flash evaluates the opening hook, benefit clarity, call-to-action strength, visual relevance, and pricing offer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>35% Longevity Signal</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meta's algorithm shuts down losing ads rapidly. An ad running continuously for 30+ days is an empirical signal of positive return.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>25% Iteration Signal</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Active variant testing signals the growth team has identified a winning core concept and is optimizing variations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
