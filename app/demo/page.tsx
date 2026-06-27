'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Zap, Plus, Mic, Target, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Task, DailyBrief } from '@/types';
import { RiskBadge, RiskBar } from '@/components/dashboard/RiskBadge';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { RiskToasts } from '@/components/ui/RiskToasts';
import { VoiceBriefButton } from '@/components/ui/Voice';
import { FocusMode } from '@/components/ui/FocusMode';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCountUp } from '@/hooks/useCountUp';
import { useRealTimeRisk } from '@/hooks/useRealTimeRisk';
import { format } from 'date-fns';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useCountUp(value, 700);
  return (
    <div className="ds-card ds-card-hover p-4">
      <div className={`font-display text-2xl font-bold tabular-nums ${color}`}>{animated}</div>
      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</div>
    </div>
  );
}

function TaskRow({ task, index, onFocus }: { task: Task; index: number; onFocus: () => void }) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);

  return (
    <div
      className={`ds-card ds-card-hover p-4 flex items-center gap-4 fade-slide-up ${
        task.risk_level === 'critical' ? 'glow-red' : ''
      }`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="w-5 h-5 rounded border border-[var(--border-hover)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{task.title}</span>
          {task.risk_level === 'critical' && (
            <span className="text-[10px] text-red-400 font-bold tracking-wider flex-shrink-0 pulse-critical">⚠ CRITICAL</span>
          )}
        </div>
        {task.ai_recommendation && (
          <div className="text-xs text-amber-400/80 mt-0.5 truncate">✦ {task.ai_recommendation}</div>
        )}
      </div>
      {task.deadline && (
        <div className={`text-xs flex-shrink-0 tabular-nums ${urgencyClass}`}>{timeLeft}</div>
      )}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-muted)]">Risk</span>
            <span className="text-xs font-medium">{task.risk_score}%</span>
          </div>
          <div className="risk-bar">
            <div
              className="risk-bar-fill risk-bar-animated"
              style={{
                width: `${task.risk_score}%`,
                background: task.risk_score >= 80 ? '#EF4444' : task.risk_score >= 60 ? '#F97316' : task.risk_score >= 30 ? '#F59E0B' : '#10B981',
              }}
            />
          </div>
        </div>
        <RiskBadge level={task.risk_level} />
      </div>
      <div className="text-xs text-[var(--text-muted)] flex-shrink-0 w-12 text-right">{task.estimated_hours}h</div>
      <button
        onClick={onFocus}
        className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-amber-500/10 hover:text-amber-400 text-[var(--text-muted)] flex items-center justify-center transition-all flex-shrink-0"
      >
        <Target size={13} />
      </button>
    </div>
  );
}

export default function DemoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/demo');
    const data = await res.json();
    setTasks(data.tasks || []);
    setBrief(data.brief || null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = tasks.filter(t => t.status !== 'completed');
  const critical = tasks.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');

  if (loading) return <DashboardSkeleton />;
  if (focusTask) return (
    <FocusMode
      task={focusTask}
      onClose={() => setFocusTask(null)}
      onComplete={() => setFocusTask(null)}
    />
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grid-bg">
      {/* Demo banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <Zap size={12} fill="currentColor" />
          <span className="font-medium">DEMO MODE</span>
          <span className="text-amber-400/60">· Realistic data, no account needed</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft size={12} />
            Back
          </Link>
          <Link href="/sign-up" className="btn-primary text-xs px-4 py-1.5">
            Deploy for Real →
          </Link>
        </div>
      </div>

      <CommandPalette
        onFocusMode={() => pending[0] && setFocusTask(pending[0])}
      />
      <RiskToasts tasks={tasks} />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between fade-slide-up">
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">{format(new Date(), 'EEEE, MMMM d')} · Demo</div>
            <h1 className="font-display text-2xl font-bold">Command Center</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-ghost text-sm flex items-center gap-2">
              <RefreshCw size={14} />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">⌘K</kbd>
          <span>Command palette</span>
          <span className="mx-1">·</span>
          <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">F</kbd>
          <span>Focus mode on top task</span>
        </div>

        {/* Brief */}
        {brief && (
          <div className="ds-card p-6 border-amber-500/20 glass fade-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-display font-bold text-lg">{brief.greeting}</div>
                  <VoiceBriefButton brief={brief} />
                </div>
                <div className="text-[var(--text-secondary)] text-sm mb-4">{brief.mission_statement}</div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <div className="text-xs text-amber-400 font-medium mb-1">⚡ PRIORITY MISSION</div>
                  <div className="font-semibold">{brief.top_task?.title}</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">{brief.top_task_reason}</div>
                </div>
                {brief.risk_alerts?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-[var(--text-muted)] font-medium tracking-wider">RISK ALERTS</div>
                    {brief.risk_alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">{alert.task_title}: </span>
                          <span className="text-sm text-[var(--text-secondary)]">{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-[var(--text-muted)] italic">{brief.motivational_note}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Active Tasks', value: pending.length,   color: 'text-white' },
            { label: 'At Risk',      value: critical.length,  color: 'text-red-400' },
            { label: 'Done Today',   value: 0,                color: 'text-green-400' },
            { label: 'Total Tasks',  value: tasks.length,     color: 'text-blue-400' },
          ].map((s, i) => <StatCard key={i} {...s} />)}
          <StreakBadge tasks={tasks} />
        </div>

        {/* Tasks */}
        <div>
          <div className="text-xs font-medium text-[var(--text-muted)] tracking-wider mb-3">
            ACTIVE TASKS — SORTED BY RISK · LIVE COUNTDOWNS
          </div>
          <div className="space-y-2">
            {pending
              .sort((a, b) => b.risk_score - a.risk_score)
              .map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} onFocus={() => setFocusTask(task)} />
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="ds-card p-6 border-amber-500/20 text-center space-y-3">
          <div className="text-xs text-amber-400 font-medium tracking-wider">READY TO DEPLOY YOUR AI CHIEF OF STAFF?</div>
          <div className="font-display text-xl font-bold">Get your real tasks analyzed by Gemini 2.5 Pro</div>
          <div className="text-sm text-[var(--text-secondary)]">Free to start · Takes 2 minutes to set up</div>
          <Link href="/sign-up" className="btn-primary inline-flex items-center gap-2 mt-2">
            <Zap size={16} fill="black" />
            Deploy Now — It's Free
          </Link>
        </div>
      </div>
    </div>
  );
}
