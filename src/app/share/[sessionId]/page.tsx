
// src/app/share/[sessionId]/page.tsx
import { getSharedSession } from '@/services/sharingService';
import SharedSessionDisplay from '@/components/SharedSessionDisplay';
import ArgumentAceLogo from '@/components/ArgumentAceLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { sessionId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sessionId = params.sessionId;
  const session = await getSharedSession(sessionId);
  
  const previousImages = (await parent).openGraph?.images || []

  if (!session) {
    return {
      title: 'Session Not Found - ArgumentAce',
      description: 'The requested debate session could not be found.',
       openGraph: {
        images: [...previousImages],
      },
    };
  }

  return {
    title: `Debate: ${session.topic} - ArgumentAce Shared Session`,
    description: `View the shared debate session on the topic: ${session.topic}. Includes debate log, AI feedback, and jury verdict.`,
    openGraph: {
      title: `Debate: ${session.topic} - ArgumentAce`,
      description: `Shared debate session.`,
      type: 'article',
      // Ideally, add an image here related to the app or topic
      images: ['/og-image-argumentace.png', ...previousImages], // Placeholder, create this image
    },
  };
}


export default async function SharedSessionPage({ params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  const session = await getSharedSession(sessionId); // This uses the stubbed service

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <ArgumentAceLogo size="lg" />
        <h1 className="text-3xl font-bold mt-8 mb-4">Session Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The debate session you are looking for either does not exist or is no longer available.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Go back to ArgumentAce
          </Link>
        </Button>
      </div>
    );
  }
  // Add a basic OG image to public folder for metadata
  // In a real app, you might generate this dynamically or have a specific one.

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="py-4 px-6 bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ArgumentAceLogo />
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">
             <Home className="mr-2 h-4 w-4" /> Create Your Own Debate
            </Link>
          </Button>
        </div>
      </header>
      <SharedSessionDisplay session={session} />
       <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ArgumentAce. Powered by AI.</p>
        <p>
          <Link href="/" className="hover:text-primary underline">
            Create your own debate practice session
          </Link>
        </p>
      </footer>
    </div>
  );
}
