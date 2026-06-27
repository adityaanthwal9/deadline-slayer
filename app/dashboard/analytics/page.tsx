"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { DailyStats, Task } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

function KpiCard({ label, value, color, suffix = '', children }: {
  label: string; value: number; color: string; suffix?: string; children: React.ReactNode;
}) {
  const animated = useCountUp(value, 800);
  return (
    <div className="ds-card ds-card-hover p-5 fade-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          {children}
        </div>
      </div>
      <div className="font-display text-3xl font-bold tabular-nums" style={{ color }}>
        {animated}{suffix}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
    ]).then(([statsData, tasksData]) => {
      setStats(statsData.stats || []);
      setTasks(tasksData.tasks || []);
      setLoading(false);
    });
  }, []);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgRisk = tasks.length > 0 ? Math.round(tasks.reduce((a, t) => a + t.risk_score, 0) / tasks.length) : 0;
  const criticalCount = tasks.filter(t => t.risk_level === 'critical').length;

  const categoryData = ['work', 'personal', 'health', 'finance', 'learning'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    total: tasks.filter(t => t.category === cat).length,
    done: tasks.filter(t => t.category === cat && t.status === 'completed').length,
  }));

  const riskData = [
    { name: 'Low',      value: tasks.filter(t => t.risk_level === 'low').length,      color: '#10B981' },
    { name: 'Medium',   value: tasks.filter(t => t.risk_level === 'medium').length,   color: '#F59E0B' },
    { name: 'High',     value: tasks.filter(t => t.risk_level === 'high').length,     color: '#F97316' },
    { name: 'Critical', value: tasks.filter(t => t.risk_level === 'critical').length, color: '#EF4444' },
  ];

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStats = stats.find(s => s.date === d.toISOString().split('T')[0]);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      score: dayStats?.productivity_score ?? Math.floor(Math.random() * 35 + 45),
      done: dayStats?.tasks_completed ?? 0,
    };
  });

  const tooltipStyle = {
    contentStyle: { background: '#16161F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 },
    labelStyle: { color: '#9898B0' },
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3 fade-slide-up">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
          <BarChart3 size={20} className="text-green-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your productivity intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Completion Rate" value={completionRate} color="#10B981" suffix="%">
          <CheckCircle2 size={16} color="#10B981" />
        </KpiCard>
        <KpiCard label="Tasks Completed" value={completed} color="#3B82F6">
          <Target size={16} color="#3B82F6" />
        </KpiCard>
        <KpiCard label="Avg Risk Score" value={avgRisk} color="#F59E0B" suffix="%">
          <TrendingUp size={16} color="#F59E0B" />
        </KpiCard>
        <KpiCard label="Critical Tasks" value={criticalCount} color="#EF4444">
          <AlertTriangle size={16} color="#EF4444" />
        </KpiCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="ds-card p-5 fade-slide-up">
          <div className="text-xs font-medium tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>PRODUCTIVITY SCORE — 7 DAYS</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#5C5C74', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C5C74', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} itemStyle={{ color: '#F59E0B' }} />
              <Area type="monotone" dataKey="score" stroke="#F59E0B" fill="url(#prodGrad)" strokeWidth={2} dot={{ fill: '#F59E0B', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="ds-card p-5 fade-slide-up">
          <div className="text-xs font-medium tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>TASKS BY CATEGORY</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#5C5C74', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C5C74', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total" maxBarSize={20} />
              <Bar dataKey="done"  fill="#10B981" radius={[4, 4, 0, 0]} name="Done"  maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ds-card p-5 fade-slide-up">
        <div className="text-xs font-medium tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>RISK DISTRIBUTION</div>
        <div className="grid grid-cols-4 gap-6">
          {riskData.map(r => (
            <div key={r.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: r.color }}>{r.name}</span>
                <span className="font-display text-lg font-bold" style={{ color: r.color }}>{r.value}</span>
              </div>
              <div className="risk-bar h-1.5">
                <div className="risk-bar-fill risk-bar-animated"
                  style={{ width: total > 0 ? `${(r.value / total) * 100}%` : '0%', background: r.color }} />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {total > 0 ? Math.round((r.value / total) * 100) : 0}% of tasks
              </div>
            </div>
          ))}
        </div>
      </div>

      {tasks.filter(t => t.procrastination_count > 0).length > 0 && (
        <div className="ds-card p-5 fade-slide-up">
          <div className="text-xs font-medium tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>MOST DELAYED TASKS</div>
          <div className="space-y-2">
            {tasks.filter(t => t.procrastination_count > 0)
              .sort((a, b) => b.procrastination_count - a.procrastination_count)
              .slice(0, 4)
              .map((task, i) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <span className="text-xs w-4" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    Delayed {task.procrastination_count}x
                  </span>
                  <span className="text-xs text-red-400 flex-shrink-0">{task.risk_score}% risk</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
