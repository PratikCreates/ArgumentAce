"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DebateFormat, debateFormats } from '@/types/debate-formats';
import { Scale, Clock, Users } from 'lucide-react';

interface FormatSelectionProps {
  onFormatSelected: (format: DebateFormat) => void;
  defaultFormat?: DebateFormat;
}

const FormatSelection: React.FC<FormatSelectionProps> = ({ 
  onFormatSelected,
  defaultFormat = 'standard'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(defaultFormat);

  const handleFormatSelect = (format: DebateFormat) => {
    setSelectedFormat(format);
  };

  const handleConfirm = () => {
    onFormatSelected(selectedFormat);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Select Debate Format</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(Object.keys(debateFormats) as DebateFormat[]).map((format) => (
          <Card 
            key={format}
            className={`cursor-pointer transition-all ${
              selectedFormat === format 
                ? 'border-primary border-2 shadow-lg' 
                : 'border hover:border-primary/50'
            }`}
            onClick={() => handleFormatSelect(format)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {format === 'standard' && <Scale className="h-5 w-5" />}
                {format === 'asian-parliamentary' && <Users className="h-5 w-5" />}
                {format === 'british-parliamentary' && <Users className="h-5 w-5" />}
                {debateFormats[format].name}
              </CardTitle>
              <CardDescription>
                {debateFormats[format].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {debateFormats[format].prepTime > 0 
                    ? `${debateFormats[format].prepTime} minutes preparation time` 
                    : 'No formal preparation time'}
                </span>
              </div>
              {format === 'asian-parliamentary' && (
                <div className="mt-2 text-sm">
                  <p>• 8 structured speeches</p>
                  <p>• Government and Opposition roles</p>
                  <p>• 7-minute substantive speeches</p>
                  <p>• 4-minute reply speeches</p>
                </div>
              )}
              {format === 'british-parliamentary' && (
                <div className="mt-2 text-sm">
                  <p>• 8 speeches from 4 teams</p>
                  <p>• Opening/Closing Gov/Opp</p>
                  <p>• 7-minute speeches</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant={selectedFormat === format ? "default" : "outline"}
                className="w-full"
                onClick={() => handleFormatSelect(format)}
              >
                {selectedFormat === format ? 'Selected' : 'Select'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button onClick={handleConfirm} size="lg">
          Continue with {debateFormats[selectedFormat].name}
        </Button>
      </div>
    </div>
  );
};

export default FormatSelection;