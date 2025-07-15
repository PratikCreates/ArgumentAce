"use client";

import DebateInterface from "@/components/DebateInterface";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { jsPDF } from "jspdf";
import type html2canvas from "html2canvas";
import ArgumentAceLogo from "@/components/ArgumentAceLogo";

export default function Home() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isCapturePhase, setIsCapturePhase] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [debateTopic, setDebateTopic] = useState("");

  const generatePdf = async () => {
    if (!contentRef.current) return;

    try {
      // Dynamically import to avoid server-side issues
      const { default: jspdf } = await import("jspdf");
      const { default: html2canvasLib } = await import("html2canvas");

      const canvas = await html2canvasLib(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        height: contentRef.current.scrollHeight,
        windowHeight: contentRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 30;
      const imgProps = pdf.getImageProperties(imgData);
      const availableWidth = pdfWidth - 2 * margin;
      const scaleFactor = availableWidth / imgProps.width;
      const scaledImgHeight = imgProps.height * scaleFactor;
      const scaledImgWidth = imgProps.width * scaleFactor;

      const topic = debateTopic || "Debate Session";
      pdf.setFontSize(18);
      pdf.text(topic, pdfWidth / 2, margin + 10, { align: 'center' });

      pdf.addImage(imgData, 'PNG', margin, margin + 30, scaledImgWidth, scaledImgHeight);
      pdf.save(`ArgumentAce_Debate_${topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  useEffect(() => {
    if (isCapturePhase && contentRef.current) {
      generatePdf().finally(() => {
        setIsCapturePhase(false);
        setIsDownloadingPdf(false);
      });
    }
  }, [isCapturePhase]);

  const handleDownloadPdfClick = () => {
    if (!contentRef.current) return;
    setIsDownloadingPdf(true);
    setIsCapturePhase(true); // Triggers the effect to generate PDF
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
      <div ref={contentRef}>
        <DebateInterface 
          isPdfCapturePhase={isCapturePhase} 
          onTopicChange={setDebateTopic} 
        />
      </div>
    </div>
  );
}
