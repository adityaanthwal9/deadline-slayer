'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/types';
import { ListTodo, Plus, Trash2, RefreshCw, Target, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { FocusMode } from '@/components/ui/FocusMode';
import { SkeletonTaskRow } from '@/components/ui/Skeleton';
import { useRealTimeRisk } from '@/hooks/useRealTimeRisk';
import { useCountUp } from '@/hooks/useCountUp';
import { format } from 'date-fns';

function TaskCard({ task, index, onDelete, onComplete, onFocus }: {
  task: Task; index: number;
  onDelete: () => void; onComplete: () => void; onFocus: () => void;
}) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);
  const isComplete = task.status === 'completed';

  return (
    <div
      className={`ds-card ds-card-hover p-4 fade-slide-up ${task.risk_level === 'critical' && !isComplete ? 'glow-red' : ''} ${isComplete ? 'opacity-40' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-4">
        {/* Complete button */}
        <button onClick={onComplete} className="mt-0.5 flex-shrink-0 group">
          <CheckCircle2 size={18} className={isComplete ? 'text-green-400' : 'text-[var(--text-muted)] group-hover:text-green-400 transition-colors'} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`font-medium text-sm ${isComplete ? 'line-through text-[var(--text-muted)]' : ''}`}>{task.title}</span>
            <RiskBadge level={task.risk_level} />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] capitalize">{task.category}</span>
            {task.procrastination_count > 0 && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Delayed {task.procrastination_count}×
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
            {task.deadline && (
              <span>📅 {format(new Date(task.deadline), 'MMM d, h:mm a')}</span>
            )}
            <span>{task.estimated_hours}h est</span>
            {task.deadline && !isComplete && (
              <span className={`font-medium ${urgencyClass}`}>{timeLeft}</span>
            )}
          </div>

          {/* Risk bar */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="w-28 risk-bar">
              <div
                className="risk-bar-fill risk-bar-animated"
                style={{
                  width: `${task.risk_score}%`,
                  background: task.risk_score >= 80 ? '#EF4444' : task.risk_score >= 60 ? '#F97316' : task.risk_score >= 30 ? '#F59E0B' : '#10B981',
                }}
              />
            </div>
            <span className="text-xs text-[var(--text-muted)]">{task.risk_score}% risk</span>
          </div>

          {task.ai_recommendation && !isComplete && (
            <div className="mt-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-1.5">
              ✦ {task.ai_recommendation}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isComplete && (
            <button onClick={onFocus} title="Focus mode" className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-amber-500/10 hover:text-amber-400 text-[var(--text-muted)] flex items-center justify-center transition-all">
              <Target size={13} />
            </button>
          )}
          <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] flex items-center justify-center transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const runRiskScan = async () => {
    setScanning(true);
    await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'risk_scan' }) });
    await fetchTasks();
    setScanning(false);
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const completeTask = async (id: string) => {
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'completed', completed_at: new Date().toISOString() }) });
    fetchTasks();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending' || t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  }).sort((a, b) => b.risk_score - a.risk_score);

  const pendingCount = useCountUp(tasks.filter(t => t.status !== 'completed').length, 600);
  const completedCount = useCountUp(tasks.filter(t => t.status === 'completed').length, 600);
  const criticalCount = useCountUp(tasks.filter(t => t.risk_level === 'critical').length, 600);

  if (focusTask) return (
    <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={async () => { await completeTask(focusTask.id); setFocusTask(null); }} />
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 fade-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <ListTodo size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Tasks</h1>
            <p className="text-[var(--text-secondary)] text-sm">{tasks.length} total · sorted by risk</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={runRiskScan} disabled={scanning} className="btn-ghost text-sm flex items-center gap-2">
            <RefreshCw size={14} className={scanning ? 'animate-spin text-amber-400' : ''} />
            {scanning ? 'Scanning...' : 'Risk Scan'}
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} />Add Task
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 stagger-children">
        <div className="ds-card p-3 text-center">
          <div className="font-display text-xl font-bold text-white">{pendingCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Active</div>
        </div>
        <div className="ds-card p-3 text-center">
          <div className="font-display text-xl font-bold text-green-400">{completedCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Completed</div>
        </div>
        <div className="ds-card p-3 text-center">
          <div className="font-display text-xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Critical</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-[var(--bg-surface)] rounded-lg w-fit fade-slide-up">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize ${filter === f ? 'bg-[var(--bg-elevated)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {loading && [...Array(4)].map((_, i) => <SkeletonTaskRow key={i} />)}
        {!loading && filteredTasks.length === 0 && (
          <div className="ds-card p-10 text-center fade-slide-up">
            <ListTodo size={24} className="text-[var(--text-muted)] mx-auto mb-3" />
            <div className="text-[var(--text-muted)] text-sm">No tasks found. Press N to add one.</div>
          </div>
        )}
        {filteredTasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i}
            onDelete={() => deleteTask(task.id)}
            onComplete={() => completeTask(task.id)}
            onFocus={() => setFocusTask(task)}
          />
        ))}
      </div>

      {showAdd && (
        <AddTaskModal onClose={() => setShowAdd(false)} onAdd={async (taskData) => {
          await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskData) });
          setShowAdd(false);
          fetchTasks();
        }} />
      )}
    </div>
  );
}
