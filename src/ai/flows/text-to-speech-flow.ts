'use server';
/**
 * @fileOverview A Genkit flow for converting text to speech.
 *
 * This file defines a flow that takes a string of text as input and returns
 * a data URI for a WAV audio file of the spoken text. It uses the Gemini TTS model.
 *
 * - textToSpeech - The main function to convert text to speech.
 */

import {ai} from '@/ai/genkit';
import * as z from 'zod';
import wav from 'wav';
import {
  TextToSpeechInput,
  TextToSpeechInputSchema,
  TextToSpeechOutput,
  TextToSpeechOutputSchema,
} from '@/types/tts';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Converts a string of text into spoken audio.
 * @param input - The text to be converted.
 * @returns An object containing the data URI of the generated WAV audio.
 */
export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

/**
 * Converts raw PCM audio data from Gemini TTS into a base64-encoded WAV format.
 * @param pcmData - The raw PCM audio buffer.
 * @param channels - The number of audio channels.
 * @param rate - The sample rate of the audio.
 * @param sampleWidth - The width of each audio sample in bytes.
 * @returns A promise that resolves with the base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts', {
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
      }),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A standard, clear voice
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    // The returned media URL is a data URI with base64 PCM data.
    // We need to extract the base64 data and convert it to WAV format.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
