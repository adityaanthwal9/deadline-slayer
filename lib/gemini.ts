import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  Task,
  UserProfile,
  TaskRiskAnalysis,
  DailyBrief,
  ScheduleOptimization,
  LifeSimulation,
  NegotiationResult,
} from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
}

async function callGemini(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function safeParseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean) as T;
}

// ============================================
// AGENT 1: Task Risk Analyzer
// Determines risk score for each task
// ============================================
export async function analyzeTaskRisks(
  tasks: Task[],
  profile: UserProfile
): Promise<TaskRiskAnalysis[]> {
  const now = new Date();
  const tasksWithContext = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .map(t => {
      const deadline = t.deadline ? new Date(t.deadline) : null;
      const hoursUntilDeadline = deadline
        ? Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
        : 999;
      const availableHours = calculateAvailableHours(profile, hoursUntilDeadline);
      return {
        id: t.id,
        title: t.title,
        estimated_hours: t.estimated_hours,
        actual_hours: t.actual_hours,
        hours_until_deadline: Math.round(hoursUntilDeadline),
        available_hours: availableHours,
        procrastination_count: t.procrastination_count,
        priority: t.priority,
        category: t.category,
      };
    });

  const prompt = `You are a Task Risk Analyzer AI. Analyze each task and return a precise risk assessment.

User context:
- Work hours: ${profile.work_start} to ${profile.work_end}
- Energy: Morning=${profile.energy_morning}, Afternoon=${profile.energy_afternoon}, Night=${profile.energy_night}
- Current productivity score: ${profile.productivity_score}/100

Tasks to analyze:
${JSON.stringify(tasksWithContext, null, 2)}

For each task, calculate:
- risk_score (0-100): Higher = more likely to miss deadline
  Formula hint: Consider (hours_remaining / estimated_hours), procrastination count, and priority
- risk_level: "low" (<30), "medium" (30-60), "high" (60-80), "critical" (>80)
- time_deficit_hours: available_hours - estimated_hours (negative means NOT enough time)
- A specific, actionable recommendation (1-2 sentences, direct and urgent)

Return ONLY valid JSON (no markdown):
{
  "analyses": [
    {
      "task_id": "string",
      "risk_score": number,
      "risk_level": "low|medium|high|critical",
      "reasoning": "string",
      "time_deficit_hours": number,
      "recommendation": "string",
      "urgency_multiplier": number
    }
  ]
}`;

  const response = await callGemini(prompt);
  const parsed = safeParseJSON<{ analyses: TaskRiskAnalysis[] }>(response);
  return parsed.analyses;
}

// ============================================
// AGENT 2: Daily Commander (Morning Brief)
// Generates personalized mission briefing
// ============================================
export async function generateDailyBrief(
  tasks: Task[],
  profile: UserProfile,
  riskAnalyses: TaskRiskAnalysis[]
): Promise<DailyBrief> {
  const pendingTasks = tasks.filter(
    t => t.status === 'pending' || t.status === 'in_progress'
  );
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const prompt = `You are an AI Chief of Staff — think JARVIS meets a brutally honest executive coach.
Generate a personalized daily briefing for ${profile.name}.

Time of day: ${timeOfDay}
Pending tasks: ${pendingTasks.length}
Risk analyses: ${JSON.stringify(riskAnalyses, null, 2)}

Task details:
${JSON.stringify(pendingTasks.map(t => ({ id: t.id, title: t.title, deadline: t.deadline, status: t.status })), null, 2)}

Generate a briefing that:
1. Feels like a JARVIS mission briefing — direct, no fluff
2. Identifies THE most important task right now
3. Calls out the highest risk items with urgency
4. Gives a clear mission for today
5. Ends with a motivational note that's real, not generic

Return ONLY valid JSON (no markdown):
{
  "greeting": "Good ${timeOfDay}, ${profile.name}.",
  "mission_statement": "string (1 sentence, what today's mission is)",
  "top_task": { "id": "string", "title": "string" },
  "top_task_reason": "string (why this task is #1 today, be specific)",
  "risk_alerts": [
    {
      "task_id": "string",
      "task_title": "string",
      "risk_level": "high|critical",
      "message": "string (specific warning, e.g. 'You need 8 hours but only have 3 free')"
    }
  ],
  "daily_schedule_summary": "string (brief overview of what the day should look like)",
  "motivational_note": "string (1-2 sentences, real and direct)"
}`;

  const response = await callGemini(prompt);
  return safeParseJSON<DailyBrief>(response);
}

// ============================================
// AGENT 3: Schedule Optimizer
// Creates optimal time blocks for the day
// ============================================
export async function generateOptimalSchedule(
  tasks: Task[],
  profile: UserProfile,
  fixedEvents: Array<{ title: string; start: string; end: string }>
): Promise<ScheduleOptimization> {
  const pendingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => b.risk_score - a.risk_score);

  const prompt = `You are a Schedule Optimizer AI. Create an optimal daily schedule.

User schedule constraints:
- Wake up: ${profile.wake_time}
- Sleep: ${profile.sleep_time}
- Work hours: ${profile.work_start} - ${profile.work_end}
- Energy levels: Morning=${profile.energy_morning}, Afternoon=${profile.energy_afternoon}, Night=${profile.energy_night}

Fixed events today (cannot move):
${JSON.stringify(fixedEvents, null, 2)}

Pending tasks (sorted by risk, highest first):
${JSON.stringify(pendingTasks.map(t => ({
  id: t.id,
  title: t.title,
  estimated_hours: t.estimated_hours,
  risk_score: t.risk_score,
  deadline: t.deadline,
  category: t.category,
})), null, 2)}

Rules:
1. Schedule highest-risk tasks during peak energy hours
2. Don't overload — include 15-min breaks every 90 mins
3. Leave buffer time before deadlines
4. High-focus tasks go in high-energy slots
5. Administrative/easy tasks go in low-energy slots

Return ONLY valid JSON (no markdown):
{
  "blocks": [
    {
      "task_id": "string or null for breaks",
      "title": "string",
      "block_type": "work|break|fixed|buffer",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "reason": "string (why this task at this time)"
    }
  ],
  "optimization_notes": "string (overall strategy explanation)",
  "total_focus_hours": number
}`;

  const response = await callGemini(prompt);
  return safeParseJSON<ScheduleOptimization>(response);
}

// ============================================
// AGENT 4: Life Simulation Engine
// The SECRET WEAPON — simulates future scenarios
// ============================================
export async function runLifeSimulation(
  focusTask: Task,
  allTasks: Task[],
  profile: UserProfile
): Promise<LifeSimulation> {
  const prompt = `You are a Life Simulation AI. Simulate two future scenarios for ${profile.name}.

Focus task: ${JSON.stringify({
  title: focusTask.title,
  deadline: focusTask.deadline,
  estimated_hours: focusTask.estimated_hours,
  risk_score: focusTask.risk_score,
  procrastination_count: focusTask.procrastination_count,
}, null, 2)}

Other pending tasks: ${allTasks.filter(t => t.id !== focusTask.id && t.status !== 'completed').map(t => t.title).join(', ')}

Simulate with psychological realism:
- Scenario A: User starts the task RIGHT NOW
- Scenario B: User delays by another day

For each scenario, calculate SUCCESS PROBABILITY (0-100%) based on:
- Time remaining vs estimated hours
- Historical procrastination pattern
- Impact on other tasks
- Real-world consequences

Be specific and brutally honest. Don't sugarcoat Scenario B.

Return ONLY valid JSON (no markdown):
{
  "scenario_a": {
    "label": "Act Now",
    "action": "string (what happens if they start now)",
    "success_probability": number,
    "outcomes": ["string", "string", "string"],
    "consequence_if_not_done": "string"
  },
  "scenario_b": {
    "label": "Delay Again",
    "action": "string (what happens if they delay)",
    "success_probability": number,
    "outcomes": ["string", "string", "string"],
    "consequence_if_not_done": "string"
  },
  "recommendation": "string (clear directive from AI)",
  "ai_verdict": "string (1 punchy sentence the user will remember)"
}`;

  const response = await callGemini(prompt);
  return safeParseJSON<LifeSimulation>(response);
}

// ============================================
// AGENT 4B: AI Negotiator
// When user can't complete everything
// ============================================
export async function negotiateTasks(
  tasks: Task[],
  constraint: string,
  profile: UserProfile
): Promise<NegotiationResult> {
  const prompt = `You are an AI Negotiator. The user has too many tasks and needs help deciding what to do.

User: ${profile.name}
Constraint/Problem: ${constraint}

Tasks on the table:
${JSON.stringify(tasks.map(t => ({
  title: t.title,
  deadline: t.deadline,
  estimated_hours: t.estimated_hours,
  risk_score: t.risk_score,
  priority: t.priority,
  category: t.category,
})), null, 2)}

Make tough decisions. For each task, decide:
- "complete": Must do, high stakes
- "delegate": Can be handed off
- "reschedule": Move deadline, low immediate consequence
- "skip": Drop entirely, lowest value

Be like a ruthless but smart Chief of Staff. Protect the most important outcomes.

Return ONLY valid JSON (no markdown):
{
  "analysis": "string (overall situation assessment)",
  "decisions": [
    {
      "task_title": "string",
      "decision": "complete|delegate|reschedule|skip",
      "reason": "string",
      "impact": "string"
    }
  ],
  "final_plan": "string (the clear action plan in 2-3 sentences)"
}`;

  const response = await callGemini(prompt);
  return safeParseJSON<NegotiationResult>(response);
}

// ============================================
// HELPER: Calculate available free hours
// ============================================
function calculateAvailableHours(profile: UserProfile, hoursUntilDeadline: number): number {
  // Rough estimate: free hours = hours until deadline minus work/sleep time
  const workHoursPerDay = calculateWorkHours(profile.work_start, profile.work_end);
  const sleepHours = 8;
  const freeHoursPerDay = 24 - workHoursPerDay - sleepHours;
  const daysUntilDeadline = hoursUntilDeadline / 24;
  // Available = work hours + evening free hours
  return Math.round(daysUntilDeadline * (workHoursPerDay * 0.3 + freeHoursPerDay * 0.7));
}

function calculateWorkHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}
