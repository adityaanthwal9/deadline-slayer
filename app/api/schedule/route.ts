import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateOptimalSchedule } from '@/lib/gemini';
import type { Task } from '@/types';

const DEFAULT_PROFILE = {
  clerk_user_id: 'demo-user', name: 'Demo User', email: 'judge@demo.com',
  wake_time: '07:00', sleep_time: '23:00', work_start: '09:00', work_end: '18:00',
  energy_morning: 8, energy_afternoon: 6, energy_night: 4, productivity_score: 75,
};

export async function POST(req: NextRequest) {
  const userId = 'demo-user';
  const { fixed_events = [] } = await req.json();
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profileData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed').neq('status', 'cancelled').order('risk_score', { ascending: false }),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  const profile = profileData || DEFAULT_PROFILE;

  try {
    const schedule = await generateOptimalSchedule((tasks || []) as Task[], profile, fixed_events);
    const todayStr = new Date().toISOString().split('T')[0];

    await supabase.from('schedule_blocks').delete().eq('user_id', userId).eq('is_ai_generated', true)
      .gte('start_time', todayStr + 'T00:00:00').lte('start_time', todayStr + 'T23:59:59');

    const blocks = schedule.blocks.map((b: any) => ({
      user_id: userId, task_id: b.task_id || null, title: b.title,
      block_type: b.block_type,
      start_time: todayStr + 'T' + b.start_time + ':00',
      end_time: todayStr + 'T' + b.end_time + ':00',
      is_ai_generated: true, notes: b.reason,
    }));

    const { data: savedBlocks, error } = await supabase.from('schedule_blocks').insert(blocks).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ schedule, blocks: savedBlocks });
  } catch (err: any) {
    console.error('Schedule error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Schedule generation failed' }, { status: 500 });
  }
}

export async function GET() {
  const userId = 'demo-user';
  const supabase = createServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: blocks, error } = await supabase.from('schedule_blocks').select('*, task:tasks(*)')
    .eq('user_id', userId).gte('start_time', todayStr + 'T00:00:00').lte('start_time', todayStr + 'T23:59:59')
    .order('start_time', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks });
}
