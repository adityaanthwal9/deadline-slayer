// ============================================
// DEADLINE SLAYER AI - TypeScript Types
// ============================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delegated';
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type BlockType = 'work' | 'break' | 'fixed' | 'buffer';

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  name: string;
  email?: string;
  wake_time: string;
  sleep_time: string;
  work_start: string;
  work_end: string;
  energy_morning: EnergyLevel;
  energy_afternoon: EnergyLevel;
  energy_night: EnergyLevel;
  productivity_score: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  estimated_hours: number;
  actual_hours: number;
  risk_score: number;
  risk_level: RiskLevel;
  ai_recommendation?: string;
  procrastination_count: number;
  last_worked_at?: string;
  completed_at?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  block_type: BlockType;
  start_time: string;
  end_time: string;
  is_ai_generated: boolean;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  task?: Task;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  tasks_completed: number;
  tasks_missed: number;
  focus_hours: number;
  productivity_score: number;
  deadline_avoidance_score: number;
}

// ============================================
// AI Agent Response Types
// ============================================

export interface TaskRiskAnalysis {
  task_id: string;
  risk_score: number;       // 0-100
  risk_level: RiskLevel;
  reasoning: string;
  time_deficit_hours: number;  // negative = not enough time
  recommendation: string;
  urgency_multiplier: number;
}

export interface DailyBrief {
  greeting: string;
  mission_statement: string;
  top_task: Task;
  top_task_reason: string;
  risk_alerts: Array<{
    task_id: string;
    task_title: string;
    risk_level: RiskLevel;
    message: string;
  }>;
  daily_schedule_summary: string;
  motivational_note: string;
}

export interface ScheduleOptimization {
  blocks: Array<{
    task_id?: string;
    title: string;
    block_type: BlockType;
    start_time: string;   // "HH:MM"
    end_time: string;     // "HH:MM"
    reason: string;
  }>;
  optimization_notes: string;
  total_focus_hours: number;
}

export interface LifeSimulation {
  scenario_a: {
    label: string;
    action: string;
    success_probability: number;
    outcomes: string[];
    consequence_if_not_done: string;
  };
  scenario_b: {
    label: string;
    action: string;
    success_probability: number;
    outcomes: string[];
    consequence_if_not_done: string;
  };
  recommendation: string;
  ai_verdict: string;
}

export interface NegotiationResult {
  analysis: string;
  decisions: Array<{
    task_title: string;
    decision: 'complete' | 'delegate' | 'reschedule' | 'skip';
    reason: string;
    impact: string;
  }>;
  final_plan: string;
}

export interface ProcrastinationAlert {
  task_id: string;
  task_title: string;
  delay_count: number;
  message: string;
  intervention: string;
  risk_if_continued: string;
}
