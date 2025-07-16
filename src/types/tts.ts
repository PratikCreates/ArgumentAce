// src/types/tts.ts
import {z} from 'genkit';

/**
 * Defines the Zod schema for the text-to-speech flow input.
 */
export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});

/**
 * The derived TypeScript type for the text-to-speech flow input.
 */
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;


/**
 * Defines the Zod schema for the text-to-speech flow output.
 */
export const TextToSpeechOutputSchema = z.object({
  audioUrl: z
    .string()
    .describe("The generated audio as a data URI. Format: 'data:audio/wav;base64,<encoded_data>'"),
});

/**
 * The derived TypeScript type for the text-to-speech flow output.
 */
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
