/**
 * Three™ - Profile Editing Screen
 *
 * Allows users to view and edit their complete profile.
 * Accessible from the Settings screen.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Image,
  Modal,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Edit3,
  User,
  Hash,
  Calendar,
  Sparkles,
  Camera,
  ImageIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  UserProfile,
  INTEREST_CATEGORIES,
  INTEREST_GROUPS,
  InterestId,
  InterestCategoryGroup,
  validateUsername,
  PROFILE_CONSTRAINTS,
} from '@/types/profile';
import { getProfile, updateProfile, updateProfileImage } from '@/store/profile';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const activeColors = colors.dark;
  const { userId } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState<string | undefined>();
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<InterestId[]>([]);
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<InterestCategoryGroup>>(
    new Set()
  );

  // Animations
  const saveButtonScale = useSharedValue(1);
  const editButtonRotation = useSharedValue(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!userId) {
        router.replace('/(auth)/login');
        return;
      }

      const userProfile = await getProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        // Initialize form fields
        setName(userProfile.name);
        setUsername(userProfile.username);
        setAge(userProfile.age?.toString() || '');
        setBio(userProfile.bio || '');
        setSelectedInterests(userProfile.interests);
        setProfileImage(userProfile.profileImage);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUsernameInput = useCallback((value: string) => {
    const result = validateUsername(value);
    setUsernameError(result.valid ? undefined : result.error);
    return result.valid;
  }, []);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    validateUsernameInput(cleaned);
  };

  const handleAgeChange = (value: string) => {
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

  const handleToggleInterest = useCallback((id: InterestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        // Don't allow going below minimum
        if (prev.length <= PROFILE_CONSTRAINTS.interests.minCount) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return prev;
        }
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= PROFILE_CONSTRAINTS.interests.maxCount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleToggleGroup = useCallback((group: InterestCategoryGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      const options = profileImage
        ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
        : ['Take Photo', 'Choose from Library', 'Cancel'];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: profileImage ? 2 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            handleTakePhoto();
          } else if (buttonIndex === 1) {
            handleChooseFromLibrary();
          } else if (profileImage && buttonIndex === 2) {
            handleRemovePhoto();
          }
        }
      );
    } else {
      setShowImageOptions(true);
    }
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take a profile photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await saveProfileImage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    setShowImageOptions(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to choose a profile photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await saveProfileImage(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = async () => {
    setShowImageOptions(false);

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userId) {
                await updateProfileImage(userId, null);
                setProfileImage(undefined);
                if (profile) {
                  setProfile({ ...profile, profileImage: undefined });
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Failed to remove photo:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const saveProfileImage = async (uri: string) => {
    try {
      if (userId) {
        await updateProfileImage(userId, uri);
        setProfileImage(uri);
        if (profile) {
          setProfile({ ...profile, profileImage: uri });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Failed to save profile image:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save profile image');
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing - restore original values
      if (profile) {
        setName(profile.name);
        setUsername(profile.username);
        setAge(profile.age?.toString() || '');
        setBio(profile.bio || '');
        setSelectedInterests(profile.interests);
      }
      setUsernameError(undefined);
      setAgeError(undefined);
    }

    editButtonRotation.value = withSpring(isEditing ? 0 : 45, { damping: 12 });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (usernameError || ageError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (selectedInterests.length < PROFILE_CONSTRAINTS.interests.minCount) {
      Alert.alert(
        'Error',
        `Please select at least ${PROFILE_CONSTRAINTS.interests.minCount} interests`
      );
      return;
    }

    try {
      setSaving(true);
      saveButtonScale.value = withSpring(0.95);

      if (!userId) throw new Error('Not authenticated');

      const updatedProfile = await updateProfile(userId, {
        name: name.trim(),
        username,
        age: age ? parseInt(age, 10) : undefined,
        bio: bio.trim() || undefined,
        interests: selectedInterests,
      });

      setProfile(updatedProfile);
      saveButtonScale.value = withSpring(1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
    } catch (error) {
      saveButtonScale.value = withSpring(1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const editButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${editButtonRotation.value}deg` }],
  }));

  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  // Get interests for a specific group
  const getInterestsForGroup = (group: InterestCategoryGroup) => {
    return INTEREST_CATEGORIES.filter((i) => i.group === group);
  };

  // Count selected in a group
  const getSelectedCountForGroup = (group: InterestCategoryGroup) => {
    return selectedInterests.filter(
      (id) => INTEREST_CATEGORIES.find((i) => i.id === id)?.group === group
    ).length;
  };

  // Get selected interests formatted for display
  const getSelectedInterestsDisplay = () => {
    return selectedInterests
      .map((id) => INTEREST_CATEGORIES.find((i) => i.id === id)?.label)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text color="secondary">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
          <Pressable
            onPress={() => router.replace('/(tabs)/settings')}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={activeColors.textPrimary} />
          </Pressable>
          <Text variant="lg" family="sansSemibold">
            Profile
          </Text>
          <Pressable
            onPress={handleToggleEdit}
            style={styles.editButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={editButtonAnimatedStyle}>
              <Edit3
                size={20}
                color={isEditing ? activeColors.accent : activeColors.textSecondary}
              />
            </Animated.View>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Avatar/Image */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              onPress={handleAvatarPress}
              style={({ pressed }) => [
                styles.avatarContainer,
                { backgroundColor: activeColors.surface },
                pressed && styles.avatarPressed,
              ]}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text
                  variant="3xl"
                  family="sansBold"
                  style={{ color: activeColors.accent }}
                >
                  {name.charAt(0).toUpperCase() || '?'}
                </Text>
              )}
              {/* Camera overlay */}
              <View
                style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
              >
                <Camera size={20} color={activeColors.textBright} strokeWidth={2} />
              </View>
            </Pressable>
            <Text variant="xs" color="tertiary" centered style={styles.avatarHint}>
              Tap to change photo
            </Text>
          </Animated.View>

          {/* Name Section */}
          <Animated.View
            entering={FadeIn.delay(100).duration(300)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <User size={16} color={activeColors.textSecondary} />
              <Text
                variant="sm"
                color="secondary"
               
                style={styles.sectionTitle}
              >
                NAME
              </Text>
            </View>
            {isEditing ? (
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
              />
            ) : (
              <Text variant="lg">
                {profile?.name || 'Not set'}
              </Text>
            )}
          </Animated.View>

          {/* Username Section */}
          <Animated.View
            entering={FadeIn.delay(150).duration(300)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Hash size={16} color={activeColors.textSecondary} />
              <Text
                variant="sm"
                color="secondary"
               
                style={styles.sectionTitle}
              >
                USERNAME
              </Text>
            </View>
            {isEditing ? (
              <View>
                <View style={styles.usernameRow}>
                  <Text
                    variant="base"
                    style={[styles.usernamePrefix, { color: activeColors.textTertiary }]}
                  >
                    @
                  </Text>
                  <Input
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={!!usernameError}
                    containerStyle={styles.usernameInput}
                  />
                </View>
                {usernameError && (
                  <Text
                    variant="xs"
                    style={[styles.errorText, { color: activeColors.error }]}
                  >
                    {usernameError}
                  </Text>
                )}
              </View>
            ) : (
              <Text variant="lg">
                @{profile?.username || 'not_set'}
              </Text>
            )}
          </Animated.View>

          {/* Age Section */}
          <Animated.View
            entering={FadeIn.delay(200).duration(300)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Calendar size={16} color={activeColors.textSecondary} />
              <Text
                variant="sm"
                color="secondary"
               
                style={styles.sectionTitle}
              >
                AGE
              </Text>
            </View>
            {isEditing ? (
              <View>
                <Input
                  value={age}
                  onChangeText={handleAgeChange}
                  placeholder="Your age (optional)"
                  keyboardType="number-pad"
                  error={!!ageError}
                  containerStyle={styles.ageInput}
                />
                {ageError && (
                  <Text
                    variant="xs"
                    style={[styles.errorText, { color: activeColors.error }]}
                  >
                    {ageError}
                  </Text>
                )}
              </View>
            ) : (
              <Text variant="lg">
                {profile?.age || 'Not specified'}
              </Text>
            )}
          </Animated.View>

          {/* Interests Section */}
          <Animated.View
            entering={FadeIn.delay(250).duration(300)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color={activeColors.textSecondary} />
              <Text
                variant="sm"
                color="secondary"
               
                style={styles.sectionTitle}
              >
                INTERESTS
              </Text>
              <Text variant="xs" color="tertiary" style={styles.sectionCount}>
                {selectedInterests.length} selected
              </Text>
            </View>

            {isEditing ? (
              // Editing mode - show grouped interests
              <View style={styles.interestGroups}>
                {(Object.keys(INTEREST_GROUPS) as InterestCategoryGroup[]).map(
                  (groupKey) => {
                    const group = INTEREST_GROUPS[groupKey];
                    const interests = getInterestsForGroup(groupKey);
                    const isExpanded = expandedGroups.has(groupKey);
                    const selectedCount = getSelectedCountForGroup(groupKey);

                    return (
                      <View key={groupKey} style={styles.groupContainer}>
                        <Pressable
                          onPress={() => handleToggleGroup(groupKey)}
                          style={[
                            styles.groupHeader,
                            { borderColor: activeColors.border },
                          ]}
                        >
                          <View style={styles.groupHeaderLeft}>
                            <Text variant="sm">
                              {group.label}
                            </Text>
                            {selectedCount > 0 && (
                              <View
                                style={[
                                  styles.selectedBadge,
                                  { backgroundColor: activeColors.accent },
                                ]}
                              >
                                <Text
                                  variant="xs"
                                  family="sansSemibold"
                                  style={{ color: '#000' }}
                                >
                                  {selectedCount}
                                </Text>
                              </View>
                            )}
                          </View>
                          {isExpanded ? (
                            <ChevronUp size={18} color={activeColors.textSecondary} />
                          ) : (
                            <ChevronDown size={18} color={activeColors.textSecondary} />
                          )}
                        </Pressable>

                        {isExpanded && (
                          <View style={styles.interestsGrid}>
                            {interests.map((interest) => {
                              const isSelected = selectedInterests.includes(interest.id);
                              return (
                                <Pressable
                                  key={interest.id}
                                  onPress={() => handleToggleInterest(interest.id)}
                                  style={[
                                    styles.interestChip,
                                    {
                                      backgroundColor: isSelected
                                        ? activeColors.accent
                                        : activeColors.surface,
                                      borderColor: isSelected
                                        ? activeColors.accent
                                        : activeColors.border,
                                    },
                                  ]}
                                >
                                  <Text
                                    variant="sm"
                                    family={isSelected ? 'sansSemibold' : 'sans'}
                                    style={{
                                      color: isSelected ? '#000' : activeColors.textPrimary,
                                    }}
                                  >
                                    {interest.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  }
                )}
              </View>
            ) : (
              // View mode - show selected interests as chips
              <View style={styles.interestsDisplay}>
                {selectedInterests.length > 0 ? (
                  <Text variant="base" color="primary" style={{ lineHeight: 24 }}>
                    {getSelectedInterestsDisplay()}
                  </Text>
                ) : (
                  <Text variant="base" color="tertiary">
                    No interests selected
                  </Text>
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Save Button */}
        {isEditing && (
          <Animated.View
            entering={SlideInRight.duration(300)}
            style={[styles.bottomSection, { borderTopColor: activeColors.border }]}
          >
            <Animated.View style={saveButtonAnimatedStyle}>
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </Animated.View>
            <Pressable onPress={handleToggleEdit} style={styles.cancelButton}>
              <Text variant="sm" color="secondary">
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Android Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: activeColors.surface }]}>
            <Text variant="lg" family="sansSemibold" style={styles.modalTitle}>
              Change Profile Photo
            </Text>

            <Pressable
              style={[styles.modalOption, { borderBottomColor: activeColors.border }]}
              onPress={handleTakePhoto}
            >
              <Camera size={22} color={activeColors.textPrimary} />
              <Text variant="base" style={styles.modalOptionText}>
                Take Photo
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, { borderBottomColor: activeColors.border }]}
              onPress={handleChooseFromLibrary}
            >
              <ImageIcon size={22} color={activeColors.textPrimary} />
              <Text variant="base" style={styles.modalOptionText}>
                Choose from Library
              </Text>
            </Pressable>

            {profileImage && (
              <Pressable
                style={[styles.modalOption, { borderBottomColor: activeColors.border }]}
                onPress={handleRemovePhoto}
              >
                <Trash2 size={22} color={activeColors.error} />
                <Text
                  variant="base"
                  style={[styles.modalOptionText, { color: activeColors.error }]}
                >
                  Remove Photo
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.modalCancel}
              onPress={() => setShowImageOptions(false)}
            >
              <Text variant="base" color="secondary">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing[2],
  },
  editButton: {
    padding: spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[20],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  avatarPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  sectionCount: {
    marginLeft: 'auto',
  },
  usernameRow: {
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
  errorText: {
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
  interestGroups: {
    gap: spacing[2],
  },
  groupContainer: {
    marginBottom: spacing[2],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  selectedBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  interestChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
  },
  interestsDisplay: {
    paddingVertical: spacing[2],
  },
  bottomSection: {
    padding: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    gap: spacing[3],
  },
  saveButton: {
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderBottomWidth: 1,
    gap: spacing[4],
  },
  modalOptionText: {
    flex: 1,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginTop: spacing[2],
  },
});
