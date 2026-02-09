/**
 * Tests for Profile Store
 *
 * Tests all profile management functions including
 * creation, updates, validation, and storage operations.
 * Updated for Supabase backend.
 */

import {
  getProfile,
  createProfile,
  updateProfile,
  saveInterests,
  setUsername,
  completeProfileSetup,
  isProfileComplete,
  getProfileSummary,
  deleteProfile,
  exportProfile,
  updateProfileImage,
  removeProfileImage,
  searchProfiles,
} from '@/store/profile';
import { PROFILE_CONSTRAINTS, InterestId } from '@/types/profile';

// Mock Supabase
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseInsert = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseDelete = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseMaybeSingle = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    from: (table: string) => {
      mockSupabaseFrom(table);
      return {
        select: () => ({
          eq: (field: string, value: string) => ({
            single: () => mockSupabaseSingle(),
            maybeSingle: () => mockSupabaseMaybeSingle(),
          }),
          or: () => ({
            eq: () => ({
              limit: () => mockSupabaseSelect(),
            }),
          }),
          contains: () => ({
            neq: () => ({
              eq: () => ({
                limit: () => mockSupabaseSelect(),
              }),
            }),
          }),
        }),
        insert: (data: unknown) => ({
          select: () => ({
            single: () => mockSupabaseInsert(data),
          }),
        }),
        update: (data: unknown) => ({
          eq: () => ({
            select: () => ({
              single: () => mockSupabaseUpdate(data),
            }),
          }),
        }),
        delete: () => ({
          eq: () => mockSupabaseDelete(),
        }),
      };
    },
  },
}));

const testUserId = 'test-user-123';

const mockDbProfile = {
  id: 'profile-uuid',
  user_id: testUserId,
  name: 'Test User',
  username: 'testuser',
  age: 28,
  bio: 'Test bio',
  profile_image: null,
  interests: ['marathon', 'meditation'] as string[],
  is_complete: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('profile store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseSingle.mockResolvedValue({ data: mockDbProfile, error: null });
    mockSupabaseInsert.mockResolvedValue({ data: mockDbProfile, error: null });
    mockSupabaseUpdate.mockResolvedValue({ data: mockDbProfile, error: null });
    mockSupabaseDelete.mockResolvedValue({ error: null });
  });

  describe('getProfile', () => {
    it('returns null for non-existent profile', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const profile = await getProfile('nonexistent');
      expect(profile).toBeNull();
    });

    it('returns profile with correct structure', async () => {
      const profile = await getProfile(testUserId);

      expect(profile).not.toBeNull();
      expect(profile?.userId).toBe(testUserId);
      expect(profile?.name).toBe('Test User');
      expect(profile?.username).toBe('testuser');
      expect(profile?.interests).toEqual(['marathon', 'meditation']);
    });

    it('maps database fields to app format', async () => {
      const profile = await getProfile(testUserId);

      expect(profile).toHaveProperty('userId');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('interests');
      expect(profile).toHaveProperty('isComplete');
      expect(profile).toHaveProperty('createdAt');
      expect(profile).toHaveProperty('updatedAt');
    });
  });

  describe('createProfile', () => {
    it('returns existing profile if it exists', async () => {
      const profile = await createProfile(testUserId, 'John');

      expect(profile.userId).toBe(testUserId);
      expect(mockSupabaseInsert).not.toHaveBeenCalled();
    });

    it('creates new profile when none exists', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      mockSupabaseInsert.mockResolvedValue({ data: mockDbProfile, error: null });

      const profile = await createProfile(testUserId, 'New User');

      expect(mockSupabaseInsert).toHaveBeenCalled();
      expect(profile).not.toBeNull();
    });

    it('initializes profile with default values', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      const newProfile = {
        ...mockDbProfile,
        interests: [],
        is_complete: false,
        username: '',
      };
      mockSupabaseInsert.mockResolvedValue({ data: newProfile, error: null });

      const profile = await createProfile(testUserId);

      expect(profile.interests).toEqual([]);
      expect(profile.isComplete).toBe(false);
    });
  });

  describe('saveInterests', () => {
    it('updates profile with interests', async () => {
      const interests: InterestId[] = ['marathon', 'meditation', 'yoga'];
      const updatedProfile = { ...mockDbProfile, interests };
      mockSupabaseUpdate.mockResolvedValue({ data: updatedProfile, error: null });

      const profile = await saveInterests(testUserId, interests);

      expect(mockSupabaseUpdate).toHaveBeenCalled();
      expect(profile.interests).toEqual(interests);
    });
  });

  describe('completeProfileSetup', () => {
    it('throws error if profile not found', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      await expect(completeProfileSetup('nonexistent')).rejects.toThrow('Profile not found');
    });

    it('throws error if minimum interests not met', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: { ...mockDbProfile, interests: [], is_complete: false },
        error: null,
      });

      await expect(completeProfileSetup(testUserId)).rejects.toThrow('interests');
    });

    it('marks profile as complete with valid data', async () => {
      const completeProfile = { ...mockDbProfile, is_complete: true };
      mockSupabaseUpdate.mockResolvedValue({ data: completeProfile, error: null });

      const profile = await completeProfileSetup(testUserId);

      expect(profile.isComplete).toBe(true);
    });
  });

  describe('isProfileComplete', () => {
    it('returns true for complete profile', async () => {
      const isComplete = await isProfileComplete(testUserId);
      expect(isComplete).toBe(true);
    });

    it('returns false for incomplete profile', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: { ...mockDbProfile, is_complete: false },
        error: null,
      });

      const isComplete = await isProfileComplete(testUserId);
      expect(isComplete).toBe(false);
    });

    it('returns false if profile not found', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const isComplete = await isProfileComplete('nonexistent');
      expect(isComplete).toBe(false);
    });
  });

  describe('getProfileSummary', () => {
    it('returns summary with correct fields', async () => {
      const summary = await getProfileSummary(testUserId);

      expect(summary).toHaveProperty('name');
      expect(summary).toHaveProperty('username');
      expect(summary).toHaveProperty('interestCount');
    });

    it('returns null for non-existent profile', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const summary = await getProfileSummary('nonexistent');
      expect(summary).toBeNull();
    });

    it('calculates interest count correctly', async () => {
      const summary = await getProfileSummary(testUserId);

      expect(summary?.interestCount).toBe(2);
    });
  });

  describe('exportProfile', () => {
    it('returns JSON string of profile', async () => {
      const exported = await exportProfile(testUserId);

      expect(exported).not.toBeNull();
      const parsed = JSON.parse(exported!);
      expect(parsed.userId).toBe(testUserId);
    });

    it('returns null for non-existent profile', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const exported = await exportProfile('nonexistent');
      expect(exported).toBeNull();
    });
  });

  describe('PROFILE_CONSTRAINTS', () => {
    it('has correct interest constraints', () => {
      expect(PROFILE_CONSTRAINTS.interests.minCount).toBe(3);
      expect(PROFILE_CONSTRAINTS.interests.maxCount).toBe(10);
    });

    it('has correct age constraints', () => {
      expect(PROFILE_CONSTRAINTS.age.min).toBe(18);
      expect(PROFILE_CONSTRAINTS.age.max).toBe(99);
    });

    it('has correct bio constraints', () => {
      expect(PROFILE_CONSTRAINTS.bio.maxLength).toBe(150);
    });
  });
});
