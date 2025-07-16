
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
  proPoints: z.array(z.string()).describe('A list of 2-3 key arguments FOR the topic.'),
  conPoints: z.array(z.string()).describe('A list of 2-3 key arguments AGAINST the topic.'),
  keyFacts: z.array(z.string()).optional().describe('A list of 1-2 relevant statistics or key facts.'),
});
export type ResearchTopicOutput = z.infer<typeof ResearchTopicOutputSchema>;

export async function researchTopic(input: ResearchTopicInput): Promise<ResearchTopicOutput> {
  return researchTopicFlow(input);
}

const researchTopicPrompt = ai.definePrompt({
  name: 'researchTopicPrompt',
  input: {schema: ResearchTopicInputSchema},
  output: {schema: ResearchTopicOutputSchema},
  prompt: `You are a helpful research assistant preparing a case file for a debater.
For the given debate topic: "{{{topic}}}", provide a structured case preparation.

Please provide the following:
1.  **Arguments FOR the topic (Pro Points):** 2-3 distinct, strong arguments in favor of the motion.
2.  **Arguments AGAINST the topic (Con Points):** 2-3 distinct, strong arguments against the motion.
3.  **Key Facts/Statistics:** 1-2 important and verifiable facts or statistics that are highly relevant to the debate.

Present the output as a structured JSON object.
`,
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
