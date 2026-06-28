import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const DEFAULT_PROFILE = {
  name: 'Commander', energy_morning: 8, energy_afternoon: 6,
  work_start: '09:00', work_end: '18:00',
};

async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 1 } as any,
  });
  const result = await model.generateContent(prompt);
  return result.response.text()
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function POST() {
  const userId = 'demo-user';
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profileData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed').neq('status', 'cancelled'),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  const profile = profileData || DEFAULT_PROFILE;
  const activeTasks = (tasks || []).sort((a: any, b: any) => b.risk_score - a.risk_score);

  if (activeTasks.length === 0) {
    return NextResponse.json({
      brief: {
        success_probability: 100,
        biggest_threat: null,
        biggest_threat_reason: '',
        key_risk_factor: 'No active missions.',
        recommended_order: [],
        focus_hours: 0,
        expected_success: 100,
        executive_insight: 'No active missions. Add tasks to receive your AI executive briefing.',
        stages_completed: 4,
        risk_analysis: [],
      }
    });
  }

  const taskSummary = activeTasks.slice(0, 8).map((t: any) => ({
    id: t.id,
    title: t.title,
    deadline: t.deadline,
    estimated_hours: t.estimated_hours,
    risk_score: t.risk_score,
    procrastination_count: t.procrastination_count,
    category: t.category,
    status: t.status,
  }));

  try {
    // ── Stage 1: Risk Analysis ─────────────────────────────
    const riskText = await callGemini(`Analyze these tasks for risk. Return JSON only, no markdown.
Tasks: ${JSON.stringify(taskSummary)}
Return: { "risk_analysis": [{ "task_id": "string", "risk_factors": ["factor1","factor2"], "urgency": "critical|high|medium|low" }] }`);
    const riskResult = JSON.parse(riskText);

    // ── Stage 2: Success Probability ───────────────────────
    const probText = await callGemini(`Calculate mission success probability. Return JSON only.
Tasks (top 5): ${JSON.stringify(taskSummary.slice(0, 5))}
Risk data: ${JSON.stringify(riskResult.risk_analysis?.slice(0, 5))}
Return: { "current_probability": <number 0-100>, "key_risk_factor": "main reason in under 20 words" }`);
    const probResult = JSON.parse(probText);

    // ── Stage 3: Execution Order ───────────────────────────
    const orderText = await callGemini(`Create optimal task execution order. Return JSON only.
Tasks: ${JSON.stringify(taskSummary.slice(0, 6))}
Return: { "recommended_order": [{ "rank": 1, "task_id": "string", "title": "string", "reasoning": "string under 15 words", "estimated_hours": 2, "risk_score": 91 }], "total_focus_hours": 8, "expected_success_if_followed": 87 }`);
    const orderResult = JSON.parse(orderText);

    // ── Stage 4: Executive Insight ─────────────────────────
    const insightText = await callGemini(`Write a one-sentence executive insight for this commander. Return JSON only.
Current success probability: ${probResult.current_probability}%
Top risk task: ${activeTasks[0]?.title}
Expected success if plan followed: ${orderResult.expected_success_if_followed}%
All tasks count: ${activeTasks.length}
Return: { "insight": "one powerful motivating sentence referencing specific data", "biggest_threat_title": "exact task name", "biggest_threat_reason": "specific reason in under 12 words" }`);
    const insightResult = JSON.parse(insightText);

    return NextResponse.json({
      brief: {
        success_probability: probResult.current_probability ?? 60,
        key_risk_factor: probResult.key_risk_factor ?? '',
        biggest_threat: insightResult.biggest_threat_title ?? activeTasks[0]?.title,
        biggest_threat_reason: insightResult.biggest_threat_reason ?? '',
        recommended_order: orderResult.recommended_order ?? [],
        focus_hours: orderResult.total_focus_hours ?? activeTasks.reduce((a: number, t: any) => a + (t.estimated_hours || 1), 0),
        expected_success: orderResult.expected_success_if_followed ?? (probResult.current_probability + 15),
        executive_insight: insightResult.insight ?? '',
        stages_completed: 4,
        risk_analysis: riskResult.risk_analysis ?? [],
      }
    });

  } catch (err: any) {
    const isQuota = err?.message?.includes('429') || err?.message?.includes('quota');
    if (isQuota) {
      return NextResponse.json({
        error: 'quota',
        message: 'Gemini quota reached. Cached analysis shown. Please retry in a few minutes.'
      }, { status: 429 });
    }
    console.error('Brief generation error:', err?.message);
    return NextResponse.json({ error: 'Brief generation failed' }, { status: 500 });
  }
}
