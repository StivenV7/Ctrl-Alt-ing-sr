import { supabase } from '@/lib/supabase';
import type { PublicProfile } from '@/lib/types';

/**
 * Creates or updates a user's public profile.
 * @param userId The ID of the user.
 * @param profileData The public profile data to save.
 */
export async function updatePublicProfile(userId: string, profileData: PublicProfile): Promise<void> {
  const { error } = await supabase
    .from('public_profiles')
    .upsert({
      uid: userId,
      display_name: profileData.displayName,
      photo_url: profileData.photoURL,
      rank_name: profileData.rankName,
      completed_habits: profileData.completedHabits,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Removes a user's public profile.
 * @param userId The ID of the user.
 */
export async function removePublicProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('public_profiles')
    .delete()
    .eq('uid', userId);

  if (error) throw error;
}

/**
 * Fetches the top users for the leaderboard.
 * Users are sorted by completed habits count in descending order.
 * @returns A promise that resolves to an array of public profiles.
 */
export async function getLeaderboardUsers(): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .order('completed_habits', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data || []).map(profile => ({
    uid: profile.uid,
    displayName: profile.display_name,
    photoURL: profile.photo_url,
    rankName: profile.rank_name,
    completedHabits: profile.completed_habits,
  }));
}
