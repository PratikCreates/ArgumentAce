
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, SearchSlash, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import type { ResearchTopicOutput } from '@/types';

interface ResearchAssistantDisplayProps {
  researchPoints: ResearchTopicOutput | null;
  isLoading: boolean;
  topic: string;
}

const ResearchAssistantDisplay: React.FC<ResearchAssistantDisplayProps> = ({
  researchPoints,
  isLoading,
  topic,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            Researching Topic...
          </CardTitle>
          <CardDescription>The AI is gathering key points for "{topic || 'your topic'}"...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-6 w-1/4 mt-2" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!researchPoints && !isLoading) {
    return (
      <Card className="shadow-lg border-dashed border-2">
        <CardContent className="p-6 text-center flex flex-col justify-center items-center min-h-[150px]">
          <SearchSlash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {topic ? `Click "Research Topic" to get key points about "${topic}".` : "Enter a topic and click 'Research Topic' to get insights."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!researchPoints) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Case Preparation
        </CardTitle>
        <CardDescription>For the topic: "{topic}"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-700">
            <ThumbsUp className="h-5 w-5" />
            Arguments For (Pro)
          </h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            {researchPoints.proPoints.map((point, index) => (
              <li key={`pro-${index}`}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-700">
            <ThumbsDown className="h-5 w-5" />
            Arguments Against (Con)
          </h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            {researchPoints.conPoints.map((point, index) => (
              <li key={`con-${index}`}>{point}</li>
            ))}
          </ul>
        </div>
        {researchPoints.keyFacts && researchPoints.keyFacts.length > 0 && (
           <div>
             <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-700">
                <FileText className="h-5 w-5" />
                Key Facts & Statistics
             </h4>
             <ul className="space-y-2 list-disc pl-5 text-sm">
                {researchPoints.keyFacts.map((point, index) => (
                  <li key={`fact-${index}`}>{point}</li>
                ))}
             </ul>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchAssistantDisplay;
