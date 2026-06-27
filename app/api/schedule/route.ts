import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateOptimalSchedule } from '@/lib/gemini';
import type { Task } from '@/types';

// POST /api/schedule - generate AI schedule for today
export async function POST(req: NextRequest) {
  const userId = 'demo-user';

  const { fixed_events = [] } = await req.json();
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('risk_score', { ascending: false }),
    supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single(),
  ]);

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const schedule = await generateOptimalSchedule(
    (tasks || []) as Task[],
    profile,
    fixed_events
  );

  // Convert time strings to today's timestamps and save to DB
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Delete existing AI blocks for today
  await supabase
    .from('schedule_blocks')
    .delete()
    .eq('user_id', userId)
    .eq('is_ai_generated', true)
    .gte('start_time', `${todayStr}T00:00:00`)
    .lte('start_time', `${todayStr}T23:59:59`);

  // Insert new blocks
  const blocks = schedule.blocks.map(b => ({
    user_id: userId,
    task_id: b.task_id || null,
    title: b.title,
    block_type: b.block_type,
    start_time: `${todayStr}T${b.start_time}:00`,
    end_time: `${todayStr}T${b.end_time}:00`,
    is_ai_generated: true,
    notes: b.reason,
  }));

  const { data: savedBlocks, error } = await supabase
    .from('schedule_blocks')
    .insert(blocks)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule, blocks: savedBlocks });
}

// GET /api/schedule - fetch today's schedule
export async function GET() {
  const userId = 'demo-user';

  const supabase = createServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: blocks, error } = await supabase
    .from('schedule_blocks')
    .select('*, task:tasks(*)')
    .eq('user_id', userId)
    .gte('start_time', `${todayStr}T00:00:00`)
    .lte('start_time', `${todayStr}T23:59:59`)
    .order('start_time', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks });
}
