
"use client";

import { useState, useEffect } from 'react';
import type { DebateSession, ReasoningSkill, AnalyzeArgumentOutput, ResearchTopicOutput, DebateTurn } from '@/types';
import { generateArgument } from '@/ai/flows/generate-argument';
import { analyzeArgument } from '@/ai/flows/real-time-feedback';
import { generateCounterArgument } from '@/ai/flows/generate-counter-argument';
import { researchTopic } from '@/ai/flows/research-topic-flow';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

import ArgumentAceLogo from './ArgumentAceLogo';
import ArgumentGeneratorControls from './ArgumentGeneratorControls';
import ArgumentDisplay from './ArgumentDisplay'; // For AI suggested argument
import FeedbackDisplay from './FeedbackDisplay';
// import OpponentArgumentDisplay from './OpponentArgumentDisplay'; // Replaced by DebateLogDisplay
import DebateLogDisplay from './DebateLogDisplay';
import ResearchAssistantDisplay from './ResearchAssistantDisplay';
import PastSessionsDialog from './PastSessionsDialog';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, MessageSquareText, Save, Send, Loader2, Swords, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const SESSIONS_STORAGE_KEY = 'argumentAceSessions';

const DebateInterface: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [reasoningSkill, setReasoningSkill] = useState<ReasoningSkill>('Intermediate');
  const [generatedArgument, setGeneratedArgument] = useState<string | null>(null); // For "Generate AI Argument" feature
  
  const [userArgumentInput, setUserArgumentInput] = useState<string>(''); // Current text in textarea
  const [debateLog, setDebateLog] = useState<DebateTurn[]>([]);
  
  const [feedback, setFeedback] = useState<AnalyzeArgumentOutput | null>(null);
  const [researchPoints, setResearchPoints] = useState<string[] | null>(null);

  const [isLoadingAiSuggestedArgument, setIsLoadingAiSuggestedArgument] = useState<boolean>(false);
  const [isLoadingFeedbackAndAiTurn, setIsLoadingFeedbackAndAiTurn] = useState<boolean>(false);
  const [isLoadingResearch, setIsLoadingResearch] = useState<boolean>(false);

  const [sessions, setSessions] = useLocalStorage<DebateSession[]>(SESSIONS_STORAGE_KEY, []);
  const [isPastSessionsDialogOpen, setIsPastSessionsDialogOpen] = useState<boolean>(false);

  const { toast } = useToast();

  // Handles "Generate AI Argument" button (suggestion for user)
  const handleGenerateAiSuggestion = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a debate topic.", variant: "destructive" });
      return;
    }
    setIsLoadingAiSuggestedArgument(true);
    setGeneratedArgument(null);
    try {
      const result = await generateArgument({ topic, reasoningSkill });
      setGeneratedArgument(result.argument);
    } catch (error) {
      console.error("Error generating AI suggested argument:", error);
      toast({ title: "Error Generating Suggestion", description: "Failed to generate argument suggestion. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingAiSuggestedArgument(false);
    }
  };

  const handleResearchTopic = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a debate topic to research.", variant: "destructive" });
      return;
    }
    setIsLoadingResearch(true);
    setResearchPoints(null);
    try {
      const result: ResearchTopicOutput = await researchTopic({ topic });
      setResearchPoints(result.researchPoints);
    } catch (error) {
      console.error("Error researching topic:", error);
      toast({ title: "Error Researching Topic", description: "Failed to get research points. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingResearch(false);
    }
  };

  const handleSubmitUserTurn = async () => {
    if (!userArgumentInput.trim()) {
      toast({ title: "Argument Required", description: "Please enter your argument.", variant: "destructive" });
      return;
    }
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please ensure a debate topic is set.", variant: "destructive" });
      return;
    }

    setIsLoadingFeedbackAndAiTurn(true);
    setFeedback(null);

    const newUserTurn: DebateTurn = { speaker: 'user', text: userArgumentInput, timestamp: new Date().toISOString() };
    const updatedDebateLog = [...debateLog, newUserTurn];
    setDebateLog(updatedDebateLog);
    setUserArgumentInput(''); // Clear input for next turn

    try {
      // 1. Get feedback for the user's current turn
      const feedbackResult = await analyzeArgument({ argument: newUserTurn.text, topic });
      setFeedback(feedbackResult);

      // 2. Get AI opponent's counter-argument
      const formattedHistory = updatedDebateLog
        .map(turn => `${turn.speaker === 'user' ? 'User' : 'AI'}: "${turn.text}"`)
        .join('\n');
      
      const aiCounterResult = await generateCounterArgument({
        topic,
        formattedDebateHistory: formattedHistory,
        opponentSkill: reasoningSkill
      });
      
      const newAiTurn: DebateTurn = { speaker: 'ai', text: aiCounterResult.counterArgument, timestamp: new Date().toISOString() };
      setDebateLog(prevLog => [...prevLog, newAiTurn]);

    } catch (error) {
      console.error("Error processing turn:", error);
      toast({ title: "Error Processing Turn", description: "Failed to get feedback or AI response. Please try again.", variant: "destructive" });
      // Optionally, remove user's turn from log if AI part fails critically, or allow retry
    } finally {
      setIsLoadingFeedbackAndAiTurn(false);
    }
  };

  const handleUseAiSuggestedArgument = (argument: string) => {
    setUserArgumentInput(argument); // Load into main input area
    setGeneratedArgument(null); // Clear the suggestion box
    toast({ title: "Argument Loaded", description: "AI suggested argument loaded for your turn." });
  };

  const handleClearAiSuggestedArgument = () => {
    setGeneratedArgument(null);
  };
  
  useEffect(() => {
    // Reset relevant states when topic changes
    setResearchPoints(null);
    setGeneratedArgument(null); // AI suggestion
    setFeedback(null);
    setDebateLog([]);
    setUserArgumentInput('');
  }, [topic]);


  const handleSaveSession = () => {
    if (!topic.trim() && debateLog.length === 0) {
      toast({ title: "Nothing to Save", description: "Please enter a topic or start the debate before saving.", variant: "destructive" });
      return;
    }
    const newSession: DebateSession = {
      id: Date.now().toString(),
      topic,
      debateLog,
      feedback: feedback ?? undefined, // Feedback for the last user turn
      researchPoints: researchPoints ?? undefined,
      timestamp: new Date().toISOString(),
      reasoningSkill,
    };
    setSessions(prevSessions => [newSession, ...prevSessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())]);
    toast({ title: "Session Saved!", description: "Your current debate session has been saved." });
  };

  const handleLoadSession = (session: DebateSession) => {
    setTopic(session.topic);
    setDebateLog(session.debateLog);
    setFeedback(session.feedback || null);
    setResearchPoints(session.researchPoints || null);
    setReasoningSkill(session.reasoningSkill || 'Intermediate');
    setUserArgumentInput(''); // Clear current input
    setGeneratedArgument(null); // Clear AI suggestion
    toast({ title: "Session Loaded", description: `Session for topic "${session.topic}" has been loaded.` });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({ title: "Session Deleted", description: "The selected session has been deleted." });
  };

  const handleDeleteAllSessions = () => {
    setSessions([]);
    toast({ title: "All Sessions Deleted", description: "All saved sessions have been deleted." });
  };
  
  const userLastTurnText = debateLog.filter(t => t.speaker === 'user').pop()?.text || "";

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-background">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <ArgumentAceLogo />
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleSaveSession} disabled={(!topic && debateLog.length === 0) || isLoadingFeedbackAndAiTurn}>
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
              onGenerateArgument={handleGenerateAiSuggestion} // This is for "Suggest an argument for me"
              onResearchTopic={handleResearchTopic}
              isLoadingArgument={isLoadingAiSuggestedArgument}
              isLoadingResearch={isLoadingResearch}
            />

            {/* Display for AI Suggested Argument (for user to use) */}
            <ArgumentDisplay
              generatedArgument={generatedArgument}
              isLoading={isLoadingAiSuggestedArgument}
              onUseArgument={handleUseAiSuggestedArgument}
              onRegenerate={handleGenerateAiSuggestion}
              onClearArgument={handleClearAiSuggestedArgument}
              topic={topic}
            />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="h-6 w-6 text-primary" />
                  {debateLog.length > 0 ? "Your Next Argument / Rebuttal" : "Your Opening Argument"}
                </CardTitle>
                <CardDescription>
                  {debateLog.length > 0 
                    ? "Respond to the AI or make your next point." 
                    : "Enter your opening argument here, or use an AI suggestion."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your argument here..."
                  value={userArgumentInput}
                  onChange={(e) => setUserArgumentInput(e.target.value)}
                  className="min-h-[200px] text-base"
                  aria-label="Your Argument Input"
                />
                <Button 
                  onClick={handleSubmitUserTurn} 
                  disabled={isLoadingFeedbackAndAiTurn || !userArgumentInput.trim() || !topic.trim()} 
                  className="mt-4 w-full"
                >
                  {isLoadingFeedbackAndAiTurn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {debateLog.length > 0 ? "Send Rebuttal & Get AI Response" : "Submit Argument & Get AI Response"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Right Panel */}
        <ScrollArea className="h-[calc(100vh-150px)] md:h-auto">
          <div className="space-y-6 md:sticky md:top-6 pr-1">
            <ResearchAssistantDisplay 
              researchPoints={researchPoints}
              isLoading={isLoadingResearch}
              topic={topic}
            />
            
            <DebateLogDisplay 
              debateLog={debateLog}
              topic={topic}
              isLoadingAiResponse={isLoadingFeedbackAndAiTurn && userArgumentInput === ''} // Show loading in log if AI is "typing"
            />

            <FeedbackDisplay 
                feedback={feedback} 
                isLoading={isLoadingFeedbackAndAiTurn && userArgumentInput !== '' && userLastTurnText !== ''} // Show loading feedback if processing user's submitted text
                // Pass the user's last argument text to FeedbackDisplay if it needs it for context, or ensure feedback object contains it
            />
            
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
