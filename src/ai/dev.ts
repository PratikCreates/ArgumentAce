
import { config } from 'dotenv';
config();

import '@/ai/flows/real-time-feedback.ts';
import '@/ai/flows/generate-argument.ts';
import '@/ai/flows/generate-counter-argument.ts';
import '@/ai/flows/suggest-topics-flow.ts';
import '@/ai/flows/research-topic-flow.ts';
import '@/ai/flows/judge-debate-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/generate-poi-flow.ts';
