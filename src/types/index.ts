
import type { AnalyzeArgumentOutput as AIAnalyzeArgumentOutput } from '@/ai/flows/real-time-feedback';
import type { ResearchTopicOutput as AIResearchTopicOutput } from '@/ai/flows/research-topic-flow';
import type { JudgeDebateOutput as AIJudgeDebateOutput } from '@/ai/flows/judge-debate-flow';

export type ReasoningSkill = "Beginner" | "Intermediate" | "Advanced";

export interface DebateTurn {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface DebateSession {
  id: string; // Local session ID
  topic: string;
  feedback?: AIAnalyzeArgumentOutput; // Feedback for the last user turn
  debateLog: DebateTurn[];
  researchPoints?: string[];
  juryVerdict?: AIJudgeDebateOutput;
  timestamp: string;
  reasoningSkill: ReasoningSkill;
  shareId?: string; // Unique ID for public sharing
  isPublic?: boolean; // Flag to indicate if session is publicly shared
}

// Re-exporting AI types for convenience
export type AnalyzeArgumentOutput = AIAnalyzeArgumentOutput;
export type ResearchTopicOutput = AIResearchTopicOutput;
export type JudgeDebateOutput = AIJudgeDebateOutput;

