/**
 * Three™ - Profile Setup Screen
 *
 * Final signup step where users complete their profile.
 * Includes username, age (optional), and bio.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  validateUsername,
  suggestUsername,
  PROFILE_CONSTRAINTS,
} from '@/types/profile';
import { updateProfile, completeProfileSetup } from '@/store/profile';

export default function ProfileSetupScreen() {
  const activeColors = colors.dark;
  const params = useLocalSearchParams<{ name?: string }>();
  const { user } = useUser();

  // Form state
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [usernameValid, setUsernameValid] = useState(false);
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState<string | undefined>();
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  // Animations
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Animate form entrance
    formOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Generate username suggestion
    if (params.name) {
      const suggested = suggestUsername(params.name);
      setUsername(suggested);
      validateUsernameInput(suggested);
    }
  }, [formOpacity, params.name]);

  const validateUsernameInput = useCallback(
    (value: string) => {
      const result = validateUsername(value);
      setUsernameError(result.valid ? undefined : result.error);
      setUsernameValid(result.valid);

      // Animate checkmark when valid
      if (result.valid) {
        checkScale.value = withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
      } else {
        checkScale.value = withTiming(0, { duration: 100 });
      }
    },
    [checkScale]
  );

  const handleUsernameChange = (value: string) => {
    // Convert to lowercase and remove invalid characters
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    validateUsernameInput(cleaned);
  };

  const handleAgeChange = (value: string) => {
    // Only allow numbers
    const cleaned = value.replace(/[^0-9]/g, '');
    setAge(cleaned);

    if (cleaned) {
      const ageNum = parseInt(cleaned, 10);
      if (ageNum < PROFILE_CONSTRAINTS.age.min) {
        setAgeError(`You must be at least ${PROFILE_CONSTRAINTS.age.min} years old`);
      } else if (ageNum > PROFILE_CONSTRAINTS.age.max) {
        setAgeError('Please enter a valid age');
      } else {
        setAgeError(undefined);
      }
    } else {
      setAgeError(undefined);
    }
  };

  const handleComplete = async () => {
    Keyboard.dismiss();

    if (!usernameValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (ageError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      buttonScale.value = withSpring(0.95);

      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Update profile with all data
      await updateProfile(user.id, {
        username,
        age: age ? parseInt(age, 10) : undefined,
        bio: bio.trim() || undefined,
      });

      // Mark profile as complete
      await completeProfileSetup(user.id);

      buttonScale.value = withSpring(1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      buttonScale.value = withSpring(1);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canComplete = usernameValid && !ageError;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text variant="2xl" weight="bold" style={styles.title}>
              Complete Your Profile
            </Text>
            <Text variant="base" color="secondary" style={styles.subtitle}>
              Let others in the community get to know you better
            </Text>
          </Animated.View>

          <Animated.View style={[styles.form, formAnimatedStyle]}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text
                  variant="sm"
                  color="secondary"
                  weight="medium"
                  style={styles.inputLabel}
                >
                  Username *
                </Text>
                <Animated.View style={checkAnimatedStyle}>
                  {usernameValid && (
                    <Check size={16} color={activeColors.accent} strokeWidth={3} />
                  )}
                </Animated.View>
              </View>
              <View style={styles.usernameContainer}>
                <Text
                  variant="base"
                  style={[styles.usernamePrefix, { color: activeColors.textTertiary }]}
                >
                  @
                </Text>
                <Input
                  placeholder="username"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!usernameError}
                  containerStyle={styles.usernameInput}
                />
              </View>
              {usernameError && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text
                    variant="xs"
                    style={[styles.errorText, { color: activeColors.error }]}
                  >
                    {usernameError}
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <Text
                variant="sm"
                color="secondary"
                weight="medium"
                style={styles.inputLabel}
              >
                Age (optional)
              </Text>
              <Input
                placeholder="Your age"
                value={age}
                onChangeText={handleAgeChange}
                keyboardType="number-pad"
                error={!!ageError}
                containerStyle={styles.ageInput}
              />
              {ageError && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text
                    variant="xs"
                    style={[styles.errorText, { color: activeColors.error }]}
                  >
                    {ageError}
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text
                  variant="sm"
                  color="secondary"
                  weight="medium"
                  style={styles.inputLabel}
                >
                  Bio (optional)
                </Text>
                <Text variant="xs" color="tertiary">
                  {bio.length}/{PROFILE_CONSTRAINTS.bio.maxLength}
                </Text>
              </View>
              <Input
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                maxLength={PROFILE_CONSTRAINTS.bio.maxLength}
                containerStyle={styles.bioInput}
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomSection, { borderTopColor: activeColors.border }]}>
          <Animated.View style={buttonAnimatedStyle}>
            <Button
              title="Let's Go"
              onPress={handleComplete}
              disabled={!canComplete}
              loading={loading}
              style={styles.completeButton}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    lineHeight: 24,
  },
  form: {
    gap: spacing[5],
  },
  inputGroup: {
    gap: spacing[2],
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernamePrefix: {
    fontSize: 16,
    marginRight: spacing[1],
    marginLeft: spacing[3],
  },
  usernameInput: {
    flex: 1,
  },
  ageInput: {
    maxWidth: 120,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    marginLeft: spacing[1],
    marginTop: spacing[1],
  },
  bottomSection: {
    padding: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  completeButton: {
    width: '100%',
  },
});
