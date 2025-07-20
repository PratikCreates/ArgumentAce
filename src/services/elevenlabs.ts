import { SarvamAIClient } from 'sarvamai';
import { SARVAM_API_KEY, SARVAM_CONFIG } from '@/config/sarvam';

interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

interface SpeechToTextOptions {
  audioBlob: Blob;
}

// Fallback TTS function that uses browser's SpeechSynthesis API
async function fallbackTextToSpeech(text: string): Promise<{ audioUrl: string }> {
  return new Promise((resolve) => {
    try {
      // Use browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a good voice if available
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      // Speak the text immediately
      speechSynthesis.speak(utterance);
      
      // Return a placeholder URL since we're using direct speech synthesis
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

export async function textToSpeech({
  text,
  voiceId = ELEVENLABS_CONFIG.voices.neutral,
  stability = ELEVENLABS_CONFIG.voiceSettings.stability,
  similarityBoost = ELEVENLABS_CONFIG.voiceSettings.similarity_boost
}: TextToSpeechOptions): Promise<{ audioUrl: string }> {
  try {
    // Check if we have a valid Eleven Labs API key
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your-api-key-here' || ELEVENLABS_API_KEY.length < 10) {
      console.warn('No valid Eleven Labs API key provided, trying Sarvam AI');
      
      // Try Sarvam AI as fallback
      try {
        const detectedLanguage = detectLanguageFromText(text);
        return await sarvamTextToSpeech({
          text,
          targetLanguageCode: detectedLanguage
        });
      } catch (sarvamError) {
        console.warn('Sarvam AI also failed, using browser TTS');
        return fallbackTextToSpeech(text);
      }
    }
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        }
      })
    });

    if (!response.ok) {
      console.error(`Eleven Labs API Error: ${response.status} ${response.statusText}`);
      if (response.status === 401) {
        console.error('Invalid API key - check your Eleven Labs API key');
        console.error('Current API key starts with:', ELEVENLABS_API_KEY.substring(0, 10) + '...');
      }
      
      // Try Sarvam AI as fallback
      console.warn('Eleven Labs failed, trying Sarvam AI');
      try {
        const detectedLanguage = detectLanguageFromText(text);
        return await sarvamTextToSpeech({
          text,
          targetLanguageCode: detectedLanguage
        });
      } catch (sarvamError) {
        console.warn('Sarvam AI also failed, using browser TTS');
        return fallbackTextToSpeech(text);
      }
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return { audioUrl };
  } catch (error) {
    console.error('Error generating speech with Eleven Labs:', error);
    console.log('Falling back to browser TTS');
    return fallbackTextToSpeech(text);
  }
}

export async function speechToText({ audioBlob }: SpeechToTextOptions): Promise<{ text: string }> {
  try {
    // Check if we have an Eleven Labs API key
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.length < 10) {
      console.warn('No valid Eleven Labs API key, trying Sarvam AI');
      const result = await sarvamSpeechToText({ audioBlob });
      return { text: result.text };
    }
    
    // Create form data to send the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model_id', 'scribe_v1');
    
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      console.error(`Eleven Labs STT API Error: ${response.status} ${response.statusText}`);
      
      // Try Sarvam AI as fallback
      console.warn('Eleven Labs STT failed, trying Sarvam AI');
      try {
        const result = await sarvamSpeechToText({ audioBlob });
        return { text: result.text };
      } catch (sarvamError) {
        console.error('Both Eleven Labs and Sarvam AI failed for STT');
        throw new Error(`Speech-to-text failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Error transcribing speech with Eleven Labs:', error);
    throw error;
  }
}

// Helper function to select a voice based on role
export function getVoiceForRole(role?: string): string {
  if (!role) return ELEVENLABS_CONFIG.voices.neutral;
  
  // Map roles to voice types
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
  
  if (governmentRoles.includes(role)) {
    return ELEVENLABS_CONFIG.voices.male;
  } else if (oppositionRoles.includes(role)) {
    return ELEVENLABS_CONFIG.voices.female;
  }
  
  return ELEVENLABS_CONFIG.voices.neutral;
}

// Enhanced function that works with both Eleven Labs and Sarvam AI
export function getVoiceForRoleWithLanguage(role?: string, language: string = 'en-IN'): {
  elevenLabsVoice: string;
  sarvamVoice: { speaker: string; languageCode: string };
} {
  const elevenLabsVoice = getVoiceForRole(role);
  const sarvamVoice = getSarvamVoiceForRole(role, language);
  
  return {
    elevenLabsVoice,
    sarvamVoice
  };
}