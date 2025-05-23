
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, BrainCircuit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OpponentArgumentDisplayProps {
  opponentArgument: string | null;
  isLoading: boolean;
  topic: string;
}

// This component might be deprecated or repurposed if DebateLogDisplay handles all AI responses.
// For now, keeping it as a reference or for potential distinct display of a single AI counter.

const OpponentArgumentDisplay: React.FC<OpponentArgumentDisplayProps> = ({
  opponentArgument,
  isLoading,
  topic,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Opponent Responding...
          </CardTitle>
          <CardDescription>The AI is formulating its counter-argument.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!opponentArgument && !isLoading) {
    return (
      <Card className="shadow-md border-dashed border-2 min-h-[150px] flex items-center justify-center">
        <CardContent className="p-6 text-center">
          <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {topic ? "Submit your argument to see the AI's response here." : "Enter a topic and your argument first."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!opponentArgument) return null;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI Opponent's Argument
        </CardTitle>
        <CardDescription>Here's the AI's counter-argument to your points.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={opponentArgument}
          readOnly
          className="min-h-[150px] bg-secondary/30"
          aria-label="AI Opponent's Argument"
        />
      </CardContent>
    </Card>
  );
};

export default OpponentArgumentDisplay;
