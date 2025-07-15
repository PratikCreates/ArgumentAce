
"use client";

import DebateInterface from "@/components/DebateInterface";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import ArgumentAceLogo from "@/components/ArgumentAceLogo";
import type { DebateSessionDataForPdf } from '@/lib/pdfGenerator';
import { generateDebatePdf } from '@/lib/pdfGenerator';

export default function Home() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const debateInterfaceRef = useRef<{ getSessionData: () => DebateSessionDataForPdf }>(null);

  const handleDownloadPdfClick = useCallback(async () => {
    if (!debateInterfaceRef.current) {
        alert("Debate data is not available yet.");
        return;
    }

    setIsDownloadingPdf(true);
    try {
        const sessionData = debateInterfaceRef.current.getSessionData();
        if (!sessionData.topic) {
            alert("Please start a debate before downloading the PDF.");
            return;
        }
        await generateDebatePdf(sessionData);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        setIsDownloadingPdf(false);
    }
  }, []);

  return (
    <div>
      <header className="py-4 px-6 bg-card shadow-sm sticky top-0 z-50 flex justify-between items-center">
        <ArgumentAceLogo />
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleDownloadPdfClick}
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (<Download className="mr-2 h-4 w-4" />)}
            Download as PDF      
          </Button>
      </div>
      </header>
      <div>
        <DebateInterface 
          ref={debateInterfaceRef}
        />
      </div>
    </div>
  );
}
