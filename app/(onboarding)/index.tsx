/**
 * ThreeSixtyThree™ Three Sentences - Onboarding Flow
 *
 * Introduces the 363 philosophy before first use.
 * Slides 2 and 3 are interactive to build understanding.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ViewToken,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SentenceCounter } from '@/components/SentenceCounter';
import { countSentences } from '@/utils/sentenceDetection';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { completeOnboarding } from '@/store/onboarding';

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  highlight?: string;
  interactive?: 'practice' | 'no-edit';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'ThreeSixtyThree™',
    subtitle: 'Three Sentences',
    description:
      'A journaling practice built on a simple truth: you cannot be perfect, but you can be relentless.',
    highlight: 'Show up. Do the work. Let go of perfection.',
  },
  {
    id: '2',
    title: 'Three Sentences',
    description:
      'Every day, write exactly three sentences. No more, no less. The constraint eliminates perfectionism.',
    highlight: 'Every entry that meets the constraint is complete.',
    interactive: 'practice',
  },
  {
    id: '3',
    title: 'Presence Over Perfection',
    description:
      'At midnight, your entry locks for good. Refine it through the day if you must — after that, your words stand as written.',
    highlight: 'Done is better than perfect.',
    interactive: 'no-edit',
  },
  {
    id: '4',
    title: 'Grace Without Guilt',
    description:
      'The 363 philosophy means committing to 363 days out of 365. Missed days are simply empty—not failures, not broken streaks.',
    highlight: 'Return when you return, without shame.',
  },
];

/** Mini practice input for Slide 2 */
function PracticeInput() {
  const c = colors.dark;
  const [text, setText] = useState('');
  const sentenceCount = countSentences(text);

  return (
    <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.practiceContainer}>
      <Text family="mono" variant="sm" style={[styles.practiceLabel, { color: c.textSecondary }]}>
        Try it — write 3 sentences:
      </Text>
      <TextInput
        style={[
          styles.practiceInput,
          {
            backgroundColor: c.surface,
            color: c.textPrimary,
            borderColor: sentenceCount === 3 ? c.textBright : c.frame,
          },
        ]}
        placeholder="Start typing..."
        placeholderTextColor={c.textTertiary}
        multiline
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />
      <SentenceCounter count={sentenceCount} />
    </Animated.View>
  );
}

/** No-edit demo animation for Slide 3 */
function NoEditDemo() {
  const c = colors.dark;

  // Typewriter text
  const DEMO_TEXT = 'Today I felt grateful.';
  const [displayText, setDisplayText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  // Strikethrough animation
  const strikeWidth = useSharedValue(0);
  const editOpacity = useSharedValue(0);
  const editScale = useSharedValue(0.5);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < DEMO_TEXT.length) {
        setDisplayText(DEMO_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // After typing: show edit icon, then strike through it
  useEffect(() => {
    if (!typingDone) return;

    // Show the edit icon
    editOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
    editScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 200 }));

    // Animate strikethrough across the icon
    strikeWidth.value = withDelay(
      1000,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [typingDone]);

  const editStyle = useAnimatedStyle(() => ({
    opacity: editOpacity.value,
    transform: [{ scale: editScale.value }],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeWidth.value * 100}%`,
  }));

  return (
    <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.noEditContainer}>
      {/* Simulated entry */}
      <View style={[styles.noEditEntry, { backgroundColor: c.surface }]}>
        <Text variant="base" style={{ color: c.textPrimary, minHeight: 24 }}>
          {displayText}
          {!typingDone && (
            <Text variant="base" style={{ color: c.textBright }}>|</Text>
          )}
        </Text>
      </View>

      {/* Edit icon with strikethrough */}
      {typingDone && (
        <Animated.View style={[styles.noEditIconContainer, editStyle]}>
          <Icon name="edit" size={22} color={c.textTertiary} />
          {/* Red strikethrough line */}
          <Animated.View
            style={[
              styles.strikethrough,
              { backgroundColor: c.warn },
              strikeStyle,
            ]}
          />
        </Animated.View>
      )}

      {typingDone && (
        <Animated.View entering={FadeIn.delay(1400).duration(400)}>
          <Text family="mono" variant="xs" style={[styles.noEditLabel, { color: c.textSecondary, textAlign: 'center' }]}>
            Entries lock for good at midnight
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function PageDot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 22 : 6);

  useEffect(() => {
    width.value = withTiming(active ? 22 : 6, {
      duration: 240,
      easing: Easing.ease,
    });
  }, [active]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 3,
          backgroundColor: active ? colors.dark.textBright : colors.dark.frame,
        },
        style,
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const c = colors.dark;
  // useWindowDimensions (not Dimensions.get at module scope) so slides track
  // rotation and browser resizes instead of going blank offscreen.
  const { width: screenWidth } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying) {
      interval = setInterval(() => {
        if (currentIndex < SLIDES.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        } else {
          flatListRef.current?.scrollToIndex({
            index: 0,
            animated: true,
          });
        }
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/interests');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleScrollBegin = () => {
    setIsAutoPlaying(false);
  };

  const handleScrollEnd = () => {
    setIsAutoPlaying(false);
  };

  const handleDotPress = (index: number) => {
    setIsAutoPlaying(false);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={[styles.slide, { width: screenWidth }]}>
      <View style={styles.slideContent}>
        {/* Slide eyebrow */}
        <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 2, marginBottom: spacing[4] }}>
          {`0${index + 1} / 04`}
        </Text>
        {item.subtitle && (
          <Text family="mono" variant="sm" uppercase style={[styles.subtitle, { color: c.textSecondary, letterSpacing: 2 }]}>
            {item.subtitle}
          </Text>
        )}
        <Text family="sansSemibold" variant="2xl" style={[styles.title, { color: c.textPrimary, marginBottom: spacing[3] }]}>
          {item.title}
        </Text>
        <Text serif variant="base" style={[styles.description, { color: c.textSecondary, lineHeight: 28 }]}>
          {item.description}
        </Text>
        {item.highlight && (
          <View style={[styles.highlightBox, { backgroundColor: c.surface }]}>
            <Text
              serif
              variant="base"
              style={[styles.highlight, { color: c.textPrimary }]}
            >
              {item.highlight}
            </Text>
          </View>
        )}

        {/* Interactive elements */}
        {item.interactive === 'practice' && <PracticeInput />}
        {item.interactive === 'no-edit' && <NoEditDemo />}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleDotPress(index)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.dotWrapper}
        >
          <PageDot active={index === currentIndex} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.background }]}
      edges={['top', 'bottom']}
    >
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        bounces={false}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {renderPagination()}
        {Platform.OS === 'web' && currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={() => handleDotPress(currentIndex + 1)}
            style={styles.webNextButton}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
          >
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5 }}>
              Next →
            </Text>
          </TouchableOpacity>
        )}
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Begin practice' : 'Get Started'}
          onPress={handleGetStarted}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  carouselContent: {
    // Stretch items to full height so justifyContent:'center' on the slide
    // actually centers on web (RN-web horizontal lists don't stretch by default).
    flexGrow: 1,
  },
  slide: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  slideContent: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    marginBottom: spacing[4],
  },
  description: {
    lineHeight: 28,
    marginBottom: spacing[5],
  },
  highlightBox: {
    padding: spacing[4],
    borderRadius: 12,
  },
  highlight: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
  },
  dotWrapper: {
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
  },
  webNextButton: {
    alignSelf: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },

  // Practice input (Slide 2)
  practiceContainer: {
    marginTop: spacing[4],
  },
  practiceLabel: {
    marginBottom: spacing[2],
  },
  practiceInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: 15,
    minHeight: 80,
    fontFamily: 'SchibstedGrotesk_400Regular',
  },

  // No-edit demo (Slide 3)
  noEditContainer: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  noEditEntry: {
    padding: spacing[3],
    borderRadius: 12,
    width: '100%',
    marginBottom: spacing[3],
  },
  noEditIconContainer: {
    position: 'relative',
    marginBottom: spacing[2],
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: -4,
    right: -4,
    height: 2,
    borderRadius: 1,
  },
  noEditLabel: {
    marginTop: spacing[1],
  },
});
