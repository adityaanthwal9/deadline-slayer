'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import type { ScheduleBlock } from '@/types';
import { Calendar, Zap, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const blockColors = {
  work: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', label: 'text-blue-400' },
  break: { bg: 'bg-green-500/15', border: 'border-green-500/30', label: 'text-green-400' },
  fixed: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'text-amber-400' },
  buffer: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', label: 'text-purple-400' },
};

export default function SchedulePage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchSchedule = async () => {
    setLoading(true);
    const res = await fetch('/api/schedule');
    const data = await res.json();
    setBlocks(data.blocks || []);
    setLoading(false);
  };

  const generateSchedule = async () => {
    setGenerating(true);
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixed_events: [] }),
    });
    const data = await res.json();
    if (data.schedule) setNotes(data.schedule.optimization_notes);
    fetchSchedule();
    setGenerating(false);
  };

  const markComplete = async (blockId: string) => {
    await fetch('/api/schedule/complete', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blockId }),
    });
    fetchSchedule();
  };

  useEffect(() => { fetchSchedule(); }, []);

  const totalFocusHours = blocks
    .filter(b => b.block_type === 'work')
    .reduce((acc, b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">AI Schedule</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {format(new Date(), 'EEEE, MMMM d')} · {totalFocusHours.toFixed(1)}h focus scheduled
            </p>
          </div>
        </div>
        <button
          onClick={generateSchedule}
          disabled={generating}
          className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Zap size={15} fill="black" />
          {generating ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      {/* Optimization notes */}
      {notes && (
        <div className="ds-card p-4 border-amber-500/20 bg-amber-500/5 mb-6">
          <div className="text-xs text-amber-400 font-medium mb-1">AI OPTIMIZATION NOTES</div>
          <div className="text-sm text-[var(--text-secondary)]">{notes}</div>
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <div className="ds-card p-10 text-center mb-6">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[var(--text-secondary)] text-sm">AI is building your optimal schedule...</div>
        </div>
      )}

      {/* Schedule blocks */}
      {!generating && (
        <div className="space-y-2">
          {blocks.length === 0 && !loading && (
            <div className="ds-card p-10 text-center">
              <div className="text-[var(--text-muted)] text-sm mb-3">No schedule for today.</div>
              <button onClick={generateSchedule} className="btn-primary text-sm">
                Generate AI Schedule
              </button>
            </div>
          )}

          {blocks.map(block => {
            const colors = blockColors[block.block_type] || blockColors.work;
            return (
              <div
                key={block.id}
                className={`ds-card p-4 border flex items-center gap-4 transition-opacity ${
                  block.is_completed ? 'opacity-40' : ''
                } ${colors.bg} ${colors.border}`}
              >
                {/* Time */}
                <div className="text-xs font-mono text-[var(--text-secondary)] w-24 flex-shrink-0">
                  {format(new Date(block.start_time), 'HH:mm')} –{' '}
                  {format(new Date(block.end_time), 'HH:mm')}
                </div>

                {/* Block type badge */}
                <div className={`text-xs font-medium uppercase w-12 flex-shrink-0 ${colors.label}`}>
                  {block.block_type}
                </div>

                {/* Title + notes */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${block.is_completed ? 'line-through' : ''}`}>
                    {block.title}
                  </div>
                  {block.notes && (
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{block.notes}</div>
                  )}
                </div>

                {/* Duration */}
                <div className="text-xs text-[var(--text-muted)] flex-shrink-0">
                  {Math.round(
                    (new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) /
                      (1000 * 60)
                  )}m
                </div>

                {/* Complete button */}
                {!block.is_completed && block.block_type === 'work' && (
                  <button
                    onClick={() => markComplete(block.id)}
                    className="flex-shrink-0 text-[var(--text-muted)] hover:text-green-400 transition-colors"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
