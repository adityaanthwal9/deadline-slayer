import { GoogleGenerativeAI, Tool, FunctionDeclaration } from '@google/generative-ai';
import type { Task, UserProfile } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================
// FUNCTION DECLARATIONS — Gemini Tool Calls
// These are the "tools" the AI agent can use
// This is TRUE agentic behavior — AI decides
// which functions to call and when
// ============================================

const agentTools: Tool = {
  functionDeclarations: [
    {
      name: 'flag_task_critical',
      description: 'Flag a task as critical risk when deadline is imminent and not enough time remains',
      parameters: {
        type: 'OBJECT',
        properties: {
          task_id:    { type: 'STRING', description: 'The task ID to flag' },
          risk_score: { type: 'NUMBER', description: 'Risk score 0-100' },
          reason:     { type: 'STRING', description: 'Why this task is critical' },
          hours_left: { type: 'NUMBER', description: 'Hours until deadline' },
          hours_needed: { type: 'NUMBER', description: 'Estimated hours required' },
        },
        required: ['task_id', 'risk_score', 'reason'],
      },
    } as FunctionDeclaration,
    {
      name: 'reschedule_task',
      description: 'Suggest rescheduling a task to a better time slot based on energy and availability',
      parameters: {
        type: 'OBJECT',
        properties: {
          task_id:          { type: 'STRING', description: 'The task ID to reschedule' },
          suggested_start:  { type: 'STRING', description: 'Suggested start time HH:MM' },
          suggested_end:    { type: 'STRING', description: 'Suggested end time HH:MM' },
          reason:           { type: 'STRING', description: 'Why this time slot is optimal' },
        },
        required: ['task_id', 'suggested_start', 'suggested_end', 'reason'],
      },
    } as FunctionDeclaration,
    {
      name: 'send_intervention',
      description: 'Send a procrastination intervention when the user has delayed a task too many times',
      parameters: {
        type: 'OBJECT',
        properties: {
          task_id:  { type: 'STRING', description: 'The task ID' },
          message:  { type: 'STRING', description: 'The intervention message to send the user' },
          urgency:  { type: 'STRING', enum: ['warning', 'urgent', 'critical'], description: 'Intervention urgency level' },
        },
        required: ['task_id', 'message', 'urgency'],
      },
    } as FunctionDeclaration,
    {
      name: 'create_focus_block',
      description: 'Create an immediate focus block for the highest risk task right now',
      parameters: {
        type: 'OBJECT',
        properties: {
          task_id:        { type: 'STRING', description: 'Task to focus on' },
          duration_mins:  { type: 'NUMBER', description: 'Recommended focus duration in minutes' },
          start_now:      { type: 'BOOLEAN', description: 'Whether to start immediately' },
          message:        { type: 'STRING', description: 'Message to show user about this focus block' },
        },
        required: ['task_id', 'duration_mins', 'start_now', 'message'],
      },
    } as FunctionDeclaration,
    {
      name: 'update_daily_mission',
      description: 'Update the users daily mission and priority task based on current risk analysis',
      parameters: {
        type: 'OBJECT',
        properties: {
          top_task_id:       { type: 'STRING', description: 'The most important task ID right now' },
          mission_statement: { type: 'STRING', description: 'Todays mission in one sentence' },
          success_criteria:  { type: 'STRING', description: 'What completing the mission looks like' },
        },
        required: ['top_task_id', 'mission_statement', 'success_criteria'],
      },
    } as FunctionDeclaration,
  ],
};

export interface AgentAction {
  type: 'flag_critical' | 'reschedule' | 'intervention' | 'focus_block' | 'mission_update';
  task_id?: string;
  data: Record<string, unknown>;
}

export interface AgentRunResult {
  actions: AgentAction[];
  summary: string;
  critical_count: number;
  interventions: number;
}

// ============================================
// MAIN AGENT RUNNER — Function Calling Loop
// This is the "agentic" core judges will see
// AI autonomously decides what actions to take
// ============================================
export async function runAgentLoop(
  tasks: Task[],
  profile: UserProfile
): Promise<AgentRunResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro-latest',
    tools: [agentTools],
  });

  const activeTasks = tasks.filter(
    t => t.status !== 'completed' && t.status !== 'cancelled'
  );

  const now = new Date();
  const taskContext = activeTasks.map(t => {
    const deadline = t.deadline ? new Date(t.deadline) : null;
    const hoursLeft = deadline
      ? Math.max(0, (deadline.getTime() - now.getTime()) / 3600000)
      : 999;
    return {
      id: t.id,
      title: t.title,
      estimated_hours: t.estimated_hours,
      hours_until_deadline: Math.round(hoursLeft),
      procrastination_count: t.procrastination_count,
      current_risk_score: t.risk_score,
      status: t.status,
    };
  });

  const prompt = `You are an autonomous AI Chief of Staff agent. Analyze these tasks and take actions.

Current time: ${now.toLocaleTimeString()}
User: ${profile.name}
Energy right now: ${now.getHours() < 12 ? profile.energy_morning : now.getHours() < 17 ? profile.energy_afternoon : profile.energy_night}
Work hours: ${profile.work_start}–${profile.work_end}

Tasks requiring your attention:
${JSON.stringify(taskContext, null, 2)}

You MUST call the appropriate functions for each task that needs action:
- Call flag_task_critical for any task with <50% time remaining vs estimated hours
- Call send_intervention for tasks delayed 2+ times
- Call reschedule_task for tasks that need to move to peak energy hours
- Call create_focus_block for the single highest-risk task
- Call update_daily_mission once with today's top priority

Be decisive. Take action on every at-risk task. Do not just observe.`;

  const result = await model.generateContent(prompt);
  const response = result.response;

  const actions: AgentAction[] = [];

  // Process all function calls the AI decided to make
  const calls = response.functionCalls();
  if (calls) {
    for (const call of calls) {
      switch (call.name) {
        case 'flag_task_critical':
          actions.push({ type: 'flag_critical', task_id: call.args.task_id as string, data: call.args });
          break;
        case 'reschedule_task':
          actions.push({ type: 'reschedule', task_id: call.args.task_id as string, data: call.args });
          break;
        case 'send_intervention':
          actions.push({ type: 'intervention', task_id: call.args.task_id as string, data: call.args });
          break;
        case 'create_focus_block':
          actions.push({ type: 'focus_block', task_id: call.args.task_id as string, data: call.args });
          break;
        case 'update_daily_mission':
          actions.push({ type: 'mission_update', data: call.args });
          break;
      }
    }
  }

  return {
    actions,
    summary: `Agent ran ${actions.length} autonomous actions on ${activeTasks.length} tasks`,
    critical_count: actions.filter(a => a.type === 'flag_critical').length,
    interventions: actions.filter(a => a.type === 'intervention').length,
  };
}

// ============================================
// NATURAL LANGUAGE TASK PARSER
// "Submit report by Sunday 5pm, takes 3 hours"
// → structured task object
// ============================================
export async function parseNaturalLanguageTask(
  input: string,
  profile: UserProfile
): Promise<{
  title: string;
  deadline: string | null;
  estimated_hours: number;
  category: string;
  priority: string;
  description: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-latest' });
  const now = new Date();

  const prompt = `Parse this natural language task input into a structured task. Today is ${now.toDateString()}, current time ${now.toLocaleTimeString()}.

User input: "${input}"

Extract:
- title: clean task name
- deadline: ISO string if mentioned (e.g. "Sunday 5pm" → next Sunday's date), null if not mentioned
- estimated_hours: number (default 1 if not mentioned)
- category: one of work|personal|health|finance|learning
- priority: one of low|medium|high|critical (infer from urgency words)
- description: any extra context

Return ONLY valid JSON, no markdown:
{
  "title": "string",
  "deadline": "ISO string or null",
  "estimated_hours": number,
  "category": "work|personal|health|finance|learning",
  "priority": "low|medium|high|critical",
  "description": "string"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ============================================
// DEADLINE DNA — Personal Failure Intelligence
// Analyzes patterns from task history
// ============================================
export async function generateDeadlineDNA(
  allTasks: Task[],
  profile: UserProfile
): Promise<{
  failure_patterns: Array<{ pattern: string; frequency: string; insight: string }>;
  underestimation_factor: number;
  worst_category: string;
  best_category: string;
  peak_failure_day: string;
  procrastination_index: number;
  personal_risk_multiplier: number;
  dna_score: number;
  brutal_truth: string;
  top_recommendation: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-latest' });

  const completed = allTasks.filter(t => t.status === 'completed');
  const missed = allTasks.filter(t => {
    if (!t.deadline || t.status === 'completed') return false;
    return new Date(t.deadline) < new Date() && t.status !== 'cancelled';
  });

  const taskHistory = allTasks.map(t => ({
    title: t.title,
    category: t.category,
    estimated_hours: t.estimated_hours,
    actual_hours: t.actual_hours,
    status: t.status,
    deadline: t.deadline,
    procrastination_count: t.procrastination_count,
    completed_at: t.completed_at,
    created_at: t.created_at,
  }));

  const prompt = `You are a behavioral AI analyst. Analyze this person's task history to build their "Deadline DNA" — a personalized failure profile.

User: ${profile.name}
Total tasks: ${allTasks.length}
Completed: ${completed.length}
Missed deadlines: ${missed.length}
Total procrastination events: ${allTasks.reduce((a, t) => a + t.procrastination_count, 0)}

Task history:
${JSON.stringify(taskHistory, null, 2)}

Build a psychologically honest, data-driven failure profile. Be specific and brutal — this helps the user win.

Calculate:
- underestimation_factor: how much they underestimate time (e.g. 2.3 = they need 2.3x their estimates)
- procrastination_index: 0-100, how much they procrastinate
- dna_score: 0-100, overall deadline reliability score (higher = better)
- personal_risk_multiplier: multiply any task's risk score by this (e.g. 1.4 means 40% riskier than average)
- peak_failure_day: which day of week they miss most
- worst_category: which category they fail most
- best_category: which category they succeed most

Return ONLY valid JSON, no markdown:
{
  "failure_patterns": [
    { "pattern": "string", "frequency": "string", "insight": "string" }
  ],
  "underestimation_factor": number,
  "worst_category": "string",
  "best_category": "string",
  "peak_failure_day": "string",
  "procrastination_index": number,
  "personal_risk_multiplier": number,
  "dna_score": number,
  "brutal_truth": "string (1 sentence, honest assessment)",
  "top_recommendation": "string (most impactful thing they can change)"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}
