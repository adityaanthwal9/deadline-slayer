import Link from "next/link";
import { ArrowRight, Shield, Activity, Clock, Zap } from "lucide-react";

export default function Home() {
  return (
    <main style={{ background: "#08080E", minHeight: "100vh", color: "#F0F0F8" }} className="flex flex-col">

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,14,0.85)" }}
        className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DS" className="w-8 h-8 rounded-lg object-cover sword-logo" />
            <div>
              <div className="font-display font-bold text-sm tracking-tight" style={{ color: "#F0F0F8" }}>
                DEADLINE <span style={{ color: "#F59E0B" }}>SLAYER</span>
              </div>
              <div className="text-[9px] font-medium tracking-widest" style={{ color: "#5C5C74" }}>
                KNOW YOUR NEXT MOVE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"
              className="text-xs px-4 py-2 rounded-md font-medium transition-all"
              style={{ color: "#9898B0", border: "1px solid rgba(255,255,255,0.08)" }}>
              Open App
            </Link>
            <Link href="/dashboard"
              className="text-xs px-4 py-2 rounded-md font-semibold transition-all"
              style={{ background: "#F59E0B", color: "#000" }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center relative overflow-hidden">
        {/* Glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, background: "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-10"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider" style={{ color: "#F59E0B" }}>
            Vibe2Ship Hackathon · Powered by Gemini 2.5 Pro
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold leading-[0.92] tracking-tight mb-6"
          style={{ fontSize: "clamp(52px, 8vw, 96px)", color: "#F0F0F8" }}>
          Deadline Slayer
          <span className="block" style={{ color: "#F59E0B" }}>Know your next move.</span>
        </h1>

        <p className="text-lg max-w-lg mx-auto mb-4 leading-relaxed" style={{ color: "#7878A0" }}>
          Predict what is at risk.<br />
          Prioritize what matters.<br />
          Execute with confidence.
        </p>

        <p className="text-sm mb-12" style={{ color: "#4A4A64" }}>
          Not a reminder app. An execution system.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard"
            className="flex items-center gap-2 px-8 py-3 rounded-md text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "#F59E0B", color: "#000", boxShadow: "0 0 24px rgba(245,158,11,0.25)" }}>
            Open Dashboard
            <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard"
            className="px-8 py-3 rounded-md text-sm font-medium transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9898B0" }}>
            See Demo
          </Link>
        </div>
        <p className="text-xs" style={{ color: "#3A3A54" }}>No login required · Open instantly</p>
      </section>

      {/* Feature strip */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {[
            {
              icon: <Shield size={18} style={{ color: "#F59E0B" }} />,
              title: "Risk Before It Happens",
              desc: "Every task gets a live failure probability based on your real free time — not guesses.",
            },
            {
              icon: <Clock size={18} style={{ color: "#6366F1" }} />,
              title: "Simulate Your Future",
              desc: "Act now vs delay. See the exact probability difference before you decide.",
            },
            {
              icon: <Activity size={18} style={{ color: "#10B981" }} />,
              title: "Adapt Autonomously",
              desc: "Background agent monitors, reschedules, and intervenes before deadlines are missed.",
            },
          ].map((f, i) => (
            <div key={i} className="p-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2" style={{ color: "#E0E0F0" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5C5C74" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#3A3A54" }}>
        <p className="text-xs">Built for Vibe2Ship Hackathon · Gemini 2.5 Pro · Supabase · Next.js 15</p>
      </div>
    </main>
  );
}
