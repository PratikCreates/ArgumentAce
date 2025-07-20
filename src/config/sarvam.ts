// Sarvam AI API configuration

export const SARVAM_API_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY;

export const SARVAM_CONFIG = {
  apiKey: SARVAM_API_KEY,
  baseUrl: 'https://api.sarvam.ai',
  endpoints: {
    speechToText: '/speech-to-text',
    textToSpeech: '/text-to-speech'
  },
  models: {
    stt: {
      default: 'saarika:v2.5',
      flash: 'saarika:flash',
      v1: 'saarika:v1',
      v2: 'saarika:v2'
    },
    tts: {
      default: 'bulbul:v2'
    }
  },
  languages: {
    'hi-IN': 'Hindi',
    'bn-IN': 'Bengali', 
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'ml-IN': 'Malayalam',
    'mr-IN': 'Marathi',
    'gu-IN': 'Gujarati',
    'kn-IN': 'Kannada',
    'or-IN': 'Odia',
    'pa-IN': 'Punjabi',
    'as-IN': 'Assamese',
    'en-IN': 'English (India)'
  },
  speakers: {
    female: ['Anushka', 'Manisha', 'Vidya', 'Arya'],
    male: ['Abhilash', 'Karun', 'Hitesh']
  },
  audioFormats: ['wav', 'mp3'],
  sampleRates: [8000, 16000, 22050, 24000],
  defaultSettings: {
    pitch: 0.0,
    pace: 1.0,
    loudness: 1.0,
    sampleRate: 22050,
    speaker: 'Anushka'
  }
};