import { DebateFormat } from './debate-formats';

// AI Flow Types - matching our simple-flows.ts implementation
export interface AIAnalyzeArgumentOutput {
  logicalFallacies: string[];
  persuasiveTechniques: string[];
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  suggestions: string[];
  counterpoints: string[];
}

export interface AIResearchTopicOutput {
  proPoints: string[];
  conPoints: string[];
  keyFacts: string[];
}

export interface AIJudgeDebateOutput {
  winner: 'user' | 'ai' | 'tie';
  overallAssessment: string;
  clashes: Array<{
    clashPoint: string;
    summary: string;
    winner: 'user' | 'ai' | 'tie';
    winnerScore: number;
    reasoning: string;
  }>;
  finalScore: number;
  userStrengths: string[];
  userWeaknesses: string[];
  aiStrengths: string[];
  aiWeaknesses: string[];
  adviceForUser?: string;
}


export type ReasoningSkill = "Beginner" | "Intermediate" | "Advanced";

export interface DebateTurn {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
  feedback?: AIAnalyzeArgumentOutput; // Feedback is now attached to each turn
  audioUrl?: string; // URL for the generated audio of the AI's speech
  role?: string; // Role in structured debate formats
}

export interface DebateSession {
  id: string; // Local session ID or public share ID
  topic: string;
  debateLog: DebateTurn[];
  researchPoints?: AIResearchTopicOutput;
  juryVerdict?: AIJudgeDebateOutput;
  timestamp: string;
  reasoningSkill: ReasoningSkill;
  shareId?: string; // Unique ID for public sharing (often same as id if it's a shared session)
  isPublic?: boolean;
  publicUrl?: string; // The full URL for the shared session
  format?: DebateFormat; // Debate format
  prepTimeUsed?: number; // Preparation time used in seconds
  currentRole?: string; // Current role in structured debate formats
}

// Re-exporting AI types for convenience
export type AnalyzeArgumentOutput = AIAnalyzeArgumentOutput;
export type ResearchTopicOutput = AIResearchTopicOutput;
export type JudgeDebateOutput = AIJudgeDebateOutput;
