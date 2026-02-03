module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Component tests are skipped due to @testing-library/react-native compatibility
    // with React Native 0.81. Re-enable when updating to compatible versions.
    '/__tests__/components/',
  ],
  collectCoverageFrom: [
    'utils/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'types/**/*.{ts,tsx}',
    'theme/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
};
