import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Zap, LayoutDashboard, ListTodo, Calendar,
  BarChart3, MessageSquare, Shield, Dna, CalendarDays,
} from 'lucide-react';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { PageTransition } from '@/components/ui/PageTransition';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Command Center', shortcut: '1' },
  { href: '/dashboard/tasks',       icon: ListTodo,        label: 'Tasks',          shortcut: '2' },
  { href: '/dashboard/schedule',    icon: Calendar,        label: 'Schedule',       shortcut: '3' },
  { href: '/dashboard/simulate',    icon: Shield,          label: 'Life Simulator', shortcut: '4' },
  { href: '/dashboard/negotiate',   icon: MessageSquare,   label: 'AI Negotiator',  shortcut: '5' },
  { href: '/dashboard/dna',         icon: Dna,             label: 'Deadline DNA',   shortcut: '6', badge: 'NEW' },
  { href: '/dashboard/gcal',        icon: CalendarDays,    label: 'Google Calendar',shortcut: '7' },
  { href: '/dashboard/analytics',   icon: BarChart3,       label: 'Analytics',      shortcut: '8' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <aside className="w-60 flex-shrink-0 border-r border-[var(--border)] flex flex-col glass">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap size={15} className="text-black" fill="black" />
            </div>
            <span className="font-display font-bold text-sm">Deadline Slayer</span>
          </Link>
        </div>

        {/* Nav — client component for active state */}
        <SidebarNav items={navItems} />

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[var(--text-muted)]">Signed in</div>
            </div>
            <ThemeToggle />
          </div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
            <kbd className="bg-[var(--bg-elevated)] border border-[var(--border)] px-1 rounded">⌘K</kbd>
            <span>command palette</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
