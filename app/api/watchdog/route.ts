import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { runAgentLoop } from '@/lib/gemini-functions';
import type { Task } from '@/types';

// POST /api/watchdog — runs the autonomous agent loop
// Called every 5 min by useWatchdog hook
// AI uses Function Calling to decide which actions to take
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed').neq('status', 'cancelled'),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const activeTasks = (tasks || []) as Task[];
  if (activeTasks.length === 0) {
    return NextResponse.json({ actions: [], summary: 'No active tasks to monitor', critical_count: 0, interventions: 0 });
  }

  try {
    // Run the Gemini Function Calling agent loop
    const result = await runAgentLoop(activeTasks, profile);

    // Execute the actions the AI decided to take
    for (const action of result.actions) {
      switch (action.type) {
        case 'flag_critical': {
          const d = action.data as { risk_score: number; reason: string };
          await supabase
            .from('tasks')
            .update({
              risk_score: d.risk_score,
              risk_level: d.risk_score >= 80 ? 'critical' : 'high',
              ai_recommendation: d.reason,
              updated_at: new Date().toISOString(),
            })
            .eq('id', action.task_id)
            .eq('user_id', userId);
          break;
        }

        case 'reschedule': {
          const d = action.data as { suggested_start: string; suggested_end: string; reason: string };
          const todayStr = new Date().toISOString().split('T')[0];
          // Update the existing schedule block or create a new one
          await supabase.from('schedule_blocks').upsert({
            user_id: userId,
            task_id: action.task_id,
            title: `Rescheduled by AI`,
            block_type: 'work',
            start_time: `${todayStr}T${d.suggested_start}:00`,
            end_time: `${todayStr}T${d.suggested_end}:00`,
            is_ai_generated: true,
            notes: `AI Watchdog: ${d.reason}`,
          });
          break;
        }

        case 'intervention': {
          const d = action.data as { message: string; urgency: string };
          // Log the intervention
          await supabase.from('procrastination_logs').insert({
            user_id: userId,
            task_id: action.task_id,
            detected_at: new Date().toISOString(),
            ai_intervention: d.message,
          });
          // Update task procrastination count
          await supabase.rpc('increment_procrastination', { task_id: action.task_id }).catch(() => {
            // fallback if RPC doesn't exist
            supabase
              .from('tasks')
              .select('procrastination_count')
              .eq('id', action.task_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  supabase
                    .from('tasks')
                    .update({ procrastination_count: (data.procrastination_count || 0) + 1 })
                    .eq('id', action.task_id);
                }
              });
          });
          break;
        }
      }
    }

    // Store watchdog run in ai_analyses
    await supabase.from('ai_analyses').insert({
      user_id: userId,
      analysis_type: 'watchdog_run',
      input_data: { task_count: activeTasks.length },
      output_data: result,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Watchdog error:', err);
    return NextResponse.json({ error: 'Agent loop failed' }, { status: 500 });
  }
}

// GET /api/watchdog — get last watchdog run result
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .eq('analysis_type', 'watchdog_run')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ last_run: data });
}
