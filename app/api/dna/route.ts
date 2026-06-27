import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateDeadlineDNA } from '@/lib/gemini-functions';
import type { Task } from '@/types';

export async function GET() {
  const userId = 'demo-user';

  const supabase = createServiceClient();

  // Check cache first — DNA doesn't need to regenerate every time
  const { data: cached } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .eq('analysis_type', 'deadline_dna')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Return cache if less than 1 hour old
  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    if (age < 60 * 60 * 1000) {
      return NextResponse.json({ dna: cached.output_data, cached: true });
    }
  }

  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  if (!tasks || tasks.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 tasks to generate DNA', insufficient_data: true });
  }

  try {
    const dna = await generateDeadlineDNA(tasks as Task[], profile);

    await supabase.from('ai_analyses').insert({
      user_id: userId,
      analysis_type: 'deadline_dna',
      input_data: { total_tasks: tasks.length },
      output_data: dna,
    });

    return NextResponse.json({ dna, cached: false });
  } catch (err) {
    console.error('DNA generation error:', err);
    return NextResponse.json({ error: 'DNA generation failed' }, { status: 500 });
  }
}
