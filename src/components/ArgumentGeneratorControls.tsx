
"use client";

import type { ReasoningSkill } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, Lightbulb, Loader2, BookOpenCheck } from 'lucide-react';
import { useState } from 'react';
import { suggestTopics, SuggestTopicsOutput } from '@/ai/flows/suggest-topics-flow';
import { useToast } from '@/hooks/use-toast';

interface ArgumentGeneratorControlsProps {
  topic: string;
  setTopic: (topic: string) => void;
  reasoningSkill: ReasoningSkill;
  setReasoningSkill: (skill: ReasoningSkill) => void;
  onGenerateArgument: () => void;
  onResearchTopic: () => void;
  isLoadingArgument: boolean;
  isLoadingResearch: boolean;
}

const ArgumentGeneratorControls: React.FC<ArgumentGeneratorControlsProps> = ({
  topic,
  setTopic,
  reasoningSkill,
  setReasoningSkill,
  onGenerateArgument,
  onResearchTopic,
  isLoadingArgument,
  isLoadingResearch,
}) => {
  const [isSuggestingTopics, setIsSuggestingTopics] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggestTopics = async () => {
    setIsSuggestingTopics(true);
    setSuggestedTopics([]);
    try {
      const result: SuggestTopicsOutput = await suggestTopics({}); // No category for now
      setSuggestedTopics(result.topics);
      if (result.topics.length === 0) {
        toast({ title: "No Topics Suggested", description: "The AI couldn't suggest any topics at this time. Try again!" });
      }
    } catch (error) {
      console.error("Error suggesting topics:", error);
      toast({ title: "Error Suggesting Topics", description: "Failed to get topic suggestions. Please try again.", variant: "destructive" });
    } finally {
      setIsSuggestingTopics(false);
    }
  };

  const handleTopicSuggestionClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    setSuggestedTopics([]); // Clear suggestions after one is picked
  };

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
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="topic"
              placeholder="E.g., 'Is universal basic income feasible?'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-grow"
            />
            <Button
              variant="outline"
              onClick={handleSuggestTopics}
              disabled={isSuggestingTopics || isLoadingArgument || isLoadingResearch}
              title="Suggest Topics"
              size="icon"
            >
              {isSuggestingTopics ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isSuggestingTopics && (
          <div className="p-3 bg-muted/50 rounded-md text-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary inline-block mr-2" />
            <span className="text-sm text-muted-foreground">Getting topic suggestions...</span>
          </div>
        )}

        {suggestedTopics.length > 0 && !isSuggestingTopics && (
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground">Topic Suggestions:</h4>
            <ul className="space-y-1">
              {suggestedTopics.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-left text-sm text-primary hover:underline"
                    onClick={() => handleTopicSuggestionClick(item)}
                  >
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button onClick={onResearchTopic} disabled={isLoadingResearch || !topic || isLoadingArgument} variant="outline">
            {isLoadingResearch ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BookOpenCheck className="mr-2 h-4 w-4" />
            )}
            Research Topic
          </Button>
          <Button onClick={onGenerateArgument} disabled={isLoadingArgument || !topic || isLoadingResearch}>
            {isLoadingArgument ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate AI Argument
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArgumentGeneratorControls;
