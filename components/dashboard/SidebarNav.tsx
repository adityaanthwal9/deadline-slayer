'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  badge?: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
      {items.map(({ href, icon: Icon, label, shortcut, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative"
            style={{
              background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                style={{ background: 'var(--amber)' }} />
            )}

            <Icon
              size={15}
              style={{
                color: isActive ? 'var(--amber)' : 'currentColor',
                transition: 'color 150ms ease',
              }}
            />

            <span className="flex-1 truncate">{label}</span>

            {badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: 'var(--blue)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                {badge}
              </span>
            )}

            <kbd className="text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}>
              {shortcut}
            </kbd>
          </Link>
        );
      })}
    </nav>
  );
}
