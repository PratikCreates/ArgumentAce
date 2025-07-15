
"use client";

import type { DebateSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye, AlertCircle, BookOpen, Users, Gavel, Share2, Copy, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { publishSession } from '@/services/sharingService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from './ui/input';
import { cn } from "@/lib/utils";

interface PastSessionsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: DebateSession[];
  onLoadSession: (session: DebateSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
  onUpdateSession: (updatedSession: DebateSession) => void; // To update session with shareId
}

const PastSessionsDialog: React.FC<PastSessionsDialogProps> = ({
  isOpen,
  setIsOpen,
  sessions,
  onLoadSession,
  onDeleteSession,
  onDeleteAllSessions,
  onUpdateSession,
}) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState<string | null>(null); // Stores ID of session being shared
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleShareSession = async (session: DebateSession) => {
    setIsSharing(session.id);
    try {
      const { shareId, publicUrl } = await publishSession({
        localId: session.id,
        topic: session.topic,
        debateLog: session.debateLog,
        researchPoints: session.researchPoints,
        juryVerdict: session.juryVerdict,
        timestamp: session.timestamp,
        reasoningSkill: session.reasoningSkill,
      });
      const updatedSession = { ...session, shareId, isPublic: true, publicUrl };
      onUpdateSession(updatedSession);

      let copySuccess = false;
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopiedLinkId(shareId); // Use shareId which is the ID for the public URL
        copySuccess = true;
        setTimeout(() => setCopiedLinkId(null), 2000);
      } catch (copyError) {
        // Explicitly not logging to console.error here to avoid Next.js overlay for handled error
        // console.error("Failed to copy link to clipboard:", copyError); 
      }

      toast({
        title: "Session Shared!",
        description: (
          <div>
            <p>Your session is now public. {copySuccess ? "Link copied to clipboard!" : "Automatic copy failed. Please copy the link manually."}</p>
            <Input readOnly value={publicUrl} className="mt-2 text-xs" onClick={(e) => (e.target as HTMLInputElement).select()} />
          </div>
        ),
      });

    } catch (error) {
      // console.error("Error sharing session:", error); // General sharing error, might still want to log this
      toast({ title: "Sharing Failed", description: "Could not share the session. Please try again.", variant: "destructive" });
    } finally {
      setIsSharing(null);
    }
  };

  const handleCopyLink = async (publicUrl: string, shareId: string) => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLinkId(shareId);
      toast({ title: "Link Copied!"});
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (error) {
      // Explicitly not logging to console.error here
      // console.error("Failed to copy link to clipboard:", error);
      toast({ title: "Copy Failed", description: "Could not copy link to clipboard. Please copy it manually.", variant: "destructive"});
    }
  };
  
  const getPublicUrl = (shareId?: string) => {
    if (!shareId || typeof window === 'undefined') return '';
    return `${window.location.origin}/share/${shareId}`;
  }

  const lastUserTurnWithFeedback = (session: DebateSession) => {
    return [...session.debateLog].reverse().find(t => t.speaker === 'user' && t.feedback);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Past Debate Sessions</DialogTitle>
          <DialogDescription>Review your saved debate sessions. Click to load or share.</DialogDescription>
        </DialogHeader>
        {sessions.length > 0 ? (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {sessions.map((session) => {
                const publicUrl = getPublicUrl(session.shareId);
                const lastFeedbackTurn = lastUserTurnWithFeedback(session);

                return (
                  <div key={session.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <p className="font-semibold truncate max-w-[300px] sm:max-w-[400px]">{session.topic || "Untitled Session"}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                          {` (${session.reasoningSkill || 'Intermediate'} level)`}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onLoadSession(session);
                            setIsOpen(false);
                          }}
                          title="Load Session"
                        >
                          <Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Load</span>
                        </Button>
                        {!session.shareId && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleShareSession(session)}
                            disabled={isSharing === session.id}
                            title="Share Session"
                          >
                            {isSharing === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4 mr-1 sm:mr-2" />}
                             <span className="hidden sm:inline">Share</span>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDeleteSession(session.id)}
                          title="Delete Session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {session.shareId && publicUrl && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary/20">
                        <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <Input 
                          readOnly 
                          value={publicUrl} 
                          className="text-xs h-8 flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                          aria-label="Shareable link"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleCopyLink(publicUrl, session.shareId!)}
                          className="h-7 w-7"
                          title="Copy link"
                        >
                          {copiedLinkId === session.shareId ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      {session.debateLog && session.debateLog.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {session.debateLog.length} Turn{session.debateLog.length === 1 ? '' : 's'}
                        </Badge>
                      )}
                      {lastFeedbackTurn?.feedback?.fallacies && lastFeedbackTurn.feedback.fallacies.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {lastFeedbackTurn.feedback.fallacies.length} Fallac{lastFeedbackTurn.feedback.fallacies.length === 1 ? 'y' : 'ies'} (last user turn)
                        </Badge>
                      )}
                      {lastFeedbackTurn?.feedback?.fallacies && lastFeedbackTurn.feedback.fallacies.length === 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                          No Fallacies (last user turn)
                        </Badge>
                      )}
                      {session.researchPoints && session.researchPoints.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Researched
                        </Badge>
                      )}
                      {session.juryVerdict && (
                        <Badge variant="default" className="text-xs bg-primary/80 text-primary-foreground">
                          <Gavel className="h-3 w-3 mr-1" />
                          Judged
                        </Badge>
                      )}
                       {session.isPublic && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared Publicly
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No saved sessions yet.</p>
          </div>
        )}
        <DialogFooter className="sm:justify-between mt-4">
          {sessions.length > 0 && (
            <Button variant="destructive" onClick={onDeleteAllSessions} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Delete All Sessions
            </Button>
          )}
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full sm:w-auto mt-2 sm:mt-0">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PastSessionsDialog;
