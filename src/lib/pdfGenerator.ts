
// src/lib/pdfGenerator.ts
import { jsPDF } from 'jspdf';
import type { DebateTurn, ReasoningSkill, JudgeDebateOutput, AnalyzeArgumentOutput } from '@/types';

export interface DebateSessionDataForPdf {
    topic: string;
    reasoningSkill: ReasoningSkill;
    debateLog: DebateTurn[];
    researchPoints?: string[] | null;
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

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    const addSectionTitle = (title: string) => {
        checkPageBreak(40);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(title, margin, y);
        y += 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text('ArgumentAce Debate Summary', pageWidth / 2, y, { align: 'center' });
    y += 25;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(LIGHT_TEXT_COLOR);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(TEXT_COLOR);
    doc.text('Topic:', margin, y);
    doc.setFont('helvetica', 'normal');
    const splitTopic = doc.splitTextToSize(sessionData.topic, pageWidth - margin * 2 - 40);
    doc.text(splitTopic, margin + 45, y);
    y += (splitTopic.length * 12) + 10;
    
    doc.setFontSize(11);
    doc.text(`Skill Level: ${sessionData.reasoningSkill}`, margin, y);
    y += 20;
    doc.setDrawColor(LIGHT_TEXT_COLOR);
    doc.line(margin, y - 10, pageWidth - margin, y - 10);
    

    if (sessionData.researchPoints && sessionData.researchPoints.length > 0) {
        addSectionTitle('Research Points');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(TEXT_COLOR);
        sessionData.researchPoints.forEach(point => {
            const splitPoint = doc.splitTextToSize(`• ${point}`, pageWidth - margin * 2 - 10);
            checkPageBreak(splitPoint.length * 10 + 5);
            doc.text(splitPoint, margin + 10, y);
            y += splitPoint.length * 10 + 5;
        });
        y += 10;
    }

    if (sessionData.debateLog && sessionData.debateLog.length > 0) {
        addSectionTitle('Debate Log & Feedback');
        doc.setFontSize(10);

        sessionData.debateLog.forEach(turn => {
            const isUser = turn.speaker === 'user';
            const speaker = isUser ? 'User' : 'AI Opponent';
            const timestamp = new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const textLines = doc.splitTextToSize(turn.text, pageWidth - margin * 2 - 15);
            const boxHeight = textLines.length * 12 + 25;
            checkPageBreak(boxHeight + 20);

            doc.setFillColor(isUser ? BACKGROUND_COLOR_USER : BACKGROUND_COLOR_AI);
            doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 3, 3, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(TEXT_COLOR);
            doc.text(speaker, margin + 8, y + 12);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(LIGHT_TEXT_COLOR);
            doc.text(timestamp, pageWidth - margin - 8, y + 12, { align: 'right' });
            
            doc.setTextColor(TEXT_COLOR);
            doc.text(textLines, margin + 8, y + 28, { lineHeightFactor: 1.2 });
            
            y += boxHeight + 10;

            // ---- Inline Feedback for User Turns ----
            if (isUser && turn.feedback) {
                const { fallacies, persuasionTechniques, feedback } = turn.feedback;
                checkPageBreak(20);
                y += 5; // Small gap before feedback box
                
                const addFeedbackList = (title: string, items: string[] | undefined, listType: 'fallacy' | 'persuasion') => {
                    let content = `**${title}**\n`;
                    if (items && items.length > 0) {
                        items.forEach(item => content += `• ${item}\n`);
                    } else {
                        content += `_No specific ${listType}s identified._\n`;
                    }
                    return content;
                }

                let feedbackText = `**Analysis of Argument:**\n${feedback}\n\n`;
                feedbackText += addFeedbackList('Logical Fallacies:', fallacies, 'fallacy');
                feedbackText += '\n';
                feedbackText += addFeedbackList('Persuasion Techniques:', persuasionTechniques, 'persuasion');
                
                doc.setFontSize(9);
                doc.setTextColor(TEXT_COLOR);
                doc.setDrawColor(LIGHT_TEXT_COLOR);
                
                const splitFeedback = doc.splitTextToSize(feedbackText, pageWidth - margin * 2 - 20);
                const feedbackBoxHeight = splitFeedback.length * 9 + 20;
                checkPageBreak(feedbackBoxHeight + 10);
                
                doc.setDrawColor('#cccccc');
                doc.setFillColor('#fafafa');
                doc.roundedRect(margin + 10, y, pageWidth - margin * 2 - 20, feedbackBoxHeight, 3, 3, 'FD');
                
                doc.text(splitFeedback, margin + 20, y + 12);
                
                y += feedbackBoxHeight + 15;
            }
        });
        y += 10;
    }

    if (sessionData.juryVerdict) {
        const { winner, overallAssessment, userStrengths, userWeaknesses, aiStrengths, aiWeaknesses, adviceForUser, keyMoments } = sessionData.juryVerdict;
        addSectionTitle('Final Jury Verdict');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(TEXT_COLOR);
        
        if (winner) {
            checkPageBreak(20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(ACCENT_COLOR);
            doc.text(`Winner: ${winner.charAt(0).toUpperCase() + winner.slice(1)}`, margin, y);
            y += 20;
        }

        const addVerdictSection = (title: string, content: string[] | string | undefined) => {
            if (!content || (Array.isArray(content) && content.length === 0)) return;
            checkPageBreak(30);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(PRIMARY_COLOR);
            doc.text(title, margin, y);
            y += 15;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(TEXT_COLOR);

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
        addVerdictSection('Key Moments:', keyMoments);
        addVerdictSection('Advice for User:', adviceForUser);
        y += 10;
    }

    doc.save(`ArgumentAce_Debate_${sessionData.topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}
