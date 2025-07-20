"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, Users } from 'lucide-react';
import PrepTimer from './PrepTimer';
import ArgumentTemplate from './ArgumentTemplate';
import { asianParliamentaryRoles } from '@/types/debate-formats';
import { ResearchTopicOutput } from '@/types';
import LanguageSelector from './LanguageSelector';

interface AsianParliamentaryPrepProps {
  topic: string;
  sessionId?: string;
  onStartDebate: (argument: string, role: string, prepTimeUsed: number) => void;
  researchPoints?: ResearchTopicOutput | null;
}

const AsianParliamentaryPrep: React.FC<AsianParliamentaryPrepProps> = ({
  topic,
  sessionId,
  onStartDebate,
  researchPoints
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(asianParliamentaryRoles[0].name);
  const [prepTimeUsed, setPrepTimeUsed] = useState<number>(0);
  const [showArgumentTemplate, setShowArgumentTemplate] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-IN');
  // const [prepCompleted, setPrepCompleted] = useState<boolean>(false);
  
  const selectedRoleDetails = asianParliamentaryRoles.find(role => role.name === selectedRole);
  
  const handleTimerComplete = () => {
    // setPrepCompleted(true);
    setShowArgumentTemplate(true);
  };
  
  const handleStartDebate = (timeUsed: number) => {
    setPrepTimeUsed(timeUsed);
    setShowArgumentTemplate(true);
  };
  
  const handleArgumentComplete = (argument: string) => {
    onStartDebate(argument, selectedRole, prepTimeUsed);
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Asian Parliamentary Debate Preparation
          </CardTitle>
          <CardDescription>
            Select your role and prepare your arguments for the topic: <span className="font-medium">{topic}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">Select Your Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {asianParliamentaryRoles.map((role) => (
                  <SelectItem key={role.name} value={role.name}>
                    {role.name} ({role.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedRoleDetails && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-1">{selectedRoleDetails.name}</h4>
              <p className="text-sm mb-2">{selectedRoleDetails.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-primary/10 px-2 py-1 rounded">
                  {selectedRoleDetails.speakingTime} minutes speaking time
                </span>
                <span className="bg-primary/10 px-2 py-1 rounded">
                  {selectedRoleDetails.position} side
                </span>
              </div>
            </div>
          )}
          
          {!showArgumentTemplate && (
            <PrepTimer
              duration={15 * 60} // 15 minutes in seconds
              onComplete={handleTimerComplete}
              onStartDebate={handleStartDebate}
              sessionId={sessionId}
            />
          )}
          
          {!showArgumentTemplate && (
            <Button 
              onClick={() => setShowArgumentTemplate(true)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Skip Timer and Start Preparing
            </Button>
          )}
        </CardContent>
      </Card>
      
      {showArgumentTemplate && (
        <div className="space-y-6">
          {researchPoints && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Research Points</CardTitle>
                <CardDescription>
                  Use these points to help build your argument.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Arguments For:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {researchPoints.proPoints.map((point, index) => (
                        <li key={`pro-${index}`}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Arguments Against:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {researchPoints.conPoints.map((point, index) => (
                        <li key={`con-${index}`}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Facts:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {researchPoints.keyFacts?.map((fact, index) => (
                        <li key={`fact-${index}`}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <ArgumentTemplate
            format="asian-parliamentary"
            role={selectedRole}
            onArgumentComplete={handleArgumentComplete}
            sessionId={sessionId}
          />
        </div>
      )}
    </div>
  );
};

export default AsianParliamentaryPrep;