"use client";

import { useState, useEffect } from 'react';
import type { DebateSession, ReasoningSkill, AnalyzeArgumentOutput } from '@/types';
import { generateArgument } from '@/ai/flows/generate-argument';
import { analyzeArgument } from '@/ai/flows/real-time-feedback';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

import ArgumentAceLogo from './ArgumentAceLogo';
import ArgumentGeneratorControls from './ArgumentGeneratorControls';
import ArgumentDisplay from './ArgumentDisplay';
import FeedbackDisplay from './FeedbackDisplay';
import PastSessionsDialog from './PastSessionsDialog';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { History, MessageSquareText, Save, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const SESSIONS_STORAGE_KEY = 'argumentAceSessions';

const DebateInterface: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [reasoningSkill, setReasoningSkill] = useState<ReasoningSkill>('Intermediate');
  const [generatedArgument, setGeneratedArgument] = useState<string | null>(null);
  const [userArgument, setUserArgument] = useState<string>('');
  const [feedback, setFeedback] = useState<AnalyzeArgumentOutput | null>(null);

  const [isLoadingArgument, setIsLoadingArgument] = useState<boolean>(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);

  const [sessions, setSessions] = useLocalStorage<DebateSession[]>(SESSIONS_STORAGE_KEY, []);
  const [isPastSessionsDialogOpen, setIsPastSessionsDialogOpen] = useState<boolean>(false);

  const { toast } = useToast();

  const handleGenerateArgument = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a debate topic.", variant: "destructive" });
      return;
    }
    setIsLoadingArgument(true);
    setGeneratedArgument(null); // Clear previous generated argument
    try {
      const result = await generateArgument({ topic, reasoningSkill });
      setGeneratedArgument(result.argument);
    } catch (error) {
      console.error("Error generating argument:", error);
      toast({ title: "Error Generating Argument", description: "Failed to generate argument. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingArgument(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!userArgument.trim()) {
      toast({ title: "Argument Required", description: "Please enter your argument.", variant: "destructive" });
      return;
    }
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a debate topic for context.", variant: "destructive" });
      return;
    }
    setIsLoadingFeedback(true);
    setFeedback(null); // Clear previous feedback
    try {
      const result = await analyzeArgument({ argument: userArgument, topic });
      setFeedback(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({ title: "Error Getting Feedback", description: "Failed to get feedback. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleUseArgument = (argument: string) => {
    setUserArgument(argument);
    toast({ title: "Argument Loaded", description: "AI argument loaded into your text area for editing." });
  };

  const handleClearGeneratedArgument = () => {
    setGeneratedArgument(null);
  }

  const handleSaveSession = () => {
    if (!topic.trim() && !userArgument.trim()) {
        toast({ title: "Nothing to Save", description: "Please enter a topic or argument before saving.", variant: "destructive"});
        return;
    }
    const newSession: DebateSession = {
      id: Date.now().toString(),
      topic,
      userArgument,
      generatedArgument: generatedArgument ?? undefined,
      feedback: feedback ?? undefined,
      timestamp: new Date().toISOString(),
    };
    setSessions([...sessions, newSession]);
    toast({ title: "Session Saved!", description: "Your current debate session has been saved." });
  };

  const handleLoadSession = (session: DebateSession) => {
    setTopic(session.topic);
    setUserArgument(session.userArgument);
    setGeneratedArgument(session.generatedArgument || null);
    setFeedback(session.feedback || null);
    setReasoningSkill('Intermediate'); // Reset or load from session if stored
    toast({ title: "Session Loaded", description: `Session for topic "${session.topic}" has been loaded.` });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({ title: "Session Deleted", description: "The selected session has been deleted." });
  };

  const handleDeleteAllSessions = () => {
    setSessions([]);
    toast({ title: "All Sessions Deleted", description: "All saved sessions have been deleted." });
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-background">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <ArgumentAceLogo />
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleSaveSession} disabled={!topic && !userArgument}>
            <Save className="mr-2 h-4 w-4" /> Save Session
          </Button>
          <Button variant="outline" onClick={() => setIsPastSessionsDialogOpen(true)}>
            <History className="mr-2 h-4 w-4" /> View Past Sessions
          </Button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel */}
        <ScrollArea className="h-[calc(100vh-150px)] md:h-auto">
        <div className="space-y-6 pr-3">
          <ArgumentGeneratorControls
            topic={topic}
            setTopic={setTopic}
            reasoningSkill={reasoningSkill}
            setReasoningSkill={setReasoningSkill}
            onGenerate={handleGenerateArgument}
            isLoading={isLoadingArgument}
          />

          <ArgumentDisplay
            generatedArgument={generatedArgument}
            isLoading={isLoadingArgument}
            onUseArgument={handleUseArgument}
            onRegenerate={handleGenerateArgument}
            onClearArgument={handleClearGeneratedArgument}
            topic={topic}
          />
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-6 w-6 text-primary" />
                Your Argument
              </CardTitle>
              <CardDescription>
                Enter your argument here, or use and edit the AI-generated one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type or paste your argument here..."
                value={userArgument}
                onChange={(e) => setUserArgument(e.target.value)}
                className="min-h-[200px] text-base"
                aria-label="Your Argument Input"
              />
              <Button onClick={handleGetFeedback} disabled={isLoadingFeedback || !userArgument.trim() || !topic.trim()} className="mt-4 w-full">
                {isLoadingFeedback ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Get Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
        </ScrollArea>

        {/* Right Panel */}
        <ScrollArea className="h-[calc(100vh-150px)] md:h-auto">
          <div className="md:sticky md:top-6 pr-1"> {/* Sticky for desktop scrolling independence */}
            <FeedbackDisplay feedback={feedback} isLoading={isLoadingFeedback} />
          </div>
        </ScrollArea>
      </main>

      <PastSessionsDialog
        isOpen={isPastSessionsDialogOpen}
        setIsOpen={setIsPastSessionsDialogOpen}
        sessions={sessions}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onDeleteAllSessions={handleDeleteAllSessions}
      />
    </div>
  );
};

export default DebateInterface;
