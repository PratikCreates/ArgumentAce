
// src/components/SharedSessionDisplay.tsx
"use client";

import type { DebateSession } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, ListChecks, Gavel, Scale, Lightbulb, AlertTriangle, Award, Star, Sparkles, Smile, Frown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface SharedSessionDisplayProps {
  session: DebateSession;
  isPdfCapturePhase?: boolean; // New prop
}

const SharedSessionDisplay: React.FC<SharedSessionDisplayProps> = ({ session, isPdfCapturePhase }) => {

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

  // Conditional class for ScrollArea based on PDF capture phase
  const scrollAreaClass = cn(
    "w-full pr-4",
    isPdfCapturePhase 
      ? "h-auto overflow-visible" 
      : "h-[400px] md:h-[600px]"
  );
  
  const scrollAreaViewportClass = cn(
    isPdfCapturePhase ? "overflow-visible" : ""
  );


  return (
    <div className={cn("container mx-auto py-8 px-4 space-y-6", isPdfCapturePhase ? "bg-white" : "")}> {/* Ensure background for PDF if needed */}
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold text-primary">{session.topic}</CardTitle>
          <CardDescription>
            A publicly shared debate session. Skill Level: <Badge variant="outline">{session.reasoningSkill}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {session.juryVerdict && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gavel className="h-7 w-7 text-primary" />
              Jury's Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.juryVerdict.winner && (
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <Award className="h-10 w-10 text-accent mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-accent">
                  Winner: {session.juryVerdict.winner.charAt(0).toUpperCase() + session.juryVerdict.winner.slice(1)}
                </h3>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Scale className="h-5 w-5 text-primary-foreground bg-primary p-0.5 rounded-sm"/>Overall Assessment</h4>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">{session.juryVerdict.overallAssessment}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500"/>User's Performance</h4>
                <div className="space-y-3">
                  <div><h5 className="font-medium text-md mb-1">Strengths:</h5>{renderStrengthsWeaknesses(session.juryVerdict.userStrengths, 'strength')}</div>
                  <div><h5 className="font-medium text-md mb-1">Areas for Improvement:</h5>{renderStrengthsWeaknesses(session.juryVerdict.userWeaknesses, 'weakness')}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-500"/>AI Opponent's Performance</h4>
                <div className="space-y-3">
                  <div><h5 className="font-medium text-md mb-1">Strengths:</h5>{renderStrengthsWeaknesses(session.juryVerdict.aiStrengths, 'strength')}</div>
                  <div><h5 className="font-medium text-md mb-1">Areas for Improvement:</h5>{renderStrengthsWeaknesses(session.juryVerdict.aiWeaknesses, 'weakness')}</div>
                </div>
              </div>
            </div>
            {session.juryVerdict.keyMoments && session.juryVerdict.keyMoments.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent"/>Key Moments</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {session.juryVerdict.keyMoments.map((moment, index) => <li key={index}>{moment}</li>)}
                </ul>
              </div>
            )}
            {session.juryVerdict.adviceForUser && (
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/>Advice for User</h4>
                <p className="text-sm p-3 bg-primary/10 rounded-md border border-primary/30">{session.juryVerdict.adviceForUser}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {session.researchPoints && session.researchPoints.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-6 w-6 text-primary" />
              Research Points Considered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5 text-sm">
              {session.researchPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle  className="text-2xl">Debate Log</CardTitle>
        </CardHeader>
        <CardContent>
           {/* Apply conditional class to ScrollArea */}
          <ScrollArea className={scrollAreaClass}>
             {/* It might also be necessary to ensure the viewport itself allows content to overflow if not wrapped by ScrollArea's fixed height */}
            <div className={cn("space-y-4", scrollAreaViewportClass)}>
              {session.debateLog.map((turn, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${
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
                    className={`max-w-[70%] p-3 rounded-lg shadow ${
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
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedSessionDisplay;
