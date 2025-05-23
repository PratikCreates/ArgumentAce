
import type { AnalyzeArgumentOutput as AIAnalyzeArgumentOutput } from '@/ai/flows/real-time-feedback';
import type { ResearchTopicOutput as AIResearchTopicOutput } from '@/ai/flows/research-topic-flow';

export type ReasoningSkill = "Beginner" | "Intermediate" | "Advanced";

export interface DebateTurn {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface DebateSession {
  id: string;
  topic: string;
  // userArgument: string; // Replaced by debateLog
  // generatedArgument?: string; // Replaced by debateLog
  feedback?: AIAnalyzeArgumentOutput; // Feedback for the last user turn
  // aiOpponentArgument?: string; // Replaced by debateLog
  debateLog: DebateTurn[];
  researchPoints?: string[];
  timestamp: string;
  reasoningSkill: ReasoningSkill; // Store skill level for the session
}

// Re-exporting AI types for convenience if needed, or use directly from AI flows
export type AnalyzeArgumentOutput = AIAnalyzeArgumentOutput;
export type ResearchTopicOutput = AIResearchTopicOutput;
