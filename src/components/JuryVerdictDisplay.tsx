
"use client";

import type { JudgeDebateOutput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Gavel, Scale, Lightbulb, AlertTriangle, Award, Star, Sparkles, Smile, Frown } from 'lucide-react';

interface JuryVerdictDisplayProps {
  verdict: JudgeDebateOutput | null;
  isLoading: boolean;
  topic: string;
}

const JuryVerdictDisplay: React.FC<JuryVerdictDisplayProps> = ({ verdict, isLoading, topic }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Jury Deliberating...
          </CardTitle>
          <CardDescription>The AI jury is evaluating the debate on "{topic || 'the topic'}"...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-1/3 mt-3" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!verdict) {
    return (
      <Card className="shadow-lg border-dashed border-2">
        <CardContent className="p-6 text-center flex flex-col justify-center items-center min-h-[200px]">
          <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {topic ? "Request a jury verdict to get an overall assessment of the debate." : "Start a debate to have it judged."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderStrengthsWeaknesses = (items: string[] | undefined, type: 'strength' | 'weakness') => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-muted-foreground">No specific {type}s noted.</p>;
    }
    return (
      <ul className="list-none space-y-1 pl-0">
        {items.map((item, index) => (
          <li key={index} className="text-sm flex items-start">
            {type === 'strength' ? 
              <Smile className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" /> :
              <Frown className="h-4 w-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
            }
            {item}
          </li>
        ))}
      </ul>
    );
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          Jury's Verdict
        </CardTitle>
        <CardDescription>An overall assessment of the debate on "{topic}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {verdict.winner && (
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <Award className="h-10 w-10 text-accent mx-auto mb-2" />
            <h3 className="text-xl font-semibold text-accent">
              Winner: {verdict.winner.charAt(0).toUpperCase() + verdict.winner.slice(1)}
            </h3>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Scale className="h-5 w-5 text-primary-foreground bg-primary p-0.5 rounded-sm"/>Overall Assessment</h4>
          <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">{verdict.overallAssessment}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500"/>User's Performance</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-md mb-1">Strengths:</h5>
                {renderStrengthsWeaknesses(verdict.userStrengths, 'strength')}
              </div>
              <div>
                <h5 className="font-medium text-md mb-1">Areas for Improvement:</h5>
                {renderStrengthsWeaknesses(verdict.userWeaknesses, 'weakness')}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-500"/>AI Opponent's Performance</h4>
             <div className="space-y-3">
              <div>
                <h5 className="font-medium text-md mb-1">Strengths:</h5>
                {renderStrengthsWeaknesses(verdict.aiStrengths, 'strength')}
              </div>
              <div>
                <h5 className="font-medium text-md mb-1">Areas for Improvement:</h5>
                {renderStrengthsWeaknesses(verdict.aiWeaknesses, 'weakness')}
              </div>
            </div>
          </div>
        </div>

        {verdict.keyMoments && verdict.keyMoments.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent"/>Key Moments</h4>
            <ul className="list-disc space-y-1 pl-5">
              {verdict.keyMoments.map((moment, index) => (
                <li key={index} className="text-sm">{moment}</li>
              ))}
            </ul>
          </div>
        )}

        {verdict.adviceForUser && (
           <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/>Advice for User</h4>
            <p className="text-sm p-3 bg-primary/10 rounded-md border border-primary/30">{verdict.adviceForUser}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JuryVerdictDisplay;
