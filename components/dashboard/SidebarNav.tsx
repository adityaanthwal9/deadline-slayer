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
    <nav className="flex-1 p-3 space-y-0.5">
      {items.map(({ href, icon: Icon, label, shortcut, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative ${
              isActive
                ? 'bg-amber-500/10 text-white border border-amber-500/20'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber-500 rounded-r" />
            )}
            <Icon
              size={16}
              className={`transition-colors flex-shrink-0 ${isActive ? 'text-amber-400' : 'group-hover:text-amber-400'}`}
            />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {badge}
              </span>
            )}
            <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {shortcut}
            </kbd>
          </Link>
        );
      })}
    </nav>
  );
}
