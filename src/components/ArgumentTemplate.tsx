"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save, Trash2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DebateFormat } from '@/types/debate-formats';
import { useToast } from '@/hooks/use-toast';

export interface ArgumentPoint {
  id: string;
  statement: string;
  explanation: string;
  evidence: string;
  impact: string;
}

export interface ArgumentStructure {
  introduction: string;
  points: ArgumentPoint[];
  conclusion: string;
}

interface ArgumentTemplateProps {
  format: DebateFormat;
  role?: string;
  onArgumentComplete: (argument: string) => void;
  sessionId?: string; // For persistence
}

const ArgumentTemplate: React.FC<ArgumentTemplateProps> = ({
  format: _format,
  role = '',
  onArgumentComplete,
  sessionId
}) => {
  const { toast } = useToast();
  const persistKey = sessionId ? `argument-draft-${sessionId}` : undefined;
  
  const [argument, setArgument] = useState<ArgumentStructure>({
    introduction: '',
    points: [{ id: '1', statement: '', explanation: '', evidence: '', impact: '' }],
    conclusion: ''
  });

  // Load persisted draft if available
  useEffect(() => {
    if (persistKey) {
      const savedDraft = localStorage.getItem(persistKey);
      if (savedDraft) {
        try {
          setArgument(JSON.parse(savedDraft));
        } catch (error) {
          console.error('Error parsing saved argument draft:', error);
        }
      }
    }
  }, [persistKey]);

  // Save draft when it changes
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(persistKey, JSON.stringify(argument));
    }
  }, [argument, persistKey]);

  const handleAddPoint = () => {
    setArgument(prev => ({
      ...prev,
      points: [...prev.points, { 
        id: Date.now().toString(), 
        statement: '', 
        explanation: '', 
        evidence: '', 
        impact: '' 
      }]
    }));
  };

  const handleRemovePoint = (id: string) => {
    if (argument.points.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You need at least one argument point.",
        variant: "destructive"
      });
      return;
    }
    
    setArgument(prev => ({
      ...prev,
      points: prev.points.filter(point => point.id !== id)
    }));
  };

  const handlePointChange = (id: string, field: keyof ArgumentPoint, value: string) => {
    setArgument(prev => ({
      ...prev,
      points: prev.points.map(point => 
        point.id === id ? { ...point, [field]: value } : point
      )
    }));
  };

  const handleSubmit = () => {
    // Format the argument as a structured text
    let formattedArgument = '';
    
    // Add role if provided
    if (role) {
      formattedArgument += `Role: ${role}\n\n`;
    }
    
    // Add introduction
    if (argument.introduction) {
      formattedArgument += `${argument.introduction}\n\n`;
    }
    
    // Add points
    argument.points.forEach((point, index) => {
      formattedArgument += `Point ${index + 1}: ${point.statement}\n`;
      if (point.explanation) {
        formattedArgument += `${point.explanation}\n`;
      }
      if (point.evidence) {
        formattedArgument += `Evidence: ${point.evidence}\n`;
      }
      if (point.impact) {
        formattedArgument += `Impact: ${point.impact}\n`;
      }
      formattedArgument += '\n';
    });
    
    // Add conclusion
    if (argument.conclusion) {
      formattedArgument += `Conclusion: ${argument.conclusion}`;
    }
    
    onArgumentComplete(formattedArgument);
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your argument draft has been saved."
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Argument Structure</span>
          {role && <span className="text-sm bg-primary/10 px-2 py-1 rounded">{role}</span>}
        </CardTitle>
        <CardDescription>
          Build your argument using this structured template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="introduction">Introduction</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Introduction help</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Start with a clear statement of your position. Define key terms and provide context for your arguments.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="introduction"
            placeholder="Begin with a clear statement of your position..."
            value={argument.introduction}
            onChange={(e) => setArgument(prev => ({ ...prev, introduction: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Arguments</Label>
            <Button variant="outline" size="sm" onClick={handleAddPoint}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Point
            </Button>
          </div>

          {argument.points.map((point, index) => (
            <Card key={point.id} className="border border-muted">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Point {index + 1}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemovePoint(point.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove point</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`statement-${point.id}`}>Statement</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            A clear, concise claim that supports your position.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id={`statement-${point.id}`}
                    placeholder="Your main claim..."
                    value={point.statement}
                    onChange={(e) => handlePointChange(point.id, 'statement', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`explanation-${point.id}`}>Explanation</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Elaborate on your claim and explain your reasoning.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id={`explanation-${point.id}`}
                    placeholder="Explain your reasoning..."
                    value={point.explanation}
                    onChange={(e) => handlePointChange(point.id, 'explanation', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`evidence-${point.id}`}>Evidence</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Facts, statistics, examples, or expert opinions that support your claim.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id={`evidence-${point.id}`}
                    placeholder="Provide supporting evidence..."
                    value={point.evidence}
                    onChange={(e) => handlePointChange(point.id, 'evidence', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`impact-${point.id}`}>Impact</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Explain why this point matters and how it affects the debate.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id={`impact-${point.id}`}
                    placeholder="Explain the significance of this point..."
                    value={point.impact}
                    onChange={(e) => handlePointChange(point.id, 'impact', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="conclusion">Conclusion</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Summarize your key points and restate your position with conviction.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="conclusion"
            placeholder="Summarize your key points and restate your position..."
            value={argument.conclusion}
            onChange={(e) => setArgument(prev => ({ ...prev, conclusion: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="mr-2 h-4 w-4" /> Save Draft
        </Button>
        <Button onClick={handleSubmit}>
          Submit Argument
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArgumentTemplate;