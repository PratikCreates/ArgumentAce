
// src/services/sharingService.ts
'use server'; // Or remove if it's client-side stubs for now

import type { DebateSession } from '@/types';

/**
 * !! THIS IS A STUBBED SERVICE !!
 * In a real application, this service would interact with a backend database
 * (e.g., Firebase Firestore) to store and retrieve shared debate sessions.
 */

// Simulate a database
const mockPublicSessions = new Map<string, DebateSession>();

/**
 * Publishes a debate session to the public "database".
 * In a real app, this would save the session to Firestore and return a unique ID.
 * @param session - The debate session to share.
 * @returns A promise that resolves with the shareId and the full public URL.
 */
export async function publishSession(
  session: Omit<DebateSession, 'id' | 'shareId' | 'isPublic'> & { localId: string }
): Promise<{ shareId: string; publicUrl: string }> {
  console.log("Attempting to publish session for localId:", session.localId);
  // Simulate saving to a public database and getting a new unique ID
  const shareId = `shared_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const publicSessionData: DebateSession = {
    ...session,
    id: shareId, // The public ID is the main ID for shared sessions
    shareId: shareId,
    isPublic: true,
  };
  mockPublicSessions.set(shareId, publicSessionData);
  console.log("Session published with shareId:", shareId, "Data:", publicSessionData);

  // Construct the public URL (replace with your actual domain in a real app)
  // For local dev, assuming the app runs on localhost:9002
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareId}`
    : `http://localhost:9002/share/${shareId}`; // Fallback for server environment

  return { shareId, publicUrl };
}

/**
 * Fetches a publicly shared debate session.
 * In a real app, this would fetch the session from Firestore using the shareId.
 * @param shareId - The unique ID of the shared session.
 * @returns A promise that resolves with the DebateSession or null if not found.
 */
export async function getSharedSession(shareId: string): Promise<DebateSession | null> {
  console.log("Attempting to fetch shared session with shareId:", shareId);
  // Simulate fetching from a public database
  const session = mockPublicSessions.get(shareId);
  if (session) {
    console.log("Found shared session:", session);
    return session;
  }
  console.log("Shared session not found for shareId:", shareId);
  return null;
}
