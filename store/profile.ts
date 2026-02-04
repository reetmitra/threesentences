/**
 * ThreeSixtyThree™ Three Sentences - Profile Store
 *
 * Manages user profile data with AsyncStorage.
 * Handles profile creation, updates, and validation.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';
import {
  UserProfile,
  ProfileUpdate,
  CategoryId,
  createDefaultProfile,
  validateProfile,
  validateUsername,
  PROFILE_CONSTRAINTS,
} from '@/types/profile';

const STORAGE_KEYS = {
  PROFILE: '@threesentences/profile',
  USERNAME_CHECK: '@threesentences/usernames', // For local username tracking
} as const;

/**
 * Get the current user's profile
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;

    const profile = JSON.parse(data) as UserProfile;
    // Verify this profile belongs to the current user
    if (profile.userId !== userId) {
      return null;
    }

    return profile;
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
  const profile = createDefaultProfile(userId, name);
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  return profile;
}

/**
 * Update the user's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  let profile = await getProfile(userId);

  if (!profile) {
    profile = createDefaultProfile(userId);
  }

  // Apply updates
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

  // Save to AsyncStorage
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

  // Sync name to Firebase Auth if it changed
  if (updates.name && auth.currentUser) {
    try {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: updates.name,
      });
    } catch (error) {
      console.error('Failed to sync name to Firebase:', error);
      // Don't throw - local profile is still saved
    }
  }

  return updatedProfile;
}

/**
 * Save selected interests during signup
 */
export async function saveInterests(
  userId: string,
  interests: CategoryId[]
): Promise<UserProfile> {
  let profile = await getProfile(userId);

  if (!profile) {
    profile = createDefaultProfile(userId);
  }

  const updatedProfile: UserProfile = {
    ...profile,
    interests,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
  return updatedProfile;
}

/**
 * Update hobbies (max 5)
 */
export async function updateHobbies(
  userId: string,
  hobbies: string[]
): Promise<UserProfile> {
  if (hobbies.length > PROFILE_CONSTRAINTS.hobbies.maxCount) {
    throw new Error(`Maximum ${PROFILE_CONSTRAINTS.hobbies.maxCount} hobbies allowed`);
  }

  // Filter out empty hobbies and trim
  const cleanedHobbies = hobbies
    .map(h => h.trim())
    .filter(h => h.length > 0);

  return updateProfile(userId, { hobbies: cleanedHobbies });
}

/**
 * Add a single hobby
 */
export async function addHobby(userId: string, hobby: string): Promise<UserProfile> {
  const profile = await getProfile(userId);
  const currentHobbies = profile?.hobbies || [];

  if (currentHobbies.length >= PROFILE_CONSTRAINTS.hobbies.maxCount) {
    throw new Error(`Maximum ${PROFILE_CONSTRAINTS.hobbies.maxCount} hobbies allowed`);
  }

  const trimmedHobby = hobby.trim();
  if (!trimmedHobby) {
    throw new Error('Hobby cannot be empty');
  }

  if (trimmedHobby.length > PROFILE_CONSTRAINTS.hobbies.maxLength) {
    throw new Error(`Hobby must be ${PROFILE_CONSTRAINTS.hobbies.maxLength} characters or less`);
  }

  // Check for duplicates
  if (currentHobbies.some(h => h.toLowerCase() === trimmedHobby.toLowerCase())) {
    throw new Error('This hobby is already added');
  }

  return updateProfile(userId, { hobbies: [...currentHobbies, trimmedHobby] });
}

/**
 * Remove a hobby
 */
export async function removeHobby(userId: string, hobby: string): Promise<UserProfile> {
  const profile = await getProfile(userId);
  const currentHobbies = profile?.hobbies || [];

  const updatedHobbies = currentHobbies.filter(
    h => h.toLowerCase() !== hobby.toLowerCase()
  );

  return updateProfile(userId, { hobbies: updatedHobbies });
}

/**
 * Check if a username is available (local check)
 * In a real app, this would check against a backend
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    return false;
  }

  // For local-first approach, we just check format validity
  // In production, this would call an API
  return true;
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
  if (profile.interests.length === 0) {
    throw new Error('Please select at least one interest');
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
  hobbyCount: number;
} | null> {
  const profile = await getProfile(userId);
  if (!profile) return null;

  return {
    name: profile.name,
    username: profile.username,
    interestCount: profile.interests.length,
    hobbyCount: profile.hobbies.length,
  };
}

/**
 * Delete profile data
 */
export async function deleteProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
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
  let profile = await getProfile(userId);

  if (!profile) {
    profile = createDefaultProfile(userId);
  }

  const updatedProfile: UserProfile = {
    ...profile,
    profileImage: imageUri || undefined,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
  return updatedProfile;
}

/**
 * Remove profile image
 */
export async function removeProfileImage(userId: string): Promise<UserProfile> {
  return updateProfileImage(userId, null);
}
