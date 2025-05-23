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

// Dynamically import jsPDF and html2canvas only when needed
type jsPDFType = typeof import('jspdf').default;
type html2canvasType = typeof import('html2canvas').default;

export default function SharedSessionPage() {
  const { sessionId } = useParams(); // ✅ unwraps sessionId properly
  const [session, setSession] = useState<DebateSession | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfCapturePhase, setIsPdfCapturePhase] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const generatePdf = async () => {
    if (!contentRef.current || !session) return;

    try {
      const { default: jsPDF } = await (import('jspdf') as Promise<{ default: jsPDFType }>);
      const { default: html2canvas } = await (import('html2canvas') as Promise<{ default: html2canvasType }>);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        height: contentRef.current.scrollHeight,
        windowHeight: contentRef.current.scrollHeight,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 30;
      const imgProps = pdf.getImageProperties(imgData);
      const availableWidth = pdfWidth - 2 * margin;
      const scaleFactor = availableWidth / imgProps.width;
      const scaledImgHeight = imgProps.height * scaleFactor;
      const scaledImgWidth = imgProps.width * scaleFactor;

      pdf.setFontSize(18);
      pdf.text(session.topic, pdfWidth / 2, margin + 10, { align: 'center' });

      pdf.addImage(imgData, 'PNG', margin, margin + 30, scaledImgWidth, scaledImgHeight);
      pdf.save(`ArgumentAce_Debate_${session.topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  useEffect(() => {
    if (isPdfCapturePhase && contentRef.current && session) {
      generatePdf().finally(() => {
        setIsPdfCapturePhase(false);
        setIsDownloadingPdf(false);
      });
    }
  }, [isPdfCapturePhase, session]);

  const handleDownloadPdfClick = () => {
    if (!contentRef.current || !session) return;
    setIsDownloadingPdf(true);
    setIsPdfCapturePhase(true);
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
      <div ref={contentRef}>
        <SharedSessionDisplay session={session} isPdfCapturePhase={isPdfCapturePhase} />
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
