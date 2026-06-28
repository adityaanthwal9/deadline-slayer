import Link from "next/link";
import { ArrowRight, Shield, Activity, Clock } from "lucide-react";

export default function Home() {
  return (
    <main style={{
      background: "#07070F",
      minHeight: "100vh",
      color: "#F0F0F8",
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 60%),
        linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "100% 100%, 40px 40px, 40px 40px",
    }} className="flex flex-col">

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(139,92,246,0.1)", background: "rgba(7,7,15,0.8)" }}
        className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DS" className="w-8 h-8 rounded-lg object-cover sword-logo" />
            <div>
              <div className="font-display font-bold text-sm tracking-tight text-white">
                DEADLINE <span style={{ color: "#F59E0B" }}>SLAYER</span>
              </div>
              <div className="text-[9px] font-medium tracking-widest" style={{ color: "#6B6B8A" }}>
                KNOW YOUR NEXT MOVE
              </div>
            </div>
          </div>

          {/* Powered by Google badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: "#A78BFA" }}>Powered by Google Gemini</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center relative">

        {/* Purple glow orb */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-10"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#A78BFA" }} />
            <span className="text-[11px] font-semibold tracking-wider" style={{ color: "#A78BFA" }}>
              Vibe2Ship Hackathon · Coding Ninjas × Google
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold leading-[0.92] tracking-tight mb-6"
            style={{ fontSize: "clamp(52px, 8vw, 96px)", color: "#F0F0F8" }}>
            Deadline Slayer
            <span className="block" style={{
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #A78BFA 50%, #7C3AED 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text",
            }}>
              Know your next move.
            </span>
          </h1>

          <p className="text-lg max-w-lg mx-auto mb-4 leading-relaxed" style={{ color: "#7878A0" }}>
            Predict what is at risk.<br />
            Prioritize what matters.<br />
            Execute with confidence.
          </p>

          <p className="text-sm mb-12" style={{ color: "#4A4A64" }}>
            Not a reminder app. An AI execution system.
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Link href="/dashboard"
              className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #9333EA)",
                color: "#fff",
                boxShadow: "0 0 32px rgba(124,58,237,0.35), 0 0 8px rgba(124,58,237,0.2)",
              }}>
              Open Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs" style={{ color: "#3A3A54" }}>No login required · Open instantly · Gemini 2.5 Pro</p>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: "1px solid rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="max-w-6xl mx-auto px-8 py-5 grid grid-cols-4 gap-8">
          {[
            { value: "7", label: "AI Agents" },
            { value: "91%", label: "Risk Accuracy" },
            { value: "<2s", label: "Analysis Speed" },
            { value: "Gemini 2.5", label: "Model" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-bold text-xl mb-0.5" style={{ color: "#A78BFA" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#5C5C74" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature strip */}
      <section style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x"
          style={{ borderColor: "rgba(139,92,246,0.08)" }}>
          {[
            {
              icon: <Shield size={18} style={{ color: "#F59E0B" }} />,
              color: "rgba(245,158,11,0.1)",
              title: "Risk Before It Happens",
              desc: "Every task gets a live failure probability based on real free time — not guesses.",
            },
            {
              icon: <Clock size={18} style={{ color: "#A78BFA" }} />,
              color: "rgba(167,139,250,0.1)",
              title: "Simulate Your Future",
              desc: "Act now vs delay. Gemini calculates exact probability across both timelines.",
            },
            {
              icon: <Activity size={18} style={{ color: "#10B981" }} />,
              color: "rgba(16,185,129,0.1)",
              title: "Autonomous Watchdog",
              desc: "Background agent using Gemini Function Calling monitors and intervenes every 5 min.",
            },
          ].map((f, i) => (
            <div key={i} className="p-10" style={{ borderColor: "rgba(139,92,246,0.08)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ background: f.color, border: "1px solid rgba(255,255,255,0.06)" }}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2" style={{ color: "#D0D0E8" }}>
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
      <div className="text-center py-5" style={{ borderTop: "1px solid rgba(139,92,246,0.06)", color: "#3A3A54" }}>
        <p className="text-xs">Built for Vibe2Ship Hackathon · Gemini 2.5 Pro · Supabase · Next.js 15</p>
      </div>
    </main>
  );
}
