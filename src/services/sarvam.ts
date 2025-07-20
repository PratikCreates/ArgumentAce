import { SARVAM_API_KEY, SARVAM_CONFIG } from '@/config/sarvam';

interface SarvamSpeechToTextOptions {
  audioBlob: Blob;
  model?: string;
  languageCode?: string;
  withTimestamps?: boolean;
}

interface SarvamTextToSpeechOptions {
  text: string;
  targetLanguageCode: string;
  speaker?: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  sampleRate?: number;
  model?: string;
}

interface SarvamSTTResponse {
  request_id: string | null;
  transcript: string;
  timestamps?: {
    words: string[];
    start_time_seconds: number[];
    end_time_seconds: number[];
  };
  diarized_transcript?: {
    entries: Array<{
      transcript: string;
      start_time_seconds: number;
      end_time_seconds: number;
      speaker_id: string;
    }>;
  };
  language_code: string | null;
}

interface SarvamTTSResponse {
  request_id: string | null;
  audios: string[];
}

// Fallback TTS function using browser's SpeechSynthesis API
async function fallbackTextToSpeech(text: string): Promise<{ audioUrl: string }> {
  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voices = speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || voice.lang.includes('hi')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      
      speechSynthesis.speak(utterance);
      
      resolve({ 
        audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' 
      });
    } catch (error) {
      console.error('Fallback TTS error:', error);
      resolve({ 
        audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' 
      });
    }
  });
}

export async function sarvamSpeechToText({
  audioBlob,
  model = SARVAM_CONFIG.models.stt.default,
  languageCode = 'unknown',
  withTimestamps = false
}: SarvamSpeechToTextOptions): Promise<{ text: string; languageCode?: string }> {
  try {
    if (!SARVAM_API_KEY || SARVAM_API_KEY.length < 10) {
      throw new Error('No valid Sarvam API key provided');
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', model);
    formData.append('language_code', languageCode);
    if (withTimestamps) {
      formData.append('with_timestamps', 'true');
    }
    
    const response = await fetch(`${SARVAM_CONFIG.baseUrl}${SARVAM_CONFIG.endpoints.speechToText}`, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sarvam STT API Error:', response.status, errorData);
      throw new Error(`Sarvam STT API Error: ${response.status} ${response.statusText}`);
    }

    const data: SarvamSTTResponse = await response.json();
    return { 
      text: data.transcript,
      languageCode: data.language_code || undefined
    };
  } catch (error) {
    console.error('Error transcribing speech with Sarvam AI:', error);
    throw error;
  }
}

export async function sarvamTextToSpeech({
  text,
  targetLanguageCode,
  speaker = SARVAM_CONFIG.defaultSettings.speaker,
  pitch = SARVAM_CONFIG.defaultSettings.pitch,
  pace = SARVAM_CONFIG.defaultSettings.pace,
  loudness = SARVAM_CONFIG.defaultSettings.loudness,
  sampleRate = SARVAM_CONFIG.defaultSettings.sampleRate,
  model = SARVAM_CONFIG.models.tts.default
}: SarvamTextToSpeechOptions): Promise<{ audioUrl: string }> {
  try {
    if (!SARVAM_API_KEY || SARVAM_API_KEY.length < 10) {
      console.warn('No valid Sarvam API key provided, using fallback TTS');
      return fallbackTextToSpeech(text);
    }
    
    const requestBody = {
      text,
      target_language_code: targetLanguageCode,
      speaker,
      pitch,
      pace,
      loudness,
      speech_sample_rate: sampleRate,
      model,
      enable_preprocessing: true
    };
    
    const response = await fetch(`${SARVAM_CONFIG.baseUrl}${SARVAM_CONFIG.endpoints.textToSpeech}`, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sarvam TTS API Error:', response.status, errorData);
      console.warn('Falling back to browser TTS');
      return fallbackTextToSpeech(text);
    }

    const data: SarvamTTSResponse = await response.json();
    
    if (!data.audios || data.audios.length === 0) {
      console.warn('No audio data received from Sarvam API, using fallback');
      return fallbackTextToSpeech(text);
    }
    
    // Convert base64 audio to blob URL
    const base64Audio = data.audios[0];
    const audioBlob = new Blob([
      Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
    ], { type: 'audio/wav' });
    
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return { audioUrl };
  } catch (error) {
    console.error('Error generating speech with Sarvam AI:', error);
    console.log('Falling back to browser TTS');
    return fallbackTextToSpeech(text);
  }
}

// Helper function to get voice based on role and language
export function getSarvamVoiceForRole(role?: string, language: string = 'en-IN'): { speaker: string; languageCode: string } {
  const governmentRoles = [
    'Prime Minister',
    'Deputy Prime Minister', 
    'Government Whip',
    'Government Reply'
  ];
  
  const oppositionRoles = [
    'Leader of Opposition',
    'Deputy Leader of Opposition',
    'Opposition Whip', 
    'Opposition Reply'
  ];
  
  let speaker: string;
  
  if (governmentRoles.includes(role || '')) {
    // Use male voices for government
    speaker = SARVAM_CONFIG.speakers.male[0]; // Abhilash
  } else if (oppositionRoles.includes(role || '')) {
    // Use female voices for opposition
    speaker = SARVAM_CONFIG.speakers.female[0]; // Anushka
  } else {
    // Default to Anushka
    speaker = SARVAM_CONFIG.defaultSettings.speaker;
  }
  
  return {
    speaker,
    languageCode: language
  };
}

// Helper function to detect language from text (basic implementation)
export function detectLanguageFromText(text: string): string {
  // Simple heuristic - check for Devanagari script (Hindi)
  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) {
    return 'hi-IN';
  }
  
  // Check for Bengali script
  const bengaliPattern = /[\u0980-\u09FF]/;
  if (bengaliPattern.test(text)) {
    return 'bn-IN';
  }
  
  // Check for Tamil script
  const tamilPattern = /[\u0B80-\u0BFF]/;
  if (tamilPattern.test(text)) {
    return 'ta-IN';
  }
  
  // Default to English (India)
  return 'en-IN';
}

// Export configuration for use in components
export { SARVAM_CONFIG };