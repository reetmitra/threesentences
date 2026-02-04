/**
 * ThreeSixtyThree™ Three Sentences - Profile Types
 *
 * Data models for user profiles, interest categories, and community features.
 */

/**
 * Interest categories for community building
 */
export const INTEREST_CATEGORIES = [
  { id: 'mindfulness', label: 'Mindfulness', icon: 'brain' },
  { id: 'fitness', label: 'Fitness', icon: 'dumbbell' },
  { id: 'creativity', label: 'Creativity', icon: 'palette' },
  { id: 'productivity', label: 'Productivity', icon: 'target' },
  { id: 'relationships', label: 'Relationships', icon: 'heart' },
  { id: 'career', label: 'Career', icon: 'briefcase' },
  { id: 'finance', label: 'Finance', icon: 'trending-up' },
  { id: 'health', label: 'Health', icon: 'activity' },
  { id: 'learning', label: 'Learning', icon: 'book-open' },
  { id: 'spirituality', label: 'Spirituality', icon: 'sun' },
  { id: 'adventure', label: 'Adventure', icon: 'compass' },
  { id: 'family', label: 'Family', icon: 'users' },
] as const;

export type CategoryId = typeof INTEREST_CATEGORIES[number]['id'];

export interface InterestCategory {
  id: CategoryId;
  label: string;
  icon: string;
}

/**
 * User profile data structure
 */
export interface UserProfile {
  /** Firebase UID */
  userId: string;

  /** Display name */
  name: string;

  /** Unique username (3-20 chars, alphanumeric + underscore) */
  username: string;

  /** User's age (optional, min 13) */
  age?: number;

  /** User's bio/description (max 150 chars) */
  bio?: string;

  /** Profile image URI (local file path or base64) */
  profileImage?: string;

  /** Selected interest categories */
  interests: CategoryId[];

  /** User's hobbies (max 5) */
  hobbies: string[];

  /** Profile creation timestamp */
  createdAt: string;

  /** Last profile update timestamp */
  updatedAt: string;

  /** Whether profile setup is complete */
  isComplete: boolean;
}

/**
 * Partial profile for updates
 */
export type ProfileUpdate = Partial<Omit<UserProfile, 'userId' | 'createdAt'>>;

/**
 * Profile validation result
 */
export interface ProfileValidation {
  isValid: boolean;
  errors: {
    name?: string;
    username?: string;
    age?: string;
    bio?: string;
    hobbies?: string;
    interests?: string;
  };
}

/**
 * Username validation constraints
 */
export const USERNAME_CONSTRAINTS = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/,
} as const;

/**
 * Profile field constraints
 */
export const PROFILE_CONSTRAINTS = {
  name: {
    minLength: 1,
    maxLength: 50,
  },
  bio: {
    maxLength: 150,
  },
  hobbies: {
    maxCount: 5,
    maxLength: 30,
  },
  interests: {
    minCount: 1,
    maxCount: INTEREST_CATEGORIES.length,
  },
  age: {
    min: 13,
    max: 120,
  },
} as const;

/**
 * Validate a username
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < USERNAME_CONSTRAINTS.minLength) {
    return { valid: false, error: `Username must be at least ${USERNAME_CONSTRAINTS.minLength} characters` };
  }

  if (username.length > USERNAME_CONSTRAINTS.maxLength) {
    return { valid: false, error: `Username cannot exceed ${USERNAME_CONSTRAINTS.maxLength} characters` };
  }

  if (!USERNAME_CONSTRAINTS.pattern.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}

/**
 * Validate user's age
 */
export function validateAge(age: number | undefined): { valid: boolean; error?: string } {
  if (age === undefined) {
    return { valid: true }; // Age is optional
  }

  if (!Number.isInteger(age)) {
    return { valid: false, error: 'Age must be a whole number' };
  }

  if (age < PROFILE_CONSTRAINTS.age.min) {
    return { valid: false, error: `You must be at least ${PROFILE_CONSTRAINTS.age.min} years old` };
  }

  if (age > PROFILE_CONSTRAINTS.age.max) {
    return { valid: false, error: 'Please enter a valid age' };
  }

  return { valid: true };
}

/**
 * Validate hobbies array
 */
export function validateHobbies(hobbies: string[]): { valid: boolean; error?: string } {
  if (hobbies.length > PROFILE_CONSTRAINTS.hobbies.maxCount) {
    return { valid: false, error: `You can add up to ${PROFILE_CONSTRAINTS.hobbies.maxCount} hobbies` };
  }

  for (const hobby of hobbies) {
    if (hobby.length > PROFILE_CONSTRAINTS.hobbies.maxLength) {
      return { valid: false, error: `Each hobby must be ${PROFILE_CONSTRAINTS.hobbies.maxLength} characters or less` };
    }
    if (hobby.trim().length === 0) {
      return { valid: false, error: 'Hobbies cannot be empty' };
    }
  }

  return { valid: true };
}

/**
 * Validate interests array
 */
export function validateInterests(interests: CategoryId[]): { valid: boolean; error?: string } {
  if (interests.length < PROFILE_CONSTRAINTS.interests.minCount) {
    return { valid: false, error: 'Please select at least one interest' };
  }

  const validIds = INTEREST_CATEGORIES.map(c => c.id);
  for (const interest of interests) {
    if (!validIds.includes(interest)) {
      return { valid: false, error: 'Invalid interest selected' };
    }
  }

  return { valid: true };
}

/**
 * Validate complete profile
 */
export function validateProfile(profile: Partial<UserProfile>): ProfileValidation {
  const errors: ProfileValidation['errors'] = {};

  // Validate name
  if (!profile.name || profile.name.trim().length < PROFILE_CONSTRAINTS.name.minLength) {
    errors.name = 'Name is required';
  } else if (profile.name.length > PROFILE_CONSTRAINTS.name.maxLength) {
    errors.name = `Name cannot exceed ${PROFILE_CONSTRAINTS.name.maxLength} characters`;
  }

  // Validate username
  if (profile.username) {
    const usernameResult = validateUsername(profile.username);
    if (!usernameResult.valid) {
      errors.username = usernameResult.error;
    }
  } else {
    errors.username = 'Username is required';
  }

  // Validate age (optional)
  if (profile.age !== undefined) {
    const ageResult = validateAge(profile.age);
    if (!ageResult.valid) {
      errors.age = ageResult.error;
    }
  }

  // Validate bio (optional)
  if (profile.bio && profile.bio.length > PROFILE_CONSTRAINTS.bio.maxLength) {
    errors.bio = `Bio cannot exceed ${PROFILE_CONSTRAINTS.bio.maxLength} characters`;
  }

  // Validate hobbies
  if (profile.hobbies) {
    const hobbiesResult = validateHobbies(profile.hobbies);
    if (!hobbiesResult.valid) {
      errors.hobbies = hobbiesResult.error;
    }
  }

  // Validate interests
  if (profile.interests) {
    const interestsResult = validateInterests(profile.interests);
    if (!interestsResult.valid) {
      errors.interests = interestsResult.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Create a default empty profile
 */
export function createDefaultProfile(userId: string, name?: string): UserProfile {
  const now = new Date().toISOString();
  return {
    userId,
    name: name || '',
    username: '',
    interests: [],
    hobbies: [],
    createdAt: now,
    updatedAt: now,
    isComplete: false,
  };
}

/**
 * Generate a username suggestion from a name
 */
export function suggestUsername(name: string): string {
  // Remove non-alphanumeric characters and convert to lowercase
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Add random suffix for uniqueness
  const suffix = Math.floor(Math.random() * 1000);
  const suggested = `${base}${suffix}`;

  // Ensure it meets length constraints
  if (suggested.length > USERNAME_CONSTRAINTS.maxLength) {
    return suggested.substring(0, USERNAME_CONSTRAINTS.maxLength);
  }
  if (suggested.length < USERNAME_CONSTRAINTS.minLength) {
    return suggested.padEnd(USERNAME_CONSTRAINTS.minLength, '0');
  }

  return suggested;
}
