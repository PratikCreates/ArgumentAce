"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SimpleSpeechInputProps {
  onTranscriptionComplete: (text: string) => void;
  isDisabled?: boolean;
}

const SimpleSpeechInput: React.FC<SimpleSpeechInputProps> = ({
  onTranscriptionComplete,
  isDisabled = false
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // Simulate recording and transcription
      setTimeout(() => {
        setIsRecording(false);
        onTranscriptionComplete("This is a simulated transcription.");
      }, 2000);
    } catch (error) {
      console.error('Error in speech input:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
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
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span>Record Speech (Simulated)</span>
          </>
        )}
      </Button>
      
      {isRecording && (
        <div className="animate-pulse flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleSpeechInput;