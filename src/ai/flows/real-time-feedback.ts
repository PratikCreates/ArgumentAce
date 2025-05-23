'use server';

/**
 * @fileOverview Provides real-time feedback on arguments during practice debates, identifying logical fallacies and suggesting improvements.
 *
 * - analyzeArgument - A function that analyzes an argument and provides feedback.
 * - AnalyzeArgumentInput - The input type for the analyzeArgument function.
 * - AnalyzeArgumentOutput - The return type for the analyzeArgument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeArgumentInputSchema = z.object({
  argument: z.string().describe('The argument to be analyzed.'),
  topic: z.string().describe('The topic of the debate.'),
});
export type AnalyzeArgumentInput = z.infer<typeof AnalyzeArgumentInputSchema>;

const AnalyzeArgumentOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the argument, including logical fallacies and suggestions for improvement.'),
  fallacies: z.array(z.string()).describe('List of logical fallacies identified in the argument.'),
  counterPoints: z.array(z.string()).describe('Suggestions for counterpoints to the argument.'),
  persuasionTechniques: z.array(z.string()).describe('Persuasion techniques used in the argument.'),
});
export type AnalyzeArgumentOutput = z.infer<typeof AnalyzeArgumentOutputSchema>;

export async function analyzeArgument(input: AnalyzeArgumentInput): Promise<AnalyzeArgumentOutput> {
  return analyzeArgumentFlow(input);
}

const analyzeArgumentPrompt = ai.definePrompt({
  name: 'analyzeArgumentPrompt',
  input: {schema: AnalyzeArgumentInputSchema},
  output: {schema: AnalyzeArgumentOutputSchema},
  prompt: `You are an expert debate coach providing real-time feedback on arguments.

  Analyze the following argument in the context of the debate topic. Identify any logical fallacies, suggest counterpoints, and list persuasive techniques used.

  Topic: {{{topic}}}
  Argument: {{{argument}}}

  Provide detailed feedback to help the user improve their reasoning and persuasion skills.
  Specifically identify the following:
  - Logical fallacies
  - Persuasion techniques
  - Counterpoints
  `,
});

const analyzeArgumentFlow = ai.defineFlow(
  {
    name: 'analyzeArgumentFlow',
    inputSchema: AnalyzeArgumentInputSchema,
    outputSchema: AnalyzeArgumentOutputSchema,
  },
  async input => {
    const {output} = await analyzeArgumentPrompt(input);
    return output!;
  }
);
