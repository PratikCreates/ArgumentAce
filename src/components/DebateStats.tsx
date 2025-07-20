"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Clock, MessageSquare, Target, TrendingUp, Award } from 'lucide-react';
import { DebateTurn } from '@/types';

interface DebateStatsProps {
  debateLog: DebateTurn[];
  prepTimeUsed: number;
  currentRole: string;
  format: string;
  totalDebateTime: number; // in seconds
}

const DebateStats: React.FC<DebateStatsProps> = ({
  debateLog,
  prepTimeUsed,
  currentRole,
  format,
  totalDebateTime
}) => {
  // Calculate statistics
  const userTurns = debateLog.filter(turn => turn.speaker === 'user');
  const aiTurns = debateLog.filter(turn => turn.speaker === 'ai');
  
  const totalWords = debateLog.reduce((total, turn) => {
    return total + turn.text.split(' ').length;
  }, 0);
  
  const userWords = userTurns.reduce((total, turn) => {
    return total + turn.text.split(' ').length;
  }, 0);
  
  // const aiWords = aiTurns.reduce((total, turn) => {
  //   return total + turn.text.split(' ').length;
  // }, 0);

  const averageWordsPerTurn = userTurns.length > 0 ? Math.round(userWords / userTurns.length) : 0;
  
  // Calculate argument quality metrics
  const argumentsWithFeedback = userTurns.filter(turn => turn.feedback);
  const totalFeedbackScore = argumentsWithFeedback.reduce((total, turn) => {
    // Simulate a scoring system based on feedback
    const feedback = turn.feedback;
    if (!feedback) return total;
    
    let score = 50; // Base score
    
    // Adjust based on feedback content (simplified scoring)
    if (feedback.logicalFallacies && feedback.logicalFallacies.length === 0) score += 20;
    if (feedback.persuasiveTechniques && feedback.persuasiveTechniques.length > 0) score += 15;
    if (feedback.feedback && feedback.feedback.includes('strong')) score += 15;
    
    return total + Math.min(score, 100);
  }, 0);
  
  const averageArgumentQuality = argumentsWithFeedback.length > 0 
    ? Math.round(totalFeedbackScore / argumentsWithFeedback.length) 
    : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (score: number): { variant: 'default' | 'secondary' | 'destructive', text: string } => {
    if (score >= 80) return { variant: 'default', text: 'Excellent' };
    if (score >= 60) return { variant: 'secondary', text: 'Good' };
    return { variant: 'destructive', text: 'Needs Work' };
  };

  const qualityBadge = getQualityBadge(averageArgumentQuality);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Debate Statistics
        </CardTitle>
        <CardDescription>
          Performance metrics for your {format} debate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role and Format Info */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentRole}</Badge>
          <Badge variant="outline">{format}</Badge>
        </div>

        {/* Time Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Prep Time Used</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(prepTimeUsed)}
            </div>
            <Progress value={(prepTimeUsed / 900) * 100} className="h-2" />
            <span className="text-xs text-muted-foreground">
              of 15:00 available
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Debate Time</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatTime(totalDebateTime)}
            </div>
            <span className="text-xs text-muted-foreground">
              Active debate duration
            </span>
          </div>
        </div>

        {/* Participation Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Participation
          </h4>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{userTurns.length}</div>
              <div className="text-xs text-muted-foreground">Your Speeches</div>
            </div>
            <div>
              <div className="text-xl font-bold">{aiTurns.length}</div>
              <div className="text-xs text-muted-foreground">AI Responses</div>
            </div>
            <div>
              <div className="text-xl font-bold">{debateLog.length}</div>
              <div className="text-xs text-muted-foreground">Total Exchanges</div>
            </div>
          </div>
        </div>

        {/* Word Count Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content Analysis
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Words</span>
              <span className="font-medium">{userWords.toLocaleString()}</span>
            </div>
            <Progress value={(userWords / Math.max(totalWords, 1)) * 100} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>Avg per speech: {averageWordsPerTurn}</div>
              <div>Total words: {totalWords.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Argument Quality */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Argument Quality
          </h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${getQualityColor(averageArgumentQuality)}`}>
                {averageArgumentQuality}%
              </div>
              <div className="text-xs text-muted-foreground">
                Average quality score
              </div>
            </div>
            <Badge variant={qualityBadge.variant}>
              {qualityBadge.text}
            </Badge>
          </div>
          
          <Progress value={averageArgumentQuality} className="h-2" />
          
          <div className="text-xs text-muted-foreground">
            Based on {argumentsWithFeedback.length} analyzed arguments
          </div>
        </div>

        {/* Performance Insights */}
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Performance Insights
          </h4>
          
          <div className="space-y-2 text-sm">
            {averageArgumentQuality >= 80 && (
              <div className="text-green-700">
                ✓ Excellent argument quality - keep up the strong reasoning!
              </div>
            )}
            
            {averageWordsPerTurn > 150 && (
              <div className="text-blue-700">
                ✓ Good speech length - you're providing detailed arguments
              </div>
            )}
            
            {userTurns.length >= 3 && (
              <div className="text-purple-700">
                ✓ Active participation - engaging well in the debate
              </div>
            )}
            
            {prepTimeUsed >= 600 && (
              <div className="text-orange-700">
                ✓ Good preparation - you used substantial prep time
              </div>
            )}
            
            {debateLog.length >= 6 && (
              <div className="text-indigo-700">
                ✓ Sustained debate - maintaining good back-and-forth
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebateStats;