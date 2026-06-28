import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { analyzeTaskRisks, generateDailyBrief, runLifeSimulation, negotiateTasks } from '@/lib/gemini';
import type { Task } from '@/types';

const DEFAULT_PROFILE = {
  clerk_user_id: 'demo-user', name: 'Demo User', email: 'judge@demo.com',
  wake_time: '07:00', sleep_time: '23:00', work_start: '09:00', work_end: '18:00',
  energy_morning: 8, energy_afternoon: 6, energy_night: 4, productivity_score: 75,
};

export async function POST(req: NextRequest) {
  const userId = 'demo-user';
  const { type, payload } = await req.json();
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profileData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed').neq('status', 'cancelled'),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  const profile = profileData || DEFAULT_PROFILE;
  const activeTasks = (tasks || []) as Task[];

  try {
    let result;
    switch (type) {
      case 'risk_scan': {
        const analyses = await analyzeTaskRisks(activeTasks, profile);
        for (const a of analyses) {
          await supabase.from('tasks').update({
            risk_score: a.risk_score, risk_level: a.risk_level,
            ai_recommendation: a.recommendation, updated_at: new Date().toISOString(),
          }).eq('id', a.task_id);
        }
        result = { analyses };
        break;
      }
      case 'daily_brief': {
        const analyses = await analyzeTaskRisks(activeTasks, profile);
        const brief = await generateDailyBrief(activeTasks, profile, analyses);
        await supabase.from('ai_analyses').insert({
          user_id: userId, analysis_type: 'daily_brief',
          input_data: { task_count: activeTasks.length }, output_data: brief,
        });
        result = { brief };
        break;
      }
      case 'simulate': {
        const { task_id } = payload;
        const focusTask = activeTasks.find(t => t.id === task_id);
        if (!focusTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        const simulation = await runLifeSimulation(focusTask, activeTasks, profile);
        result = { simulation };
        break;
      }
      case 'negotiate': {
        const { constraint } = payload;
        const negotiation = await negotiateTasks(activeTasks, constraint, profile);
        result = { negotiation };
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Gemini analysis error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'AI analysis failed' }, { status: 500 });
  }
}
