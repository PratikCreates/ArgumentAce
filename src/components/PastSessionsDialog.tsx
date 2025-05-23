
"use client";

import type { DebateSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye, AlertCircle, BookOpen, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PastSessionsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: DebateSession[];
  onLoadSession: (session: DebateSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
}

const PastSessionsDialog: React.FC<PastSessionsDialogProps> = ({
  isOpen,
  setIsOpen,
  sessions,
  onLoadSession,
  onDeleteSession,
  onDeleteAllSessions,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Past Debate Sessions</DialogTitle>
          <DialogDescription>Review your saved debate sessions. Click to load a session.</DialogDescription>
        </DialogHeader>
        {sessions.length > 0 ? (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {sessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((session) => (
                <div key={session.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <p className="font-semibold truncate max-w-[350px] sm:max-w-[450px]">{session.topic || "Untitled Session"}</p>
                      <p className="text-xs text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
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
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {session.feedback && session.feedback.fallacies && session.feedback.fallacies.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {session.feedback.fallacies.length} Fallac{session.feedback.fallacies.length === 1 ? 'y' : 'ies'}
                      </Badge>
                    )}
                     {session.feedback && session.feedback.fallacies && session.feedback.fallacies.length === 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                        No Fallacies
                      </Badge>
                    )}
                    {session.researchPoints && session.researchPoints.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Researched
                      </Badge>
                    )}
                    {session.aiOpponentArgument && (
                      <Badge variant="outline" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Countered
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No saved sessions yet.</p>
          </div>
        )}
        <DialogFooter className="sm:justify-between mt-4">
           {sessions.length > 0 && (
             <Button variant="destructive" onClick={() => {
                onDeleteAllSessions();
                // Optionally close dialog if you want, or let user close manually
                // setIsOpen(false); 
             }} className="w-full sm:w-auto">
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

