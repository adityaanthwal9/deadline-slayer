'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Zap, RefreshCw, Plus, Mic, Target, Volume2, X, Bot } from 'lucide-react';
import type { Task, DailyBrief, TaskRiskAnalysis } from '@/types';
import { RiskBadge, RiskBar } from '@/components/dashboard/RiskBadge';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { RiskToasts } from '@/components/ui/RiskToasts';
import { VoiceBriefButton } from '@/components/ui/Voice';
import { FocusMode } from '@/components/ui/FocusMode';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { WatchdogStatus } from '@/components/ui/WatchdogStatus';
import { StreamingBrief } from '@/components/ui/StreamingBrief';
import { useCountUp } from '@/hooks/useCountUp';
import { useRealTimeRisk } from '@/hooks/useRealTimeRisk';
import { format } from 'date-fns';

// ─── Stat Card with animated counter ───────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useCountUp(value, 700);
  return (
    <div className="ds-card ds-card-hover p-4">
      <div className={`font-display text-2xl font-bold tabular-nums ${color}`}>{animated}</div>
      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</div>
    </div>
  );
}

// ─── Task row with real-time countdown ─────────────────
function TaskRow({
  task,
  index,
  onComplete,
  onFocus,
}: {
  task: Task;
  index: number;
  onComplete: () => void;
  onFocus: () => void;
}) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);

  return (
    <div
      className={`ds-card ds-card-hover p-4 flex items-center gap-4 fade-slide-up ${
        task.risk_level === 'critical' ? 'glow-red' : ''
      }`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Complete */}
      <button
        onClick={onComplete}
        className="w-5 h-5 rounded border border-[var(--border-hover)] hover:border-green-400 hover:bg-green-400/10 flex-shrink-0 transition-all"
        title="Mark complete"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{task.title}</span>
          {task.risk_level === 'critical' && (
            <span className="text-[10px] text-red-400 font-bold tracking-wider flex-shrink-0 pulse-critical">
              ⚠ CRITICAL
            </span>
          )}
        </div>
        {task.ai_recommendation && (
          <div className="text-xs text-amber-400/80 mt-0.5 truncate">
            ✦ {task.ai_recommendation}
          </div>
        )}
      </div>

      {/* Real-time deadline */}
      {task.deadline && (
        <div className={`text-xs flex-shrink-0 tabular-nums ${urgencyClass}`}>
          {timeLeft}
        </div>
      )}

      {/* Risk */}
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
                background:
                  task.risk_score >= 80 ? '#EF4444' :
                  task.risk_score >= 60 ? '#F97316' :
                  task.risk_score >= 30 ? '#F59E0B' : '#10B981',
              }}
            />
          </div>
        </div>
        <RiskBadge level={task.risk_level} />
      </div>

      {/* Est */}
      <div className="text-xs text-[var(--text-muted)] flex-shrink-0 w-12 text-right">
        {task.estimated_hours}h
      </div>

      {/* Focus */}
      <button
        onClick={onFocus}
        title="Enter focus mode"
        className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-amber-500/10 hover:text-amber-400 text-[var(--text-muted)] flex items-center justify-center transition-all flex-shrink-0"
      >
        <Target size={13} />
      </button>
    </div>
  );
}

// ─── Voice task input modal ─────────────────────────────
function VoiceTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string) => void }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input'); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.onstart = () => setListening(true);
    r.onresult = (e: any) => setTranscript(Array.from(e.results).map((x: any) => x[0].transcript).join(''));
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const stop = () => recognitionRef.current?.stop();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="ds-card w-full max-w-sm p-6 fade-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold">Voice Input</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex flex-col items-center gap-5">
          <button
            onClick={listening ? stop : start}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-500/20 border-2 border-red-500 voice-active'
                : 'bg-amber-500/10 border-2 border-amber-500/40 hover:border-amber-500'
            }`}
          >
            <Mic size={32} className={listening ? 'text-red-400' : 'text-amber-400'} />
            {listening && <span className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping" style={{ marginTop: '-48px', marginLeft: '48px' }} />}
          </button>

          <div className="text-center min-h-[60px]">
            {listening ? (
              <>
                <div className="text-xs text-red-400 font-medium mb-2">LISTENING...</div>
                <div className="text-sm text-white italic">"{transcript || '...'}"</div>
              </>
            ) : transcript ? (
              <div className="text-sm text-white">"{transcript}"</div>
            ) : (
              <div className="text-sm text-[var(--text-muted)]">Tap and say your task name</div>
            )}
          </div>

          {transcript && !listening && (
            <div className="flex gap-3 w-full">
              <button onClick={() => setTranscript('')} className="btn-ghost flex-1 text-sm">Retry</button>
              <button onClick={() => { onAdd(transcript); onClose(); }} className="btn-primary flex-1 text-sm">
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────
export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
  }, []);

  const fetchDailyBrief = useCallback(async () => {
    setBriefLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily_brief' }),
      });
      const data = await res.json();
      if (data.brief) setBrief(data.brief);
    } finally {
      setBriefLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
      fetchDailyBrief();
    };
    init();
  }, [fetchTasks, fetchDailyBrief]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') setShowAddTask(true);
      if (e.key === 'r' || e.key === 'R') fetchDailyBrief();
      if (e.key === 'v' || e.key === 'V') setShowVoice(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fetchDailyBrief]);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const criticalTasks = tasks.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');
  const completedToday = tasks.filter(t => {
    if (!t.completed_at) return false;
    return new Date(t.completed_at).toDateString() === new Date().toDateString();
  });

  if (loading) return <DashboardSkeleton />;
  if (focusTask) return (
    <FocusMode
      task={focusTask}
      onClose={() => setFocusTask(null)}
      onComplete={async () => {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: focusTask.id, status: 'completed', completed_at: new Date().toISOString() }),
        });
        setFocusTask(null);
        fetchTasks();
      }}
    />
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Command Palette */}
      <CommandPalette
        onAddTask={() => setShowAddTask(true)}
        onRefreshBrief={fetchDailyBrief}
        onVoiceInput={() => setShowVoice(true)}
        onFocusMode={() => pendingTasks[0] && setFocusTask(pendingTasks[0])}
      />

      {/* Risk Toasts */}
      <RiskToasts tasks={tasks} />

      {/* Header */}
      <div className={`flex items-center justify-between ${mounted ? 'fade-slide-up' : 'opacity-0'}`}>
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">{format(new Date(), 'EEEE, MMMM d')}</div>
          <h1 className="font-display text-2xl font-bold">Command Center</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoice(true)}
            className="btn-ghost text-sm flex items-center gap-2"
            title="Voice input (V)"
          >
            <Mic size={14} className="text-amber-400" />
            Voice
          </button>
          <button
            onClick={fetchDailyBrief}
            disabled={briefLoading}
            className="btn-ghost text-sm flex items-center gap-2"
            title="Refresh brief (R)"
          >
            <RefreshCw size={14} className={briefLoading ? 'animate-spin' : ''} />
            {briefLoading ? 'Analyzing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="btn-primary text-sm flex items-center gap-2"
            title="Add task (N)"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Cmd+K hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">⌘K</kbd>
        <span>Command palette</span>
        <span className="mx-1">·</span>
        <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">N</kbd>
        <span>New task</span>
        <span className="mx-1">·</span>
        <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">V</kbd>
        <span>Voice</span>
        <span className="mx-1">·</span>
        <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px]">R</kbd>
        <span>Refresh brief</span>
      </div>

      {/* AI Watchdog Status bar */}
      <WatchdogStatus onCriticalDetected={() => fetchTasks()} />

      {/* Streaming AI Brief — replaces old spinner brief */}
      <StreamingBrief autoStart />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Active Tasks',  value: pendingTasks.length,   color: 'text-white' },
          { label: 'At Risk',       value: criticalTasks.length,  color: 'text-red-400' },
          { label: 'Done Today',    value: completedToday.length, color: 'text-green-400' },
          { label: 'Total Tasks',   value: tasks.length,          color: 'text-blue-400' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
        <StreakBadge tasks={tasks} />
      </div>

      {/* Task List */}
      <div>
        <div className="text-xs font-medium text-[var(--text-muted)] tracking-wider mb-3">
          ACTIVE TASKS — SORTED BY RISK · LIVE COUNTDOWNS
        </div>
        <div className="space-y-2">
          {pendingTasks.length === 0 ? (
            <div className="ds-card p-10 text-center fade-slide-up">
              <Zap size={24} className="text-amber-400/30 mx-auto mb-3" />
              <div className="text-[var(--text-muted)] text-sm">No active tasks. Press N to add your first task.</div>
            </div>
          ) : (
            pendingTasks
              .sort((a, b) => b.risk_score - a.risk_score)
              .map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onFocus={() => setFocusTask(task)}
                  onComplete={async () => {
                    await fetch('/api/tasks', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: task.id,
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                      }),
                    });
                    fetchTasks();
                  }}
                />
              ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onAdd={async (taskData) => {
            await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData),
            });
            setShowAddTask(false);
            await fetchTasks();
            fetchDailyBrief();
          }}
        />
      )}

      {/* Voice modal */}
      {showVoice && (
        <VoiceTaskModal
          onClose={() => setShowVoice(false)}
          onAdd={(title) => {
            setShowVoice(false);
            setShowAddTask(true);
            // Pre-fill would need a ref — for now it opens the modal
            // In a real impl you'd pass defaultTitle prop to AddTaskModal
          }}
        />
      )}
    </div>
  );
}
