'use client';

import { useState, useEffect } from 'react';
import type { Task, LifeSimulation } from '@/types';
import { Shield, TrendingUp, TrendingDown, Zap, ChevronRight } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

function ProbabilityBar({ value, color }: { value: number; color: string }) {
  const animated = useCountUp(value, 1000);
  return (
    <div>
      <div className="flex items-end gap-2 mb-2">
        <span className="font-display text-5xl font-bold tabular-nums" style={{ color }}>{animated}%</span>
        <span className="text-[var(--text-secondary)] text-sm mb-2">success probability</span>
      </div>
      <div className="risk-bar h-2">
        <div className="risk-bar-fill risk-bar-animated" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function SimulatePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [simulation, setSimulation] = useState<LifeSimulation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => {
      const active = (d.tasks || []).filter((t: Task) => t.status !== 'completed' && t.status !== 'cancelled');
      setTasks(active);
      if (active.length > 0) setSelectedTaskId(active[0].id);
    });
  }, []);

  const runSimulation = async () => {
    if (!selectedTaskId) return;
    setLoading(true);
    setSimulation(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'simulate', payload: { task_id: selectedTaskId } }),
      });
      const data = await res.json();
      if (data.simulation) setSimulation(data.simulation);
    } finally { setLoading(false); }
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const delta = simulation
    ? simulation.scenario_a.success_probability - simulation.scenario_b.success_probability
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 fade-slide-up">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Life Simulation Engine</h1>
          <p className="text-[var(--text-secondary)] text-sm">AI runs your future — act now vs delay. See exactly what you lose.</p>
        </div>
      </div>

      {/* Task selector */}
      <div className="ds-card p-5 mb-6 fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <label className="text-xs text-[var(--text-muted)] font-medium tracking-wider mb-3 block">SELECT TASK TO SIMULATE</label>
        <div className="flex gap-3">
          <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
            {tasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} {t.risk_score > 60 ? `⚠ ${t.risk_score}% risk` : ''}
              </option>
            ))}
          </select>
          <button onClick={runSimulation} disabled={loading || !selectedTaskId}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 px-6">
            <Zap size={16} fill="black" />
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
        {selectedTask && (
          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span>⏱ {selectedTask.estimated_hours}h est</span>
            <span>📊 {selectedTask.risk_score}% risk</span>
            {selectedTask.deadline && <span>📅 Due {new Date(selectedTask.deadline).toLocaleDateString()}</span>}
            {selectedTask.procrastination_count > 0 && <span className="text-amber-400">Delayed {selectedTask.procrastination_count}×</span>}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="ds-card p-14 text-center fade-slide-up">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="w-14 h-14 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Shield size={18} className="text-blue-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-white font-medium mb-1">Simulating your future timelines...</div>
          <div className="text-[var(--text-muted)] text-sm">Gemini 2.5 Pro calculating probability across both scenarios</div>
        </div>
      )}

      {/* Results */}
      {simulation && (
        <div className="space-y-5 stagger-children">
          {/* AI Verdict */}
          <div className="ds-card p-5 border-amber-500/30 bg-amber-500/5 glow-amber">
            <div className="text-xs text-amber-400 font-medium tracking-wider mb-2">⚡ AI VERDICT</div>
            <div className="font-display text-xl font-bold text-white mb-2">"{simulation.ai_verdict}"</div>
            <div className="text-[var(--text-secondary)] text-sm">{simulation.recommendation}</div>
          </div>

          {/* Scenarios */}
          <div className="grid grid-cols-2 gap-4">
            {/* Act Now */}
            <div className="ds-card p-5 border-green-500/25 bg-green-500/5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="text-[10px] text-green-400 font-bold tracking-wider">SCENARIO A</div>
                  <div className="font-display font-bold text-sm">{simulation.scenario_a.label}</div>
                </div>
              </div>
              <ProbabilityBar value={simulation.scenario_a.success_probability} color="#10B981" />
              <p className="text-sm text-[var(--text-secondary)] mt-4 mb-4">{simulation.scenario_a.action}</p>
              <div className="space-y-2">
                {simulation.scenario_a.outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[var(--text-secondary)]">{o}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delay */}
            <div className="ds-card p-5 border-red-500/25 bg-red-500/5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <TrendingDown size={16} className="text-red-400" />
                </div>
                <div>
                  <div className="text-[10px] text-red-400 font-bold tracking-wider">SCENARIO B</div>
                  <div className="font-display font-bold text-sm">{simulation.scenario_b.label}</div>
                </div>
              </div>
              <ProbabilityBar value={simulation.scenario_b.success_probability} color="#EF4444" />
              <p className="text-sm text-[var(--text-secondary)] mt-4 mb-4">{simulation.scenario_b.action}</p>
              <div className="space-y-2">
                {simulation.scenario_b.outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-[var(--text-secondary)]">{o}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-[10px] text-red-400 font-bold tracking-wider mb-1">CONSEQUENCE</div>
                <div className="text-xs text-[var(--text-secondary)]">{simulation.scenario_b.consequence_if_not_done}</div>
              </div>
            </div>
          </div>

          {/* Delta CTA */}
          <div className="ds-card p-4 border-green-500/20 bg-green-500/5 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Starting now gives you </span>
              <span className="font-display text-xl font-bold text-green-400">+{delta}%</span>
              <span className="text-sm font-medium"> better odds of success</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
              Act now <ChevronRight size={14} />
            </div>
          </div>
        </div>
      )}

      {!simulation && !loading && tasks.length === 0 && (
        <div className="ds-card p-14 text-center fade-slide-up">
          <Shield size={28} className="text-[var(--text-muted)] mx-auto mb-3" />
          <div className="text-[var(--text-muted)] text-sm">Add tasks first to run simulations.</div>
        </div>
      )}
    </div>
  );
}
