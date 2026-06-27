'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import type { NegotiationResult } from '@/types';
import { MessageSquare, CheckCircle, Clock, ArrowRight, XCircle } from 'lucide-react';

const decisionConfig = {
  complete: { label: 'Complete', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  delegate: { label: 'Delegate', icon: ArrowRight, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  reschedule: { label: 'Reschedule', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  skip: { label: 'Skip', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function NegotiatePage() {
  const [constraint, setConstraint] = useState('');
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    'I cannot complete all tasks this week',
    'I have an unexpected emergency and need to drop tasks',
    'I only have 4 hours free today, help me prioritize',
    'I need to decide what to sacrifice — interview prep or project deadline',
  ];

  const runNegotiation = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'negotiate', payload: { constraint: text } }),
      });
      const data = await res.json();
      if (data.negotiation) setResult(data.negotiation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <MessageSquare size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Negotiator</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Too much on your plate? Tell the AI and it makes the tough calls.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="ds-card p-5 mb-4">
        <label className="text-xs text-[var(--text-secondary)] mb-2 block">DESCRIBE YOUR CONSTRAINT</label>
        <textarea
          value={constraint}
          onChange={e => setConstraint(e.target.value)}
          rows={3}
          placeholder="e.g. I have 3 deadlines tomorrow and only 6 free hours. I can't complete all of them."
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 resize-none mb-3"
        />
        <button
          onClick={() => runNegotiation(constraint)}
          disabled={loading || !constraint.trim()}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {loading ? 'AI is deciding...' : 'Let AI Decide'}
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <div className="text-xs text-[var(--text-muted)] mb-2">QUICK SCENARIOS</div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => { setConstraint(p); runNegotiation(p); }}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="ds-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[var(--text-secondary)] text-sm">AI Chief of Staff is making decisions...</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="ds-card p-4 border-purple-500/20 bg-purple-500/5">
            <div className="text-xs text-purple-400 font-medium mb-1">AI ANALYSIS</div>
            <div className="text-sm text-[var(--text-secondary)]">{result.analysis}</div>
          </div>

          <div>
            <div className="text-xs text-[var(--text-muted)] mb-3 font-medium">DECISIONS</div>
            <div className="space-y-2">
              {result.decisions.map((d, i) => {
                const config = decisionConfig[d.decision];
                const Icon = config.icon;
                return (
                  <div key={i} className={`ds-card p-4 border ${config.bg}`}>
                    <div className="flex items-start gap-3">
                      <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{d.task_title}</span>
                          <span className={`text-xs font-semibold ${config.color}`}>
                            → {config.label}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">{d.reason}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">Impact: {d.impact}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ds-card p-4 border-amber-500/20 bg-amber-500/5">
            <div className="text-xs text-amber-400 font-medium mb-1">FINAL PLAN</div>
            <div className="text-sm text-white">{result.final_plan}</div>
          </div>
        </div>
      )}
    </div>
  );
}
