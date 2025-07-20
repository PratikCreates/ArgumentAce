import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Make sure to use the environment variable for the API key
export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
  })],
  model: 'googleai/gemini-2.0-flash',
});
