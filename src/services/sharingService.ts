
// src/services/sharingService.ts
'use server';

import type { DebateSession } from '@/types';

/**
 * !! THIS IS A STUBBED SERVICE !!
 * In a real application, this service would interact with a backend database
 * (e.g., Firebase Firestore) to store and retrieve shared debate sessions.
 * The current in-memory `mockPublicSessions` will reset on server restarts
 * or when different server instances handle requests, leading to "Session Not Found"
 * for shared links over time or across different environments.
 */

// Simulate a database
const mockPublicSessions = new Map<string, DebateSession>();

/**
 * Publishes a debate session to the public "database".
 * In a real app, this would save the session to Firestore and return a unique ID.
 * @param sessionData - The core data of the debate session to share.
 * @returns A promise that resolves with the shareId and the full public URL.
 */
export async function publishSession(
  sessionData: Omit<DebateSession, 'id' | 'shareId' | 'isPublic' | 'publicUrl'> & { localId: string }
): Promise<{ shareId: string; publicUrl: string }> {
  console.log("Attempting to publish session for localId:", sessionData.localId);
  // Simulate saving to a public database and getting a new unique ID
  const shareId = `shared_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareId}`
    : `http://localhost:9002/share/${shareId}`; // Fallback for server environment

  const publicSession: DebateSession = {
    ...sessionData,    // Spread the core session data
    id: shareId,       // Public session's main ID is its shareId
    shareId: shareId,
    isPublic: true,
    publicUrl: publicUrl, // Explicitly set the publicUrl
  };
  mockPublicSessions.set(shareId, publicSession);
  console.log("Session published to mock DB with shareId:", shareId, "Data:", publicSession);

  return { shareId, publicUrl };
}

/**
 * Fetches a publicly shared debate session.
 * In a real app, this would fetch the session from Firestore using the shareId.
 * @param shareId - The unique ID of the shared session.
 * @returns A promise that resolves with the DebateSession or null if not found.
 */
export async function getSharedSession(shareId: string): Promise<DebateSession | null> {
  console.log("Attempting to fetch shared session with shareId from mock DB:", shareId);
  const session = mockPublicSessions.get(shareId);
  if (session) {
    console.log("Found shared session in mock DB:", session);
    return session;
  }
  console.log("Shared session not found in mock DB for shareId:", shareId);
  return null;
}
