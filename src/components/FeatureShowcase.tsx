"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Mic, 
  Volume2, 
  BarChart3, 
  Award, 
  Timer,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface FeatureShowcaseProps {
  onStartDebate: () => void;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ onStartDebate }) => {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Asian Parliamentary Format",
      description: "Complete support for the 8-speech Asian Parliamentary debate structure with role-specific guidance.",
      highlights: ["8 structured roles", "Government vs Opposition", "7-minute substantive speeches", "4-minute reply speeches"]
    },
    {
      icon: <Timer className="h-6 w-6 text-green-600" />,
      title: "15-Minute Preparation Timer",
      description: "Professional preparation phase with pause/resume functionality and time tracking.",
      highlights: ["Visual countdown", "Pause & resume", "Time notifications", "Early start option"]
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
      title: "Structured Argument Builder",
      description: "Template-guided argument formation with introduction, points, evidence, and conclusion sections.",
      highlights: ["Guided templates", "Draft saving", "Contextual help", "Evidence tracking"]
    },
    {
      icon: <Mic className="h-6 w-6 text-red-600" />,
      title: "Speech-to-Text Input",
      description: "Natural speech input for arguments with real-time transcription capabilities.",
      highlights: ["Voice recording", "Text transcription", "Append to arguments", "Hands-free input"]
    },
    {
      icon: <Volume2 className="h-6 w-6 text-orange-600" />,
      title: "AI Voice Responses",
      description: "Role-appropriate AI voices that adapt to different debate positions and speaking styles.",
      highlights: ["Role-specific voices", "High-quality TTS", "Government/Opposition voices", "Natural delivery"]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
      title: "Performance Analytics",
      description: "Comprehensive statistics tracking argument quality, participation, and improvement areas.",
      highlights: ["Quality scoring", "Word count analysis", "Time tracking", "Performance insights"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Master Asian Parliamentary Debate
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Practice with AI opponents, get real-time feedback, and improve your debating skills 
          with our comprehensive Asian Parliamentary Debate training platform.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={onStartDebate} size="lg" className="px-8">
            <ArrowRight className="mr-2 h-5 w-5" />
            Start Debating Now
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Flow */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            How It Works
          </CardTitle>
          <CardDescription>
            Follow these simple steps to start your Asian Parliamentary debate practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium">Choose Topic</h3>
              <p className="text-sm text-muted-foreground">
                Enter your debate motion and select Asian Parliamentary format
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium">Prepare</h3>
              <p className="text-sm text-muted-foreground">
                Use 15 minutes to research and structure your arguments
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium">Debate</h3>
              <p className="text-sm text-muted-foreground">
                Engage with AI opponents in structured debate rounds
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-medium">Improve</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed feedback and track your progress over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-600" />
              Perfect for Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Practice anytime, anywhere</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">No need for human debate partners</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Immediate feedback and improvement tips</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Track progress over multiple sessions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Competitive Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Official Asian Parliamentary format</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Realistic timing and structure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Role-specific training and feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Points of Information practice</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-blue-50">
        <CardContent className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Become a Better Debater?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of students who have improved their debate skills with ArgumentAce. 
            Start your first Asian Parliamentary debate session today.
          </p>
          <Button onClick={onStartDebate} size="lg" className="px-8">
            <ArrowRight className="mr-2 h-5 w-5" />
            Begin Your First Debate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureShowcase;