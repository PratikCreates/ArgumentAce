
// src/ai/flows/generate-counter-argument.ts
'use server';

/**
 * @fileOverview AI Opponent counter-argument generation flow.
 *
 * This file defines a Genkit flow for an AI to generate a counter-argument
 * to a user's statement on a given topic.
 *
 * @interface GenerateCounterArgumentInput - Defines the input: topic, user's argument, and opponent's skill level.
 * @interface GenerateCounterArgumentOutput - Defines the output: the AI's counter-argument.
 * @function generateCounterArgument - The main function to generate a counter-argument.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ReasoningSkill } from '@/types';

const GenerateCounterArgumentInputSchema = z.object({
  topic: z.string().describe('The topic of the debate.'),
  userArgument: z.string().describe("The user's argument to which the AI should respond."),
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
 * Generates a counter-argument from an AI opponent.
 * @param input - The input parameters: topic, user's argument, and opponent's skill level.
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

The user has made the following argument:
"{{{userArgument}}}"

Your task is to provide a strong, relevant, and well-reasoned counter-argument.
Focus on directly addressing the user's points if possible, or introduce new perspectives that challenge their argument.
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
