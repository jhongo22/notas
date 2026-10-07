export type Priority = 'high' | 'medium' | 'low';

export interface SubtaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  tags: string[];
  subtasks: SubtaskItem[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export type EventCategory = 'exam' | 'assignment' | 'meeting' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: EventCategory;
  location?: string;
  reminderMinutes?: number;
}

export type FinanceCategory = 'comida' | 'transporte' | 'universidad' | 'ocio' | 'servicios' | 'ingresos' | 'otros';

export interface FinanceTransaction {
  id: string;
  amount: number; // positive for income, negative for expense
  description: string;
  category: FinanceCategory;
  date: string; // YYYY-MM-DD
  type: 'expense' | 'income';
}

export interface AgentAction {
  type: 'expense' | 'task' | 'event';
  summary: string;
  detail: any;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionExecuted?: AgentAction;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AgentMessage[];
}

export type ActiveTab = 'notes' | 'today' | 'calendar' | 'finance' | 'copilot';
