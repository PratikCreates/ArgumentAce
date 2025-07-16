// src/ai/flows/generate-poi-flow.ts
'use server';

/**
 * @fileOverview Flow for generating a Point of Information (POI).
 *
 * This file defines a Genkit flow for an AI to generate a challenging
 * and relevant Point of Information based on a user's in-progress argument.
 *
 * @interface GeneratePoiInput - Defines the input: the debate topic and the user's current argument text.
 * @interface GeneratePoiOutput - Defines the output: the AI's generated POI question.
 * @function generatePoi - The main function to generate a POI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoiInputSchema = z.object({
  topic: z.string().describe('The topic of the debate.'),
  userArgument: z.string().describe("The user's current, in-progress argument text."),
});
export type GeneratePoiInput = z.infer<typeof GeneratePoiInputSchema>;

const GeneratePoiOutputSchema = z.object({
  poiQuestion: z.string().describe("The AI opponent's generated Point of Information (a short, challenging question)."),
});
export type GeneratePoiOutput = z.infer<typeof GeneratePoiOutputSchema>;

/**
 * Generates a Point of Information from an AI opponent based on the user's current argument.
 * @param input - The input parameters: topic and the user's argument text.
 * @returns The AI opponent's POI question.
 */
export async function generatePoi(input: GeneratePoiInput): Promise<GeneratePoiOutput> {
  return generatePoiFlow(input);
}

const generatePoiPrompt = ai.definePrompt({
  name: 'generatePoiPrompt',
  input: {schema: GeneratePoiInputSchema},
  output: {schema: GeneratePoiOutputSchema},
  prompt: `You are an AI debate opponent in a parliamentary-style debate.
The debate topic is: "{{{topic}}}"

The user is currently delivering their speech. Below is the text of their speech so far.
Your task is to interrupt with a challenging and relevant "Point of Information" (POI).

A good POI is:
- A short, sharp question (under 15 words).
- Directly related to a point the user has just made.
- Designed to expose a weakness, ask for clarification on a key point, or challenge an assumption.
- For example: "On that point, what is your evidence?" or "How does that solve the core problem?"

Do NOT provide a long counter-argument. Generate only the POI question itself.

User's argument so far:
"""
{{{userArgument}}}
"""

Point of Information:`,
});

const generatePoiFlow = ai.defineFlow(
  {
    name: 'generatePoiFlow',
    inputSchema: GeneratePoiInputSchema,
    outputSchema: GeneratePoiOutputSchema,
  },
  async input => {
    const {output} = await generatePoiPrompt(input);
    return output!;
  }
);
