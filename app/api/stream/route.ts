import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServiceClient } from '@/lib/supabase';
import type { Task } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Server-Sent Events — streams Gemini token by token
// No more spinners. Judges see AI "thinking live"
export async function POST(req: NextRequest) {
  const userId = 'demo-user';

  const { type, payload } = await req.json();
  const supabase = createServiceClient();

  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'completed'),
    supabase.from('user_profiles').select('*').eq('clerk_user_id', userId).single(),
  ]);

  if (!profile) return new Response('Profile not found', { status: 404 });
  const activeTasks = (tasks || []) as Task[];

  let prompt = '';

  if (type === 'daily_brief') {
    const critical = activeTasks.filter(t => t.risk_level === 'critical' || t.risk_level === 'high');
    prompt = `You are JARVIS — an AI Chief of Staff. Generate a sharp morning briefing for ${profile.name}.

Active tasks: ${activeTasks.length}
At-risk tasks: ${critical.map(t => `${t.title} (${t.risk_score}% risk, due: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'no deadline'})`).join('; ')}
Time: ${new Date().toLocaleTimeString()}
Current energy: ${new Date().getHours() < 12 ? profile.energy_morning : new Date().getHours() < 17 ? profile.energy_afternoon : profile.energy_night}

Write the briefing:
• Sharp greeting (1 line)
• Today's mission (1 line)  
• 2-3 specific risk callouts with numbers
• 3 concrete next actions
• One-line verdict

Direct, specific, JARVIS-like. Use real task names.`;

  } else if (type === 'chat') {
    const { message } = payload;
    prompt = `You are AI Chief of Staff for ${profile.name}. Answer directly.

Their tasks: ${activeTasks.slice(0, 8).map(t => `${t.title} (${t.risk_score}% risk)`).join('; ')}

Question: "${message}"

Be concise, use their actual data, max 120 words.`;

  } else if (type === 'quick_advice') {
    const { task_title, task_risk } = payload;
    prompt = `Give brutally honest 3-step advice for: "${task_title}" (current risk: ${task_risk}%)
User: ${profile.name}. Be direct, specific, max 80 words. No fluff.`;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-latest' });
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
