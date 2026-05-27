/**
 * Three™ - Profile Types
 *
 * Data models for user profiles and curated elite interest categories.
 */

/**
 * Interest category groups for elite community
 */
export type InterestCategoryGroup =
  | 'fitness'
  | 'wellness'
  | 'nutrition'
  | 'finance'
  | 'lifestyle'
  | 'intellectual';

/**
 * Curated elite interests for high-achieving individuals
 */
export const INTEREST_CATEGORIES = [
  // Fitness & Endurance
  { id: 'hyrox', label: 'Hyrox', group: 'fitness', icon: 'timer' },
  { id: 'ironman', label: 'Ironman', group: 'fitness', icon: 'medal' },
  { id: 'marathon', label: 'Marathon Running', group: 'fitness', icon: 'footprints' },
  { id: 'ultra-running', label: 'Ultra Running', group: 'fitness', icon: 'mountain' },
  { id: 'crossfit', label: 'CrossFit', group: 'fitness', icon: 'dumbbell' },
  { id: 'olympic-lifting', label: 'Olympic Lifting', group: 'fitness', icon: 'weight' },
  { id: 'cycling', label: 'Cycling', group: 'fitness', icon: 'bike' },
  { id: 'swimming', label: 'Swimming', group: 'fitness', icon: 'waves' },
  { id: 'rowing', label: 'Rowing', group: 'fitness', icon: 'ship' },
  { id: 'triathlon', label: 'Triathlon', group: 'fitness', icon: 'trophy' },

  // Recovery & Wellness
  { id: 'cold-plunge', label: 'Ice Bath / Cold Plunge', group: 'wellness', icon: 'snowflake' },
  { id: 'sauna', label: 'Sauna', group: 'wellness', icon: 'flame' },
  { id: 'breathwork', label: 'Breathwork', group: 'wellness', icon: 'wind' },
  { id: 'meditation', label: 'Meditation', group: 'wellness', icon: 'brain' },
  { id: 'biohacking', label: 'Biohacking', group: 'wellness', icon: 'activity' },
  { id: 'sleep-optimization', label: 'Sleep Optimization', group: 'wellness', icon: 'moon' },
  { id: 'yoga', label: 'Yoga', group: 'wellness', icon: 'heart' },

  // Nutrition
  { id: 'clean-eating', label: 'Clean Eating', group: 'nutrition', icon: 'salad' },
  { id: 'carnivore', label: 'Carnivore Diet', group: 'nutrition', icon: 'beef' },
  { id: 'keto', label: 'Keto', group: 'nutrition', icon: 'egg' },
  { id: 'intermittent-fasting', label: 'Intermittent Fasting', group: 'nutrition', icon: 'clock' },
  { id: 'plant-based', label: 'Plant-Based', group: 'nutrition', icon: 'leaf' },

  // Finance & Business
  { id: 'investment-banking', label: 'Investment Banking', group: 'finance', icon: 'building' },
  { id: 'private-equity', label: 'Private Equity', group: 'finance', icon: 'briefcase' },
  { id: 'venture-capital', label: 'Venture Capital', group: 'finance', icon: 'rocket' },
  { id: 'hedge-funds', label: 'Hedge Funds', group: 'finance', icon: 'trending-up' },
  { id: 'real-estate', label: 'Real Estate', group: 'finance', icon: 'home' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', group: 'finance', icon: 'lightbulb' },
  { id: 'angel-investing', label: 'Angel Investing', group: 'finance', icon: 'star' },
  { id: 'crypto-web3', label: 'Crypto / Web3', group: 'finance', icon: 'bitcoin' },

  // Lifestyle & Adventure
  { id: 'golf', label: 'Golf', group: 'lifestyle', icon: 'flag' },
  { id: 'tennis', label: 'Tennis', group: 'lifestyle', icon: 'circle' },
  { id: 'skiing', label: 'Skiing', group: 'lifestyle', icon: 'mountain-snow' },
  { id: 'sailing', label: 'Sailing', group: 'lifestyle', icon: 'anchor' },
  { id: 'polo', label: 'Polo', group: 'lifestyle', icon: 'crown' },
  { id: 'aviation', label: 'Aviation', group: 'lifestyle', icon: 'plane' },
  { id: 'motorsports', label: 'Motorsports', group: 'lifestyle', icon: 'car' },
  { id: 'travel', label: 'Travel', group: 'lifestyle', icon: 'globe' },

  // Intellectual Pursuits
  { id: 'reading', label: 'Reading', group: 'intellectual', icon: 'book-open' },
  { id: 'podcasts', label: 'Podcasts', group: 'intellectual', icon: 'headphones' },
  { id: 'public-speaking', label: 'Public Speaking', group: 'intellectual', icon: 'mic' },
  { id: 'philanthropy', label: 'Philanthropy', group: 'intellectual', icon: 'hand-heart' },
  { id: 'art-collecting', label: 'Art Collecting', group: 'intellectual', icon: 'palette' },
  { id: 'wine-spirits', label: 'Wine & Spirits', group: 'intellectual', icon: 'wine' },
] as const;

export type InterestId = (typeof INTEREST_CATEGORIES)[number]['id'];

export interface Interest {
  id: InterestId;
  label: string;
  group: InterestCategoryGroup;
  icon: string;
}

/**
 * Interest category group metadata
 */
export const INTEREST_GROUPS: Record<
  InterestCategoryGroup,
  { label: string; icon: string }
> = {
  fitness: { label: 'Fitness & Endurance', icon: 'dumbbell' },
  wellness: { label: 'Recovery & Wellness', icon: 'heart' },
  nutrition: { label: 'Nutrition', icon: 'utensils' },
  finance: { label: 'Finance & Business', icon: 'briefcase' },
  lifestyle: { label: 'Lifestyle & Adventure', icon: 'compass' },
  intellectual: { label: 'Intellectual Pursuits', icon: 'book-open' },
};

/**
 * Get interests by group
 */
export function getInterestsByGroup(group: InterestCategoryGroup): Interest[] {
  return INTEREST_CATEGORIES.filter((i) => i.group === group) as Interest[];
}

/**
 * Get interest by ID
 */
export function getInterestById(id: InterestId): Interest | undefined {
  return INTEREST_CATEGORIES.find((i) => i.id === id) as Interest | undefined;
}

/**
 * User profile data structure
 */
export interface UserProfile {
  /** User ID (Supabase UUID) */
  userId: string;

  /** Display name */
  name: string;

  /** Unique username (3-20 chars, alphanumeric + underscore) */
  username: string;

  /** User's age (optional, min 18 for elite network) */
  age?: number;

  /** User's bio/description (max 150 chars) */
  bio?: string;

  /** Profile image URI */
  profileImage?: string;

  /** Selected elite interests (minimum 3) */
  interests: InterestId[];

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
    interests?: string;
  };
}

/**
 * Username validation constraints
 */
export const USERNAME_CONSTRAINTS = {
  minLength: 3,
  maxLength: 20,
  pattern: /^@?[\w.]{3,}$/,
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
  interests: {
    minCount: 3, // Minimum 3 interests for better matching
    maxCount: 10, // Cap at 10 for focus
  },
  age: {
    min: 18, // Adults only for elite network
    max: 99,
  },
} as const;

/**
 * Validate a username
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < USERNAME_CONSTRAINTS.minLength) {
    return {
      valid: false,
      error: `Username must be at least ${USERNAME_CONSTRAINTS.minLength} characters`,
    };
  }

  if (username.length > USERNAME_CONSTRAINTS.maxLength) {
    return {
      valid: false,
      error: `Username cannot exceed ${USERNAME_CONSTRAINTS.maxLength} characters`,
    };
  }

  if (!USERNAME_CONSTRAINTS.pattern.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Validate user's age
 */
export function validateAge(age: number | undefined): {
  valid: boolean;
  error?: string;
} {
  if (age === undefined) {
    return { valid: true }; // Age is optional
  }

  if (!Number.isInteger(age)) {
    return { valid: false, error: 'Age must be a whole number' };
  }

  if (age < PROFILE_CONSTRAINTS.age.min) {
    return {
      valid: false,
      error: `You must be at least ${PROFILE_CONSTRAINTS.age.min} years old`,
    };
  }

  if (age > PROFILE_CONSTRAINTS.age.max) {
    return { valid: false, error: 'Please enter a valid age' };
  }

  return { valid: true };
}

/**
 * Validate interests array
 */
export function validateInterests(interests: InterestId[]): {
  valid: boolean;
  error?: string;
} {
  if (interests.length < PROFILE_CONSTRAINTS.interests.minCount) {
    return {
      valid: false,
      error: `Please select at least ${PROFILE_CONSTRAINTS.interests.minCount} interests`,
    };
  }

  if (interests.length > PROFILE_CONSTRAINTS.interests.maxCount) {
    return {
      valid: false,
      error: `You can select up to ${PROFILE_CONSTRAINTS.interests.maxCount} interests`,
    };
  }

  const validIds = INTEREST_CATEGORIES.map((c) => c.id);
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
  if (
    !profile.name ||
    profile.name.trim().length < PROFILE_CONSTRAINTS.name.minLength
  ) {
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

  // Validate interests
  if (profile.interests) {
    const interestsResult = validateInterests(profile.interests);
    if (!interestsResult.valid) {
      errors.interests = interestsResult.error;
    }
  } else {
    errors.interests = `Please select at least ${PROFILE_CONSTRAINTS.interests.minCount} interests`;
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
  // Use a per-user temp username derived from their UUID so the UNIQUE constraint is
  // never violated when multiple users are in-flight through onboarding simultaneously.
  // The real username (from user_metadata) is written by updateProfile on completion.
  const tempUsername = `_${userId.replace(/-/g, '').slice(0, 18)}`; // e.g. "_4a3bc2d1e0f912a3b4"
  return {
    userId,
    name: name || '',
    username: tempUsername,
    interests: [],
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

// Legacy type alias for backwards compatibility during migration
export type CategoryId = InterestId;
