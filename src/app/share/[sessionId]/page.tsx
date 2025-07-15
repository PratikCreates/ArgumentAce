
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getSharedSession } from '@/services/sharingService';
import SharedSessionDisplay from '@/components/SharedSessionDisplay';
import ArgumentAceLogo from '@/components/ArgumentAceLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Download, Loader2 } from 'lucide-react';
import type { DebateSession } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDebatePdf } from '@/lib/pdfGenerator';

export default function SharedSessionPage() {
  const { sessionId } = useParams(); // ✅ unwraps sessionId properly
  const [session, setSession] = useState<DebateSession | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const fetchedSession = await getSharedSession(sessionId as string);
        setSession(fetchedSession);
        document.title = fetchedSession
          ? `Debate: ${fetchedSession.topic} - ArgumentAce Shared Session`
          : 'Session Not Found - ArgumentAce';
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(null);
        document.title = 'Error Loading Session - ArgumentAce';
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleDownloadPdfClick = async () => {
    if (!session) return;
    setIsDownloadingPdf(true);
    try {
      await generateDebatePdf({
        topic: session.topic,
        reasoningSkill: session.reasoningSkill,
        debateLog: session.debateLog,
        researchPoints: session.researchPoints,
        juryVerdict: session.juryVerdict,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <ArgumentAceLogo size="lg" />
        <h1 className="text-3xl font-bold mt-8 mb-4">Loading Session...</h1>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="mt-8 w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <ArgumentAceLogo size="lg" />
        <h1 className="text-3xl font-bold mt-8 mb-4">Session Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The debate session you are looking for either does not exist, is no longer available,
          or there was an issue loading it.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Go back to ArgumentAce
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="py-4 px-6 bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ArgumentAceLogo />
          </Link>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button variant="outline" onClick={handleDownloadPdfClick} disabled={isDownloadingPdf}>
 {isDownloadingPdf ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Download className="mr-2 h-4 w-4" />)}Download as PDF
            </Button>
            <Button variant="default" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Create Your Own Debate
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div>
        <SharedSessionDisplay session={session} />
      </div>
      <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ArgumentAce. Powered by AI.</p>
        <p>
          <Link href="/" className="hover:text-primary underline">
            Create your own debate practice session
          </Link>
        </p>
      </footer>
    </div>
  );
}
