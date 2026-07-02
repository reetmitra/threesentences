/**
 * ThreeSixtyThree™ Three Sentences - Onboarding Flow
 *
 * Introduces the 363 philosophy before first use.
 * Self-paced: Continue advances, Skip exits, slide content reveals on arrival.
 * Slides 2 and 3 are interactive to build understanding.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ViewToken,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
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
  withSpring,
  withRepeat,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SentenceCounter } from '@/components/SentenceCounter';
import { countSentences } from '@/utils/sentenceDetection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { completeOnboarding } from '@/store/onboarding';

const EASE_OUT_CUBIC = Easing.out(Easing.cubic);

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

/**
 * Reveals a slide's content the first time it becomes the active slide,
 * so animations play for the reader instead of firing at mount while
 * the slide is still offscreen.
 */
function SlideReveal({ active, children }: { active: boolean; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const activated = useRef(false);

  useEffect(() => {
    if (!active || activated.current) return;
    activated.current = true;
    const duration = reduced ? 0 : 480;
    opacity.value = withTiming(1, { duration, easing: EASE_OUT_CUBIC });
    translateY.value = withTiming(0, { duration, easing: EASE_OUT_CUBIC });
  }, [active, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Mini practice input for Slide 2 */
function PracticeInput() {
  const c = colors.dark;
  const [text, setText] = useState('');
  const sentenceCount = countSentences(text);

  return (
    <View style={styles.practiceContainer}>
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
          Platform.OS === 'web' && ({ outlineColor: c.creamLo, outlineWidth: 1 } as any),
        ]}
        placeholder="Start typing..."
        placeholderTextColor={c.textTertiary}
        multiline
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />
      <SentenceCounter count={sentenceCount} />
    </View>
  );
}

/** Blinking caret for the typewriter demo */
function Caret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0, { duration: 480 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={[{ color: colors.dark.textBright }, style]}>|</Animated.Text>
  );
}

/** No-edit demo animation for Slide 3 — starts when the slide becomes active */
function NoEditDemo({ active }: { active: boolean }) {
  const c = colors.dark;
  const reduced = useReducedMotion();

  const DEMO_TEXT = 'Today I felt grateful.';
  const [displayText, setDisplayText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const started = useRef(false);

  // Strikethrough animation
  const strikeWidth = useSharedValue(0);
  const editOpacity = useSharedValue(0);
  const editScale = useSharedValue(0.5);

  // Typewriter effect, triggered by first activation
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    if (reduced) {
      setDisplayText(DEMO_TEXT);
      setTypingDone(true);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    // Small lead-in so the slide reveal lands before the typing begins
    const leadIn = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        if (i < DEMO_TEXT.length) {
          setDisplayText(DEMO_TEXT.slice(0, i + 1));
          i++;
        } else {
          if (interval) clearInterval(interval);
          setTypingDone(true);
        }
      }, 55);
    }, 500);

    return () => {
      clearTimeout(leadIn);
      if (interval) clearInterval(interval);
    };
  }, [active, reduced]);

  // After typing: show edit icon, then strike through it
  useEffect(() => {
    if (!typingDone) return;

    const showDelay = reduced ? 0 : 400;
    const strikeDelay = reduced ? 0 : 1000;

    editOpacity.value = withDelay(showDelay, withTiming(1, { duration: reduced ? 0 : 300 }));
    editScale.value = withDelay(showDelay, withSpring(1, { damping: 12, stiffness: 200 }));
    strikeWidth.value = withDelay(
      strikeDelay,
      withTiming(1, { duration: reduced ? 0 : 400, easing: EASE_OUT_CUBIC })
    );
  }, [typingDone, reduced]);

  const editStyle = useAnimatedStyle(() => ({
    opacity: editOpacity.value,
    transform: [{ scale: editScale.value }],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeWidth.value * 100}%`,
  }));

  return (
    <View style={styles.noEditContainer}>
      {/* Simulated entry */}
      <View style={[styles.noEditEntry, { backgroundColor: c.surface, borderLeftColor: c.textBright }]}>
        <Text serif variant="base" style={{ color: c.textPrimary, minHeight: 24 }}>
          {displayText}
          {!typingDone && <Caret />}
        </Text>
      </View>

      {/* Edit icon with strikethrough */}
      {typingDone && (
        <Animated.View style={[styles.noEditIconContainer, editStyle]}>
          <Icon name="edit" size={22} color={c.textTertiary} />
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
        <Animated.View entering={FadeIn.delay(reduced ? 0 : 1400).duration(reduced ? 0 : 400)}>
          <Text family="mono" variant="xs" style={[styles.noEditLabel, { color: c.textSecondary, textAlign: 'center' }]}>
            Entries lock for good at midnight
          </Text>
        </Animated.View>
      )}
    </View>
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
          backgroundColor: active ? colors.dark.textBright : colors.dark.textTertiary,
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
  // Measured height of the carousel area — RN-web horizontal lists don't
  // stretch cells, so each slide gets the exact height to center within.
  const [listHeight, setListHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // Re-align the scroll offset to the current slide after a resize/rotation —
  // page boundaries move with the width and can leave the list mid-slide.
  useEffect(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenWidth]);

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
    router.replace('/(auth)/interests');
  };

  const handleContinue = () => {
    if (isLastSlide) {
      void handleComplete();
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const active = index === currentIndex;
    return (
      <View
        style={[
          styles.slide,
          { width: screenWidth },
          listHeight > 0 && { height: listHeight },
        ]}
      >
        <View style={styles.slideContent}>
          <SlideReveal active={active}>
            {index === 0 && (
              <View style={styles.logoMark}>
                <Logo size={44} />
              </View>
            )}
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
              <View style={[styles.highlightBox, { backgroundColor: c.surface, borderLeftColor: c.textBright }]}>
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
            {item.interactive === 'no-edit' && <NoEditDemo active={active} />}
          </SlideReveal>
        </View>
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => goToSlide(index)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.dotWrapper}
          accessibilityRole="button"
          accessibilityLabel={`Go to slide ${index + 1} of ${SLIDES.length}`}
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top bar: quiet exit for the impatient */}
        <View style={styles.topBar}>
          {!isLastSlide && (
            <TouchableOpacity
              onPress={() => void handleComplete()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Skip introduction"
            >
              <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5 }}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={styles.carouselWrapper}
          onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        >
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            extraData={currentIndex}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            bounces={false}
            getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
          />
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {renderPagination()}
          <Button
            title={isLastSlide ? 'Begin practice' : 'Continue'}
            onPress={handleContinue}
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    minHeight: 40,
  },
  carouselWrapper: {
    flex: 1,
  },
  slide: {
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  slideContent: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logoMark: {
    marginBottom: spacing[6],
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
    borderLeftWidth: 2,
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
  dotWrapper: {
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
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
    borderLeftWidth: 2,
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
