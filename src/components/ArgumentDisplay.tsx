"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Edit3, RefreshCw, Trash2, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface ArgumentDisplayProps {
  generatedArgument: string | null;
  isLoading: boolean;
  onUseArgument: (argument: string) => void;
  onRegenerate: () => void;
  onClearArgument: () => void;
  topic: string;
}

const ArgumentDisplay: React.FC<ArgumentDisplayProps> = ({
  generatedArgument,
  isLoading,
  onUseArgument,
  onRegenerate,
  onClearArgument,
  topic,
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (generatedArgument) {
      navigator.clipboard.writeText(generatedArgument);
      setIsCopied(true);
      toast({ title: "Argument Copied!", description: "The generated argument has been copied to your clipboard." });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Generated Argument
          </CardTitle>
          <CardDescription>The AI is crafting an argument for you...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generatedArgument && !isLoading) {
     return (
      <Card className="shadow-md border-dashed border-2">
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {topic ? "Generate an argument for the current topic or write your own below." : "Enter a topic above to generate an AI argument."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!generatedArgument) return null;


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Generated Argument
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy Argument">
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>Here's a starting point from the AI. You can use it, edit it, or write your own.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/30 p-4 rounded-md border min-h-[150px]">
          <div className="prose prose-sm max-w-none">
            {generatedArgument.split('\n').filter(line => line.trim()).map((paragraph, index) => (
              <p key={index} className="mb-3 text-sm leading-relaxed text-foreground">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => onUseArgument(generatedArgument)} variant="default">
            <Edit3 className="mr-2 h-4 w-4" /> Use & Edit This
          </Button>
          <Button onClick={onRegenerate} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
          </Button>
          <Button onClick={onClearArgument} variant="ghost" className="text-destructive hover:text-destructive">
             <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArgumentDisplay;
