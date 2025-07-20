"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { asianParliamentaryRoles } from '@/types/debate-formats';

interface DebateFlowManagerProps {
  currentUserRole: string;
  onRoleChange: (role: string, isUserTurn: boolean) => void;
  completedSpeeches: string[];
  onSpeechComplete: (role: string) => void;
}

const DebateFlowManager: React.FC<DebateFlowManagerProps> = ({
  currentUserRole,
  onRoleChange,
  completedSpeeches,
  onSpeechComplete
}) => {
  // Define the speaking order for Asian Parliamentary
  const speakingOrder = [
    'Prime Minister',
    'Leader of Opposition', 
    'Deputy Prime Minister',
    'Deputy Leader of Opposition',
    'Government Whip',
    'Opposition Whip',
    'Opposition Reply',
    'Government Reply'
  ];

  const [currentSpeechIndex, setCurrentSpeechIndex] = useState<number>(0);
  const [isUserTurn, setIsUserTurn] = useState<boolean>(false);

  useEffect(() => {
    // Determine if it's the user's turn based on current speech and user role
    const currentSpeechRole = speakingOrder[currentSpeechIndex];
    const isUserSpeaking = currentSpeechRole === currentUserRole;
    setIsUserTurn(isUserSpeaking);
    onRoleChange(currentSpeechRole, isUserSpeaking);
  }, [currentSpeechIndex, currentUserRole, onRoleChange]);

  const getCurrentSpeech = () => {
    return speakingOrder[currentSpeechIndex];
  };

  const getNextSpeech = () => {
    return currentSpeechIndex < speakingOrder.length - 1 
      ? speakingOrder[currentSpeechIndex + 1] 
      : null;
  };

  const handleNextSpeech = () => {
    const currentRole = getCurrentSpeech();
    onSpeechComplete(currentRole);
    
    if (currentSpeechIndex < speakingOrder.length - 1) {
      setCurrentSpeechIndex(currentSpeechIndex + 1);
    }
  };

  const getSpeechType = (role: string): string => {
    if (role.includes('Reply')) return 'Reply Speech';
    return 'Substantive Speech';
  };

  const getSpeechDuration = (role: string): number => {
    return role.includes('Reply') ? 4 : 7; // 4 minutes for reply, 7 for substantive
  };

  const getRoleDetails = (roleName: string) => {
    return asianParliamentaryRoles.find(role => role.name === roleName);
  };

  const progress = ((currentSpeechIndex + 1) / speakingOrder.length) * 100;
  const currentRole = getCurrentSpeech();
  const nextRole = getNextSpeech();
  const roleDetails = getRoleDetails(currentRole);

  return (
    <Card className="shadow-lg border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Debate Flow - Asian Parliamentary
        </CardTitle>
        <CardDescription>
          Speech {currentSpeechIndex + 1} of {speakingOrder.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Debate Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Speech */}
        <div className="p-4 border rounded-lg bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{currentRole}</h3>
            <Badge variant={isUserTurn ? "default" : "secondary"}>
              {isUserTurn ? "Your Turn" : "AI Turn"}
            </Badge>
          </div>
          
          {roleDetails && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{roleDetails.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getSpeechDuration(currentRole)} minutes</span>
                </div>
                <Badge variant="outline">
                  {getSpeechType(currentRole)}
                </Badge>
                <Badge variant="outline">
                  {roleDetails.position}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Next Speech Preview */}
        {nextRole && (
          <div className="p-3 border rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-1">Next: {nextRole}</h4>
            <p className="text-xs text-muted-foreground">
              {getSpeechType(nextRole)} - {getSpeechDuration(nextRole)} minutes
            </p>
          </div>
        )}

        {/* Speech Completion Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {completedSpeeches.length} of {speakingOrder.length} speeches completed
          </div>
          <Button 
            onClick={handleNextSpeech}
            disabled={currentSpeechIndex >= speakingOrder.length - 1}
          >
            {currentSpeechIndex >= speakingOrder.length - 1 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Debate Complete
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Next Speech
              </>
            )}
          </Button>
        </div>

        {/* Speaking Order Overview */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Speaking Order:</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {speakingOrder.map((role, index) => (
              <div 
                key={role}
                className={`flex items-center justify-between p-2 rounded ${
                  index === currentSpeechIndex 
                    ? 'bg-primary/10 border border-primary/20' 
                    : completedSpeeches.includes(role)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-muted/30'
                }`}
              >
                <span className="flex items-center gap-2">
                  {completedSpeeches.includes(role) && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                  {index + 1}. {role}
                </span>
                <span className="text-xs">
                  {getSpeechDuration(role)}min
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebateFlowManager;