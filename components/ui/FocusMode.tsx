'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Target, CheckCircle2, SkipForward } from 'lucide-react';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
}

const POMODORO_MINUTES = 25;

export function FocusMode({ task, onClose, onComplete }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval);
          setRunning(false);
          setSessions(n => n + 1);
          setDone(true);
          // Play a soft beep
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.5);
          } catch {}
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    setSecondsLeft(POMODORO_MINUTES * 60);
    setRunning(false);
    setDone(false);
  }, []);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / (POMODORO_MINUTES * 60);
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="focus-mode-overlay">
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
          <Target size={12} className="text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">FOCUS MODE</span>
          {sessions > 0 && (
            <span className="text-xs text-[var(--text-secondary)]">· {sessions} session{sessions > 1 ? 's' : ''} done</span>
          )}
        </div>

        {/* Task name */}
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-2">CURRENT MISSION</div>
          <h2 className="font-display text-2xl font-bold text-white leading-tight">{task.title}</h2>
          {task.ai_recommendation && (
            <p className="text-sm text-amber-400/80 mt-2">{task.ai_recommendation}</p>
          )}
        </div>

        {/* Circular timer */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={done ? '#10B981' : '#F59E0B'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-3xl font-bold tabular-nums">
              {mins}:{secs}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {done ? 'Session complete!' : running ? 'focusing' : 'paused'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {done ? (
            <>
              <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
                <SkipForward size={14} />
                New Session
              </button>
              <button onClick={onComplete} className="btn-primary text-sm flex items-center gap-2">
                <CheckCircle2 size={14} />
                Mark Complete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setRunning(r => !r)} className="btn-primary text-sm px-8">
                {running ? 'Pause' : secondsLeft === POMODORO_MINUTES * 60 ? 'Start Focus' : 'Resume'}
              </button>
              {!running && secondsLeft < POMODORO_MINUTES * 60 && (
                <button onClick={reset} className="btn-ghost text-sm">Reset</button>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          25-min deep work session · close to return to dashboard
        </div>
      </div>
    </div>
  );
}
