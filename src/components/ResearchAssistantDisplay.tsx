
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
      <CardContent className="space-y-5">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-800">
            <ThumbsUp className="h-5 w-5" />
            Supporting Arguments
          </h4>
          <div className="space-y-2">
            {researchPoints.proPoints.map((point, index) => (
              <div key={`pro-${index}`} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-green-900 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-800">
            <ThumbsDown className="h-5 w-5" />
            Opposing Arguments
          </h4>
          <div className="space-y-2">
            {researchPoints.conPoints.map((point, index) => (
              <div key={`con-${index}`} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-900 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
        
        {researchPoints.keyFacts && researchPoints.keyFacts.length > 0 && (
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
             <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-800">
                <FileText className="h-5 w-5" />
                Key Facts & Evidence
             </h4>
             <div className="space-y-2">
                {researchPoints.keyFacts.map((fact, index) => (
                  <div key={`fact-${index}`} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-900 leading-relaxed">{fact}</p>
                  </div>
                ))}
             </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchAssistantDisplay;
