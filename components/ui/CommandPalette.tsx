'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import {
  LayoutDashboard, ListTodo, Calendar, Shield,
  MessageSquare, BarChart3, Plus, Zap, RefreshCw,
  Mic, Target, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  onAddTask?: () => void;
  onRefreshBrief?: () => void;
  onVoiceInput?: () => void;
  onFocusMode?: () => void;
}

export function CommandPalette({ onAddTask, onRefreshBrief, onVoiceInput, onFocusMode }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 100);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[560px] mx-4 fade-slide-up">
        <Command>
          <div className="flex items-center px-4 border-b border-[var(--border)]">
            <Zap size={14} className="text-amber-400 mr-2 flex-shrink-0" />
            <Command.Input placeholder="Type a command or search..." autoFocus />
            <button onClick={() => setOpen(false)} className="ml-2 text-[var(--text-muted)] hover:text-white">
              <X size={14} />
            </button>
          </div>

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Actions">
              <Command.Item onSelect={() => run(() => onAddTask?.())}>
                <Plus size={15} className="text-amber-400" />
                Add New Task
                <kbd className="ml-auto text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">N</kbd>
              </Command.Item>
              <Command.Item onSelect={() => run(() => onRefreshBrief?.())}>
                <RefreshCw size={15} className="text-blue-400" />
                Refresh AI Brief
                <kbd className="ml-auto text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">R</kbd>
              </Command.Item>
              <Command.Item onSelect={() => run(() => onVoiceInput?.())}>
                <Mic size={15} className="text-green-400" />
                Voice Input
                <kbd className="ml-auto text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">V</kbd>
              </Command.Item>
              <Command.Item onSelect={() => run(() => onFocusMode?.())}>
                <Target size={15} className="text-purple-400" />
                Enter Focus Mode
                <kbd className="ml-auto text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">F</kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigate">
              {[
                { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
                { label: 'Tasks', href: '/dashboard/tasks', icon: ListTodo },
                { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
                { label: 'Life Simulator', href: '/dashboard/simulate', icon: Shield },
                { label: 'AI Negotiator', href: '/dashboard/negotiate', icon: MessageSquare },
                { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
              ].map(({ label, href, icon: Icon }) => (
                <Command.Item key={href} onSelect={() => run(() => router.push(href))}>
                  <Icon size={15} className="text-[var(--text-secondary)]" />
                  {label}
                  <span className="ml-auto text-[10px] text-[var(--text-muted)]">Go to</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2.5 border-t border-[var(--border)] flex items-center gap-4">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="bg-[var(--bg-elevated)] px-1 rounded">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="bg-[var(--bg-elevated)] px-1 rounded">↵</kbd> select
            </span>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="bg-[var(--bg-elevated)] px-1 rounded">esc</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
