/**
 * Three™ - Profile Store
 *
 * Manages user profile data with Supabase backend.
 * Handles profile creation, updates, and validation.
 */

import { getAuthenticatedSupabase } from '@/config/supabase';
import {
  UserProfile,
  ProfileUpdate,
  InterestId,
  createDefaultProfile,
  validateProfile,
  validateUsername,
  PROFILE_CONSTRAINTS,
} from '@/types/profile';

/**
 * Database profile row type
 */
interface DbProfile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  age: number | null;
  bio: string | null;
  profile_image: string | null;
  interests: string[];
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database profile to app UserProfile type
 */
function mapToUserProfile(dbProfile: DbProfile): UserProfile {
  return {
    userId: dbProfile.user_id,
    name: dbProfile.name,
    username: dbProfile.username,
    age: dbProfile.age ?? undefined,
    bio: dbProfile.bio ?? undefined,
    profileImage: dbProfile.profile_image ?? undefined,
    interests: dbProfile.interests as InterestId[],
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    isComplete: dbProfile.is_complete,
  };
}

/**
 * Get the current user's profile
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await getAuthenticatedSupabase()
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - profile doesn't exist
        return null;
      }
      console.error('Failed to get profile:', error.message, error.code, error.details);
      return null;
    }

    return data ? mapToUserProfile(data as DbProfile) : null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

/**
 * Create or initialize a new profile
 */
export async function createProfile(
  userId: string,
  name?: string
): Promise<UserProfile> {
  // Check if profile already exists
  const existing = await getProfile(userId);
  if (existing) {
    return existing;
  }

  const profile = createDefaultProfile(userId, name);

  const insertData = {
    user_id: profile.userId,
    name: profile.name,
    username: profile.username,
    age: profile.age ?? null,
    bio: profile.bio ?? null,
    profile_image: profile.profileImage ?? null,
    interests: profile.interests,
    is_complete: profile.isComplete,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };

  const { data, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to create profile:', error.message, error.code, error.details);
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return mapToUserProfile(data as DbProfile);
}

/**
 * Update the user's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  const profile = await getProfile(userId);

  if (!profile) {
    // Create profile if it doesn't exist
    const newProfile = createDefaultProfile(userId);
    const merged = { ...newProfile, ...updates };
    return createProfile(userId, merged.name);
  }

  // Apply updates for validation
  const updatedProfile: UserProfile = {
    ...profile,
    ...updates,
    userId, // Ensure userId can't be changed
    createdAt: profile.createdAt, // Preserve creation time
    updatedAt: new Date().toISOString(),
  };

  // Validate the updated profile
  const validation = validateProfile(updatedProfile);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors).find(Boolean);
    throw new Error(firstError || 'Invalid profile data');
  }

  // Build update data object with only changed fields
  const updateData: Record<string, unknown> = {
    name: updatedProfile.name,
    username: updatedProfile.username,
    age: updatedProfile.age ?? null,
    bio: updatedProfile.bio ?? null,
    profile_image: updatedProfile.profileImage ?? null,
    interests: updatedProfile.interests,
    is_complete: updatedProfile.isComplete,
    updated_at: updatedProfile.updatedAt,
  };

  const { data, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile:', error.message, error.code, error.details);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return mapToUserProfile(data as DbProfile);
}

/**
 * Save selected interests during signup
 */
export async function saveInterests(
  userId: string,
  interests: InterestId[]
): Promise<UserProfile> {
  return updateProfile(userId, { interests });
}

/**
 * Check if a username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    return false;
  }

  const { data, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Failed to check username:', error.message);
    return false;
  }

  return data === null;
}

/**
 * Set username with validation
 */
export async function setUsername(
  userId: string,
  username: string
): Promise<UserProfile> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const available = await isUsernameAvailable(username);
  if (!available) {
    throw new Error('This username is not available');
  }

  return updateProfile(userId, { username });
}

/**
 * Mark profile as complete after initial setup
 */
export async function completeProfileSetup(userId: string): Promise<UserProfile> {
  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Ensure minimum requirements are met
  if (!profile.name) {
    throw new Error('Name is required to complete profile');
  }
  if (!profile.username) {
    throw new Error('Username is required to complete profile');
  }
  if (profile.interests.length < PROFILE_CONSTRAINTS.interests.minCount) {
    throw new Error(
      `Please select at least ${PROFILE_CONSTRAINTS.interests.minCount} interests`
    );
  }

  return updateProfile(userId, { isComplete: true });
}

/**
 * Check if profile setup is complete
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.isComplete ?? false;
}

/**
 * Get profile summary for display
 */
export async function getProfileSummary(userId: string): Promise<{
  name: string;
  username: string;
  interestCount: number;
} | null> {
  const profile = await getProfile(userId);
  if (!profile) return null;

  return {
    name: profile.name,
    username: profile.username,
    interestCount: profile.interests.length,
  };
}

/**
 * Delete profile data
 */
export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await getAuthenticatedSupabase()
    .from('profiles')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete profile:', error.message);
    throw new Error(`Failed to delete profile: ${error.message}`);
  }
}

/**
 * Export profile data as JSON
 */
export async function exportProfile(userId: string): Promise<string | null> {
  const profile = await getProfile(userId);
  if (!profile) return null;

  return JSON.stringify(profile, null, 2);
}

/**
 * Update profile image
 */
export async function updateProfileImage(
  userId: string,
  imageUri: string | null
): Promise<UserProfile> {
  return updateProfile(userId, { profileImage: imageUri ?? undefined });
}

/**
 * Remove profile image
 */
export async function removeProfileImage(userId: string): Promise<UserProfile> {
  return updateProfileImage(userId, null);
}

/**
 * Search profiles by username or name
 */
export async function searchProfiles(query: string, limit = 20): Promise<UserProfile[]> {
  const { data, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .eq('is_complete', true)
    .limit(limit);

  if (error) {
    console.error('Failed to search profiles:', error.message);
    return [];
  }

  return (data as DbProfile[]).map(mapToUserProfile);
}

/**
 * Get profiles by interest for discovery
 */
export async function getProfilesByInterest(
  interest: InterestId,
  excludeUserId: string,
  limit = 20
): Promise<UserProfile[]> {
  const { data, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('*')
    .contains('interests', [interest])
    .neq('user_id', excludeUserId)
    .eq('is_complete', true)
    .limit(limit);

  if (error) {
    console.error('Failed to get profiles by interest:', error.message);
    return [];
  }

  return (data as DbProfile[]).map(mapToUserProfile);
}
