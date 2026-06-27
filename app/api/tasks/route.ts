import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { analyzeTaskRisks } from '@/lib/gemini';
import type { Task } from '@/types';

// GET /api/tasks - fetch all tasks for current user
export async function GET() {
  const userId = 'demo-user';

  const supabase = createServiceClient();
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks });
}

// POST /api/tasks - create a task
export async function POST(req: NextRequest) {
  const userId = 'demo-user';

  const body = await req.json();
  const supabase = createServiceClient();

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...body, user_id: userId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger async risk analysis (non-blocking)
  triggerRiskAnalysis(userId, supabase).catch(console.error);

  return NextResponse.json({ task }, { status: 201 });
}

// PATCH /api/tasks - update a task
export async function PATCH(req: NextRequest) {
  const userId = 'demo-user';

  const body = await req.json();
  const { id, ...updates } = body;
  const supabase = createServiceClient();

  const { data: task, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task });
}

// DELETE /api/tasks
export async function DELETE(req: NextRequest) {
  const userId = 'demo-user';

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Helper: Re-analyze all task risks after any mutation
async function triggerRiskAnalysis(userId: string, supabase: ReturnType<typeof createServiceClient>) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'completed')
    .neq('status', 'cancelled');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!tasks || !profile || tasks.length === 0) return;

  const analyses = await analyzeTaskRisks(tasks as Task[], profile);

  // Update risk scores in DB
  for (const analysis of analyses) {
    await supabase
      .from('tasks')
      .update({
        risk_score: analysis.risk_score,
        risk_level: analysis.risk_level,
        ai_recommendation: analysis.recommendation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysis.task_id);
  }
}
