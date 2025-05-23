
'use server';
/**
 * @fileOverview A flow to provide research assistance on a given debate topic.
 *
 * - researchTopic - A function that provides key talking points or facts for a topic.
 * - ResearchTopicInput - The input type for the researchTopic function.
 * - ResearchTopicOutput - The return type for the researchTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The debate topic to research.'),
});
export type ResearchTopicInput = z.infer<typeof ResearchTopicInputSchema>;

const ResearchTopicOutputSchema = z.object({
  researchPoints: z.array(z.string()).describe('A list of 3-5 key talking points, facts, or common arguments related to the topic.'),
});
export type ResearchTopicOutput = z.infer<typeof ResearchTopicOutputSchema>;

export async function researchTopic(input: ResearchTopicInput): Promise<ResearchTopicOutput> {
  return researchTopicFlow(input);
}

const researchTopicPrompt = ai.definePrompt({
  name: 'researchTopicPrompt',
  input: {schema: ResearchTopicInputSchema},
  output: {schema: ResearchTopicOutputSchema},
  prompt: `You are a helpful research assistant. For the given debate topic: "{{{topic}}}", provide 3-5 key talking points, facts, or common arguments that are relevant to this topic. These points should be concise and help someone quickly understand the main facets of the debate. Present them as a list of strings.`,
});

const researchTopicFlow = ai.defineFlow(
  {
    name: 'researchTopicFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  },
  async (input) => {
    const {output} = await researchTopicPrompt(input);
    return output!;
  }
);
