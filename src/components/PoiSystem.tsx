"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, Hand, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface PoiSystemProps {
  isActive: boolean;
  currentRole: string;
  speechTimeElapsed: number; // in seconds
  onPoiOffered: (poi: string) => void;
  onPoiAccepted: (response: string) => void;
  onPoiDeclined: () => void;
  activePoi?: string;
  isWaitingForResponse?: boolean;
}

const PoiSystem: React.FC<PoiSystemProps> = ({
  isActive,
  currentRole,
  speechTimeElapsed,
  onPoiOffered,
  onPoiAccepted,
  onPoiDeclined,
  activePoi,
  isWaitingForResponse = false
}) => {
  const [poiText, setPoiText] = useState<string>('');
  const [poiResponse, setPoiResponse] = useState<string>('');
  const [canOfferPoi, setCanOfferPoi] = useState<boolean>(false);

  // POIs can only be offered between minutes 1-6 of a speech
  useEffect(() => {
    const canOffer = speechTimeElapsed >= 60 && speechTimeElapsed <= 360 && isActive;
    setCanOfferPoi(canOffer);
  }, [speechTimeElapsed, isActive]);

  const handleOfferPoi = () => {
    if (poiText.trim() && canOfferPoi) {
      onPoiOffered(poiText.trim());
      setPoiText('');
    }
  };

  const handleAcceptPoi = () => {
    if (poiResponse.trim()) {
      onPoiAccepted(poiResponse.trim());
      setPoiResponse('');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPoiStatus = () => {
    if (speechTimeElapsed < 60) return 'protected-time-start';
    if (speechTimeElapsed > 360) return 'protected-time-end';
    return 'poi-time';
  };

  const poiStatus = getPoiStatus();

  return (
    <Card className="shadow-lg border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="h-5 w-5 text-blue-600" />
          Points of Information (POI)
          <Badge variant={poiStatus === 'poi-time' ? 'default' : 'secondary'}>
            {formatTime(speechTimeElapsed)}
          </Badge>
        </CardTitle>
        <CardDescription>
          {currentRole && `Speaking as: ${currentRole}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* POI Status Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {poiStatus === 'protected-time-start' && 'Protected time - POIs not allowed (first minute)'}
            {poiStatus === 'protected-time-end' && 'Protected time - POIs not allowed (last minute)'}
            {poiStatus === 'poi-time' && 'POI time - Points of Information allowed'}
          </span>
        </div>

        {/* Offer POI Section */}
        {!activePoi && !isWaitingForResponse && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Offer a Point of Information
            </h4>
            <Textarea
              placeholder="Enter your POI question (keep it brief and relevant)..."
              value={poiText}
              onChange={(e) => setPoiText(e.target.value)}
              className="min-h-[80px]"
              disabled={!canOfferPoi}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {poiText.length}/100 characters (keep POIs concise)
              </span>
              <Button
                onClick={handleOfferPoi}
                disabled={!canOfferPoi || !poiText.trim() || poiText.length > 100}
                size="sm"
              >
                <Hand className="mr-2 h-4 w-4" />
                Offer POI
              </Button>
            </div>
          </div>
        )}

        {/* Active POI Section */}
        {activePoi && (
          <div className="space-y-3 p-4 border rounded-md bg-blue-50">
            <h4 className="font-medium text-blue-800">Active POI:</h4>
            <p className="text-sm bg-white p-3 rounded border">"{activePoi}"</p>
            
            {!isWaitingForResponse ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Your response to the POI..."
                  value={poiResponse}
                  onChange={(e) => setPoiResponse(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAcceptPoi}
                    disabled={!poiResponse.trim()}
                    size="sm"
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept & Respond
                  </Button>
                  <Button
                    onClick={onPoiDeclined}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline POI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-pulse text-blue-600">
                  Waiting for response...
                </div>
              </div>
            )}
          </div>
        )}

        {/* POI Guidelines */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded">
          <h5 className="font-medium">POI Guidelines:</h5>
          <ul className="list-disc pl-4 space-y-1">
            <li>POIs can only be offered between minutes 1-6 of a speech</li>
            <li>Keep POIs brief and relevant (max 15 seconds when spoken)</li>
            <li>Speakers should take at least one POI during their speech</li>
            <li>POIs should challenge or clarify, not make new arguments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoiSystem;