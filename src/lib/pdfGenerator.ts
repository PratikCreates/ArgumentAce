
// src/lib/pdfGenerator.ts
import { jsPDF } from 'jspdf';
import type { DebateTurn, ReasoningSkill, JudgeDebateOutput, AnalyzeArgumentOutput, ResearchTopicOutput } from '@/types';

export interface DebateSessionDataForPdf {
    topic: string;
    reasoningSkill: ReasoningSkill;
    debateLog: DebateTurn[];
    researchPoints?: ResearchTopicOutput | null;
    juryVerdict?: JudgeDebateOutput | null;
}

// Color definitions (approximating theme)
const PRIMARY_COLOR = '#3F51B5'; // Deep Blue
const ACCENT_COLOR = '#FFC107'; // Amber
const TEXT_COLOR = '#212121'; // Almost black
const LIGHT_TEXT_COLOR = '#757575'; // Gray
const BACKGROUND_COLOR_USER = '#E8EAF6'; // Light blue (user messages)
const BACKGROUND_COLOR_AI = '#F5F5F5'; // Light gray (AI messages)


export async function generateDebatePdf(sessionData: DebateSessionDataForPdf): Promise<void> {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin; // Current y position

    // Store current font state to re-apply after page break
    let currentFont = {
        name: 'helvetica',
        style: 'normal',
        size: 10,
        color: TEXT_COLOR
    };

    const setFont = (name: string, style: string, size: number, color: string) => {
        currentFont = { name, style, size, color };
        doc.setFont(name, style);
        doc.setFontSize(size);
        doc.setTextColor(color);
    };

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
            doc.addPage();
            y = margin;
            // Re-apply font styles on new page
            setFont(currentFont.name, currentFont.style, currentFont.size, currentFont.color);
        }
    };
    
    const addSectionTitle = (title: string) => {
        checkPageBreak(40);
        y += 10;
        setFont('helvetica', 'bold', 16, PRIMARY_COLOR);
        doc.text(title, margin, y);
        y += 20;
    }
    
    // START: Document Header
    setFont('helvetica', 'bold', 22, PRIMARY_COLOR);
    doc.text('ArgumentAce Debate Summary', pageWidth / 2, y, { align: 'center' });
    y += 25;

    setFont('helvetica', 'normal', 11, LIGHT_TEXT_COLOR);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    setFont('helvetica', 'bold', 14, TEXT_COLOR);
    doc.text('Topic:', margin, y);
    setFont('helvetica', 'normal', 14, TEXT_COLOR);
    const splitTopic = doc.splitTextToSize(sessionData.topic, pageWidth - margin * 2 - 40);
    doc.text(splitTopic, margin + 45, y);
    y += (splitTopic.length * 14) + 10;
    
    setFont('helvetica', 'normal', 11, TEXT_COLOR);
    doc.text(`Skill Level: ${sessionData.reasoningSkill}`, margin, y);
    y += 20;
    doc.setDrawColor(LIGHT_TEXT_COLOR);
    doc.line(margin, y - 10, pageWidth - margin, y - 10);
    // END: Document Header

    if (sessionData.researchPoints && (sessionData.researchPoints.proPoints.length > 0 || sessionData.researchPoints.conPoints.length > 0)) {
        addSectionTitle('Research Points');
        
        if (sessionData.researchPoints.proPoints.length > 0) {
            setFont('helvetica', 'bold', 11, TEXT_COLOR);
            doc.text('Arguments For:', margin, y);
            y += 15;
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            sessionData.researchPoints.proPoints.forEach(point => {
                const splitPoint = doc.splitTextToSize(`• ${point}`, pageWidth - margin * 2 - 10);
                checkPageBreak(splitPoint.length * 10 + 5);
                doc.text(splitPoint, margin + 10, y);
                y += splitPoint.length * 10 + 5;
            });
            y += 10;
        }
        
        if (sessionData.researchPoints.conPoints.length > 0) {
            setFont('helvetica', 'bold', 11, TEXT_COLOR);
            doc.text('Arguments Against:', margin, y);
            y += 15;
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            sessionData.researchPoints.conPoints.forEach(point => {
                const splitPoint = doc.splitTextToSize(`• ${point}`, pageWidth - margin * 2 - 10);
                checkPageBreak(splitPoint.length * 10 + 5);
                doc.text(splitPoint, margin + 10, y);
                y += splitPoint.length * 10 + 5;
            });
            y += 10;
        }
        
        if (sessionData.researchPoints.keyFacts && sessionData.researchPoints.keyFacts.length > 0) {
            setFont('helvetica', 'bold', 11, TEXT_COLOR);
            doc.text('Key Facts:', margin, y);
            y += 15;
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            sessionData.researchPoints.keyFacts.forEach(fact => {
                const splitFact = doc.splitTextToSize(`• ${fact}`, pageWidth - margin * 2 - 10);
                checkPageBreak(splitFact.length * 10 + 5);
                doc.text(splitFact, margin + 10, y);
                y += splitFact.length * 10 + 5;
            });
            y += 10;
        }
    }

    if (sessionData.debateLog && sessionData.debateLog.length > 0) {
        addSectionTitle('Debate Log & Feedback');

        sessionData.debateLog.forEach(turn => {
            const isUser = turn.speaker === 'user';
            const speaker = isUser ? 'User' : 'AI Opponent';
            const timestamp = new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            const textLines = doc.splitTextToSize(turn.text, pageWidth - margin * 2 - 15);
            const boxHeight = textLines.length * 12 + 25;
            checkPageBreak(boxHeight + 20);

            doc.setFillColor(isUser ? BACKGROUND_COLOR_USER : BACKGROUND_COLOR_AI);
            doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 3, 3, 'F');
            
            setFont('helvetica', 'bold', 10, TEXT_COLOR);
            doc.text(speaker, margin + 8, y + 12);
            
            setFont('helvetica', 'normal', 9, LIGHT_TEXT_COLOR);
            doc.text(timestamp, pageWidth - margin - 8, y + 12, { align: 'right' });
            
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            doc.text(textLines, margin + 8, y + 28, { lineHeightFactor: 1.2 });
            
            y += boxHeight + 10;

            if (isUser && turn.feedback) {
                const { logicalFallacies, persuasiveTechniques, feedback } = turn.feedback;
                
                const addFeedbackList = (title: string, items: string[] | undefined) => {
                    let content = `**${title}**\n`;
                    if (items && items.length > 0) {
                        items.forEach(item => content += `• ${item}\n`);
                    } else {
                        content += `No specific items identified.\n`;
                    }
                    return content;
                }

                setFont('helvetica', 'bold', 9, TEXT_COLOR);
                doc.text('Analysis of Argument:', margin + 15, y);
                y += 12;

                setFont('helvetica', 'normal', 9, TEXT_COLOR);
                const feedbackLines = doc.splitTextToSize(feedback, pageWidth - margin * 2 - 20);
                checkPageBreak(feedbackLines.length * 9 + 5);
                doc.text(feedbackLines, margin + 15, y);
                y += feedbackLines.length * 9 + 10;

                const drawFeedbackSubSection = (title: string, items: string[] | undefined) => {
                    if (items && items.length > 0) {
                        checkPageBreak(25);
                        setFont('helvetica', 'bold', 9, TEXT_COLOR);
                        doc.text(title, margin + 15, y);
                        y += 12;
                        setFont('helvetica', 'normal', 9, TEXT_COLOR);
                        items.forEach(item => {
                            const itemLines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 30);
                            checkPageBreak(itemLines.length * 9 + 5);
                            doc.text(itemLines, margin + 25, y);
                            y += itemLines.length * 9 + 5;
                        });
                    }
                }
                
                drawFeedbackSubSection('Logical Fallacies Identified:', logicalFallacies);
                drawFeedbackSubSection('Persuasion Techniques Used:', persuasiveTechniques);

                y += 15;
            }
        });
        y += 10;
    }

    if (sessionData.juryVerdict) {
        const { winner, overallAssessment, userStrengths, userWeaknesses, aiStrengths, aiWeaknesses, adviceForUser } = sessionData.juryVerdict;
        addSectionTitle('Final Jury Verdict');
        
        if (winner) {
            checkPageBreak(20);
            setFont('helvetica', 'bold', 12, ACCENT_COLOR);
            doc.text(`Winner: ${winner.charAt(0).toUpperCase() + winner.slice(1)}`, margin, y);
            y += 20;
        }

        const addVerdictSection = (title: string, content: string[] | string | undefined) => {
            if (!content || (Array.isArray(content) && content.length === 0)) return;
            checkPageBreak(30);
            setFont('helvetica', 'bold', 11, PRIMARY_COLOR);
            doc.text(title, margin, y);
            y += 15;
            
            setFont('helvetica', 'normal', 10, TEXT_COLOR);
            if (Array.isArray(content)) {
                content.forEach(item => {
                    const splitItem = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 10);
                    checkPageBreak(splitItem.length * 10 + 5);
                    doc.text(splitItem, margin + 10, y);
                    y += splitItem.length * 10 + 5;
                });
            } else {
                 const splitContent = doc.splitTextToSize(content, pageWidth - margin * 2);
                 checkPageBreak(splitContent.length * 10 + 5);
                 doc.text(splitContent, margin, y);
                 y += splitContent.length * 10 + 5;
            }
             y += 10;
        };

        addVerdictSection('Overall Assessment:', overallAssessment);
        addVerdictSection('User Strengths:', userStrengths);
        addVerdictSection('User Weaknesses:', userWeaknesses);
        addVerdictSection('AI Strengths:', aiStrengths);
        addVerdictSection('AI Weaknesses:', aiWeaknesses);
        // Key moments removed - using clashes instead if needed
        addVerdictSection('Advice for User:', adviceForUser);
        y += 10;
    }

    doc.save(`ArgumentAce_Debate_${sessionData.topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}
