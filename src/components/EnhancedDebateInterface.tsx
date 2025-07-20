"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { DebateSession, ReasoningSkill, AnalyzeArgumentOutput, ResearchTopicOutput, DebateTurn, JudgeDebateOutput } from '@/types';
import { DebateFormat } from '@/types/debate-formats';
import { 
  generateArgument, 
  analyzeArgument, 
  generateCounterArgument, 
  researchTopic, 
  judgeDebate, 
  // generatePoi 
} from '@/ai/simple-flows';
import { textToSpeech, getVoiceForRole } from '@/services/speech';
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
import FormatSelection from './FormatSelection';
import AsianParliamentaryPrep from './AsianParliamentaryPrep';
import SpeechToTextInput from './SpeechToTextInput';
import PoiSystem from './PoiSystem';
import SpeechTimer from './SpeechTimer';
import DebateFlowManager from './DebateFlowManager';
import DebateStats from './DebateStats';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, MessageSquareText, Save, Send, Loader2, Gavel } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const SESSIONS_STORAGE_KEY = 'argumentAceSessions';
const MIN_TURNS_FOR_JURY = 4;

interface EnhancedDebateInterfaceProps {
  initialTopic?: string;
}

export interface EnhancedDebateInterfaceHandle {
  getSessionData: () => {
    topic: string;
    reasoningSkill: ReasoningSkill;
    debateLog: DebateTurn[];
    researchPoints: ResearchTopicOutput | null;
    juryVerdict: JudgeDebateOutput | null;
    format?: DebateFormat;
    currentRole?: string;
    prepTimeUsed?: number;
  };
}

const EnhancedDebateInterface = forwardRef<EnhancedDebateInterfaceHandle, EnhancedDebateInterfaceProps>((props, ref) => {
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

  const [sessions, setSessions] = useLocalStorage<DebateSession[]>(SESSIONS_STORAGE_KEY, []);
  const [isPastSessionsDialogOpen, setIsPastSessionsDialogOpen] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Enhanced state for debate format and flow
  const [debateFormat, setDebateFormat] = useState<DebateFormat | null>(null);
  const [showFormatSelection, setShowFormatSelection] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [prepTimeUsed, setPrepTimeUsed] = useState<number>(0);
  const [inPreparationPhase, setInPreparationPhase] = useState<boolean>(false);
  
  // New enhanced features
  const [speechTimeElapsed, setSpeechTimeElapsed] = useState<number>(0);
  const [totalDebateTime, setTotalDebateTime] = useState<number>(0);
  const [activePoi, setActivePoi] = useState<string | null>(null);
  const [completedSpeeches, setCompletedSpeeches] = useState<string[]>([]);
  const [currentSpeakingRole, setCurrentSpeakingRole] = useState<string>('');
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    getSessionData: () => ({
      topic,
      reasoningSkill,
      debateLog,
      researchPoints,
      juryVerdict,
      format: debateFormat || undefined,
      currentRole: currentRole || undefined,
      prepTimeUsed: prepTimeUsed || undefined,
    }),
  }));

  // Enhanced handlers
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

    const userTurnText = userArgumentInput;
    setUserArgumentInput(''); 

    // Create user turn with role information if available
    const optimisticUserTurn: DebateTurn = { 
      speaker: 'user', 
      text: userTurnText, 
      timestamp: new Date().toISOString(),
      role: currentRole || undefined
    };
    
    const logWithUserTurn = [...debateLog, optimisticUserTurn];
    setDebateLog(logWithUserTurn);

    try {
      // Format debate history with roles if available
      const formattedDebateHistory = logWithUserTurn.map(turn => {
        const speakerLabel = turn.speaker === 'user' ? 
          (turn.role ? `User (${turn.role})` : 'User') : 
          (turn.role ? `AI (${turn.role})` : 'AI');
        return `${speakerLabel}: "${turn.text}"`;
      }).join('\n\n');

      // Determine AI role based on user role in Asian Parliamentary format
      let aiRole: string | undefined = undefined;
      if (debateFormat === 'asian-parliamentary' && currentRole) {
        const roleMap: Record<string, string> = {
          'Prime Minister': 'Leader of Opposition',
          'Leader of Opposition': 'Deputy Prime Minister',
          'Deputy Prime Minister': 'Deputy Leader of Opposition',
          'Deputy Leader of Opposition': 'Government Whip',
          'Government Whip': 'Opposition Whip',
          'Opposition Whip': 'Government Reply',
          'Government Reply': 'Opposition Reply',
          'Opposition Reply': 'Prime Minister'
        };
        aiRole = roleMap[currentRole];
      }

      const [feedbackResult, aiCounterResult] = await Promise.all([
        analyzeArgument({ 
          argument: userTurnText, 
          topic
        }),
        generateCounterArgument({
          topic,
          formattedDebateHistory,
          opponentSkill: reasoningSkill,
          userRole: currentRole || undefined,
          aiRole: aiRole || undefined
        })
      ]);
      
      setLastFeedback(feedbackResult);

      const finalUserTurn: DebateTurn = { ...optimisticUserTurn, feedback: feedbackResult };
      
      const newAiTurn: DebateTurn = { 
        speaker: 'ai', 
        text: aiCounterResult.counterArgument, 
        timestamp: new Date().toISOString(),
        audioUrl: undefined,
        role: aiRole
      };
      
      setDebateLog([...debateLog, finalUserTurn, newAiTurn]);

      // Generate TTS for AI response
      textToSpeech({ 
        text: newAiTurn.text,
        voiceId: aiRole ? getVoiceForRole(aiRole) : undefined
      }).then(ttsResult => {
        setDebateLog(currentLog => currentLog.map(turn => 
          turn.timestamp === newAiTurn.timestamp ? { ...turn, audioUrl: ttsResult.audioUrl } : turn
        ));
      }).catch(ttsError => {
        console.error("TTS generation failed:", ttsError);
        toast({
          title: "Audio Generation Failed",
          description: "Could not generate audio for AI response. You can still read the text response.",
          variant: "destructive"
        });
      });

    } catch (error) {
      console.error("Error processing turn:", error);
      setDebateLog(debateLog);
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
      const formattedHistory = debateLog.map(turn => {
        const speakerLabel = turn.speaker === 'user' ? 
          (turn.role ? `User (${turn.role})` : 'User') : 
          (turn.role ? `AI (${turn.role})` : 'AI');
        return `${speakerLabel}: "${turn.text}"`;
      }).join('\n\n');
      
      const result = await judgeDebate({ 
        topic, 
        formattedDebateHistory: formattedHistory,
        userRole: currentRole || undefined
      });
      
      setJuryVerdict(result);
    } catch (error) {
      console.error("Error requesting jury verdict:", error);
      toast({ title: "Error Getting Verdict", description: "Failed to get jury verdict. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingJuryVerdict(false);
    }
  };

  // Enhanced POI handlers
  const handlePoiOffered = (poi: string) => {
    setActivePoi(poi);
    toast({ title: "POI Offered", description: "Point of Information has been offered." });
  };

  const handlePoiAccepted = (response: string) => {
    setActivePoi(null);
    // Add POI response to current argument
    setUserArgumentInput(prev => prev + `\n\n[POI Response]: ${response}`);
    toast({ title: "POI Accepted", description: "Your response has been added to your argument." });
  };

  const handlePoiDeclined = () => {
    setActivePoi(null);
    toast({ title: "POI Declined", description: "Point of Information was declined." });
  };

  // Format selection and preparation handlers
  const handleFormatSelected = (format: DebateFormat) => {
    setDebateFormat(format);
    setShowFormatSelection(false);
    
    if (format === 'asian-parliamentary') {
      setInPreparationPhase(true);
    }
  };
  
  const handleStartDebateFromPrep = (argument: string, role: string, timeUsed: number) => {
    setInPreparationPhase(false);
    setUserArgumentInput(argument);
    setCurrentRole(role);
    setPrepTimeUsed(timeUsed);
    setCurrentSpeakingRole(role);
    setIsUserSpeaking(true);
    
    toast({
      title: "Preparation Complete",
      description: `You're now ready to debate as ${role}. Your prepared argument has been loaded.`,
    });
  };

  // Speech timer handlers
  const handleSpeechTimeUpdate = (elapsed: number) => {
    setSpeechTimeElapsed(elapsed);
  };

  const handleSpeechComplete = () => {
    toast({ title: "Speech Time Complete", description: "Your speaking time is up!" });
  };

  // Debate flow handlers
  const handleRoleChange = (role: string, isUserTurn: boolean) => {
    setCurrentSpeakingRole(role);
    setIsUserSpeaking(isUserTurn);
    setSpeechTimeElapsed(0); // Reset speech timer for new speaker
  };

  const handleSpeechCompleted = (role: string) => {
    setCompletedSpeeches(prev => [...prev, role]);
    toast({ title: "Speech Completed", description: `${role} speech has been completed.` });
  };

  // Session management
  const handleSaveSession = () => {
    if (!topic.trim() && debateLog.length === 0) {
      toast({ title: "Nothing to Save", description: "Please enter a topic or start the debate before saving.", variant: "destructive" });
      return;
    }
    
    const existingSessionIndex = currentSessionId ? sessions.findIndex(s => s.id === currentSessionId) : -1;
    let newSession: DebateSession;

    if (existingSessionIndex > -1) {
      newSession = {
        ...sessions[existingSessionIndex],
        topic,
        debateLog,
        researchPoints: researchPoints ?? undefined,
        juryVerdict: juryVerdict ?? undefined,
        timestamp: new Date().toISOString(),
        reasoningSkill,
        format: debateFormat || undefined,
        currentRole: currentRole || undefined,
        prepTimeUsed: prepTimeUsed || undefined
      };
      const updatedSessions = [...sessions];
      updatedSessions[existingSessionIndex] = newSession;
      setSessions(updatedSessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      toast({ title: "Session Updated!", description: "Your current debate session has been updated." });
    } else {
      newSession = {
        id: Date.now().toString(),
        topic,
        debateLog,
        researchPoints: researchPoints ?? undefined,
        juryVerdict: juryVerdict ?? undefined,
        timestamp: new Date().toISOString(),
        reasoningSkill,
        format: debateFormat || undefined,
        currentRole: currentRole || undefined,
        prepTimeUsed: prepTimeUsed || undefined
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
    
    if (session.format) {
      setDebateFormat(session.format);
      setShowFormatSelection(false);
      setInPreparationPhase(false);
    }
    
    if (session.currentRole) {
      setCurrentRole(session.currentRole);
    }
    
    if (session.prepTimeUsed) {
      setPrepTimeUsed(session.prepTimeUsed);
    }
    
    toast({ 
      title: "Session Loaded", 
      description: `Session for topic "${session.topic}"${session.format ? ` (${session.format === 'asian-parliamentary' ? 'Asian Parliamentary' : session.format === 'british-parliamentary' ? 'British Parliamentary' : 'Standard'} format)` : ''} has been loaded.` 
    });
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

  // Reset state when topic changes
  useEffect(() => {
    setResearchPoints(null);
    setGeneratedArgument(null);
    setLastFeedback(null);
    setDebateLog([]);
    setUserArgumentInput('');
    setJuryVerdict(null);
    setCurrentSessionId(null);
    setActivePoi(null);
    setCompletedSpeeches([]);
    setSpeechTimeElapsed(0);
    setTotalDebateTime(0);
    
    if (topic) {
      setShowFormatSelection(true);
      setDebateFormat(null);
      setInPreparationPhase(false);
      setCurrentRole('');
      setPrepTimeUsed(0);
    }
  }, [topic, reasoningSkill]);

  const canRequestVerdict = debateLog.length >= MIN_TURNS_FOR_JURY && !isLoadingJuryVerdict && !isLoadingFeedbackAndAiTurn;

  // Render different content based on the current state
  const renderContent = () => {
    if (!topic.trim()) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Start a New Debate</CardTitle>
              <CardDescription>Enter a topic to begin your debate session.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (showFormatSelection) {
      return <FormatSelection onFormatSelected={handleFormatSelected} />;
    }
    
    if (debateFormat === 'asian-parliamentary' && inPreparationPhase) {
      return (
        <AsianParliamentaryPrep
          topic={topic}
          sessionId={currentSessionId || undefined}
          onStartDebate={handleStartDebateFromPrep}
          researchPoints={researchPoints}
        />
      );
    }
    
    // Enhanced debate interface with tabs
    return (
      <div className="flex-grow">
        <Tabs defaultValue="debate" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="debate">Debate</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="timer">Timer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="debate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScrollArea className="h-[calc(100vh-200px)]">
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

                  {debateFormat && (
                    <Card className="shadow-lg bg-primary/5">
                      <CardContent className="pt-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Format:</span>
                            <span>{debateFormat === 'asian-parliamentary' ? 'Asian Parliamentary' : 
                                   debateFormat === 'british-parliamentary' ? 'British Parliamentary' : 'Standard'}</span>
                          </div>
                          {currentRole && (
                            <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                              Role: {currentRole}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <ArgumentDisplay
                    generatedArgument={generatedArgument}
                    isLoading={isLoadingAiSuggestedArgument}
                    onUseArgument={(argument) => {
                      setUserArgumentInput(argument);
                      setGeneratedArgument(null);
                      toast({ title: "Argument Loaded", description: "AI suggested argument loaded for your turn." });
                    }}
                    onRegenerate={handleGenerateAiSuggestion}
                    onClearArgument={() => setGeneratedArgument(null)}
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
                      
                      <div className="flex justify-between items-center mt-2">
                        <SpeechToTextInput 
                          onTranscriptionComplete={(text) => {
                            if (userArgumentInput.trim()) {
                              setUserArgumentInput(prev => `${prev}\n\n${text}`);
                            } else {
                              setUserArgumentInput(text);
                            }
                            toast({
                              title: "Speech Transcribed",
                              description: "Your speech has been added to the argument."
                            });
                          }}
                          isDisabled={isLoadingFeedbackAndAiTurn || isLoadingJuryVerdict}
                        />
                      </div>
                      
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

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6 pr-1">
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
            </div>
          </TabsContent>
          
          <TabsContent value="flow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DebateFlowManager
                currentUserRole={currentRole}
                onRoleChange={handleRoleChange}
                completedSpeeches={completedSpeeches}
                onSpeechComplete={handleSpeechCompleted}
              />
              <PoiSystem
                isActive={isUserSpeaking}
                currentRole={currentSpeakingRole}
                speechTimeElapsed={speechTimeElapsed}
                onPoiOffered={handlePoiOffered}
                onPoiAccepted={handlePoiAccepted}
                onPoiDeclined={handlePoiDeclined}
                activePoi={activePoi || undefined}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <DebateStats
              debateLog={debateLog}
              prepTimeUsed={prepTimeUsed}
              currentRole={currentRole}
              format={debateFormat === 'asian-parliamentary' ? 'Asian Parliamentary' : debateFormat || 'Standard'}
              totalDebateTime={totalDebateTime}
            />
          </TabsContent>
          
          <TabsContent value="timer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpeechTimer
                maxDuration={currentRole?.includes('Reply') ? 240 : 420} // 4 or 7 minutes
                role={currentSpeakingRole}
                onTimeUpdate={handleSpeechTimeUpdate}
                onComplete={handleSpeechComplete}
                isActive={isUserSpeaking}
              />
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Timer Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Substantive Speeches:</strong> 7 minutes</p>
                    <p><strong>Reply Speeches:</strong> 4 minutes</p>
                    <p><strong>POI Time:</strong> Minutes 1-6 of substantive speeches</p>
                    <p><strong>Protected Time:</strong> First and last minute of each speech</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-background">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <ArgumentAceLogo />
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {debateLog.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleRequestJuryVerdict} 
              disabled={!canRequestVerdict}
              title={debateLog.length < MIN_TURNS_FOR_JURY ? `Need at least ${MIN_TURNS_FOR_JURY - debateLog.length} more turn(s) for a verdict` : "Get Jury Verdict"}
            >
              {isLoadingJuryVerdict ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />}
              Jury Verdict
            </Button>
          )}
          <Button variant="outline" onClick={handleSaveSession} disabled={(!topic && debateLog.length === 0) || isLoadingFeedbackAndAiTurn || isLoadingJuryVerdict}>
            <Save className="mr-2 h-4 w-4" /> {currentSessionId ? 'Update Session' : 'Save Session'}
          </Button>
          <Button variant="outline" onClick={() => setIsPastSessionsDialogOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Past Sessions
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {renderContent()}
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

EnhancedDebateInterface.displayName = "EnhancedDebateInterface";

export default EnhancedDebateInterface;