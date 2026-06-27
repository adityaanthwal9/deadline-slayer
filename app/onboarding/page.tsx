'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Zap } from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    wake_time: '06:00',
    sleep_time: '23:00',
    work_start: '09:00',
    work_end: '18:00',
    energy_morning: 'high',
    energy_afternoon: 'medium',
    energy_night: 'low',
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.firstName || user?.username || 'User',
          email: user?.emailAddresses[0]?.emailAddress,
          ...form,
        }),
      });
      if (res.ok) router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const energyOptions = [
    { value: 'high', label: '🔥 High Focus', desc: 'Best deep work hours' },
    { value: 'medium', label: '⚡ Medium', desc: 'Meetings, emails' },
    { value: 'low', label: '😴 Low', desc: 'Light tasks only' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" fill="black" />
          </div>
          <span className="font-display font-bold text-lg">Deadline Slayer</span>
        </div>

        <div className="ds-card p-8">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl font-bold mb-1">
                Welcome, {user?.firstName || 'there'} 👋
              </h2>
              <p className="text-[#9898B0] text-sm mb-8">
                Let's set up your profile so the AI can optimize your schedule.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#9898B0] mb-2 block">Wake Up Time</label>
                    <input
                      type="time"
                      value={form.wake_time}
                      onChange={e => update('wake_time', e.target.value)}
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9898B0] mb-2 block">Sleep Time</label>
                    <input
                      type="time"
                      value={form.sleep_time}
                      onChange={e => update('sleep_time', e.target.value)}
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#9898B0] mb-2 block">Work Start</label>
                    <input
                      type="time"
                      value={form.work_start}
                      onChange={e => update('work_start', e.target.value)}
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9898B0] mb-2 block">Work End</label>
                    <input
                      type="time"
                      value={form.work_end}
                      onChange={e => update('work_end', e.target.value)}
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full mt-8"
              >
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl font-bold mb-1">Your Energy Map</h2>
              <p className="text-[#9898B0] text-sm mb-8">
                AI will schedule your hardest tasks during peak energy.
              </p>

              {(['morning', 'afternoon', 'night'] as const).map(period => (
                <div key={period} className="mb-6">
                  <label className="text-sm font-medium capitalize mb-3 block">{period}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {energyOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => update(`energy_${period}`, opt.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          form[`energy_${period}` as keyof typeof form] === opt.value
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-white/8 bg-[#1A1A24] hover:border-white/15'
                        }`}
                      >
                        <div className="text-sm">{opt.label}</div>
                        <div className="text-xs text-[#9898B0] mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Launch Dashboard 🚀'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
