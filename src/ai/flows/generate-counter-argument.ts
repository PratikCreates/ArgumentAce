// src/ai/flows/generate-counter-argument.ts
'use server';

/**
 * @fileOverview AI Opponent counter-argument generation flow.
 *
 * This file defines a Genkit flow for an AI to generate a counter-argument
 * based on the history of a debate.
 *
 * @interface GenerateCounterArgumentInput - Defines the input: topic, debate history, and opponent's skill level.
 * @interface GenerateCounterArgumentOutput - Defines the output: the AI's counter-argument.
 * @function generateCounterArgument - The main function to generate a counter-argument.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ReasoningSkill } from '@/types';

const GenerateCounterArgumentInputSchema = z.object({
  topic: z.string().describe('The topic of the debate.'),
  // debateHistory: z.array(z.object({ speaker: z.enum(['user', 'ai']), text: z.string() })).describe("The history of the debate so far, with the latest user message at the end."),
  formattedDebateHistory: z.string().describe("The conversation history, formatted with speaker labels (e.g., 'User: ...', 'AI: ...'). The user's latest statement is at the end."),
  opponentSkill: z
    .string()
    .describe(
      'The desired reasoning skill level for the AI opponent (e.g., Beginner, Intermediate, Advanced).'
    ),
});

export type GenerateCounterArgumentInput = z.infer<typeof GenerateCounterArgumentInputSchema>;

const GenerateCounterArgumentOutputSchema = z.object({
  counterArgument: z.string().describe("The AI opponent's generated counter-argument."),
});

export type GenerateCounterArgumentOutput = z.infer<typeof GenerateCounterArgumentOutputSchema>;

/**
 * Generates a counter-argument from an AI opponent based on the debate history.
 * @param input - The input parameters: topic, formatted debate history, and opponent's skill level.
 * @returns The AI opponent's counter-argument.
 */
export async function generateCounterArgument(input: GenerateCounterArgumentInput): Promise<GenerateCounterArgumentOutput> {
  return generateCounterArgumentFlow(input);
}

const generateCounterArgumentPrompt = ai.definePrompt({
  name: 'generateCounterArgumentPrompt',
  input: {schema: GenerateCounterArgumentInputSchema},
  output: {schema: GenerateCounterArgumentOutputSchema},
  prompt: `You are an AI debate opponent with a {{{opponentSkill}}} skill level.
The debate topic is: "{{{topic}}}"

Debate Transcript:
{{{formattedDebateHistory}}}

Your task is to provide a strong, relevant, and well-reasoned counter-argument to the USER'S LATEST statement in the transcript.
Focus on directly addressing their points or introducing new perspectives that challenge their argument.
Ensure your counter-argument is appropriate for the specified skill level.

Counter-Argument:`,
});

const generateCounterArgumentFlow = ai.defineFlow(
  {
    name: 'generateCounterArgumentFlow',
    inputSchema: GenerateCounterArgumentInputSchema,
    outputSchema: GenerateCounterArgumentOutputSchema,
  },
  async input => {
    const {output} = await generateCounterArgumentPrompt(input);
    return output!;
  }
);
