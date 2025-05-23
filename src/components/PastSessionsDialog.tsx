"use client";

import type { DebateSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Past Debate Sessions</DialogTitle>
          <DialogDescription>Review your saved debate sessions. Click to load a session.</DialogDescription>
        </DialogHeader>
        {sessions.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold truncate max-w-[300px]">{session.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
             <Button variant="destructive" onClick={onDeleteAllSessions} className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Delete All Sessions
             </Button>
           )}
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PastSessionsDialog;
