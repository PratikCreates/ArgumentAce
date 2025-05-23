
import { config } from 'dotenv';
config();

import '@/ai/flows/real-time-feedback.ts';
import '@/ai/flows/generate-argument.ts';
import '@/ai/flows/generate-counter-argument.ts';
import '@/ai/flows/suggest-topics-flow.ts'; // Added new flow
