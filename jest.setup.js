/**
 * Jest Setup File
 *
 * Configures mocks for React Native, Expo, and third-party modules.
 */

import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(mockStorage.get(key) || null)),
    setItem: jest.fn((key, value) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach((key) => mockStorage.delete(key));
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Array.from(mockStorage.keys()))),
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
  },
}));

// Helper to clear mock storage between tests
global.clearMockStorage = () => {
  mockStorage.clear();
};

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn((length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(bytes);
  }),
  digestStringAsync: jest.fn((algorithm, content) => {
    // Simple mock hash - just returns a consistent hex string
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(64, '0');
    return Promise.resolve(hexHash);
  }),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256',
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock Firebase
const mockFirebaseUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

let mockCurrentUser = null;
let mockAuthStateCallback = null;

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({
    currentUser: null,
  })),
  getReactNativePersistence: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn((auth, email, password) => {
    if (password.length < 6) {
      const error = new Error('Password should be at least 6 characters');
      error.code = 'auth/weak-password';
      return Promise.reject(error);
    }
    if (!email.includes('@')) {
      const error = new Error('Invalid email');
      error.code = 'auth/invalid-email';
      return Promise.reject(error);
    }
    mockCurrentUser = { ...mockFirebaseUser, email };
    return Promise.resolve({ user: mockCurrentUser });
  }),
  signInWithEmailAndPassword: jest.fn((auth, email, password) => {
    if (email === 'notfound@example.com') {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      return Promise.reject(error);
    }
    if (password === 'wrongpassword') {
      const error = new Error('Wrong password');
      error.code = 'auth/invalid-credential';
      return Promise.reject(error);
    }
    mockCurrentUser = { ...mockFirebaseUser, email };
    return Promise.resolve({ user: mockCurrentUser });
  }),
  signOut: jest.fn(() => {
    mockCurrentUser = null;
    return Promise.resolve();
  }),
  onAuthStateChanged: jest.fn((auth, callback) => {
    mockAuthStateCallback = callback;
    const unsubscribe = jest.fn();
    // Call callback asynchronously to allow unsubscribe to be assigned first
    setTimeout(() => callback(mockCurrentUser), 0);
    return unsubscribe;
  }),
  updateProfile: jest.fn(() => Promise.resolve()),
  signInWithCredential: jest.fn(() => Promise.resolve({ user: mockFirebaseUser })),
  OAuthProvider: jest.fn(() => ({
    credential: jest.fn(() => ({})),
  })),
}));

// Helper to reset Firebase mock state
global.resetFirebaseMock = () => {
  mockCurrentUser = null;
  mockAuthStateCallback = null;
};

global.setMockFirebaseUser = (user) => {
  mockCurrentUser = user;
  if (mockAuthStateCallback) {
    mockAuthStateCallback(user);
  }
};

// Mock Firebase config
jest.mock('@/config/firebase', () => ({
  app: {},
  auth: { currentUser: null },
  isConfigured: true,
}));

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(() => Promise.resolve({
    identityToken: 'mock-identity-token',
    fullName: { givenName: 'Test', familyName: 'User' },
  })),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  AppleAuthenticationButtonType: {
    SIGN_IN: 0,
    SIGN_UP: 1,
  },
  AppleAuthenticationButtonStyle: {
    WHITE: 0,
    BLACK: 1,
  },
  AppleAuthenticationButton: 'AppleAuthenticationButton',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
  Redirect: 'Redirect',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
  Settings: 'Settings',
  Calendar: 'Calendar',
  Sparkles: 'Sparkles',
  Pencil: 'Pencil',
  Download: 'Download',
  Trash2: 'Trash2',
  Info: 'Info',
  X: 'X',
  Check: 'Check',
  Lock: 'Lock',
  LogOut: 'LogOut',
  User: 'User',
  PenTool: 'PenTool',
}));

// Mock TextEncoder/TextDecoder for encryption tests
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encode(str) {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return arr;
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class {
    decode(arr) {
      return String.fromCharCode.apply(null, arr);
    }
  };
}

// Mock Intl.DateTimeFormat for timezone tests
const originalIntl = global.Intl;
if (originalIntl) {
  global.Intl = {
    ...originalIntl,
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: jest.fn(() => ({
        timeZone: 'America/New_York',
      })),
      format: jest.fn(() => 'formatted date'),
    })),
  };
}

// Silence console errors during tests (optional)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: An update to'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Clear mocks and storage between tests
beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.clear();
});
