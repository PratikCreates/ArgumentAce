
import type { AnalyzeArgumentOutput as AIAnalyzeArgumentOutput } from '@/ai/flows/real-time-feedback';

export type ReasoningSkill = "Beginner" | "Intermediate" | "Advanced";

export interface DebateSession {
  id: string;
  topic: string;
  userArgument: string;
  generatedArgument?: string;
  feedback?: AIAnalyzeArgumentOutput;
  aiOpponentArgument?: string;
  timestamp: string;
}

// Re-exporting AI types for convenience if needed, or use directly from AI flows
export type AnalyzeArgumentOutput = AIAnalyzeArgumentOutput;
