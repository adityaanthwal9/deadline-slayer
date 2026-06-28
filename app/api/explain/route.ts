import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { task } = await req.json();
  if (!task) return NextResponse.json({ error: 'Task required' }, { status: 400 });

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 1 } as any,
    });

    const hoursLeft = task.deadline
      ? Math.max(0, (new Date(task.deadline).getTime() - Date.now()) / 3600000)
      : null;

    const prompt = `You are an AI risk analyst. Explain exactly why this task is at risk.
Task: ${JSON.stringify({
  title: task.title,
  deadline: task.deadline,
  estimated_hours: task.estimated_hours,
  risk_score: task.risk_score,
  procrastination_count: task.procrastination_count,
  category: task.category,
})}
Hours remaining until deadline: ${hoursLeft !== null ? Math.round(hoursLeft) : 'unknown'}
Time deficit: ${hoursLeft !== null ? (hoursLeft - task.estimated_hours).toFixed(1) + ' hours' : 'unknown'}

Return JSON only, no markdown:
{
  "why_risky": "2 sentences explaining the specific risk using the actual numbers",
  "data_used": ["key data point 1", "key data point 2", "key data point 3"],
  "confidence": <number 80-99>,
  "immediate_recommendation": "one specific action to take in the next 30 minutes",
  "if_delayed_consequence": "what specifically happens if not started today"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(text));

  } catch (err: any) {
    const isQuota = err?.message?.includes('429') || err?.message?.includes('quota');
    if (isQuota) {
      return NextResponse.json({ error: 'quota', message: 'Quota reached. Try again in a minute.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Explanation failed' }, { status: 500 });
  }
}
