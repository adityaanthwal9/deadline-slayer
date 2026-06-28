"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Mic, ChevronRight, X } from 'lucide-react';
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

function RiskRing({ score }: { score: number }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#EF4444' : score >= 60 ? '#F97316' : score >= 30 ? '#F59E0B' : '#10B981';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42 }}>
      <svg width="42" height="42" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx="21" cy="21" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <span style={{ fontSize: 8.5, fontWeight: 800, color, letterSpacing: '-0.5px', zIndex: 1 }}>{score}%</span>
    </div>
  );
}

function MissionCard({ task, onComplete, onFocus }: { task: Task; onComplete: () => void; onFocus: () => void }) {
  const { timeLeft, urgencyClass } = useRealTimeRisk(task.deadline, task.estimated_hours);
  const [showWhy, setShowWhy] = useState(false);
  const hoursLeft = task.deadline ? Math.max(0, (new Date(task.deadline).getTime() - Date.now()) / 3600000) : null;
  const confidence = Math.max(5, 100 - task.risk_score);
  const borderColor = task.risk_level === 'critical' ? 'rgba(239,68,68,0.25)' : task.risk_level === 'high' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)';
  const levelColor = task.risk_level === 'critical' ? '#F87171' : task.risk_level === 'high' ? '#FB923C' : task.risk_level === 'medium' ? '#F59E0B' : '#34D399';
  const levelBg = task.risk_level === 'critical' ? 'rgba(239,68,68,0.1)' : task.risk_level === 'high' ? 'rgba(249,115,22,0.1)' : task.risk_level === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
  return (
    <div style={{ background: '#111827', border: `1px solid ${borderColor}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
      <div className="p-3 flex items-start gap-3">
        <button onClick={onComplete} className="w-4 h-4 rounded flex-shrink-0 mt-1 transition-all hover:border-green-400"
          style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: '#E2E8F0' }}>{task.title}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: levelBg, color: levelColor }}>{task.risk_level.toUpperCase()}</span>
            <span className={`text-[10px] tabular-nums font-medium ${urgencyClass}`}>{timeLeft}</span>
          </div>
          <div className="text-[10px] mt-1" style={{ color: '#374151' }}>{task.category?.charAt(0).toUpperCase()}{task.category?.slice(1)} · {task.estimated_hours}h est</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <RiskRing score={task.risk_score} />
          <button onClick={() => setShowWhy(!showWhy)} className="text-[9px] font-semibold transition-colors"
            style={{ color: showWhy ? '#A78BFA' : '#4B5563' }}>{showWhy ? 'Close' : 'Why?'}</button>
        </div>
      </div>
      {showWhy && (
        <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
          <div className="text-[9px] font-bold tracking-widest mb-2" style={{ color: '#7C3AED' }}>
            GEMINI 2.5 REASONING · {confidence}% CONFIDENCE
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {[
              { label: 'Time Left', value: hoursLeft !== null ? `${Math.round(hoursLeft)}h` : 'No DL', ok: hoursLeft === null || hoursLeft >= task.estimated_hours },
              { label: 'Need', value: `${task.estimated_hours}h`, ok: true },
              { label: 'Delays', value: `${task.procrastination_count}x`, ok: task.procrastination_count === 0 },
            ].map((item, i) => (
              <div key={i} className="text-center py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[9px] mb-0.5" style={{ color: '#4B5563' }}>{item.label}</div>
                <div className="text-[11px] font-bold" style={{ color: item.ok ? '#34D399' : '#F87171' }}>{item.value}</div>
              </div>
            ))}
          </div>
          {task.ai_recommendation && (
            <div className="text-[10px] leading-relaxed p-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.06)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.12)' }}>
              ✦ {task.ai_recommendation}
            </div>
          )}
        </div>
      )}
      <button onClick={onFocus} className="w-full py-1.5 text-[10px] font-medium transition-all hover:bg-violet-500/10 hover:text-violet-400"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#4B5563', background: 'transparent' }}>
        Enter Focus Mode
      </button>
    </div>
  );
}

function StatCard({ label, value, color, icon, sublabel }: { label: string; value: number; color: string; icon: string; sublabel?: string }) {
  const animated = useCountUp(value, 800);
  return (
    <div className="p-4 rounded-xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-base mb-2">{icon}</div>
      <div className="font-display text-2xl font-bold tabular-nums" style={{ color }}>{animated}</div>
      <div className="text-xs mt-0.5 font-medium" style={{ color: '#64748B' }}>{label}</div>
      {sublabel && <div className="text-[10px] mt-0.5" style={{ color: '#374151' }}>{sublabel}</div>}
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-white">Voice Input</h3>
          <button onClick={onClose} style={{ color: '#4B5563' }}><X size={18} /></button>
        </div>
        <div className="flex flex-col items-center gap-5">
          <button onClick={listening ? () => recRef.current?.stop() : start} className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: listening ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)', border: `2px solid ${listening ? '#EF4444' : 'rgba(124,58,237,0.4)'}` }}>
            <Mic size={32} style={{ color: listening ? '#EF4444' : '#8B5CF6' }} />
          </button>
          <div className="text-center min-h-[60px]">
            {listening ? <div className="text-sm text-red-400">"{transcript || '...'}"</div>
              : transcript ? <div className="text-sm text-white">"{transcript}"</div>
              : <div className="text-sm" style={{ color: '#4B5563' }}>Tap and say your task</div>}
          </div>
          {transcript && !listening && (
            <div className="flex gap-3 w-full">
              <button onClick={() => setTranscript('')} className="flex-1 py-2 rounded-lg text-sm" style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>Retry</button>
              <button onClick={() => { onAdd(transcript); onClose(); }} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: '#7C3AED', color: '#fff' }}>Add Mission</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high'>('all');

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
  }, []);

  useEffect(() => {
    const init = async () => { setLoading(true); await fetchTasks(); setLoading(false); };
    init();
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

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const criticalTasks = tasks.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');
  const completedToday = tasks.filter(t => t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString());
  const filteredRight = pendingTasks.filter(t => activeFilter === 'all' ? true : t.risk_level === activeFilter).sort((a, b) => b.risk_score - a.risk_score);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const successProb = pendingTasks.length === 0 ? 100 : Math.max(0, Math.round(100 - (pendingTasks.reduce((a, t) => a + t.risk_score, 0) / pendingTasks.length)));
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
    <div className="flex h-screen overflow-hidden" style={{ background: '#0B0F17' }}>
      <CommandPalette onAddTask={() => setShowAddTask(true)} onRefreshBrief={() => {}} onVoiceInput={() => setShowVoice(true)} onFocusMode={() => pendingTasks[0] && setFocusTask(pendingTasks[0])} />
      <RiskToasts tasks={tasks} />

      {/* LEFT 70% */}
      <div className="flex-1 overflow-auto p-6 space-y-4 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium mb-1" style={{ color: '#374151' }}>{format(new Date(), "EEEE, MMMM d")}</div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#F1F5F9' }}>{greeting}, Commander.</h1>
            <p className="text-sm mt-1" style={{ color: criticalTasks.length > 0 ? '#F87171' : '#4B5563' }}>
              {criticalTasks.length > 0 ? `⚠ ${criticalTasks.length} mission${criticalTasks.length > 1 ? 's' : ''} need immediate attention` : 'All systems nominal. Keep executing.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowVoice(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7280' }}>
              <Mic size={12} /> Voice
            </button>
            <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#7C3AED', color: '#fff', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}>
              <Plus size={14} /> Add Mission
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(139,92,246,0.22)' }}>
            <div className="text-[9px] font-bold tracking-widest mb-2" style={{ color: '#7C3AED' }}>SUCCESS PROBABILITY</div>
            <div className="font-display text-3xl font-bold" style={{ color: successProb >= 70 ? '#A78BFA' : successProb >= 40 ? '#F59E0B' : '#F87171' }}>{successProb}%</div>
            <div className="text-[10px] mt-1" style={{ color: '#6B7280' }}>{successProb >= 70 ? 'On track to win' : successProb >= 40 ? 'Needs attention' : 'Critical — act now'}</div>
          </div>
          <StatCard label="Active Missions" value={pendingTasks.length} color="#F1F5F9" icon="⚡" />
          <StatCard label="At Risk" value={criticalTasks.length} color="#F87171" icon="🔥" sublabel="need action now" />
          <StatCard label="Done Today" value={completedToday.length} color="#34D399" icon="✓" sublabel="completed" />
        </div>

        <StreamingBrief autoStart />
        <WatchdogStatus onCriticalDetected={() => fetchTasks()} />

        <div className="rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] font-bold tracking-widest" style={{ color: '#374151' }}>TODAY'S MISSION QUEUE</span>
            <a href="/dashboard/tasks" className="text-[10px] font-medium flex items-center gap-1 hover:text-violet-400 transition-colors" style={{ color: '#4B5563' }}>
              View All <ChevronRight size={11} />
            </a>
          </div>
          <div className="p-3 space-y-1.5">
            {pendingTasks.slice(0, 4).map((task, i) => (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-violet-500/5"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-0.5 h-7 rounded-full flex-shrink-0" style={{ background: accentColors[i % 4] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: '#D1D5DB' }}>{task.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#374151' }}>{task.estimated_hours}h · {task.category}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: task.risk_score >= 70 ? 'rgba(239,68,68,0.1)' : task.risk_score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: task.risk_score >= 70 ? '#F87171' : task.risk_score >= 40 ? '#F59E0B' : '#34D399' }}>
                  {task.risk_score}%
                </span>
              </div>
            ))}
            {pendingTasks.length === 0 && <div className="text-center py-6 text-sm" style={{ color: '#374151' }}>No active missions · Press N to add one</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[['⌘K', 'Palette'], ['N', 'New'], ['V', 'Voice']].map(([k, l]) => (
            <div key={k} className="flex items-center gap-1 text-[10px]">
              <kbd className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#374151' }}>{k}</kbd>
              <span style={{ color: '#1F2937' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT 30% */}
      <div className="w-72 flex-shrink-0 flex flex-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#0D1117' }}>
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-bold text-sm" style={{ color: '#E2E8F0' }}>Risk Queue</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: criticalTasks.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${criticalTasks.length > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: criticalTasks.length > 0 ? '#EF4444' : '#10B981' }} />
              <span className="text-[10px] font-bold" style={{ color: criticalTasks.length > 0 ? '#F87171' : '#34D399' }}>{criticalTasks.length} critical</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['all', 'critical', 'high'] as const).map(f => {
              const active = activeFilter === f;
              const ac = f === 'critical' ? '#F87171' : f === 'high' ? '#FB923C' : '#A78BFA';
              const ab = f === 'critical' ? 'rgba(239,68,68,0.12)' : f === 'high' ? 'rgba(249,115,22,0.12)' : 'rgba(139,92,246,0.12)';
              return (
                <button key={f} onClick={() => setActiveFilter(f)} className="py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                  style={{ background: active ? ab : 'transparent', color: active ? ac : '#374151', border: `1px solid ${active ? (f === 'critical' ? 'rgba(239,68,68,0.25)' : f === 'high' ? 'rgba(249,115,22,0.25)' : 'rgba(139,92,246,0.25)') : 'transparent'}` }}>
                  {f === 'all' ? `All (${pendingTasks.length})` : f === 'critical' ? '🔴 Critical' : '🟠 High'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3">
          {filteredRight.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#1F2937' }}>
              <div className="text-3xl mb-3">✓</div>
              <div className="text-sm">No {activeFilter !== 'all' ? activeFilter : ''} missions</div>
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

        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[9px] text-center" style={{ color: '#1F2937' }}>Sorted by risk · Live · Gemini 2.5 Pro</div>
        </div>
      </div>

      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)}
          onAdd={async (taskData) => {
            await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskData) });
            setShowAddTask(false); await fetchTasks();
          }} />
      )}
      {showVoice && <VoiceModal onClose={() => setShowVoice(false)} onAdd={(title) => { setShowVoice(false); setShowAddTask(true); }} />}
    </div>
  );
}
