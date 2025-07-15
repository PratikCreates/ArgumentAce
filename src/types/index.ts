
import type { AnalyzeArgumentOutput as AIAnalyzeArgumentOutput } from '@/ai/flows/real-time-feedback';
import type { ResearchTopicOutput as AIResearchTopicOutput } from '@/ai/flows/research-topic-flow';
import type { JudgeDebateOutput as AIJudgeDebateOutput } from '@/ai/flows/judge-debate-flow';
import { z } from 'genkit';


export type ReasoningSkill = "Beginner" | "Intermediate" | "Advanced";

export interface DebateTurn {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
  isGeneratingAudio?: boolean;
}

export interface DebateSession {
  id: string; // Local session ID or public share ID
  topic: string;
  feedback?: AIAnalyzeArgumentOutput; // Feedback for the last user turn
  debateLog: DebateTurn[];
  researchPoints?: string[];
  juryVerdict?: AIJudgeDebateOutput;
  timestamp: string;
  reasoningSkill: ReasoningSkill;
  shareId?: string; // Unique ID for public sharing (often same as id if it's a shared session)
  isPublic?: boolean;
  publicUrl?: string; // The full URL for the shared session
}

// Re-exporting AI types for convenience
export type AnalyzeArgumentOutput = AIAnalyzeArgumentOutput;
export type ResearchTopicOutput = AIResearchTopicOutput;
export type JudgeDebateOutput = AIJudgeDebateOutput;
