import { useState, useEffect } from 'react';

export function useRealTimeRisk(deadline?: string, estimatedHours?: number) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [urgencyClass, setUrgencyClass] = useState<string>('');

  useEffect(() => {
    if (!deadline) return;

    const update = () => {
      const now = new Date();
      const due = new Date(deadline);
      const diffMs = due.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('OVERDUE');
        setUrgencyClass('text-red-400 font-bold pulse-critical');
        return;
      }

      const diffH = diffMs / (1000 * 60 * 60);
      const est = estimatedHours ?? 0;

      if (diffH < 1) {
        setTimeLeft(`${Math.round(diffMs / 60000)}m left`);
        setUrgencyClass('text-red-400 font-bold');
      } else if (diffH < 24) {
        setTimeLeft(`${Math.round(diffH)}h left`);
        setUrgencyClass(diffH < est * 1.5 ? 'text-red-400' : 'text-orange-400');
      } else {
        const days = Math.floor(diffH / 24);
        const hrs = Math.round(diffH % 24);
        setTimeLeft(`${days}d ${hrs}h`);
        setUrgencyClass(diffH < est * 2 ? 'text-amber-400' : 'text-[#9898B0]');
      }
    };

    update();
    const interval = setInterval(update, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [deadline, estimatedHours]);

  return { timeLeft, urgencyClass };
}
