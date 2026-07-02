/**
 * Three™ - Profile Store
 *
 * Manages user profile data with Supabase backend.
 * Handles profile creation, updates, and validation.
 */

import { supabase } from '@/config/supabase';
import {
  UserProfile,
  ProfileUpdate,
  InterestId,
  createDefaultProfile,
  validateProfile,
  validateUsername,
  normalizeUsername,
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
    const { data, error } = await supabase
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

  // Upsert so a concurrent create (e.g. app root + interests screen both
  // pre-creating on mount) is a no-op instead of a 23505 error.
  const { error } = await supabase
    .from('profiles')
    .upsert(insertData, { onConflict: 'user_id', ignoreDuplicates: true });

  if (error) {
    console.error('Failed to create profile:', error.message, error.code, error.details);
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  // Re-read: with ignoreDuplicates the upsert returns no row when one already existed.
  const created = await getProfile(userId);
  if (!created) {
    throw new Error('Failed to create profile: row not found after upsert');
  }
  return created;
}

/**
 * Update the user's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  // Usernames are stored in canonical form (no @, lowercase) so lookups,
  // uniqueness, and "@handle" display never disagree.
  if (updates.username !== undefined) {
    updates = { ...updates, username: normalizeUsername(updates.username) };
  }

  const profile = await getProfile(userId);

  if (!profile) {
    // Profile doesn't exist yet — build a complete row from defaults + updates so
    // nothing is lost (interests, username, isComplete are all preserved).
    const defaults = createDefaultProfile(userId, updates.name);
    const merged: UserProfile = {
      ...defaults,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };

    // Validate before inserting
    const validation = validateProfile(merged);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors).find(Boolean);
      throw new Error(firstError || 'Invalid profile data');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: merged.userId,
        name: merged.name,
        username: merged.username,
        age: merged.age ?? null,
        bio: merged.bio ?? null,
        profile_image: merged.profileImage ?? null,
        interests: merged.interests,
        is_complete: merged.isComplete,
        created_at: merged.createdAt,
        updated_at: merged.updatedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create profile during update:', error.message, error.code);
      if (error.code === '23505') {
        throw new Error('This username is not available');
      }
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return mapToUserProfile(data as DbProfile);
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

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile:', error.message, error.code, error.details);
    if (error.code === '23505') {
      throw new Error('This username is not available');
    }
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

  const { data, error } = await supabase
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

  try {
    return await updateProfile(userId, { username });
  } catch (error: any) {
    if (error.message === 'This username is not available' || error.message?.includes('23505')) {
      throw new Error('This username was just taken. Please choose another.');
    }
    throw error;
  }
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
  const { error } = await supabase
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.*${query}*,name.ilike.*${query}*`)
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
  const { data, error } = await supabase
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
