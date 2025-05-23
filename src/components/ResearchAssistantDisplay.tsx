
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, SearchSlash } from 'lucide-react';

interface ResearchAssistantDisplayProps {
  researchPoints: string[] | null;
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
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
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

  if (!researchPoints || researchPoints.length === 0) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Key Talking Points
        </CardTitle>
        <CardDescription>For the topic: "{topic}"</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          {researchPoints.map((point, index) => (
            <li key={index} className="text-sm">{point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ResearchAssistantDisplay;
