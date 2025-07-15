
"use client";

import type { DebateTurn } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';

interface DebateLogDisplayProps {
  debateLog: DebateTurn[];
  topic: string;
  isLoadingAiResponse: boolean;
}

const DebateLogDisplay: React.FC<DebateLogDisplayProps> = ({ debateLog, topic, isLoadingAiResponse }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [debateLog, isLoadingAiResponse]);

  if (debateLog.length === 0 && !isLoadingAiResponse) {
    return (
      <Card className="shadow-lg border-dashed border-2 min-h-[200px] flex flex-col justify-center">
        <CardContent className="p-6 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {topic ? "The debate will appear here once you submit your first argument." : "Enter a topic and your argument to start the debate."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Debate Log</CardTitle>
        <CardDescription>Topic: {topic || "Not set"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] md:h-[400px] w-full pr-4" ref={scrollAreaRef}>
          <div ref={viewportRef} className="space-y-4">
            {debateLog.map((turn, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  turn.speaker === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {turn.speaker === 'ai' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    turn.speaker === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{turn.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {turn.speaker === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoadingAiResponse && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8 self-start">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <Bot size={18} />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-lg bg-secondary text-secondary-foreground rounded-bl-none animate-pulse">
                  <p className="text-sm">AI is typing...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DebateLogDisplay;
