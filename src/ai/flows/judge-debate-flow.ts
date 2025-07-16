
'use server';
/**
 * @fileOverview A Genkit flow to act as a jury for a debate session.
 *
 * - judgeDebate - A function that analyzes a debate log and provides a verdict.
 * - JudgeDebateInput - The input type for the judgeDebate function.
 * - JudgeDebateOutput - The return type for the judgeDebate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JudgeDebateInputSchema = z.object({
  topic: z.string().describe('The topic of the debate.'),
  formattedDebateHistory: z
    .string()
    .describe(
      "The complete conversation history of the debate, formatted with speaker labels (e.g., 'User: ...', 'AI: ...')."
    ),
});
export type JudgeDebateInput = z.infer<typeof JudgeDebateInputSchema>;

const ClashAnalysisSchema = z.object({
  clashPoint: z.string().describe("A brief title for the key point of contention (e.g., 'Economic Impact', 'Ethical Concerns')."),
  summary: z.string().describe("A summary of how this clash played out between the user and the AI."),
  winner: z.enum(['user', 'ai', 'tie']).describe("Who won this specific point of contention."),
  winnerScore: z.number().describe("A score from -5 (strong loss for user) to +5 (strong win for user) for this clash. 0 is a tie."),
  reasoning: z.string().describe("The justification for why the winner was chosen for this clash."),
});

const JudgeDebateOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe("A summary of the debate and the jury's overall impression."),
  clashes: z.array(ClashAnalysisSchema).describe("An analysis of the key clashes or points of contention in the debate."),
  finalScore: z.number().describe("The sum of all clash scores. A positive score favors the user, negative favors the AI."),
  winner: z
    .enum(['user', 'ai', 'tie'])
    .describe(
      "The declared winner, determined by the final score. Could be 'tie'."
    ),
  userStrengths: z
    .array(z.string())
    .describe(
      "Positive aspects of the user's arguments and debating style (2-3 points)."
    ),
  userWeaknesses: z
    .array(z.string())
    .describe("Areas where the user could improve (2-3 points)."),
  aiStrengths: z
    .array(z.string())
    .describe(
      "Positive aspects of the AI's arguments and debating style (2-3 points)."
    ),
  aiWeaknesses: z
    .array(z.string())
    .describe(
      "Areas where the AI opponent was less effective or could have improved (2-3 points)."
    ),
  adviceForUser: z
    .string()
    .optional()
    .describe(
      "One primary piece of actionable advice for the user to improve their debating skills based on this specific debate."
    ),
});
export type JudgeDebateOutput = z.infer<typeof JudgeDebateOutputSchema>;

export async function judgeDebate(
  input: JudgeDebateInput
): Promise<JudgeDebateOutput> {
  return judgeDebateFlow(input);
}

const judgeDebatePrompt = ai.definePrompt({
  name: 'judgeDebatePrompt',
  input: {schema: JudgeDebateInputSchema},
  output: {schema: JudgeDebateOutputSchema},
  prompt: `You are an impartial and experienced debate judging panel. Your task is to analyze the following debate transcript and provide a comprehensive, analytical, and quasi-mathematical verdict.

Debate Topic: "{{{topic}}}"

Debate Transcript (User vs. AI):
{{{formattedDebateHistory}}}

**Adjudication Algorithm:**
1.  **Identify Key Clashes:** First, identify the 2-4 main points of contention ("clashes") where arguments from both sides directly engaged with each other.
2.  **Analyze Each Clash:** For each clash:
    a. Summarize the arguments made by the User and the AI on this point.
    b. Determine a winner for that specific clash ('user', 'ai', or 'tie').
    c. Assign a score from -5 (decisive win for AI) to +5 (decisive win for User). 0 represents a perfect tie or symmetric arguments.
    d. Provide a brief reasoning for your decision on that clash.
3.  **Calculate Final Score:** Sum the scores from all clashes to get a final numerical score.
4.  **Declare Overall Winner:** The winner is determined by the sign of the final score (positive for User, negative for AI, zero for Tie).
5.  **Provide Qualitative Feedback:** Based on the clash analysis, provide overall strengths and weaknesses for both the User and the AI, and offer one key piece of actionable advice for the user.

**Output Generation:**
Please fill out the structured JSON output with your complete analysis. Ensure your response strictly adheres to the JSON schema. Do not include any introductory phrases like "Here's the verdict:" in your JSON output.
`,
});

const judgeDebateFlow = ai.defineFlow(
  {
    name: 'judgeDebateFlow',
    inputSchema: JudgeDebateInputSchema,
    outputSchema: JudgeDebateOutputSchema,
  },
  async (input) => {
    const {output} = await judgeDebatePrompt(input);
    // Here we could add logic to double-check the AI's math, but for now we trust the model.
    return output!;
  }
);
