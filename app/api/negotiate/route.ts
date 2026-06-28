import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const DEFAULT_PROFILE = {
  name: 'Commander', energy_morning: 8, energy_afternoon: 6, work_start: '09:00', work_end: '18:00',
};

export async function POST(req: NextRequest) {
  const { constraint } = await req.json();
  if (!constraint) return NextResponse.json({ error: 'Constraint required' }, { status: 400 });

  const userId = 'demo-user';
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profileData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed').neq('status', 'cancelled'),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  const profile = profileData || DEFAULT_PROFILE;
  const activeTasks = (tasks || []).sort((a: any, b: any) => b.risk_score - a.risk_score);

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 1 } as any,
    });

    const prompt = `You are an AI Decision Engine for a productivity system.
The user has a constraint: "${constraint}"

Current active tasks:
${JSON.stringify(activeTasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  deadline: t.deadline,
  estimated_hours: t.estimated_hours,
  risk_score: t.risk_score,
  priority: t.priority,
  category: t.category,
  procrastination_count: t.procrastination_count,
})))}

Analyze ALL tasks against the constraint. Create a strategic plan.
Return JSON only, no markdown:
{
  "constraint_analysis": "1 sentence explaining what the constraint means in context",
  "current_success_probability": <number>,
  "optimized_success_probability": <number>,
  "recommendations": [
    {
      "action": "DO_FIRST|MOVE|DELEGATE|DROP",
      "task_id": "string",
      "task_title": "string",
      "reason": "specific reason under 15 words using task data",
      "expected_outcome": "specific measurable outcome",
      "confidence": <number 75-99>,
      "priority": <number 1-10>
    }
  ],
  "executive_summary": "1 sentence: if you follow this plan, here is what happens"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (err: any) {
    const isQuota = err?.message?.includes('429') || err?.message?.includes('quota');
    if (isQuota) {
      return NextResponse.json({ error: 'quota', message: 'Gemini quota reached. Please retry in a few minutes.' }, { status: 429 });
    }
    console.error('Negotiate error:', err?.message);
    return NextResponse.json({ error: 'Negotiation failed' }, { status: 500 });
  }
}
