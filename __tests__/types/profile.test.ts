/**
 * Tests for Profile Types and Validation Functions
 *
 * Tests all validation logic for user profiles including
 * username, age, hobbies, and interests validation.
 */

import {
  INTEREST_CATEGORIES,
  PROFILE_CONSTRAINTS,
  USERNAME_CONSTRAINTS,
  validateUsername,
  validateAge,
  validateHobbies,
  validateInterests,
  validateProfile,
  createDefaultProfile,
  suggestUsername,
  CategoryId,
} from '@/types/profile';

describe('profile types', () => {
  describe('INTEREST_CATEGORIES', () => {
    it('has all required categories', () => {
      expect(INTEREST_CATEGORIES.length).toBe(12);
    });

    it('each category has id, label, and icon', () => {
      INTEREST_CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('icon');
        expect(typeof category.id).toBe('string');
        expect(typeof category.label).toBe('string');
        expect(typeof category.icon).toBe('string');
      });
    });

    it('has unique category ids', () => {
      const ids = INTEREST_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes expected categories', () => {
      const ids = INTEREST_CATEGORIES.map((c) => c.id);
      expect(ids).toContain('mindfulness');
      expect(ids).toContain('fitness');
      expect(ids).toContain('creativity');
      expect(ids).toContain('productivity');
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

    it('returns invalid for username with spaces', () => {
      const result = validateUsername('john doe');
      expect(result.valid).toBe(false);
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

    it('returns valid for minimum age', () => {
      expect(validateAge(PROFILE_CONSTRAINTS.age.min).valid).toBe(true);
    });

    it('returns valid for maximum age', () => {
      expect(validateAge(PROFILE_CONSTRAINTS.age.max).valid).toBe(true);
    });

    it('returns invalid for age below minimum', () => {
      const result = validateAge(PROFILE_CONSTRAINTS.age.min - 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('returns invalid for age above maximum', () => {
      const result = validateAge(PROFILE_CONSTRAINTS.age.max + 1);
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

    it('returns invalid for zero age', () => {
      const result = validateAge(0);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateHobbies', () => {
    it('returns valid for empty hobbies array', () => {
      expect(validateHobbies([]).valid).toBe(true);
    });

    it('returns valid for hobbies within limit', () => {
      const hobbies = ['reading', 'coding', 'gaming'];
      expect(validateHobbies(hobbies).valid).toBe(true);
    });

    it('returns valid for maximum number of hobbies', () => {
      const hobbies = Array(PROFILE_CONSTRAINTS.hobbies.maxCount).fill('hobby');
      expect(validateHobbies(hobbies).valid).toBe(true);
    });

    it('returns invalid for too many hobbies', () => {
      const hobbies = Array(PROFILE_CONSTRAINTS.hobbies.maxCount + 1).fill('hobby');
      const result = validateHobbies(hobbies);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('up to');
    });

    it('returns invalid for hobby too long', () => {
      const longHobby = 'a'.repeat(PROFILE_CONSTRAINTS.hobbies.maxLength + 1);
      const result = validateHobbies([longHobby]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('characters or less');
    });

    it('returns invalid for empty hobby string', () => {
      const result = validateHobbies(['', 'valid']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('returns invalid for whitespace-only hobby', () => {
      const result = validateHobbies(['   ']);
      expect(result.valid).toBe(false);
    });

    it('accepts hobby at max length', () => {
      const maxLengthHobby = 'a'.repeat(PROFILE_CONSTRAINTS.hobbies.maxLength);
      expect(validateHobbies([maxLengthHobby]).valid).toBe(true);
    });
  });

  describe('validateInterests', () => {
    it('returns invalid for empty interests', () => {
      const result = validateInterests([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least one');
    });

    it('returns valid for single interest', () => {
      expect(validateInterests(['mindfulness']).valid).toBe(true);
    });

    it('returns valid for multiple valid interests', () => {
      const interests: CategoryId[] = ['mindfulness', 'fitness', 'creativity'];
      expect(validateInterests(interests).valid).toBe(true);
    });

    it('returns invalid for invalid interest id', () => {
      const result = validateInterests(['invalid_interest' as CategoryId]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid interest');
    });

    it('returns valid for all interests selected', () => {
      const allInterests = INTEREST_CATEGORIES.map((c) => c.id);
      expect(validateInterests(allInterests).valid).toBe(true);
    });
  });

  describe('validateProfile', () => {
    const validProfile = {
      name: 'John Doe',
      username: 'johndoe123',
      age: 25,
      interests: ['mindfulness'] as CategoryId[],
      hobbies: ['reading'],
    };

    it('returns valid for complete valid profile', () => {
      const result = validateProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
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
        age: 5, // too young
        hobbies: Array(10).fill('hobby'), // too many
        interests: [], // empty
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.username).toBeDefined();
      expect(result.errors.age).toBeDefined();
      expect(result.errors.hobbies).toBeDefined();
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

    it('initializes empty hobbies array', () => {
      const profile = createDefaultProfile('user123');
      expect(profile.hobbies).toEqual([]);
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

    it('handles name with only special characters', () => {
      const username = suggestUsername('@#$%');
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

    it('has correct hobbies constraints', () => {
      expect(PROFILE_CONSTRAINTS.hobbies.maxCount).toBe(5);
      expect(PROFILE_CONSTRAINTS.hobbies.maxLength).toBe(30);
    });

    it('has correct interests constraints', () => {
      expect(PROFILE_CONSTRAINTS.interests.minCount).toBe(1);
    });

    it('has correct age constraints', () => {
      expect(PROFILE_CONSTRAINTS.age.min).toBe(13);
      expect(PROFILE_CONSTRAINTS.age.max).toBe(120);
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
