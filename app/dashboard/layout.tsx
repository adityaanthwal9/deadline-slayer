"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import {
  LayoutDashboard, ListTodo, Calendar,
  BarChart3, MessageSquare, Shield, Dna, CalendarDays,
} from "lucide-react";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { PageTransition } from "@/components/ui/PageTransition";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Overview",  shortcut: "1" },
  { href: "/dashboard/tasks",     icon: ListTodo,        label: "Missions",  shortcut: "2" },
  { href: "/dashboard/schedule",  icon: Calendar,        label: "Timeline",  shortcut: "3" },
  { href: "/dashboard/simulate",  icon: Shield,          label: "Simulate",  shortcut: "4" },
  { href: "/dashboard/negotiate", icon: MessageSquare,   label: "Negotiate", shortcut: "5" },
  { href: "/dashboard/dna",       icon: Dna,             label: "Insights",  shortcut: "6", badge: "NEW" },
  { href: "/dashboard/gcal",      icon: CalendarDays,    label: "Calendar",  shortcut: "7" },
  { href: "/dashboard/analytics", icon: BarChart3,       label: "Analytics", shortcut: "8" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen dark" style={{ background: "#09090F" }}>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{
        background: "var(--bg-void)",
        borderRight: "1px solid var(--border)",
      }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="DS" className="w-8 h-8 rounded-lg object-cover sword-logo flex-shrink-0" />
            <div>
              <div className="font-display font-bold text-sm tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>
                DEADLINE <span style={{ color: "var(--amber)" }}>SLAYER</span>
              </div>
              <div className="text-[9px] mt-0.5 font-medium tracking-widest" style={{ color: "var(--text-muted)" }}>
                KNOW YOUR NEXT MOVE
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <SidebarNav items={navItems} />

        {/* Footer */}
        <div className="p-4 border-t mt-auto" style={{ borderColor: "var(--border)" }}>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <kbd className="px-1.5 py-0.5 rounded text-[9px]"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>K</kbd>
            <span>Command palette</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ background: "#09090F" }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
