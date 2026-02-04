/**
 * Tests for Profile Store
 *
 * Tests all profile management functions including
 * creation, updates, validation, and storage operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getProfile,
  createProfile,
  updateProfile,
  saveInterests,
  updateHobbies,
  addHobby,
  removeHobby,
  setUsername,
  completeProfileSetup,
  isProfileComplete,
  getProfileSummary,
  deleteProfile,
  exportProfile,
  updateProfileImage,
  removeProfileImage,
} from '@/store/profile';
import { PROFILE_CONSTRAINTS } from '@/types/profile';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Firebase auth
const mockUpdateProfile = jest.fn();
jest.mock('firebase/auth', () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

jest.mock('@/config/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123', displayName: 'Test User' },
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;


describe('profile store', () => {
  const testUserId = 'test-user-123';
  const mockProfile = {
    userId: testUserId,
    name: 'Test User',
    username: 'testuser',
    age: 25,
    interests: ['mindfulness', 'fitness'] as const,
    hobbies: ['reading', 'coding'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isComplete: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns null when no profile exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const profile = await getProfile(testUserId);

      expect(profile).toBeNull();
    });

    it('returns profile when it exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const profile = await getProfile(testUserId);

      expect(profile).toEqual(mockProfile);
    });

    it('returns null when profile belongs to different user', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const profile = await getProfile('different-user');

      expect(profile).toBeNull();
    });

    it('returns null on parse error', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const profile = await getProfile(testUserId);

      expect(profile).toBeNull();
    });

    it('reads from correct storage key', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await getProfile(testUserId);

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@threesentences/profile');
    });
  });

  describe('createProfile', () => {
    it('creates profile with userId', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const profile = await createProfile(testUserId);

      expect(profile.userId).toBe(testUserId);
    });

    it('creates profile with provided name', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const profile = await createProfile(testUserId, 'John');

      expect(profile.name).toBe('John');
    });

    it('saves profile to storage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await createProfile(testUserId, 'John');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@threesentences/profile',
        expect.any(String)
      );
    });

    it('initializes profile with default values', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const profile = await createProfile(testUserId);

      expect(profile.interests).toEqual([]);
      expect(profile.hobbies).toEqual([]);
      expect(profile.isComplete).toBe(false);
      expect(profile.username).toBe('');
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('updates specified fields', async () => {
      const updated = await updateProfile(testUserId, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
    });

    it('preserves unupdated fields', async () => {
      const updated = await updateProfile(testUserId, { name: 'New Name' });

      expect(updated.username).toBe(mockProfile.username);
      expect(updated.age).toBe(mockProfile.age);
    });

    it('updates updatedAt timestamp', async () => {
      const updated = await updateProfile(testUserId, { name: 'New Name' });

      expect(updated.updatedAt).not.toBe(mockProfile.updatedAt);
    });

    it('preserves createdAt timestamp', async () => {
      const updated = await updateProfile(testUserId, { name: 'New Name' });

      expect(updated.createdAt).toBe(mockProfile.createdAt);
    });

    it('creates profile if it does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const updated = await updateProfile(testUserId, {
        name: 'New User',
        username: 'newuser',
        interests: ['mindfulness'],
      });

      expect(updated.name).toBe('New User');
    });

    it('throws error for invalid profile data', async () => {
      await expect(
        updateProfile(testUserId, { name: '' })
      ).rejects.toThrow();
    });

    it('cannot change userId', async () => {
      const updated = await updateProfile(testUserId, {
        // @ts-expect-error - testing runtime protection
        userId: 'hacked-id'
      });

      expect(updated.userId).toBe(testUserId);
    });

    it('syncs name change to Firebase Auth', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);

      await updateProfile(testUserId, { name: 'New Firebase Name' });

      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ uid: testUserId }),
        { displayName: 'New Firebase Name' }
      );
    });

    it('does not throw if Firebase sync fails', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Firebase error'));

      const updated = await updateProfile(testUserId, { name: 'New Name' });

      // Should still return the updated profile
      expect(updated.name).toBe('New Name');
    });
  });

  describe('saveInterests', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('saves interests to profile', async () => {
      const interests = ['creativity', 'productivity'] as const;

      const updated = await saveInterests(testUserId, [...interests]);

      expect(updated.interests).toEqual(interests);
    });

    it('creates profile if it does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const updated = await saveInterests(testUserId, ['mindfulness']);

      expect(updated.userId).toBe(testUserId);
      expect(updated.interests).toEqual(['mindfulness']);
    });

    it('updates timestamp', async () => {
      const updated = await saveInterests(testUserId, ['mindfulness']);

      expect(updated.updatedAt).not.toBe(mockProfile.updatedAt);
    });
  });

  describe('updateHobbies', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('updates hobbies list', async () => {
      const hobbies = ['gaming', 'hiking'];

      const updated = await updateHobbies(testUserId, hobbies);

      expect(updated.hobbies).toEqual(hobbies);
    });

    it('throws error for too many hobbies', async () => {
      const tooManyHobbies = Array(PROFILE_CONSTRAINTS.hobbies.maxCount + 1).fill('hobby');

      await expect(
        updateHobbies(testUserId, tooManyHobbies)
      ).rejects.toThrow(/maximum/i);
    });

    it('trims hobby strings', async () => {
      const updated = await updateHobbies(testUserId, ['  reading  ', '  gaming  ']);

      expect(updated.hobbies).toEqual(['reading', 'gaming']);
    });

    it('filters empty hobbies', async () => {
      const updated = await updateHobbies(testUserId, ['reading', '', '  ', 'gaming']);

      expect(updated.hobbies).toEqual(['reading', 'gaming']);
    });
  });

  describe('addHobby', () => {
    beforeEach(() => {
      const profileWithFewHobbies = { ...mockProfile, hobbies: ['reading'] };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileWithFewHobbies));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('adds hobby to list', async () => {
      const updated = await addHobby(testUserId, 'gaming');

      expect(updated.hobbies).toContain('gaming');
    });

    it('trims hobby before adding', async () => {
      const updated = await addHobby(testUserId, '  gaming  ');

      expect(updated.hobbies).toContain('gaming');
    });

    it('throws error for empty hobby', async () => {
      await expect(
        addHobby(testUserId, '')
      ).rejects.toThrow(/empty/i);
    });

    it('throws error for whitespace-only hobby', async () => {
      await expect(
        addHobby(testUserId, '   ')
      ).rejects.toThrow(/empty/i);
    });

    it('throws error when hobby limit reached', async () => {
      const fullProfile = {
        ...mockProfile,
        hobbies: Array(PROFILE_CONSTRAINTS.hobbies.maxCount).fill('hobby'),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(fullProfile));

      await expect(
        addHobby(testUserId, 'new hobby')
      ).rejects.toThrow(/maximum/i);
    });

    it('throws error for duplicate hobby', async () => {
      await expect(
        addHobby(testUserId, 'reading')
      ).rejects.toThrow(/already added/i);
    });

    it('throws error for hobby too long', async () => {
      const longHobby = 'a'.repeat(PROFILE_CONSTRAINTS.hobbies.maxLength + 1);

      await expect(
        addHobby(testUserId, longHobby)
      ).rejects.toThrow(/characters or less/i);
    });

    it('case-insensitive duplicate detection', async () => {
      await expect(
        addHobby(testUserId, 'READING')
      ).rejects.toThrow(/already added/i);
    });
  });

  describe('removeHobby', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('removes hobby from list', async () => {
      const updated = await removeHobby(testUserId, 'reading');

      expect(updated.hobbies).not.toContain('reading');
    });

    it('case-insensitive removal', async () => {
      const updated = await removeHobby(testUserId, 'READING');

      expect(updated.hobbies).not.toContain('reading');
    });

    it('does not throw for non-existent hobby', async () => {
      const updated = await removeHobby(testUserId, 'nonexistent');

      expect(updated.hobbies).toEqual(mockProfile.hobbies);
    });
  });

  describe('setUsername', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('sets valid username', async () => {
      const updated = await setUsername(testUserId, 'newusername');

      expect(updated.username).toBe('newusername');
    });

    it('throws error for invalid username', async () => {
      await expect(
        setUsername(testUserId, 'ab') // too short
      ).rejects.toThrow();
    });

    it('throws error for username with invalid characters', async () => {
      await expect(
        setUsername(testUserId, 'user@name')
      ).rejects.toThrow(/letters, numbers, and underscores/i);
    });
  });

  describe('completeProfileSetup', () => {
    beforeEach(() => {
      const completeProfile = {
        ...mockProfile,
        isComplete: false,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(completeProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('marks profile as complete', async () => {
      const updated = await completeProfileSetup(testUserId);

      expect(updated.isComplete).toBe(true);
    });

    it('throws error for missing name', async () => {
      const incompleteProfile = { ...mockProfile, name: '', isComplete: false };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(incompleteProfile));

      await expect(
        completeProfileSetup(testUserId)
      ).rejects.toThrow(/name.*required/i);
    });

    it('throws error for missing username', async () => {
      const incompleteProfile = { ...mockProfile, username: '', isComplete: false };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(incompleteProfile));

      await expect(
        completeProfileSetup(testUserId)
      ).rejects.toThrow(/username.*required/i);
    });

    it('throws error for no interests', async () => {
      const incompleteProfile = { ...mockProfile, interests: [], isComplete: false };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(incompleteProfile));

      await expect(
        completeProfileSetup(testUserId)
      ).rejects.toThrow(/interest/i);
    });

    it('throws error when profile not found', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await expect(
        completeProfileSetup(testUserId)
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('isProfileComplete', () => {
    it('returns true when profile is complete', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const complete = await isProfileComplete(testUserId);

      expect(complete).toBe(true);
    });

    it('returns false when profile is incomplete', async () => {
      const incompleteProfile = { ...mockProfile, isComplete: false };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(incompleteProfile));

      const complete = await isProfileComplete(testUserId);

      expect(complete).toBe(false);
    });

    it('returns false when no profile exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const complete = await isProfileComplete(testUserId);

      expect(complete).toBe(false);
    });
  });

  describe('getProfileSummary', () => {
    it('returns profile summary when profile exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const summary = await getProfileSummary(testUserId);

      expect(summary).toEqual({
        name: mockProfile.name,
        username: mockProfile.username,
        interestCount: mockProfile.interests.length,
        hobbyCount: mockProfile.hobbies.length,
      });
    });

    it('returns null when no profile exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const summary = await getProfileSummary(testUserId);

      expect(summary).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    it('removes profile from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await deleteProfile();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@threesentences/profile');
    });
  });

  describe('exportProfile', () => {
    it('returns profile as JSON string', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const exported = await exportProfile(testUserId);

      expect(exported).toBe(JSON.stringify(mockProfile, null, 2));
    });

    it('returns null when no profile exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const exported = await exportProfile(testUserId);

      expect(exported).toBeNull();
    });

    it('returns formatted JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));

      const exported = await exportProfile(testUserId);

      expect(exported).toContain('\n'); // Should be pretty-printed
    });
  });

  describe('updateProfileImage', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfile));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('updates profile image URI', async () => {
      const imageUri = 'file://new-profile-image.jpg';

      const updated = await updateProfileImage(testUserId, imageUri);

      expect(updated.profileImage).toBe(imageUri);
    });

    it('creates profile if it does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const imageUri = 'file://profile.jpg';

      const updated = await updateProfileImage(testUserId, imageUri);

      expect(updated.profileImage).toBe(imageUri);
      expect(updated.userId).toBe(testUserId);
    });

    it('updates timestamp when changing image', async () => {
      const imageUri = 'file://new-image.jpg';

      const updated = await updateProfileImage(testUserId, imageUri);

      expect(updated.updatedAt).not.toBe(mockProfile.updatedAt);
    });

    it('removes image when null is passed', async () => {
      const profileWithImage = {
        ...mockProfile,
        profileImage: 'file://existing.jpg',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileWithImage));

      const updated = await updateProfileImage(testUserId, null);

      expect(updated.profileImage).toBeUndefined();
    });

    it('saves to correct storage key', async () => {
      await updateProfileImage(testUserId, 'file://image.jpg');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@threesentences/profile',
        expect.any(String)
      );
    });
  });

  describe('removeProfileImage', () => {
    beforeEach(() => {
      const profileWithImage = {
        ...mockProfile,
        profileImage: 'file://existing-image.jpg',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileWithImage));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('removes the profile image', async () => {
      const updated = await removeProfileImage(testUserId);

      expect(updated.profileImage).toBeUndefined();
    });

    it('preserves other profile data', async () => {
      const updated = await removeProfileImage(testUserId);

      expect(updated.name).toBe(mockProfile.name);
      expect(updated.username).toBe(mockProfile.username);
      expect(updated.interests).toEqual(mockProfile.interests);
    });
  });
});
