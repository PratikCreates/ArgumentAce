
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

const JudgeDebateOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe("A summary of the debate and the jury's overall impression."),
  winner: z
    .enum(['user', 'ai', 'tie'])
    .optional()
    .describe(
      "The declared winner, if one can be clearly determined. Could be 'tie'."
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
  keyMoments: z
    .array(z.string())
    .optional()
    .describe(
      "Specific points or exchanges in the debate that were particularly impactful or noteworthy (1-2 points)."
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
  prompt: `You are an impartial and experienced debate judging panel. Your task is to analyze the following debate transcript and provide a comprehensive verdict.

Debate Topic: "{{{topic}}}"

Debate Transcript (User vs. AI):
{{{formattedDebateHistory}}}

Please evaluate the debate based on the following criteria:
1.  **Clarity and Coherence:** How clear and well-structured were the arguments from each side?
2.  **Relevance to Topic:** Did the arguments stay focused on the debate topic?
3.  **Logical Reasoning:** How sound was the logic used? Were there any notable fallacies (beyond what might have been caught by per-turn feedback)?
4.  **Strength of Rebuttals:** How effectively did each side address and counter the points made by the opponent?
5.  **Persuasiveness:** Which side was more convincing overall?
6.  **Use of Evidence/Support (if applicable/implied):** While direct evidence wasn't provided, assess if arguments implied strong support or relied on unsubstantiated claims.

Based on your evaluation, provide the following:
-   **Overall Assessment:** A summary of the debate flow, how each side performed generally.
-   **User Strengths:** List 2-3 key strengths of the user's debating.
-   **User Weaknesses:** List 2-3 key areas for improvement for the user.
-   **AI Strengths:** List 2-3 key strengths of the AI's debating.
-   **AI Weaknesses:** List 2-3 key areas where the AI opponent was less effective or could have improved.
-   **Winner (Optional):** If a clear winner emerges, state who (User or AI) or if it was a Tie. If too close to call or nuanced, explain why.
-   **Key Moments (Optional):** Identify 1-2 pivotal moments or exchanges in the debate.
-   **Advice For User:** Offer one primary piece of actionable advice for the user to improve their debating skills based on this specific debate.

Be fair, balanced, and constructive in your feedback. Ensure your response strictly adheres to the JSON schema for the output.
Do not include any introductory phrases like "Here's the verdict:" in your JSON output.
Output only the JSON.
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
    return output!;
  }
);
