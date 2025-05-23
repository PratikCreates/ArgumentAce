// src/ai/flows/generate-argument.ts
'use server';

/**
 * @fileOverview Argument generation flow.
 *
 * This file defines a Genkit flow for generating arguments on a given topic.
 * It includes the input and output schemas, the main function to trigger the flow,
 * and the prompt used to generate the argument.
 *
 * @interface GenerateArgumentInput - Defines the structure for input parameters: the debate topic and reasoning skill level.
 * @interface GenerateArgumentOutput - Defines the structure for the output: the generated argument.
 * @function generateArgument - The main function to generate arguments from a given topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArgumentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate an argument.'),
  reasoningSkill: z
    .string()
    .describe(
      'The desired level of reasoning skill for the generated argument (e.g., beginner, intermediate, advanced).'
    ),
});

export type GenerateArgumentInput = z.infer<typeof GenerateArgumentInputSchema>;

const GenerateArgumentOutputSchema = z.object({
  argument: z.string().describe('The generated argument for the given topic.'),
});

export type GenerateArgumentOutput = z.infer<typeof GenerateArgumentOutputSchema>;

/**
 * Generates an argument for a given topic using the specified reasoning skill level.
 * @param input - The input parameters including the topic and desired reasoning skill.
 * @returns The generated argument.
 */
export async function generateArgument(input: GenerateArgumentInput): Promise<GenerateArgumentOutput> {
  return generateArgumentFlow(input);
}

const generateArgumentPrompt = ai.definePrompt({
  name: 'generateArgumentPrompt',
  input: {schema: GenerateArgumentInputSchema},
  output: {schema: GenerateArgumentOutputSchema},
  prompt: `You are an expert debater skilled at constructing arguments.

  Generate a well-reasoned argument for the following topic, suitable for a debate at the specified reasoning skill level:

  Topic: {{{topic}}}
  Reasoning Skill Level: {{{reasoningSkill}}}

  Argument:`, // Keep Argument: at the end so that the LLM knows where the argument should start.
});

const generateArgumentFlow = ai.defineFlow(
  {
    name: 'generateArgumentFlow',
    inputSchema: GenerateArgumentInputSchema,
    outputSchema: GenerateArgumentOutputSchema,
  },
  async input => {
    const {output} = await generateArgumentPrompt(input);
    return output!;
  }
);
