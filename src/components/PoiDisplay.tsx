// src/components/PoiDisplay.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface PoiDisplayProps {
  poi: string | null;
  poiResponse: string;
  setPoiResponse: (response: string) => void;
  onGetPoi: () => void;
  canRequestPoi: boolean;
  isLoadingPoi: boolean;
}

const PoiDisplay: React.FC<PoiDisplayProps> = ({
  poi,
  poiResponse,
  setPoiResponse,
  onGetPoi,
  canRequestPoi,
  isLoadingPoi,
}) => {
  return (
    <div className="mt-4">
      <Button
        variant="outline"
        onClick={onGetPoi}
        disabled={!canRequestPoi || isLoadingPoi}
        className="w-full"
        title={!canRequestPoi && !isLoadingPoi ? "Write more to enable POIs" : "Request a Point of Information"}
      >
        {isLoadingPoi ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <HelpCircle className="mr-2 h-4 w-4" />
        )}
        Challenge me with a POI
      </Button>

      {isLoadingPoi && (
         <Card className="mt-4 border-dashed">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-accent" />
                    Opponent is thinking...
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
      )}

      {poi && !isLoadingPoi && (
        <Card className="mt-4 bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-accent" />
              Point of Information
            </CardTitle>
            <CardDescription>The AI opponent asks: "{poi}"</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Your response to the POI..."
              value={poiResponse}
              onChange={(e) => setPoiResponse(e.target.value)}
              aria-label="Your response to the Point of Information"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PoiDisplay;
