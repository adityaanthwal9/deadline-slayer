import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { parseNaturalLanguageTask } from '@/lib/gemini-functions';

// POST /api/parse-task
// Input: { text: "Submit report by Sunday 5pm, takes 3 hours" }
// Output: structured task object ready to insert
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  try {
    const parsed = await parseNaturalLanguageTask(text, profile);
    return NextResponse.json({ task: parsed });
  } catch (err) {
    console.error('Parse error:', err);
    return NextResponse.json({ error: 'Failed to parse task' }, { status: 500 });
  }
}
