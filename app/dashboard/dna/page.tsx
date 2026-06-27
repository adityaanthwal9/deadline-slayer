'use client';

import { useState, useEffect } from 'react';
import { Dna, RefreshCw, TrendingDown, AlertCircle, CheckCircle, Brain } from 'lucide-react';

interface DeadlineDNA {
  failure_patterns: Array<{ pattern: string; frequency: string; insight: string }>;
  underestimation_factor: number;
  worst_category: string;
  best_category: string;
  peak_failure_day: string;
  procrastination_index: number;
  personal_risk_multiplier: number;
  dna_score: number;
  brutal_truth: string;
  top_recommendation: string;
}

function DNAScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 40;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[#5C5C74]">DNA Score</span>
      </div>
    </div>
  );
}

export default function DNAPage() {
  const [dna, setDna] = useState<DeadlineDNA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  const fetchDNA = async (force = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(force ? '/api/dna?refresh=1' : '/api/dna');
      const data = await res.json();
      if (data.error) {
        setError(data.insufficient_data
          ? 'Add at least 2 tasks and complete some to generate your Deadline DNA.'
          : data.error
        );
      } else {
        setDna(data.dna);
        setCached(data.cached);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDNA(); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.2)' }}>
            <Dna size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Deadline DNA</h1>
            <p className="text-[#9898B0] text-sm">Your personal failure intelligence profile</p>
          </div>
        </div>
        <button
          onClick={() => fetchDNA(true)}
          disabled={loading}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="ds-card p-16 text-center">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white font-medium mb-1">Analyzing your failure patterns...</div>
          <div className="text-[#9898B0] text-sm">Gemini is building your personal profile</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="ds-card p-8 text-center border-amber-500/20 bg-amber-500/5">
          <Brain size={32} className="text-amber-400 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">Not enough data yet</div>
          <div className="text-[#9898B0] text-sm">{error}</div>
        </div>
      )}

      {/* DNA Profile */}
      {dna && !loading && (
        <div className="space-y-4">
          {cached && (
            <div className="text-xs text-[#5C5C74] text-right">Cached result · Regenerates hourly</div>
          )}

          {/* Score + brutal truth */}
          <div className="ds-card p-6 flex items-center gap-8"
            style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' }}>
            <DNAScoreRing score={dna.dna_score} />
            <div className="flex-1">
              <div className="text-xs text-purple-400 font-medium mb-2">BRUTAL TRUTH</div>
              <div className="font-display text-xl font-bold text-white mb-3">
                "{dna.brutal_truth}"
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">{dna.top_recommendation}</div>
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Underestimation Factor',
                value: `${dna.underestimation_factor}×`,
                sub: 'you need this much more time than you think',
                color: dna.underestimation_factor > 1.5 ? '#EF4444' : '#F59E0B',
              },
              {
                label: 'Procrastination Index',
                value: `${dna.procrastination_index}/100`,
                sub: dna.procrastination_index > 60 ? 'high — act faster' : 'manageable',
                color: dna.procrastination_index > 60 ? '#EF4444' : '#10B981',
              },
              {
                label: 'Risk Multiplier',
                value: `${dna.personal_risk_multiplier}×`,
                sub: 'applied to all your risk scores',
                color: dna.personal_risk_multiplier > 1.3 ? '#F97316' : '#10B981',
              },
              {
                label: 'Peak Failure Day',
                value: dna.peak_failure_day,
                sub: 'schedule less on this day',
                color: '#EF4444',
              },
            ].map((m, i) => (
              <div key={i} className="ds-card p-4">
                <div className="font-display text-2xl font-bold mb-1" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className="text-xs font-medium text-white mb-1">{m.label}</div>
                <div className="text-[10px] text-[#5C5C74]">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-3">
            <div className="ds-card p-4 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">WEAKEST CATEGORY</span>
              </div>
              <div className="font-display text-xl font-bold capitalize">{dna.worst_category}</div>
              <div className="text-xs text-[#9898B0] mt-1">You miss deadlines here most</div>
            </div>
            <div className="ds-card p-4 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">STRONGEST CATEGORY</span>
              </div>
              <div className="font-display text-xl font-bold capitalize">{dna.best_category}</div>
              <div className="text-xs text-[#9898B0] mt-1">You consistently deliver here</div>
            </div>
          </div>

          {/* Failure patterns */}
          <div>
            <div className="text-xs text-[#5C5C74] font-medium mb-3">YOUR FAILURE PATTERNS</div>
            <div className="space-y-2">
              {dna.failure_patterns.map((p, i) => (
                <div key={i} className="ds-card p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-400">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{p.pattern}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#5C5C74]">
                        {p.frequency}
                      </span>
                    </div>
                    <div className="text-xs text-[#9898B0]">{p.insight}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
