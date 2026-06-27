'use client';

import { useState, useCallback } from 'react';

interface UseStreamOptions {
  onToken?: (token: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: string) => void;
}

export function useStream(options: UseStreamOptions = {}) {
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);

  const stream = useCallback(
    async (type: string, payload?: Record<string, unknown>) => {
      setText('');
      setDone(false);
      setStreaming(true);

      try {
        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, payload }),
        });

        if (!res.ok) throw new Error('Stream request failed');
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setDone(true);
                options.onDone?.(fullText);
              } else if (data.error) {
                options.onError?.(data.error);
              } else if (data.text) {
                fullText += data.text;
                setText(prev => prev + data.text);
                options.onToken?.(data.text);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        options.onError?.(String(err));
      } finally {
        setStreaming(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setText('');
    setDone(false);
    setStreaming(false);
  }, []);

  return { text, streaming, done, stream, reset };
}
