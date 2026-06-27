'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/types';

interface Props {
  tasks: Task[];
}

function getStreakEmoji(streak: number) {
  if (streak === 0) return '💤';
  if (streak < 3) return '🔥';
  if (streak < 7) return '🔥🔥';
  if (streak < 14) return '🔥🔥🔥';
  return '⚡🔥⚡';
}

function getStreakMessage(streak: number) {
  if (streak === 0) return 'No active streak';
  if (streak === 1) return '1 day streak!';
  if (streak < 3) return `${streak} day streak!`;
  if (streak < 7) return `${streak} days — on fire!`;
  if (streak < 14) return `${streak} days — unstoppable!`;
  return `${streak} days — LEGENDARY`;
}

export function StreakBadge({ tasks }: Props) {
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(0);

  useEffect(() => {
    // Calculate streak from completed tasks
    const completed = tasks
      .filter(t => t.completed_at && t.status === 'completed')
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    // Count today's completions
    const today = new Date().toDateString();
    const doneToday = completed.filter(t => new Date(t.completed_at!).toDateString() === today).length;
    setTodayDone(doneToday);

    // Build streak — count consecutive days with at least 1 completion
    const daySet = new Set(completed.map(t => new Date(t.completed_at!).toDateString()));
    let s = 0;
    const d = new Date();
    while (daySet.has(d.toDateString())) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(s);
  }, [tasks]);

  return (
    <div className="ds-card px-4 py-3 flex items-center gap-3 ds-card-hover cursor-default">
      <div className="text-2xl leading-none" style={{ filter: streak >= 3 ? 'drop-shadow(0 0 6px #f97316)' : 'none' }}>
        {getStreakEmoji(streak)}
      </div>
      <div>
        <div className="text-xs font-bold text-white">{getStreakMessage(streak)}</div>
        <div className="text-[10px] text-[#5C5C74] mt-0.5">
          {todayDone > 0 ? `${todayDone} done today` : 'Complete a task to start'}
        </div>
      </div>
      {streak >= 7 && (
        <div className="ml-auto text-[10px] text-amber-400 font-bold tracking-wider animate-pulse">
          STREAK
        </div>
      )}
    </div>
  );
}
