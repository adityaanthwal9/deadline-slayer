'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WatchdogResult {
  actions: Array<{
    type: string;
    task_id?: string;
    data: Record<string, unknown>;
  }>;
  summary: string;
  critical_count: number;
  interventions: number;
}

interface UseWatchdogOptions {
  intervalMs?: number;       // default: 5 min
  onActions?: (result: WatchdogResult) => void;
  enabled?: boolean;
}

export function useWatchdog({
  intervalMs = 5 * 60 * 1000,
  onActions,
  enabled = true,
}: UseWatchdogOptions = {}) {
  const [lastResult, setLastResult] = useState<WatchdogResult | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRan, setLastRan] = useState<Date | null>(null);
  const [totalActions, setTotalActions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runWatchdog = useCallback(async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await fetch('/api/watchdog', { method: 'POST' });
      if (!res.ok) return;
      const data: WatchdogResult = await res.json();
      setLastResult(data);
      setLastRan(new Date());
      setTotalActions(prev => prev + data.actions.length);
      if (data.actions.length > 0) {
        onActions?.(data);
      }
    } catch (err) {
      console.error('Watchdog failed:', err);
    } finally {
      setRunning(false);
    }
  }, [running, onActions]);

  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    runWatchdog();

    // Then run every intervalMs
    intervalRef.current = setInterval(runWatchdog, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs]); // eslint-disable-line

  return { lastResult, running, lastRan, totalActions, runWatchdog };
}
