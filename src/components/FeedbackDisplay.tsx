
"use client";

import type { AnalyzeArgumentOutput } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lightbulb, MessageCircleQuestion, ThumbsUp, BotMessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackDisplayProps {
  feedback: AnalyzeArgumentOutput | null;
  isLoading: boolean;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <BotMessageSquare className="h-6 w-6 text-primary" />
            AI Feedback
          </CardTitle>
          <CardDescription>Analyzing your argument...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card className="shadow-lg h-full border-dashed border-2">
        <CardContent className="p-6 text-center flex flex-col justify-center items-center h-full">
          <BotMessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Submit an argument to get feedback from the AI.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          AI Feedback for Your Last Turn
        </CardTitle>
        <CardDescription>Here&apos;s the AI&apos;s analysis of your most recent argument.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['overall-feedback', 'fallacies', 'persuasion', 'counterpoints']} className="w-full">
          <AccordionItem value="overall-feedback">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" /> Overall Feedback
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              {feedback.feedback || "No overall feedback provided."}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fallacies">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Logical Fallacies
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              {feedback.logicalFallacies && feedback.logicalFallacies.length > 0 ? (
                feedback.logicalFallacies.map((fallacy, index) => (
                  <Badge key={index} variant="destructive" className="mr-2 mb-2 p-2 text-sm">{fallacy}</Badge>
                ))
              ) : (
                <p>No logical fallacies identified. Well done!</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="persuasion">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-600" /> Persuasion Techniques
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              {feedback.persuasiveTechniques && feedback.persuasiveTechniques.length > 0 ? (
                feedback.persuasiveTechniques.map((technique, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2 p-2 text-sm bg-green-100 text-green-700 border-green-300">{technique}</Badge>
                ))
              ) : (
                <p>No specific persuasion techniques highlighted. Consider incorporating some!</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="counterpoints">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
               <div className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-blue-600" /> Suggested Counterpoints
               </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              {feedback.counterpoints && feedback.counterpoints.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {feedback.counterpoints.map((counter, index) => (
                    <li key={index}>{counter}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific counterpoints suggested by the AI for this argument.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FeedbackDisplay;
