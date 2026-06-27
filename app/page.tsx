import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Zap, Brain, Target, TrendingDown, Play, Command, ArrowRight } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-[#0A0A0F] grid-bg flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 glass sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="DS" className="w-10 h-10 rounded-lg object-cover sword-logo" /><span className="font-display font-bold text-lg tracking-tight">Deadline Slayer</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="btn-ghost text-sm flex items-center gap-2">
            <Play size={13} className="text-amber-400" />Live Demo
          </Link>
          <Link href="/sign-in" className="btn-ghost text-sm">Sign In</Link>
          <Link href="/sign-up" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Powered by Gemini 2.5 Pro · Vibe2Ship Hackathon
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] max-w-4xl mb-6 fade-slide-up">
          Your AI Chief of Staff
          <span className="block text-amber-400">Never Miss Again.</span>
        </h1>
        <p className="text-[#9898B0] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed fade-slide-up">
          Not a reminder app. Deadline Slayer{' '}
          <strong className="text-white">predicts which commitments you will fail</strong>{' '}
          before you fail them — and autonomously restructures your schedule to prevent it.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center fade-slide-up">
          <Link href="/demo" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
            <Play size={18} fill="black" />Try Live Demo — No Sign Up
          </Link>
          <Link href="/sign-up" className="btn-ghost text-base px-8 py-3.5 flex items-center gap-2">
            Deploy Your AI Chief of Staff<ArrowRight size={16} />
          </Link>
        </div>
        <p className="text-[#5C5C74] text-sm mt-4">Free to start · No credit card required</p>
      </section>
      <section className="border-t border-white/5 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
        {[
          { icon: <Brain size={20} className="text-amber-400" />, title: 'Risk Score Engine', desc: 'Every task gets a live failure probability. AI calculates time deficit vs your actual free hours.' },
          { icon: <Target size={20} className="text-blue-400" />, title: 'JARVIS Daily Brief', desc: 'Voice-playback mission briefing every morning. One priority, ranked alerts, spoken aloud.' },
          { icon: <TrendingDown size={20} className="text-red-400" />, title: 'Life Simulation', desc: "Act now vs delay — AI runs your future scenarios and shows exactly what you'll lose." },
          { icon: <Command size={20} className="text-green-400" />, title: 'Command Palette', desc: 'Keyboard-first. ⌘K for instant actions. Voice input. Pomodoro focus mode. Zero friction.' },
        ].map((f, i) => (
          <div key={i} className="p-8 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{f.icon}</div>
            <div>
              <div className="font-display font-semibold text-white mb-1">{f.title}</div>
              <div className="text-[#9898B0] text-sm leading-relaxed">{f.desc}</div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
