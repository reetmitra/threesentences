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

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock-camera-image.jpg' }],
    })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock-library-image.jpg' }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
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
  // New icons for profile/community features
  ArrowLeft: 'ArrowLeft',
  Plus: 'Plus',
  Edit3: 'Edit3',
  Hash: 'Hash',
  Heart: 'Heart',
  Brain: 'Brain',
  Dumbbell: 'Dumbbell',
  Palette: 'Palette',
  Target: 'Target',
  Briefcase: 'Briefcase',
  TrendingUp: 'TrendingUp',
  Activity: 'Activity',
  BookOpen: 'BookOpen',
  Sun: 'Sun',
  Compass: 'Compass',
  Users: 'Users',
  Camera: 'Camera',
  ImageIcon: 'ImageIcon',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Text = require('react-native').Text;
  const Pressable = require('react-native').Pressable;

  return {
    default: {
      createAnimatedComponent: (component) => component,
      addWhitelistedUIProps: () => {},
      addWhitelistedNativeProps: () => {},
    },
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withDelay: jest.fn((delay, value) => value),
    withSequence: jest.fn((...values) => values[0]),
    interpolate: jest.fn((value, inputRange, outputRange) => outputRange[0]),
    interpolateColor: jest.fn((value, inputRange, outputRange) => outputRange[0]),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(() => jest.fn()),
      in: jest.fn((easing) => easing),
      out: jest.fn((easing) => easing),
      inOut: jest.fn((easing) => easing),
    },
    FadeIn: { delay: jest.fn(() => ({ duration: jest.fn(() => ({})) })), duration: jest.fn(() => ({})) },
    FadeInDown: { delay: jest.fn(() => ({ duration: jest.fn(() => ({})) })), duration: jest.fn(() => ({})) },
    SlideInUp: { delay: jest.fn(() => ({ duration: jest.fn(() => ({})) })), duration: jest.fn(() => ({})) },
    SlideInRight: { delay: jest.fn(() => ({ duration: jest.fn(() => ({})) })), duration: jest.fn(() => ({})) },
    Layout: { springify: jest.fn(() => ({})) },
    createAnimatedComponent: (component) => component,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

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
