import Link from "next/link";
import { ArrowRight, Shield, Activity, Clock } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] grid-bg flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DS" className="w-8 h-8 rounded-lg object-cover sword-logo" />
            <div>
              <div className="font-display font-bold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>
                DEADLINE <span style={{ color: "var(--amber)" }}>SLAYER</span>
              </div>
              <div className="text-[9px] font-medium tracking-widest" style={{ color: "var(--text-muted)" }}>
                KNOW YOUR NEXT MOVE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/demo" className="btn-ghost text-xs px-4 py-2">Live Demo</Link>
            <Link href="/dashboard" className="btn-primary text-xs px-4 py-2">Open App</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-10"
          style={{ background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-amber-400 tracking-wider">Vibe2Ship Hackathon · Powered by Gemini 2.5 Pro</span>
        </div>

        <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-6 fade-up"
          style={{ fontSize: "clamp(52px, 8vw, 88px)", color: "var(--text-primary)" }}>
          Deadline Slayer
          <span className="block" style={{ color: "var(--amber)" }}>Know your next move.</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-4 leading-relaxed fade-up"
          style={{ color: "var(--text-secondary)", animationDelay: "80ms" }}>
          Predict what is at risk.<br />
          Prioritize what matters.<br />
          Execute with confidence.
        </p>

        <p className="text-sm mb-12 fade-up" style={{ color: "var(--text-muted)", animationDelay: "120ms" }}>
          Not a reminder app. An execution system.
        </p>

        <div className="flex items-center gap-3 fade-up" style={{ animationDelay: "160ms" }}>
          <Link href="/demo" className="btn-primary px-8 py-3 text-sm flex items-center gap-2">
            See it in action
            <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard" className="btn-ghost px-8 py-3 text-sm">
            Open Dashboard
          </Link>
        </div>
        <p className="text-xs mt-4 fade-up" style={{ color: "var(--text-muted)", animationDelay: "200ms" }}>
          Free to start · No credit card
        </p>
      </section>

      {/* Feature strip */}
      <section style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x">
          {[
            {
              icon: <Shield size={18} style={{ color: "var(--amber)" }} />,
              title: "Risk Before It Happens",
              desc: "Every task gets a live failure probability based on your real free time — not guesses.",
            },
            {
              icon: <Clock size={18} style={{ color: "var(--blue)" }} />,
              title: "Simulate Your Future",
              desc: "Act now vs delay. See the exact probability difference before you decide.",
            },
            {
              icon: <Activity size={18} style={{ color: "var(--green)" }} />,
              title: "Adapt Autonomously",
              desc: "Background agent monitors, reschedules, and intervenes before deadlines are missed.",
            },
          ].map((f, i) => (
            <div key={i} className="p-10" style={{ borderColor: "var(--border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
