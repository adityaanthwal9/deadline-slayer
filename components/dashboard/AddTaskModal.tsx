'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import type { TaskCategory, TaskPriority } from '@/types';

interface TaskData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string;
  estimated_hours: number;
}

interface Props {
  onClose: () => void;
  onAdd: (task: TaskData) => void;
}

export function AddTaskModal({ onClose, onAdd }: Props) {
  const [mode, setMode] = useState<'natural' | 'manual'>('natural');
  const [nlText, setNlText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState<TaskData>({
    title: '', description: '', category: 'work',
    priority: 'medium', deadline: '', estimated_hours: 1,
  });

  const update = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const parseNL = async () => {
    if (!nlText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlText }),
      });
      const data = await res.json();
      if (data.task) {
        setForm({
          title: data.task.title,
          description: data.task.description || '',
          category: data.task.category,
          priority: data.task.priority,
          deadline: data.task.deadline ? new Date(data.task.deadline).toISOString().slice(0, 16) : '',
          estimated_hours: data.task.estimated_hours,
        });
        setMode('manual');
      }
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({ ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined });
  };

  const categories: TaskCategory[] = ['work', 'personal', 'health', 'finance', 'learning'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

  const examples = [
    'Submit project report by Sunday 5pm, needs 6 hours',
    'Pay electricity bill today, 10 minutes',
    'Prepare for interview tomorrow morning, 4 hours, critical',
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="ds-card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold">Add Task</h2>
            <p className="text-[#9898B0] text-xs mt-0.5">Natural language or manual</p>
          </div>
          <button onClick={onClose} className="text-[#9898B0] hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-1 p-1 rounded-lg mb-5 bg-[#1A1A24]">
          {(['natural', 'manual'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === m ? 'bg-[#16161F] text-white' : 'text-[#5C5C74]'}`}>
              {m === 'natural' ? '✨ Natural Language' : '⚙️ Manual'}
            </button>
          ))}
        </div>

        {mode === 'natural' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#9898B0] mb-2 block">Describe your task in plain English</label>
              <textarea value={nlText} onChange={e => setNlText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) parseNL(); }}
                rows={3} placeholder='e.g. "Submit report by Sunday 5pm, needs 6 hours"'
                className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#5C5C74] focus:outline-none focus:border-amber-500/50 resize-none"
                autoFocus />
            </div>
            <div>
              <div className="text-xs text-[#5C5C74] mb-2">Examples:</div>
              <div className="space-y-1.5">
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => setNlText(ex)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-[#1A1A24] border border-white/8 text-[#9898B0] hover:text-white hover:border-white/15 transition-all">
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
            <button onClick={parseNL} disabled={!nlText.trim() || parsing}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {parsing ? <><Loader2 size={16} className="animate-spin" />Parsing with Gemini...</> : <><Sparkles size={16} />Parse with AI</>}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#9898B0] mb-1.5 block">Task Title *</label>
              <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="e.g. Complete JS Assignment" autoFocus
                className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#5C5C74] focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9898B0] mb-1.5 block">Deadline</label>
                <input type="datetime-local" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-[#9898B0] mb-1.5 block">Est. Hours</label>
                <input type="number" min="0.5" step="0.5" value={form.estimated_hours}
                  onChange={e => update('estimated_hours', parseFloat(e.target.value))}
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9898B0] mb-1.5 block">Category</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => update('category', c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${form.category === c ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-transparent border-white/8 text-[#9898B0] hover:border-white/15'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9898B0] mb-1.5 block">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map(p => (
                  <button key={p} onClick={() => update('priority', p)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                      form.priority === p
                        ? p === 'critical' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : p === 'high' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                          : p === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-transparent border-white/8 text-[#9898B0]'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={!form.title.trim()}
                className="btn-primary flex-1 text-sm disabled:opacity-50">Add Task</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
