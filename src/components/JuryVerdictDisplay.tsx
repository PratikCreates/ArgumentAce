
"use client";

import type { JudgeDebateOutput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Gavel, Scale, Lightbulb, AlertTriangle, Award, Star, Sparkles, Smile, Frown, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';


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
  
  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-600';
    if (score < 0) return 'text-red-600';
    return 'text-muted-foreground';
  }
  
  const getWinnerBadge = (winner: 'user' | 'ai' | 'tie') => {
    if (winner === 'user') return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">User Win</Badge>;
    if (winner === 'ai') return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">AI Win</Badge>;
    return <Badge variant="outline">Tie</Badge>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          Jury's Verdict
        </CardTitle>
        <CardDescription>An analytical assessment of the debate on "{topic}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="text-center p-4 bg-accent/10 rounded-lg">
          <Award className="h-10 w-10 text-accent mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-accent">
            Overall Winner: {verdict.winner.charAt(0).toUpperCase() + verdict.winner.slice(1)}
          </h3>
          <p className="text-sm text-muted-foreground">Based on a final score of <span className={cn("font-bold", getScoreColor(verdict.finalScore))}>{verdict.finalScore}</span>.</p>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Scale className="h-5 w-5 text-primary-foreground bg-primary p-0.5 rounded-sm"/>Clash Analysis</h4>
          <div className="space-y-4">
            {verdict.clashes.map((clash, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <h5 className="font-semibold">{clash.clashPoint}</h5>
                  {getWinnerBadge(clash.winner)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{clash.summary}</p>
                <p className="text-xs italic bg-secondary/30 p-2 rounded">Reasoning: {clash.reasoning}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold">Score: <span className={cn("font-bold", getScoreColor(clash.winnerScore))}>{clash.winnerScore > 0 ? `+${clash.winnerScore}`: clash.winnerScore}</span></span>
                  <Progress value={50 + (clash.winnerScore * 10)} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary-foreground bg-primary p-0.5 rounded-sm"/>
            Overall Assessment
          </h4>
          <div className="bg-secondary/30 p-4 rounded-md space-y-2">
            {verdict.overallAssessment.split('\n').filter(line => line.trim()).map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph.trim()}
              </p>
            ))}
          </div>
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

        {verdict.adviceForUser && (
           <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/>Actionable Advice for User</h4>
            <p className="text-sm p-3 bg-primary/10 rounded-md border border-primary/30">{verdict.adviceForUser}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JuryVerdictDisplay;
