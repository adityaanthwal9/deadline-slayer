import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import {
  analyzeTaskRisks,
  generateDailyBrief,
  runLifeSimulation,
  negotiateTasks,
} from '@/lib/gemini';
import type { Task } from '@/types';

export async function POST(req: NextRequest) {
  const userId = 'demo-user';

  const { type, payload } = await req.json();
  const supabase = createServiceClient();

  // Fetch user data
  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .neq('status', 'cancelled'),
    supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single(),
  ]);

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  const activeTasks = (tasks || []) as Task[];

  try {
    let result;

    switch (type) {
      case 'risk_scan': {
        const analyses = await analyzeTaskRisks(activeTasks, profile);
        // Persist updated risk scores
        for (const a of analyses) {
          await supabase
            .from('tasks')
            .update({
              risk_score: a.risk_score,
              risk_level: a.risk_level,
              ai_recommendation: a.recommendation,
              updated_at: new Date().toISOString(),
            })
            .eq('id', a.task_id);
        }
        result = { analyses };
        break;
      }

      case 'daily_brief': {
        const analyses = await analyzeTaskRisks(activeTasks, profile);
        const brief = await generateDailyBrief(activeTasks, profile, analyses);
        // Store in ai_analyses
        await supabase.from('ai_analyses').insert({
          user_id: userId,
          analysis_type: 'daily_brief',
          input_data: { task_count: activeTasks.length },
          output_data: brief,
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
        return NextResponse.json({ error: 'Unknown analysis type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini analysis error:', err);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
