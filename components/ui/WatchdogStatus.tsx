'use client';

import { useWatchdog, WatchdogResult } from '@/hooks/useWatchdog';
import { Bot, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  onCriticalDetected?: (result: WatchdogResult) => void;
}

export function WatchdogStatus({ onCriticalDetected }: Props) {
  const { lastResult, running, lastRan, runWatchdog } = useWatchdog({
    intervalMs: 5 * 60 * 1000,
    onActions: (result) => {
      if (result.critical_count > 0) {
        onCriticalDetected?.(result);
      }
    },
  });

  return (
    <div
      className="ds-card px-4 py-3 flex items-center gap-3"
      style={{ borderColor: running ? 'rgba(59,130,246,0.4)' : undefined }}
    >
      {/* Animated bot icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: running ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${running ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <Bot
          size={15}
          className={running ? 'text-blue-400 animate-pulse' : 'text-[#5C5C74]'}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white">
          {running ? 'AI Watchdog scanning...' : 'AI Watchdog'}
        </div>
        <div className="text-[10px] text-[#5C5C74] mt-0.5">
          {running
            ? 'Gemini analyzing your tasks'
            : lastRan
            ? `Last scan: ${lastRan.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Waiting to scan'}
        </div>
      </div>

      {/* Action counts */}
      {lastResult && lastResult.actions.length > 0 && (
        <div className="flex items-center gap-2">
          {lastResult.critical_count > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-red-400">
              <AlertTriangle size={10} />
              {lastResult.critical_count}
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <Zap size={10} />
            {lastResult.actions.length} actions
          </div>
        </div>
      )}

      {/* Manual trigger */}
      <button
        onClick={runWatchdog}
        disabled={running}
        className="text-[#5C5C74] hover:text-blue-400 transition-colors disabled:opacity-30"
        title="Run agent now"
      >
        <RefreshCw size={13} className={running ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
