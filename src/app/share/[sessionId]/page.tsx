
// src/app/share/[sessionId]/page.tsx
"use client"; // Required for jsPDF and html2canvas client-side usage

import { useEffect, useState, useRef } from 'react';
import { getSharedSession } from '@/services/sharingService';
import SharedSessionDisplay from '@/components/SharedSessionDisplay';
import ArgumentAceLogo from '@/components/ArgumentAceLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Download, Loader2 } from 'lucide-react';
import type { Metadata } from 'next'; // Removed ResolvingMetadata as we are client-side fetching
import type { DebateSession } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


// Metadata generation needs to be handled differently for client-side fetched data
// For now, we'll set a generic title in the component, or you can explore
// more advanced solutions if SEO for shared pages is critical.

// export async function generateMetadata(
//   { params }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> { ... } // This approach works best with server components

export default function SharedSessionPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<DebateSession | null | undefined>(undefined); // undefined for loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const fetchedSession = await getSharedSession(params.sessionId);
        setSession(fetchedSession);
        if (fetchedSession) {
          document.title = `Debate: ${fetchedSession.topic} - ArgumentAce Shared Session`;
        } else {
          document.title = 'Session Not Found - ArgumentAce';
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(null); // Error state
        document.title = 'Error Loading Session - ArgumentAce';
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [params.sessionId]);

  const handleDownloadPdf = async () => {
    if (!contentRef.current || !session) return;
    setIsDownloadingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // If you have external images
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4', // Page format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      // const imgY = (pdfHeight - imgHeight * ratio) / 2; // Center vertically
      const imgY = 10; // Add some margin from top

      // Add title to PDF
      pdf.setFontSize(18);
      pdf.text(session.topic, pdfWidth / 2, 30, { align: 'center' });


      // Add image to PDF - adjust as needed if content is too long
      // For very long content, you might need to split it into multiple pages
      const contentHeight = imgHeight * ratio;
      if (contentHeight > pdfHeight - 50) { // Check if content exceeds one page (approx)
         // Simple approach: add image and let it crop or scale.
         // Advanced: loop and add sections of the canvas to multiple pages.
        pdf.addImage(imgData, 'PNG', imgX, imgY + 20, imgWidth * ratio, imgHeight * ratio);
        alert("The content is long and might be split across multiple pages or truncated in the PDF. For best results, ensure the content fits a standard page.");
      } else {
         pdf.addImage(imgData, 'PNG', imgX, imgY + 20, imgWidth * ratio, imgHeight * ratio);
      }
      pdf.save(`ArgumentAce_Debate_${session.topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);
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
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <ArgumentAceLogo size="lg" />
        <h1 className="text-3xl font-bold mt-8 mb-4">Session Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The debate session you are looking for either does not exist, is no longer available,
          or there was an issue loading it. This can happen if the server restarted since the session was shared,
          as shared sessions are not persistently stored in this demo version.
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
            <Button 
              variant="outline" 
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download as PDF
            </Button>
            <Button variant="default" asChild>
              <Link href="/">
               <Home className="mr-2 h-4 w-4" /> Create Your Own Debate
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div ref={contentRef}> {/* This div will be captured for PDF */}
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
