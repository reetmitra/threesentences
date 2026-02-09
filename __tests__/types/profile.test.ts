/**
 * Tests for Profile Types and Validation Functions
 *
 * Tests all validation logic for user profiles including
 * username, age, bio, and interests validation.
 * Updated for elite interests system.
 */

import {
  INTEREST_CATEGORIES,
  INTEREST_GROUPS,
  PROFILE_CONSTRAINTS,
  USERNAME_CONSTRAINTS,
  validateUsername,
  validateAge,
  validateInterests,
  validateProfile,
  createDefaultProfile,
  suggestUsername,
  InterestId,
} from '@/types/profile';

describe('profile types', () => {
  describe('INTEREST_CATEGORIES', () => {
    it('has 46 elite interests', () => {
      expect(INTEREST_CATEGORIES.length).toBe(46);
    });

    it('each interest has id, label, and group', () => {
      INTEREST_CATEGORIES.forEach((interest) => {
        expect(interest).toHaveProperty('id');
        expect(interest).toHaveProperty('label');
        expect(interest).toHaveProperty('group');
        expect(typeof interest.id).toBe('string');
        expect(typeof interest.label).toBe('string');
        expect(typeof interest.group).toBe('string');
      });
    });

    it('has unique interest ids', () => {
      const ids = INTEREST_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes expected elite interests', () => {
      const ids = INTEREST_CATEGORIES.map((c) => c.id);
      expect(ids).toContain('marathon');
      expect(ids).toContain('meditation');
      expect(ids).toContain('venture-capital');
      expect(ids).toContain('private-jet');
    });
  });

  describe('INTEREST_GROUPS', () => {
    it('has 6 groups', () => {
      expect(Object.keys(INTEREST_GROUPS).length).toBe(6);
    });

    it('has correct group structure', () => {
      Object.values(INTEREST_GROUPS).forEach((group) => {
        expect(group).toHaveProperty('label');
        expect(group).toHaveProperty('icon');
      });
    });

    it('includes expected groups', () => {
      const groupIds = Object.keys(INTEREST_GROUPS);
      expect(groupIds).toContain('fitness');
      expect(groupIds).toContain('wellness');
      expect(groupIds).toContain('finance');
    });
  });

  describe('validateUsername', () => {
    it('returns valid for correct username', () => {
      expect(validateUsername('john_doe123').valid).toBe(true);
    });

    it('returns invalid for empty username', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('returns invalid for username too short', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('returns invalid for username too long', () => {
      const result = validateUsername('a'.repeat(USERNAME_CONSTRAINTS.maxLength + 1));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceed');
    });

    it('returns invalid for username with special characters', () => {
      const result = validateUsername('john@doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('letters, numbers, and underscores');
    });

    it('allows underscores in username', () => {
      expect(validateUsername('john_doe_123').valid).toBe(true);
    });

    it('allows numbers in username', () => {
      expect(validateUsername('user12345').valid).toBe(true);
    });

    it('accepts minimum length username', () => {
      const minLength = USERNAME_CONSTRAINTS.minLength;
      expect(validateUsername('a'.repeat(minLength)).valid).toBe(true);
    });

    it('accepts maximum length username', () => {
      const maxLength = USERNAME_CONSTRAINTS.maxLength;
      expect(validateUsername('a'.repeat(maxLength)).valid).toBe(true);
    });
  });

  describe('validateAge', () => {
    it('returns valid for undefined age (optional)', () => {
      expect(validateAge(undefined).valid).toBe(true);
    });

    it('returns valid for age within range', () => {
      expect(validateAge(25).valid).toBe(true);
      expect(validateAge(50).valid).toBe(true);
    });

    it('returns valid for minimum age (18)', () => {
      expect(validateAge(18).valid).toBe(true);
    });

    it('returns valid for maximum age (99)', () => {
      expect(validateAge(99).valid).toBe(true);
    });

    it('returns invalid for age below minimum (18)', () => {
      const result = validateAge(17);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('18');
    });

    it('returns invalid for age above maximum', () => {
      const result = validateAge(100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid age');
    });

    it('returns invalid for non-integer age', () => {
      const result = validateAge(25.5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('whole number');
    });

    it('returns invalid for negative age', () => {
      const result = validateAge(-5);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInterests', () => {
    it('returns invalid for empty interests', () => {
      const result = validateInterests([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('requires minimum 3 interests', () => {
      const result = validateInterests(['marathon', 'meditation'] as InterestId[]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('3');
    });

    it('returns valid for 3 interests', () => {
      const interests: InterestId[] = ['marathon', 'meditation', 'yoga'];
      expect(validateInterests(interests).valid).toBe(true);
    });

    it('returns valid for multiple valid interests', () => {
      const interests: InterestId[] = ['marathon', 'meditation', 'yoga', 'crossfit'];
      expect(validateInterests(interests).valid).toBe(true);
    });

    it('returns invalid for more than 10 interests', () => {
      const interests: InterestId[] = [
        'marathon', 'meditation', 'yoga', 'crossfit', 'swimming',
        'cycling', 'sauna', 'cold-plunge', 'breathwork', 'intermittent-fasting',
        'keto'
      ];
      const result = validateInterests(interests);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10');
    });

    it('returns invalid for invalid interest id', () => {
      const result = validateInterests(['invalid_interest' as InterestId, 'marathon', 'yoga']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid interest');
    });
  });

  describe('validateProfile', () => {
    const validProfile = {
      name: 'John Doe',
      username: 'johndoe123',
      age: 25,
      bio: 'Elite entrepreneur',
      interests: ['marathon', 'meditation', 'yoga'] as InterestId[],
    };

    it('returns valid for complete valid profile', () => {
      const result = validateProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).filter(k => result.errors[k as keyof typeof result.errors])).toHaveLength(0);
    });

    it('returns invalid for missing name', () => {
      const result = validateProfile({ ...validProfile, name: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('returns invalid for missing username', () => {
      const result = validateProfile({ ...validProfile, username: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBeDefined();
    });

    it('returns invalid for name too long', () => {
      const result = validateProfile({
        ...validProfile,
        name: 'a'.repeat(PROFILE_CONSTRAINTS.name.maxLength + 1),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('exceed');
    });

    it('returns invalid for bio too long', () => {
      const result = validateProfile({
        ...validProfile,
        bio: 'a'.repeat(PROFILE_CONSTRAINTS.bio.maxLength + 1),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.bio).toContain('exceed');
    });

    it('validates all fields and returns multiple errors', () => {
      const result = validateProfile({
        name: '',
        username: 'ab', // too short
        age: 15, // too young (must be 18+)
        interests: [], // empty (needs minimum 3)
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.username).toBeDefined();
      expect(result.errors.age).toBeDefined();
      expect(result.errors.interests).toBeDefined();
    });

    it('allows optional age to be undefined', () => {
      const result = validateProfile({
        ...validProfile,
        age: undefined,
      });
      expect(result.isValid).toBe(true);
    });

    it('allows optional bio to be undefined', () => {
      const result = validateProfile({
        ...validProfile,
        bio: undefined,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('createDefaultProfile', () => {
    it('creates profile with userId', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.userId).toBe('user123');
    });

    it('creates profile with provided name', () => {
      const profile = createDefaultProfile('user123', 'John');
      expect(profile.name).toBe('John');
    });

    it('creates profile with empty name if not provided', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.name).toBe('');
    });

    it('initializes empty interests array', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.interests).toEqual([]);
    });

    it('sets isComplete to false', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.isComplete).toBe(false);
    });

    it('sets createdAt timestamp', () => {
      const before = new Date().toISOString();
      const profile = createDefaultProfile('user123');
      const after = new Date().toISOString();

      expect(profile.createdAt).toBeDefined();
      expect(profile.createdAt >= before).toBe(true);
      expect(profile.createdAt <= after).toBe(true);
    });

    it('sets updatedAt timestamp', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.updatedAt).toBeDefined();
      expect(profile.createdAt).toBe(profile.updatedAt);
    });

    it('does not set age', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.age).toBeUndefined();
    });

    it('does not set bio', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.bio).toBeUndefined();
    });

    it('sets empty username', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.username).toBe('');
    });
  });

  describe('suggestUsername', () => {
    it('generates username from name', () => {
      const username = suggestUsername('John Doe');
      expect(username).toMatch(/^johndoe\d+$/);
    });

    it('removes special characters', () => {
      const username = suggestUsername("John O'Brien");
      expect(username).not.toContain("'");
    });

    it('converts to lowercase', () => {
      const username = suggestUsername('JOHN');
      expect(username).toMatch(/^john\d+$/);
    });

    it('adds numeric suffix for uniqueness', () => {
      const username = suggestUsername('John');
      expect(username).toMatch(/\d+$/);
    });

    it('respects maximum length constraint', () => {
      const longName = 'a'.repeat(50);
      const username = suggestUsername(longName);
      expect(username.length).toBeLessThanOrEqual(USERNAME_CONSTRAINTS.maxLength);
    });

    it('meets minimum length constraint', () => {
      const username = suggestUsername('a');
      expect(username.length).toBeGreaterThanOrEqual(USERNAME_CONSTRAINTS.minLength);
    });

    it('handles empty name', () => {
      const username = suggestUsername('');
      expect(username.length).toBeGreaterThanOrEqual(USERNAME_CONSTRAINTS.minLength);
    });
  });

  describe('PROFILE_CONSTRAINTS', () => {
    it('has correct name constraints', () => {
      expect(PROFILE_CONSTRAINTS.name.minLength).toBe(1);
      expect(PROFILE_CONSTRAINTS.name.maxLength).toBe(50);
    });

    it('has correct bio constraints', () => {
      expect(PROFILE_CONSTRAINTS.bio.maxLength).toBe(150);
    });

    it('has correct interests constraints for elite networking', () => {
      expect(PROFILE_CONSTRAINTS.interests.minCount).toBe(3);
      expect(PROFILE_CONSTRAINTS.interests.maxCount).toBe(10);
    });

    it('has correct age constraints (adults only)', () => {
      expect(PROFILE_CONSTRAINTS.age.min).toBe(18);
      expect(PROFILE_CONSTRAINTS.age.max).toBe(99);
    });
  });

  describe('USERNAME_CONSTRAINTS', () => {
    it('has correct length constraints', () => {
      expect(USERNAME_CONSTRAINTS.minLength).toBe(3);
      expect(USERNAME_CONSTRAINTS.maxLength).toBe(20);
    });

    it('has valid pattern', () => {
      expect(USERNAME_CONSTRAINTS.pattern.test('valid_user123')).toBe(true);
      expect(USERNAME_CONSTRAINTS.pattern.test('invalid@user')).toBe(false);
    });
  });
});
