
"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { DebateSession, ReasoningSkill, AnalyzeArgumentOutput, ResearchTopicOutput, DebateTurn, JudgeDebateOutput } from '@/types';
import { generateArgument } from '@/ai/flows/generate-argument';
import { analyzeArgument } from '@/ai/flows/real-time-feedback';
import { generateCounterArgument } from '@/ai/flows/generate-counter-argument';
import { researchTopic } from '@/ai/flows/research-topic-flow';
import { judgeDebate } from '@/ai/flows/judge-debate-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { generatePoi } from '@/ai/flows/generate-poi-flow';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

import ArgumentAceLogo from './ArgumentAceLogo';
import ArgumentGeneratorControls from './ArgumentGeneratorControls';
import ArgumentDisplay from './ArgumentDisplay';
import FeedbackDisplay from './FeedbackDisplay';
import DebateLogDisplay from './DebateLogDisplay';
import ResearchAssistantDisplay from './ResearchAssistantDisplay';
import JuryVerdictDisplay from './JuryVerdictDisplay';
import PastSessionsDialog from './PastSessionsDialog';
import PoiDisplay from './PoiDisplay';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, MessageSquareText, Save, Send, Loader2, Gavel, Scale, HelpCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const SESSIONS_STORAGE_KEY = 'argumentAceSessions';
const MIN_TURNS_FOR_JURY = 4;
const MIN_CHARS_FOR_POI = 150;

interface DebateInterfaceProps {
  // No props needed for now
}

export interface DebateInterfaceHandle {
  getSessionData: () => {
    topic: string;
    reasoningSkill: ReasoningSkill;
    debateLog: DebateTurn[];
    researchPoints: ResearchTopicOutput | null;
    juryVerdict: JudgeDebateOutput | null;
  };
}


const DebateInterface = forwardRef<DebateInterfaceHandle, DebateInterfaceProps>((props, ref) => {
  const [topic, setTopic] = useState<string>('');
  const [reasoningSkill, setReasoningSkill] = useState<ReasoningSkill>('Intermediate');
  const [generatedArgument, setGeneratedArgument] = useState<string | null>(null);
  
  const [userArgumentInput, setUserArgumentInput] = useState<string>('');
  const [debateLog, setDebateLog] = useState<DebateTurn[]>([]);
  
  const [lastFeedback, setLastFeedback] = useState<AnalyzeArgumentOutput | null>(null);
  const [researchPoints, setResearchPoints] = useState<ResearchTopicOutput | null>(null);
  const [juryVerdict, setJuryVerdict] = useState<JudgeDebateOutput | null>(null);

  const [isLoadingAiSuggestedArgument, setIsLoadingAiSuggestedArgument] = useState<boolean>(false);
  const [isLoadingFeedbackAndAiTurn, setIsLoadingFeedbackAndAiTurn] = useState<boolean>(false);
  const [isLoadingResearch, setIsLoadingResearch] = useState<boolean>(false);
  const [isLoadingJuryVerdict, setIsLoadingJuryVerdict] = useState<boolean>(false);
  const [isLoadingPoi, setIsLoadingPoi] = useState<boolean>(false);
  
  const [poi, setPoi] = useState<string | null>(null);
  const [poiResponse, setPoiResponse] = useState<string>('');

  const [sessions, setSessions] = useLocalStorage<DebateSession[]>(SESSIONS_STORAGE_KEY, []);
  const [isPastSessionsDialogOpen, setIsPastSessionsDialogOpen] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    getSessionData: () => ({
      topic,
      reasoningSkill,
      debateLog,
      researchPoints,
      juryVerdict,
    }),
  }));


  const handleGenerateAiSuggestion = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a debate topic.", variant: "destructive" });
      return;
    }
    setIsLoadingAiSuggestedArgument(true);
    setGeneratedArgument(null);
    setJuryVerdict(null); 
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
    setJuryVerdict(null); 
    try {
      const result: ResearchTopicOutput = await researchTopic({ topic });
      setResearchPoints(result);
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
    setLastFeedback(null);
    setJuryVerdict(null);

    let userTurnText = userArgumentInput;
    // Append POI response if it exists
    if (poi && poiResponse) {
        userTurnText += `\n\n(Response to POI: "${poi}"): ${poiResponse}`;
    }

    setUserArgumentInput(''); 
    setPoi(null);
    setPoiResponse('');


    const optimisticUserTurn: DebateTurn = { speaker: 'user', text: userTurnText, timestamp: new Date().toISOString() };
    const logWithUserTurn = [...debateLog, optimisticUserTurn];
    setDebateLog(logWithUserTurn);

    try {
      const [feedbackResult, aiCounterResult] = await Promise.all([
        analyzeArgument({ argument: userTurnText, topic }),
        generateCounterArgument({
          topic,
          formattedDebateHistory: logWithUserTurn.map(turn => `${turn.speaker === 'user' ? 'User' : 'AI'}: "${turn.text}"`).join('\n\n'),
          opponentSkill: reasoningSkill
        })
      ]);
      
      setLastFeedback(feedbackResult);

      const finalUserTurn: DebateTurn = { ...optimisticUserTurn, feedback: feedbackResult };
      
      let newAiTurn: DebateTurn = { 
        speaker: 'ai', 
        text: aiCounterResult.counterArgument, 
        timestamp: new Date().toISOString(),
        audioUrl: undefined, // Start with no audio URL
      };
      
      setDebateLog([...debateLog, finalUserTurn, newAiTurn]);

      // Kick off TTS generation in the background, non-blocking
      textToSpeech({ text: newAiTurn.text }).then(ttsResult => {
        setDebateLog(currentLog => currentLog.map(turn => 
          turn.timestamp === newAiTurn.timestamp ? { ...turn, audioUrl: ttsResult.audioUrl } : turn
        ));
      }).catch(ttsError => {
        console.error("TTS generation failed:", ttsError);
        // Optionally notify user, but don't block the flow
      });

    } catch (error) {
      console.error("Error processing turn:", error);
      setDebateLog(debateLog); // Revert optimistic update on primary error
      toast({ title: "Error Processing Turn", description: "Failed to get feedback or AI response. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingFeedbackAndAiTurn(false);
    }
  };

  const handleRequestJuryVerdict = async () => {
    if (debateLog.length < MIN_TURNS_FOR_JURY) {
      toast({ title: "Not Enough Debate", description: `Please have at least ${MIN_TURNS_FOR_JURY / 2} exchanges before requesting a verdict.`, variant: "destructive" });
      return;
    }
    setIsLoadingJuryVerdict(true);
    setJuryVerdict(null);
    try {
      const formattedHistory = debateLog
        .map(turn => `${turn.speaker === 'user' ? 'User' : 'AI'}: "${turn.text}"`)
        .join('\n\n');
      const result = await judgeDebate({ topic, formattedDebateHistory: formattedHistory });
      setJuryVerdict(result);
    } catch (error)      {
      console.error("Error requesting jury verdict:", error);
      toast({ title: "Error Getting Verdict", description: "Failed to get jury verdict. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingJuryVerdict(false);
    }
  };
  
  const handleRequestPoi = async () => {
    if (!userArgumentInput.trim() || userArgumentInput.length < MIN_CHARS_FOR_POI) {
        toast({ title: "Argument Too Short", description: `Please write at least ${MIN_CHARS_FOR_POI} characters before requesting a POI.`, variant: "destructive" });
        return;
    }
    setIsLoadingPoi(true);
    setPoi(null);
    setPoiResponse('');
    try {
        const result = await generatePoi({ topic, userArgument: userArgumentInput });
        setPoi(result.poiQuestion);
    } catch (error) {
        console.error("Error generating POI:", error);
        toast({ title: "Error Generating POI", description: "Failed to get a POI. Please try again.", variant: "destructive" });
    } finally {
        setIsLoadingPoi(false);
    }
  }


  const handleUseAiSuggestedArgument = (argument: string) => {
    setUserArgumentInput(argument);
    setGeneratedArgument(null);
    setJuryVerdict(null);
    toast({ title: "Argument Loaded", description: "AI suggested argument loaded for your turn." });
  };

  const handleClearAiSuggestedArgument = () => {
    setGeneratedArgument(null);
  };
  
  useEffect(() => {
    setResearchPoints(null);
    setGeneratedArgument(null);
    setLastFeedback(null);
    setDebateLog([]);
    setUserArgumentInput('');
    setJuryVerdict(null);
    setCurrentSessionId(null);
    setPoi(null);
    setPoiResponse('');
  }, [topic, reasoningSkill]);


  const handleSaveSession = () => {
    if (!topic.trim() && debateLog.length === 0) {
      toast({ title: "Nothing to Save", description: "Please enter a topic or start the debate before saving.", variant: "destructive" });
      return;
    }
    
    const existingSessionIndex = currentSessionId ? sessions.findIndex(s => s.id === currentSessionId) : -1;
    let newSession: DebateSession;

    if (existingSessionIndex > -1) { // Update existing session
      newSession = {
        ...sessions[existingSessionIndex],
        topic,
        debateLog,
        researchPoints: researchPoints ?? undefined,
        juryVerdict: juryVerdict ?? undefined,
        timestamp: new Date().toISOString(),
        reasoningSkill,
      };
      const updatedSessions = [...sessions];
      updatedSessions[existingSessionIndex] = newSession;
      setSessions(updatedSessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      toast({ title: "Session Updated!", description: "Your current debate session has been updated." });
    } else { // Create new session
      newSession = {
        id: Date.now().toString(),
        topic,
        debateLog,
        researchPoints: researchPoints ?? undefined,
        juryVerdict: juryVerdict ?? undefined,
        timestamp: new Date().toISOString(),
        reasoningSkill,
      };
      setCurrentSessionId(newSession.id);
      setSessions(prevSessions => [newSession, ...prevSessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())]);
      toast({ title: "Session Saved!", description: "Your current debate session has been saved." });
    }
  };

  const handleLoadSession = (session: DebateSession) => {
    setTopic(session.topic);
    setDebateLog(session.debateLog);
    setResearchPoints(session.researchPoints || null);
    setJuryVerdict(session.juryVerdict || null);
    setReasoningSkill(session.reasoningSkill || 'Intermediate');
    setCurrentSessionId(session.id); 
    setUserArgumentInput(''); 
    setGeneratedArgument(null); 
    setLastFeedback(session.debateLog.filter(t => t.speaker === 'user').pop()?.feedback || null);
    toast({ title: "Session Loaded", description: `Session for topic "${session.topic}" has been loaded.` });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setTopic('');
      setReasoningSkill('Intermediate');
    }
    toast({ title: "Session Deleted", description: "The selected session has been deleted." });
  };

  const handleDeleteAllSessions = () => {
    setSessions([]);
    setTopic('');
    setReasoningSkill('Intermediate');
    toast({ title: "All Sessions Deleted", description: "All saved sessions have been deleted." });
  };

  const handleUpdateSessionWithShareId = (updatedSession: DebateSession) => {
    const sessionIndex = sessions.findIndex(s => s.id === updatedSession.id);
    if (sessionIndex > -1) {
      const newSessions = [...sessions];
      newSessions[sessionIndex] = updatedSession;
      setSessions(newSessions);
    }
  };
  
  const userLastTurnText = debateLog.filter(t => t.speaker === 'user').pop()?.text || "";
  const canRequestVerdict = debateLog.length >= MIN_TURNS_FOR_JURY && !isLoadingJuryVerdict && !isLoadingFeedbackAndAiTurn;
  const canRequestPoi = userArgumentInput.length >= MIN_CHARS_FOR_POI && !poi && !isLoadingPoi;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-background">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <ArgumentAceLogo />
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={handleRequestJuryVerdict} 
            disabled={!canRequestVerdict}
            title={debateLog.length < MIN_TURNS_FOR_JURY ? `Need at least ${MIN_TURNS_FOR_JURY - debateLog.length} more turn(s) for a verdict` : "Get Jury Verdict"}
          >
            {isLoadingJuryVerdict ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />}
            Jury Verdict
          </Button>
          <Button variant="outline" onClick={handleSaveSession} disabled={(!topic && debateLog.length === 0) || isLoadingFeedbackAndAiTurn || isLoadingJuryVerdict}>
            <Save className="mr-2 h-4 w-4" /> {currentSessionId ? 'Update Session' : 'Save Session'}
          </Button>
          <Button variant="outline" onClick={() => setIsPastSessionsDialogOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Past Sessions
          </Button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScrollArea className={"h-[calc(100vh-170px)] md:h-auto"}>
          <div className="space-y-6 pr-3">
            <ArgumentGeneratorControls
              topic={topic}
              setTopic={setTopic}
              reasoningSkill={reasoningSkill}
              setReasoningSkill={setReasoningSkill}
              onGenerateArgument={handleGenerateAiSuggestion}
              onResearchTopic={handleResearchTopic}
              isLoadingArgument={isLoadingAiSuggestedArgument}
              isLoadingResearch={isLoadingResearch}
            />

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
                  className="min-h-[150px] md:min-h-[200px] text-base"
                  aria-label="Your Argument Input"
                  disabled={isLoadingFeedbackAndAiTurn || isLoadingJuryVerdict}
                />

                <PoiDisplay 
                  poi={poi}
                  poiResponse={poiResponse}
                  setPoiResponse={setPoiResponse}
                  onGetPoi={handleRequestPoi}
                  canRequestPoi={canRequestPoi}
                  isLoadingPoi={isLoadingPoi}
                />
                
                <Button 
                  onClick={handleSubmitUserTurn} 
                  disabled={isLoadingFeedbackAndAiTurn || isLoadingJuryVerdict || !userArgumentInput.trim() || !topic.trim()} 
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

        <ScrollArea className={"h-[calc(100vh-170px)] md:h-auto"}>
          <div className="space-y-6 md:sticky md:top-6 pr-1">
             <JuryVerdictDisplay
              verdict={juryVerdict}
              isLoading={isLoadingJuryVerdict}
              topic={topic}
            />
            <ResearchAssistantDisplay 
              researchPoints={researchPoints}
              isLoading={isLoadingResearch}
              topic={topic}
            />
            <DebateLogDisplay 
              debateLog={debateLog}
              topic={topic}
              isLoadingAiResponse={isLoadingFeedbackAndAiTurn}
            />
            <FeedbackDisplay 
                feedback={lastFeedback} 
                isLoading={isLoadingFeedbackAndAiTurn}
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
        onUpdateSession={handleUpdateSessionWithShareId}
      />
    </div>
  );
});

DebateInterface.displayName = "DebateInterface";

export default DebateInterface;
