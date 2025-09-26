
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import type { PublicProfile } from '@/lib/types';

const PUBLIC_PROFILES_COLLECTION = 'publicProfiles';

/**
 * Creates or updates a user's public profile document.
 * @param userId The UID of the user.
 * @param profileData The public profile data to save.
 */
export async function updatePublicProfile(userId: string, profileData: PublicProfile): Promise<void> {
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  await setDoc(publicProfileRef, profileData);
}

/**
 * Removes a user's public profile document.
 * @param userId The UID of the user.
 */
export async function removePublicProfile(userId: string): Promise<void> {
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  await deleteDoc(publicProfileRef);
}

/**
 * Fetches the top users for the leaderboard.
 * Users are sorted by completed habits count in descending order.
 * @returns A promise that resolves to an array of public profiles.
 */
export async function getLeaderboardUsers(): Promise<PublicProfile[]> {
  const q = query(
    collection(db, PUBLIC_PROFILES_COLLECTION),
    orderBy('completedHabits', 'desc'),
    limit(50) // Limit to top 50 users for performance
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as PublicProfile);
}
