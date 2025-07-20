"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { speechToText } from '@/services/speech';
import { useToast } from '@/hooks/use-toast';

interface SpeechToTextInputProps {
  onTranscriptionComplete: (text: string) => void;
  isDisabled?: boolean;
  preferredLanguage?: string;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const SpeechToTextInput: React.FC<SpeechToTextInputProps> = ({
  onTranscriptionComplete,
  isDisabled = false,
  preferredLanguage = 'en-IN'
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [useWebSpeechAPI, setUseWebSpeechAPI] = useState<boolean>(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUseWebSpeechAPI(false);
      console.log('Web Speech API not supported, will use audio recording + STT API');
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startWebSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set language based on preference
    if (preferredLanguage.startsWith('hi')) {
      recognition.lang = 'hi-IN';
    } else if (preferredLanguage.startsWith('bn')) {
      recognition.lang = 'bn-IN';
    } else if (preferredLanguage.startsWith('ta')) {
      recognition.lang = 'ta-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (finalTranscript.trim()) {
        onTranscriptionComplete(finalTranscript.trim());
        toast({
          title: 'Speech Transcribed',
          description: 'Your speech has been converted to text.',
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: 'Speech Recognition Error',
        description: `Error: ${event.error}. Please try again.`,
        variant: 'destructive'
      });
    };

    recognition.start();
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        try {
          setIsProcessing(true);
          
          // Use Sarvam AI for transcription
          const result = await speechToText({ 
            audioBlob,
            languageCode: preferredLanguage === 'unknown' ? 'unknown' : preferredLanguage
          });
          
          onTranscriptionComplete(result.text);
          toast({
            title: 'Speech Transcribed',
            description: 'Your speech has been converted to text using Sarvam AI.',
          });
        } catch (error) {
          console.error('Speech to text error:', error);
          toast({
            title: 'Transcription Failed',
            description: 'Failed to convert your speech to text. Please try again.',
            variant: 'destructive'
          });
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
          setRecordingTime(0);
          
          // Stop all tracks on the stream to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Error',
        description: 'Please allow microphone access to use speech input.',
        variant: 'destructive'
      });
    }
  };

  const startRecording = () => {
    if (useWebSpeechAPI) {
      startWebSpeechRecognition();
    } else {
      startAudioRecording();
    }
  };

  const stopRecording = () => {
    if (useWebSpeechAPI && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return `Stop Recording (${formatTime(recordingTime)})`;
    
    const method = useWebSpeechAPI ? 'Live Recognition' : 'Sarvam AI';
    return `Record Speech (${method})`;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isDisabled || isProcessing}
        className="flex items-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            <span>Stop Recording ({formatTime(recordingTime)})</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span>{getButtonText()}</span>
          </>
        )}
      </Button>
      
      {isRecording && (
        <div className="animate-pulse flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
        </div>
      )}
      
      <span className="text-xs text-muted-foreground">
        Powered by Sarvam AI ({preferredLanguage})
      </span>
    </div>
  );
};

export default SpeechToTextInput;