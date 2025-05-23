
'use server';
/**
 * @fileOverview A flow to suggest debate topics.
 *
 * - suggestTopics - A function that suggests debate topics, optionally based on a category.
 * - SuggestTopicsInput - The input type for the suggestTopics function.
 * - SuggestTopicsOutput - The return type for the suggestTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTopicsInputSchema = z.object({
  category: z.string().optional().describe('An optional category to focus the topic suggestions (e.g., technology, ethics, politics).'),
});
export type SuggestTopicsInput = z.infer<typeof SuggestTopicsInputSchema>;

const SuggestTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('A list of 3-5 suggested debate topics.'),
});
export type SuggestTopicsOutput = z.infer<typeof SuggestTopicsOutputSchema>;

export async function suggestTopics(input?: SuggestTopicsInput): Promise<SuggestTopicsOutput> {
  return suggestTopicsFlow(input || {});
}

const suggestTopicsPrompt = ai.definePrompt({
  name: 'suggestTopicsPrompt',
  input: {schema: SuggestTopicsInputSchema},
  output: {schema: SuggestTopicsOutputSchema},
  prompt: `You are an AI assistant helping users find interesting debate topics for practice.
Suggest 3-5 diverse, engaging, and debatable topics.
{{#if category}}
Focus on the category: {{{category}}}.
{{else}}
Provide general topics suitable for debate.
{{/if}}
Ensure the topics are phrased as questions or statements that can be argued for or against.
Return the topics as a list of strings.
`,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    inputSchema: SuggestTopicsInputSchema,
    outputSchema: SuggestTopicsOutputSchema,
  },
  async (input) => {
    const {output} = await suggestTopicsPrompt(input);
    return output!;
  }
);
