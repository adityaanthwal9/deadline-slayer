"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Mic, X, ChevronRight, Search, Bell, Zap, Shield, Clock, Target, Activity } from 'lucide-react';
import type { Task } from '@/types';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { RiskToasts } from '@/components/ui/RiskToasts';
import { FocusMode } from '@/components/ui/FocusMode';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { WatchdogStatus } from '@/components/ui/WatchdogStatus';
import { StreamingBrief } from '@/components/ui/StreamingBrief';
import { useCountUp } from '@/hooks/useCountUp';
import { useRealTimeRisk } from '@/hooks/useRealTimeRisk';
import { format } from 'date-fns';

// ── Design tokens — all CSS vars, theme-aware ─────────────────
const T = {
  bg:         'var(--bg-base)',
  card:       'var(--bg-card)',
  cardHover:  'var(--bg-hover)',
  surface:    'var(--bg-elevated)',
  border:     'var(--border-color)',
  borderHi:   'var(--border-strong)',
  text:       'var(--text-primary)',
  textSub:    'var(--text-secondary)',
  textMuted:  'var(--text-muted)',
  violet:     'var(--violet)',
  violetSoft: 'var(--violet-soft)',
  critical:   'var(--color-critical)',
  high:       'var(--color-high)',
  medium:     'var(--color-medium)',
  low:        'var(--color-low)',
};

const riskColor = (s: number) => s >= 80 ? T.critical : s >= 60 ? T.high : s >= 30 ? T.medium : T.low;
const riskBg    = (l: string) => l === 'critical' ? 'rgba(239,68,68,0.1)' : l === 'high' ? 'rgba(249,115,22,0.1)' : l === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';

// ── Circular Risk Ring ─────────────────────────────────────────
function RiskRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = riskColor(score);
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={fill + ' ' + circ} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <span style={{ fontSize: size > 50 ? 13 : 9, fontWeight: 800, color, letterSpacing: '-0.5px', zIndex: 1 }}>{score}%</span>
    </div>
  );
}

// ── Mission Card (right panel) ─────────────────────────────────
function MissionCard({ task, onComplete, onFocus }: { task: Task; onComplete: () => void; onFocus: () => void }) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);
  const [showWhy, setShowWhy] = useState(false);
  const hoursLeft = task.deadline ? Math.max(0, (new Date(task.deadline).getTime() - Date.now()) / 3600000) : null;
  const conf = Math.max(5, 100 - task.risk_score);
  const lc = riskColor(task.risk_score);

  return (
    <div style={{
      background: T.card,
      border: '1px solid ' + (task.risk_level === 'critical' ? 'rgba(239,68,68,0.22)' : T.border),
      borderRadius: 14,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {/* Checkbox */}
          <button onClick={onComplete} style={{
            width: 16, height: 16, borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', flexShrink: 0, marginTop: 2, cursor: 'pointer',
          }} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6, lineHeight: 1.4 }}>{task.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 100, fontWeight: 700,
                background: riskBg(task.risk_level), color: lc }}>
                {task.risk_level.toUpperCase()}
              </span>
              <span style={{ fontSize: 10, color: task.risk_level === 'critical' ? T.critical : T.textSub, fontWeight: 500 }}>{timeLeft}</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 5 }}>
              {task.category?.charAt(0).toUpperCase()}{task.category?.slice(1)} · {task.estimated_hours}h est
            </div>
          </div>

          {/* Ring + Why */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <RiskRing score={task.risk_score} size={44} />
            <button onClick={() => setShowWhy(!showWhy)} style={{
              fontSize: 9, fontWeight: 700, color: showWhy ? '#A78BFA' : T.textMuted,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {showWhy ? 'Close ↑' : 'Why? ↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Why? Panel */}
      {showWhy && (
        <div style={{ padding: '10px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: T.violet, marginBottom: 8 }}>
            GEMINI 2.5 REASONING · {conf}% CONFIDENCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            {[
              { l: 'Time Left', v: hoursLeft !== null ? Math.round(hoursLeft) + 'h' : 'None', ok: hoursLeft === null || hoursLeft >= task.estimated_hours },
              { l: 'Est. Need', v: task.estimated_hours + 'h', ok: true },
              { l: 'Delays', v: task.procrastination_count + 'x', ok: task.procrastination_count === 0 },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, color: T.textMuted, marginBottom: 2 }}>{item.l}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: item.ok ? T.low : T.critical }}>{item.v}</div>
              </div>
            ))}
          </div>
          {task.ai_recommendation && (
            <div style={{ fontSize: 10, lineHeight: 1.5, padding: '8px 10px', borderRadius: 8,
              background: 'rgba(124,58,237,0.07)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.14)' }}>
              ✦ {task.ai_recommendation}
            </div>
          )}
        </div>
      )}

      {/* Focus strip */}
      <button onClick={onFocus} style={{
        width: '100%', padding: '7px', fontSize: 10, fontWeight: 500, textAlign: 'center',
        background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)',
        color: T.textMuted, cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.07)'; (e.currentTarget as HTMLElement).style.color = '#A78BFA'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = T.textMuted; }}>
        ⚡ Enter Focus Mode
      </button>
    </div>
  );
}

// ── Mini Stat ──────────────────────────────────────────────────
function MiniStat({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const animated = useCountUp(value, 900);
  return (
    <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 12,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{animated}</div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Voice Modal ────────────────────────────────────────────────
function VoiceModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>(null);
  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input'); return; }
    const r = new SR(); r.continuous = false; r.interimResults = true;
    r.onstart = () => setListening(true);
    r.onresult = (e: any) => setTranscript(Array.from(e.results).map((x: any) => x[0].transcript).join(''));
    r.onend = () => setListening(false);
    recRef.current = r; r.start();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: 28, width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Voice Input</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <button onClick={listening ? () => recRef.current?.stop() : start} style={{
            width: 80, height: 80, borderRadius: '50%', border: '2px solid ' + (listening ? T.critical : 'rgba(124,58,237,0.5)'),
            background: listening ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mic size={32} color={listening ? T.critical : '#8B5CF6'} />
          </button>
          <div style={{ textAlign: 'center', minHeight: 60 }}>
            {listening ? <span style={{ fontSize: 13, color: T.critical }}>"{transcript || '...'}"</span>
              : transcript ? <span style={{ fontSize: 13, color: T.text }}>"{transcript}"</span>
              : <span style={{ fontSize: 13, color: T.textMuted }}>Tap and say your task</span>}
          </div>
          {transcript && !listening && (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={() => setTranscript('')} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'none', border: '1px solid ' + T.border, color: T.textSub, cursor: 'pointer' }}>Retry</button>
              <button onClick={() => { onAdd(transcript); onClose(); }} style={{ flex: 1, padding: '10px', borderRadius: 10, background: T.violet, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Mission</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showVoice, setShowVoice]   = useState(false);
  const [focusTask, setFocusTask]   = useState<Task | null>(null);
  const [filter, setFilter]         = useState<'all' | 'critical' | 'high' | 'completed'>('all');

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await fetchTasks(); setLoading(false); })();
  }, [fetchTasks]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') setShowAddTask(true);
      if (e.key === 'v' || e.key === 'V') setShowVoice(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const pending   = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');
  const critical  = tasks.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');
  const doneToday = tasks.filter(t => t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString());
  const topTask   = [...pending].sort((a, b) => b.risk_score - a.risk_score)[0] || null;
  const atRisk    = pending.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');

  const filteredRight = (filter === 'completed' ? completed
    : filter === 'critical' ? pending.filter(t => t.risk_level === 'critical')
    : filter === 'high'     ? pending.filter(t => t.risk_level === 'high')
    : pending).sort((a, b) => b.risk_score - a.risk_score);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const successProb = pending.length === 0 ? 100 : Math.max(0, Math.round(100 - (pending.reduce((a, t) => a + t.risk_score, 0) / pending.length)));
  const accentColors = ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981'];

  if (loading) return <DashboardSkeleton />;
  if (focusTask) return (
    <FocusMode task={focusTask} onClose={() => setFocusTask(null)}
      onComplete={async () => {
        await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: focusTask.id, status: 'completed', completed_at: new Date().toISOString() }) });
        setFocusTask(null); fetchTasks();
      }} />
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg }}>
      <CommandPalette onAddTask={() => setShowAddTask(true)} onRefreshBrief={() => {}}
        onVoiceInput={() => setShowVoice(true)} onFocusMode={() => pending[0] && setFocusTask(pending[0])} />
      <RiskToasts tasks={tasks} />

      {/* ═══ LEFT PANEL ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{format(new Date(), "EEEE, MMMM d · h:mm a")}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>{greeting}, Commander. 👋</h1>
            <p style={{ fontSize: 12, color: critical.length > 0 ? '#FCA5A5' : T.textMuted, margin: '4px 0 0' }}>
              {critical.length > 0 ? '⚠ ' + critical.length + ' mission' + (critical.length > 1 ? 's' : '') + ' need immediate attention' : 'All systems nominal. Keep executing.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowVoice(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid ' + T.border, color: '#9CA3AF',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>
              <Mic size={13} /> Voice
            </button>
            <button onClick={() => setShowAddTask(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10,
              background: T.violet, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 0 28px rgba(124,58,237,0.35)',
            }}>
              <Plus size={14} /> Add Mission
            </button>
          </div>
        </div>

        {/* ── 3 Featured Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

          {/* Card 1: Mission Success Probability */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(109,40,217,0.08) 100%)',
            border: '1px solid rgba(139,92,246,0.25)', borderRadius: 16, padding: 20,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#8B5CF6', marginBottom: 12 }}>MISSION SUCCESS PROBABILITY</div>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: successProb >= 70 ? '#A78BFA' : successProb >= 40 ? T.medium : T.critical, marginBottom: 8 }}>
              {successProb}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: successProb + '%', height: '100%', background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: 100, transition: 'width 1s ease' }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#6B7280', marginTop: 8 }}>
              {successProb >= 70 ? "You're on track to crush your goals!" : successProb >= 40 ? 'Needs immediate attention' : 'Critical — take action now'}
            </div>
          </div>

          {/* Card 2: Today's Focus */}
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: T.textMuted, marginBottom: 12 }}>TODAY\'S FOCUS</div>
            {topTask ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 100, fontWeight: 700,
                    background: riskBg(topTask.risk_level), color: riskColor(topTask.risk_score) }}>
                    {topTask.priority?.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.4 }}>{topTask.title}</div>
                {topTask.deadline && (
                  <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 12 }}>
                    Deadline: {new Date(topTask.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: T.textMuted }}>Est. time left: {topTask.estimated_hours}h</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: riskColor(topTask.risk_score) }}>{topTask.risk_score}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: topTask.risk_score + '%', height: '100%', background: riskColor(topTask.risk_score), borderRadius: 100 }} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: T.textMuted }}>No active missions. Press N to add one.</div>
            )}
          </div>

          {/* Card 3: Tasks At Risk */}
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: T.textMuted, marginBottom: 12 }}>TASKS AT RISK</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <RiskRing score={atRisk.length > 0 ? Math.round(atRisk.reduce((a,t)=>a+t.risk_score,0)/atRisk.length) : 0} size={80} />
              <div style={{ fontSize: 24, fontWeight: 900, color: atRisk.length > 0 ? T.critical : T.low, marginTop: 8 }}>{atRisk.length}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Need Attention</div>
            </div>
            <button onClick={() => setFilter('critical')} style={{
              fontSize: 10, fontWeight: 700, color: '#A78BFA', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}>View All →</button>
          </div>
        </div>

        {/* ── Mini Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <MiniStat icon="📋" value={tasks.length}         label="Total Tasks"   color={T.text} />
          <MiniStat icon="✓"  value={doneToday.length}     label="Completed"     color={T.low} />
          <MiniStat icon="⚠"  value={atRisk.length}        label="At Risk"       color={T.critical} />
          <MiniStat icon="🔥" value={doneToday.length > 0 ? 1 : 0} label="Day Streak"  color={T.medium} />
        </div>

        {/* ── AI Brief ── */}
        <StreamingBrief autoStart />

        {/* ── Watchdog ── */}
        <WatchdogStatus onCriticalDetected={() => fetchTasks()} />

        {/* ── Today's Schedule Mini ── */}
        <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: T.textMuted }}>TODAY\'S SCHEDULE</span>
            <a href="/dashboard/schedule" style={{ fontSize: 10, fontWeight: 600, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
              View Full Timeline <ChevronRight size={11} />
            </a>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pending.slice(0, 4).map((task, i) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ width: 3, height: 28, borderRadius: 100, background: accentColors[i % 4], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{task.estimated_hours}h · {task.category}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                  background: task.risk_score >= 70 ? 'rgba(239,68,68,0.1)' : task.risk_score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                  color: task.risk_score >= 70 ? T.critical : task.risk_score >= 40 ? T.medium : T.low }}>
                  {task.risk_score}%
                </span>
              </div>
            ))}
            {pending.length === 0 && <div style={{ textAlign: 'center', padding: '16px', fontSize: 12, color: T.textMuted }}>No missions scheduled</div>}
          </div>
        </div>

      </div>

      {/* ═══ RIGHT PANEL ══════════════════════════════════════════ */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#0F0F1A', overflow: 'hidden' }}>

        {/* Panel header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Mission Queue</span>
            <span style={{ fontSize: 10, color: T.textMuted }}>Sort by Risk ↓</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {[
              { key: 'all',       label: 'All (' + tasks.length + ')',            color: '#8B5CF6' },
              { key: 'critical',  label: 'At Risk (' + atRisk.length + ')',       color: T.critical },
              { key: 'high',      label: 'High (' + pending.filter(t=>t.risk_level==='high').length + ')', color: T.high },
              { key: 'completed', label: 'Done (' + doneToday.length + ')',       color: T.low },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as any)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap', border: '1px solid transparent',
                  background: filter === tab.key ? 'rgba(139,92,246,0.12)' : 'transparent',
                  color: filter === tab.key ? tab.color : T.textMuted,
                  borderColor: filter === tab.key ? 'rgba(139,92,246,0.25)' : 'transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {filteredRight.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: T.textMuted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 13 }}>No {filter !== 'all' ? filter : ''} missions</div>
            </div>
          ) : (
            filteredRight.map(task => (
              <MissionCard key={task.id} task={task}
                onFocus={() => setFocusTask(task)}
                onComplete={async () => {
                  await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: task.id, status: 'completed', completed_at: new Date().toISOString() }) });
                  fetchTasks();
                }} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#1F2937' }}>Live countdowns · Sorted by risk · Gemini 2.5 Pro</span>
        </div>
      </div>

      {/* Modals */}
      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)}
          onAdd={async (taskData) => {
            await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskData) });
            setShowAddTask(false); await fetchTasks();
          }} />
      )}
      {showVoice && <VoiceModal onClose={() => setShowVoice(false)} onAdd={(_title) => { setShowVoice(false); setShowAddTask(true); }} />}
    </div>
  );
}
