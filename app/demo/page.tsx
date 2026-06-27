'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Target, RefreshCw, ArrowLeft, Volume2, VolumeX,
  AlertTriangle, Clock, Zap, ChevronRight, Activity,
  CheckCircle2, Circle, X, Command
} from 'lucide-react';
import type { Task, DailyBrief } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { useRealTimeRisk } from '@/hooks/useRealTimeRisk';
import { FocusMode } from '@/components/ui/FocusMode';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { RiskToasts } from '@/components/ui/RiskToasts';
import { format } from 'date-fns';

/* ── Circular Risk Ring ─────────────────────────────── */
function RiskRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#EF4444' : score >= 60 ? '#F97316' : score >= 30 ? '#F59E0B' : '#10B981';
  const label = score >= 80 ? 'Critical' : score >= 60 ? 'High Risk' : score >= 30 ? 'Medium' : 'On Track';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5"/>
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (score / 100) * circ}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold tabular-nums" style={{ fontSize: size * 0.22, color }}>{score}%</span>
        </div>
      </div>
      <span className="text-[10px] font-medium tracking-wide" style={{ color, opacity: 0.85 }}>{label}</span>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = 'var(--text-primary)' }: {
  icon: React.ElementType; label: string; value: number | string; color?: string;
}) {
  const animated = typeof value === 'number' ? useCountUp(value, 800) : null;
  return (
    <div className="ds-card ds-card-hover p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="font-display font-bold text-xl tabular-nums" style={{ color }}>
          {animated ?? value}
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-none">{label}</div>
      </div>
    </div>
  );
}

/* ── Task Row ────────────────────────────────────────── */
function TaskRow({ task, index, onFocus, onComplete }: {
  task: Task; index: number;
  onFocus: () => void; onComplete: () => void;
}) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);
  const isCritical = task.risk_level === 'critical';
  const riskColor = task.risk_score >= 80 ? '#EF4444' : task.risk_score >= 60 ? '#F97316' : task.risk_score >= 30 ? '#F59E0B' : '#10B981';

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-default ${
        isCritical ? 'glow-red' : ''
      }`}
      style={{
        background: 'var(--bg-card)',
        borderColor: isCritical ? 'rgba(239,68,68,0.15)' : 'var(--border)',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Complete btn */}
      <button
        onClick={onComplete}
        className="w-4 h-4 rounded-full border flex-shrink-0 transition-all hover:scale-110"
        style={{ borderColor: 'var(--border-hover)' }}
        title="Mark complete"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </span>
          {isCritical && (
            <span className="badge badge-critical text-[9px] flex-shrink-0 pulse-crit">CRITICAL</span>
          )}
        </div>
        {task.ai_recommendation && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {task.ai_recommendation}
          </p>
        )}
      </div>

      {/* Countdown */}
      {task.deadline && (
        <div className={`text-xs font-mono flex-shrink-0 ${urgencyClass}`}>{timeLeft}</div>
      )}

      {/* Risk bar + score */}
      <div className="flex items-center gap-2 flex-shrink-0 w-28">
        <div className="flex-1 risk-bar">
          <div className="risk-bar-fill risk-fill" style={{ width: `${task.risk_score}%`, background: riskColor }}/>
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: riskColor, minWidth: 28 }}>
          {task.risk_score}%
        </span>
      </div>

      {/* Est hours */}
      <div className="text-[11px] flex-shrink-0 w-10 text-right" style={{ color: 'var(--text-muted)' }}>
        {task.estimated_hours}h
      </div>

      {/* Focus */}
      <button
        onClick={onFocus}
        className="btn-icon opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Focus mode"
      >
        <Target size={12} />
      </button>
    </div>
  );
}

/* ── Main Demo Page ──────────────────────────────────── */
export default function DemoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Force dark mode on demo page
  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/demo');
    const data = await res.json();
    setTasks(data.tasks || []);
    setBrief(data.brief || null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = tasks.filter(t => t.status !== 'completed' && !completedIds.has(t.id));
  const critical = pending.filter(t => t.risk_level === 'critical');
  const topTask = pending.sort((a, b) => b.risk_score - a.risk_score)[0];
  const missionScore = Math.max(0, 100 - Math.round(pending.reduce((a, t) => a + t.risk_score, 0) / Math.max(pending.length, 1)));

  const speakBrief = () => {
    if (!brief) return;
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    const text = `${brief.greeting} ${brief.mission_statement} Priority mission: ${brief.top_task?.title}. ${brief.top_task_reason}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1;
    const v = window.speechSynthesis?.getVoices().find(v => v.name.includes('Google') || v.name.includes('Alex'));
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis?.speak(u);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"/>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your brief...</p>
        </div>
      </div>
    );
  }

  if (focusTask) return (
    <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={() => setFocusTask(null)} />
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] grid-bg">
      <CommandPalette onFocusMode={() => topTask && setFocusTask(topTask)} />
      <RiskToasts tasks={pending} />

      {/* ── Top Bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DS" className="w-7 h-7 rounded-lg object-cover sword-logo" />
            <div>
              <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                DEADLINE <span style={{ color: 'var(--amber)' }}>SLAYER</span>
              </span>
            </div>
            <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-amber-400 tracking-wider">DEMO</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{format(new Date(), 'EEEE, MMMM d')}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px]"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Command size={9} />
              <span>K</span>
            </div>
            <button onClick={load} className="btn-icon" title="Reset demo">
              <RefreshCw size={12} />
            </button>
            <Link href="/" className="btn-ghost text-xs flex items-center gap-1.5">
              <ArrowLeft size={12} />
              Back
            </Link>
            <Link href="/sign-up" className="btn-primary text-xs px-4 py-2">
              Try for real →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero Brief ──────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 stagger">

          {/* Main mission card */}
          <div className="col-span-2 ds-card ds-card-active p-7 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, var(--amber) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--amber)', opacity: 0.7 }}>
                    TODAY'S BRIEF
                  </p>
                  <h1 className="font-display text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {brief?.greeting || 'Good evening, Commander.'}
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {brief?.mission_statement || 'Here\'s what matters today.'}
                  </p>
                </div>
                <button
                  onClick={speakBrief}
                  className="btn-icon flex-shrink-0"
                  style={speaking ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}
                  title={speaking ? 'Stop' : 'Play brief'}
                >
                  {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
              </div>

              {/* Priority Mission */}
              {topTask && (
                <div className="rounded-xl p-4 mb-4" style={{
                  background: 'var(--amber-dim)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={11} className="text-amber-400" fill="currentColor" />
                    <span className="text-[10px] font-bold tracking-widest text-amber-400">NEXT MOVE</span>
                  </div>
                  <div className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                    {topTask.title}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {brief?.top_task_reason || topTask.ai_recommendation}
                  </p>
                </div>
              )}

              {/* Risk alerts */}
              {(brief?.risk_alerts?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  {brief!.risk_alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg"
                      style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{a.task_title}: </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {brief?.motivational_note && (
                <p className="text-xs mt-4 italic" style={{ color: 'var(--text-muted)' }}>
                  {brief.motivational_note}
                </p>
              )}
            </div>
          </div>

          {/* Right panel — metrics */}
          <div className="space-y-3">
            {/* Mission score */}
            <div className="ds-card p-5 flex flex-col items-center gap-3">
              <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>MISSION RISK</p>
              <RiskRing score={topTask?.risk_score ?? 0} size={90} />
              <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                {critical.length > 0 ? `${critical.length} task${critical.length > 1 ? 's' : ''} need immediate action` : 'All tasks on track'}
              </p>
            </div>

            {/* Time remaining */}
            <div className="ds-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={12} style={{ color: 'var(--amber)' }} />
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>SUBMISSION</span>
              </div>
              {topTask?.deadline ? (
                <TimeRemaining deadline={topTask.deadline} />
              ) : (
                <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>—</div>
              )}
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Until next deadline</p>
              <div className="risk-bar mt-3">
                <div className="risk-bar-fill risk-fill" style={{ width: `${Math.min(topTask?.risk_score ?? 0, 100)}%`, background: 'var(--amber)' }} />
              </div>
            </div>

            {/* Confidence */}
            <div className="ds-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={12} style={{ color: 'var(--green)' }} />
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>CONFIDENCE</span>
              </div>
              <div className="font-display font-bold text-2xl" style={{ color: 'var(--green)' }}>{missionScore}%</div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Prediction accuracy</p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-3 stagger">
          <StatCard icon={Circle}       label="Active"     value={pending.length}  />
          <StatCard icon={AlertTriangle} label="At Risk"    value={critical.length} color="var(--red)" />
          <StatCard icon={CheckCircle2}  label="Done Today" value={0}               color="var(--green)" />
          <StatCard icon={Activity}      label="Total"      value={tasks.length}    color="var(--blue)" />
          <div className="ds-card p-4 flex items-center gap-3">
            <div className="text-2xl">
              {pending.filter(t => t.status === 'in_progress').length > 0 ? '🔥' : '💤'}
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {pending.filter(t => t.status === 'in_progress').length > 0 ? 'In Progress' : 'No Streak'}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>complete a task to start</div>
            </div>
          </div>
        </div>

        {/* ── Task List ────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
              ACTIVE TASKS — SORTED BY RISK
            </p>
            <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>F</kbd>
                Focus mode
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>⌘K</kbd>
                Command
              </span>
            </div>
          </div>

          <div className="space-y-1.5 stagger">
            {pending
              .sort((a, b) => b.risk_score - a.risk_score)
              .map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onFocus={() => setFocusTask(task)}
                  onComplete={() => setCompletedIds(s => new Set([...s, task.id]))}
                />
              ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div className="ds-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            background: 'radial-gradient(ellipse at 50% 0%, var(--amber) 0%, transparent 70%)'
          }} />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--amber)', opacity: 0.7 }}>
              READY TO EXECUTE
            </p>
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Know your next move. Every day.
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Your tasks. Your risk. Your schedule. All in one place.
            </p>
            <Link href="/sign-up" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <Zap size={15} fill="black" />
              Start for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Time Remaining helper ──────────────────────────── */
function TimeRemaining({ deadline }: { deadline: string }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setDisplay('OVERDUE'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setDisplay(`${h}h ${m}m`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [deadline]);

  return (
    <div className="font-display font-bold text-2xl tabular-nums" style={{ color: 'var(--text-primary)' }}>
      {display}
    </div>
  );
}