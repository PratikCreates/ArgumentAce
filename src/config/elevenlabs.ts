// Eleven Labs API configuration

export const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

export const ELEVENLABS_CONFIG = {
  apiKey: ELEVENLABS_API_KEY,
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75
  },
  // Default voice IDs - you can replace these with your preferred voices
  voices: {
    male: 'pNInz6obpgDQGcFmaJgB', // Adam
    female: 'EXAVITQu4vr4xnSDxMaL', // Rachel
    neutral: 'onwK4e9ZLuTAKqWW03F9'  // Antoni
  }
};