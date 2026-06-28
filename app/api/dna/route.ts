import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateDeadlineDNA } from '@/lib/gemini-functions';
import type { Task } from '@/types';

const DEFAULT_PROFILE = {
  clerk_user_id: 'demo-user', name: 'Demo User', email: 'judge@demo.com',
  wake_time: '07:00', sleep_time: '23:00', work_start: '09:00', work_end: '18:00',
  energy_morning: 8, energy_afternoon: 6, energy_night: 4, productivity_score: 75,
};

export async function GET() {
  const userId = 'demo-user';
  const supabase = createServiceClient();

  const { data: cached } = await supabase.from('ai_analyses').select('*')
    .eq('user_id', userId).eq('analysis_type', 'deadline_dna')
    .order('created_at', { ascending: false }).limit(1).single();

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    if (age < 60 * 60 * 1000) return NextResponse.json({ dna: cached.output_data, cached: true });
  }

  const [{ data: tasks }, { data: profileData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  const profile = profileData || DEFAULT_PROFILE;

  if (!tasks || tasks.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 tasks', insufficient_data: true });
  }

  try {
    const dna = await generateDeadlineDNA(tasks as Task[], profile);
    await supabase.from('ai_analyses').insert({
      user_id: userId, analysis_type: 'deadline_dna',
      input_data: { total_tasks: tasks.length }, output_data: dna,
    });
    return NextResponse.json({ dna, cached: false });
  } catch (err: any) {
    console.error('DNA generation error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'DNA generation failed' }, { status: 500 });
  }
}
