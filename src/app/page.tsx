"use client";

import DebateInterface from "@/components/DebateInterface";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ArgumentAceLogo from "@/components/ArgumentAceLogo";

export default function Home() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const contentRef = useRef(null); // Ref for the content to be captured

  const handleDownloadPdfClick = () => {
    setIsDownloadingPdf(true);
    // PDF generation logic will be triggered by an effect or directly here
    // For now, just setting the state.
  };

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
      <div ref={contentRef}> {/* Attach ref to the content container */}
        <DebateInterface />
      </div>
    </div>
  );
}
