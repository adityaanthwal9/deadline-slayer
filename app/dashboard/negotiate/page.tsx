"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface Recommendation {
  action: 'DO_FIRST' | 'MOVE' | 'DELEGATE' | 'DROP';
  task_id: string;
  task_title: string;
  reason: string;
  expected_outcome: string;
  confidence: number;
  priority: number;
}

interface NegotiationResult {
  constraint_analysis: string;
  current_success_probability: number;
  optimized_success_probability: number;
  recommendations: Recommendation[];
  executive_summary: string;
}

const QUICK_SCENARIOS = [
  "I only have 4 hours free today",
  "I have an unexpected emergency and need to drop tasks",
  "I cannot complete all tasks this week",
  "I need to decide what to sacrifice — interview prep or project deadline",
];

const ACTION_CONFIG = {
  DO_FIRST:  { label: 'Do First',  color: 'var(--color-low)',      bg: 'var(--bg-low)',      icon: '🚀' },
  MOVE:      { label: 'Move Later', color: 'var(--color-medium)',   bg: 'var(--bg-medium)',   icon: '📅' },
  DELEGATE:  { label: 'Delegate',  color: 'var(--color-info)',      bg: 'var(--bg-info)',     icon: '👥' },
  DROP:      { label: 'Drop',      color: 'var(--color-critical)',  bg: 'var(--bg-critical)', icon: '🗑' },
};

function RecommendationCard({ rec, onApply, onIgnore }: {
  rec: Recommendation;
  onApply: () => void;
  onIgnore: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied]   = useState(false);
  const [ignored, setIgnored]   = useState(false);
  const cfg = ACTION_CONFIG[rec.action];

  if (ignored) return null;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
      opacity: applied ? 0.5 : 1, transition: 'opacity 0.3s',
    }}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

          {/* Action badge */}
          <div style={{ padding: '4px 10px', borderRadius: 100, background: cfg.bg, border: `1px solid ${cfg.color}22`, flexShrink: 0, marginTop: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{rec.task_title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.reason}</div>
          </div>

          {/* Confidence */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-low)', lineHeight: 1 }}>{rec.confidence}%</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>confidence</div>
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0 }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Less detail' : 'Expected outcome'}
        </button>

        {expanded && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>EXPECTED OUTCOME</div>
            <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>{rec.expected_outcome}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!applied && (
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={() => { onIgnore(); setIgnored(true); }} style={{
            flex: 1, padding: '10px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border-color)',
            color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            Ignore
          </button>
          <button onClick={() => { onApply(); setApplied(true); }} style={{
            flex: 2, padding: '10px', background: 'var(--violet-soft)', border: 'none',
            color: 'var(--violet-text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Check size={13} /> Apply Recommendation
          </button>
        </div>
      )}
      {applied && (
        <div style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-low)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-low)' }}>✓ Applied — task marked as deferred</span>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ rec, onConfirm, onCancel }: {
  rec: Recommendation; onConfirm: () => void; onCancel: () => void;
}) {
  const cfg = ACTION_CONFIG[rec.action];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Apply Recommendation?</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
          This will mark <strong style={{ color: 'var(--text-primary)' }}>{rec.task_title}</strong> as <strong style={{ color: cfg.color }}>{cfg.label.toLowerCase()}</strong> in your mission queue.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Expected outcome</div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{rec.expected_outcome}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '11px', borderRadius: 10, background: 'var(--violet)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Confirm & Apply</button>
        </div>
      </div>
    </div>
  );
}

export default function NegotiatePage() {
  const [constraint, setConstraint]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<NegotiationResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [confirmRec, setConfirmRec]   = useState<Recommendation | null>(null);

  const handleSubmit = async () => {
    if (!constraint.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ constraint }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.message || 'Gemini quota reached. Please retry in a few minutes.');
        return;
      }

      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError('Negotiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (rec: Recommendation) => {
    setConfirmRec(null);
    try {
      // Fetch tasks to find task_id
      const res = await fetch('/api/tasks');
      const { tasks } = await res.json();
      const task = tasks.find((t: any) => t.id === rec.task_id || t.title === rec.task_title);
      if (task) {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: task.id, status: 'cancelled', ai_recommendation: `Deferred: ${rec.reason}` }),
        });
      }
    } catch (e) {
      console.error('Apply failed:', e);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--violet-soft)', border: '1px solid var(--violet-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} color="var(--violet)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>AI Negotiator</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Describe your constraint. Gemini decides what to do, move, delegate, or drop.</p>
        </div>
      </div>

      {/* Input */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>DESCRIBE YOUR CONSTRAINT</div>
        <textarea
          value={constraint}
          onChange={e => setConstraint(e.target.value)}
          placeholder="e.g. I only have 4 hours today and need to decide what to focus on..."
          rows={3}
          style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⌘↵ to submit</span>
          <button onClick={handleSubmit} disabled={loading || !constraint.trim()} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            background: loading ? 'var(--bg-elevated)' : 'var(--violet)', border: 'none',
            color: loading ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 700, cursor: loading || !constraint.trim() ? 'not-allowed' : 'pointer',
          }}>
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--violet)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                Gemini deciding...
              </>
            ) : (
              <><Zap size={14} /> Let AI Decide</>
            )}
          </button>
        </div>
      </div>

      {/* Quick scenarios */}
      {!result && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>QUICK SCENARIOS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_SCENARIOS.map(s => (
              <button key={s} onClick={() => setConstraint(s)} style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, background: 'var(--bg-card)',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--bg-medium)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--color-medium)', fontSize: 13, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Summary card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--violet-border)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--violet-text)', marginBottom: 10 }}>GEMINI DECISION SUMMARY</div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.executive_summary}"</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-critical)' }}>{result.current_success_probability}%</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>CURRENT</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 18, color: 'var(--text-muted)' }}>→</div>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, background: 'var(--bg-low)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-low)' }}>{result.optimized_success_probability}%</div>
                <div style={{ fontSize: 9, color: 'var(--color-low)', marginTop: 2 }}>IF APPLIED</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>
            AI RECOMMENDATIONS ({result.recommendations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map(rec => (
                <RecommendationCard
                  key={rec.task_id + rec.action}
                  rec={rec}
                  onApply={() => setConfirmRec(rec)}
                  onIgnore={() => {}}
                />
              ))}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmRec && (
        <ConfirmModal
          rec={confirmRec}
          onConfirm={() => handleApply(confirmRec)}
          onCancel={() => setConfirmRec(null)}
        />
      )}
    </div>
  );
}
