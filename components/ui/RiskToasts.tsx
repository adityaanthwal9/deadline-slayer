'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X, Zap } from 'lucide-react';
import type { Task } from '@/types';

interface Toast {
  id: string;
  task: Task;
  exiting: boolean;
}

interface Props {
  tasks: Task[];
}

export function RiskToasts({ tasks }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shown, setShown] = useState<Set<string>>(new Set());

  useEffect(() => {
    const critical = tasks.filter(
      t => (t.risk_level === 'critical' || t.risk_score >= 80) &&
           t.status !== 'completed' && t.status !== 'cancelled'
    );

    critical.forEach(task => {
      if (!shown.has(task.id)) {
        setShown(s => new Set([...s, task.id]));
        const toast: Toast = { id: `${task.id}-${Date.now()}`, task, exiting: false };
        setToasts(prev => [...prev, toast]);

        // Auto-dismiss after 6s
        setTimeout(() => dismiss(task.id), 6000);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`ds-card glow-red p-4 ${toast.exiting ? 'toast-out' : 'toast-in'}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 pulse-critical">
              <AlertTriangle size={15} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-red-400 tracking-wider">CRITICAL ALERT</span>
                <Zap size={10} className="text-red-400" />
              </div>
              <div className="text-sm font-semibold text-white truncate">{toast.task.title}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                {toast.task.risk_score}% failure probability — act now
              </div>
              {toast.task.ai_recommendation && (
                <div className="text-xs text-amber-400/80 mt-1 line-clamp-2">
                  {toast.task.ai_recommendation}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-[var(--text-muted)] hover:text-white transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          {/* Progress bar draining */}
          <div className="mt-3 h-0.5 bg-[var(--bg-elevated)] rounded overflow-hidden">
            <div
              className="h-full bg-red-500/40 rounded"
              style={{
                animation: 'riskBarFill 6s linear reverse forwards',
                width: '100%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
