'use client';

import { useEffect, useRef } from 'react';
import { useStream } from '@/hooks/useStream';
import { Zap, RefreshCw } from 'lucide-react';

interface Props {
  autoStart?: boolean;
}

export function StreamingBrief({ autoStart = true }: Props) {
  const { text, streaming, stream, reset } = useStream();
  const textRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      stream('daily_brief');
    }
  }, [autoStart, stream]);

  // Auto-scroll as text streams in
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);

  const handleRefresh = () => {
    reset();
    started.current = false;
    setTimeout(() => {
      started.current = true;
      stream('daily_brief');
    }, 100);
  };

  return (
    <div
      className="ds-card p-5"
      style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">AI Mission Brief</span>
            <span className="text-[10px] font-semibold tracking-wider text-amber-400/70 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded-full">
              Gemini 2.5
            </span>
          </div>
          {streaming && (
            <div className="flex gap-0.5 items-center">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-amber-400"
                  style={{
                    animation: `bounce 1s infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={streaming}
          className="text-[#5C5C74] hover:text-amber-400 transition-colors disabled:opacity-30"
        >
          <RefreshCw size={13} className={streaming ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Streaming text output */}
      <div
        ref={textRef}
        className="text-sm text-[#C8C8D8] leading-relaxed whitespace-pre-wrap min-h-[60px] max-h-[200px] overflow-y-auto"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {text || (!streaming && (
          <span className="text-[#5C5C74]">Click refresh to generate your mission brief...</span>
        ))}
        {/* Blinking cursor while streaming */}
        {streaming && (
          <span
            className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 align-middle"
            style={{ animation: 'pulse 1s ease-in-out infinite' }}
          />
        )}
      </div>
    </div>
  );
}
