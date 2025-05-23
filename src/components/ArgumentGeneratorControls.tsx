"use client";

import type { ReasoningSkill } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles } from 'lucide-react';

interface ArgumentGeneratorControlsProps {
  topic: string;
  setTopic: (topic: string) => void;
  reasoningSkill: ReasoningSkill;
  setReasoningSkill: (skill: ReasoningSkill) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const ArgumentGeneratorControls: React.FC<ArgumentGeneratorControlsProps> = ({
  topic,
  setTopic,
  reasoningSkill,
  setReasoningSkill,
  onGenerate,
  isLoading,
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Craft Your Argument
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="topic" className="text-sm font-medium">Debate Topic</Label>
          <Input
            id="topic"
            placeholder="E.g., 'Is universal basic income feasible?'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="reasoning-skill" className="text-sm font-medium">Reasoning Skill Level</Label>
          <Select value={reasoningSkill} onValueChange={(value) => setReasoningSkill(value as ReasoningSkill)}>
            <SelectTrigger id="reasoning-skill" className="mt-1">
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onGenerate} disabled={isLoading || !topic} className="w-full">
          {isLoading ? (
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate AI Argument
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArgumentGeneratorControls;
