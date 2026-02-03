/**
 * ThreeSixtyThree™ Three Sentences - Onboarding Flow
 * 
 * Introduces the 363 philosophy before first use.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { completeOnboarding } from '@/store/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  highlight?: string;
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
      'Every day, write exactly three sentences. No more, no less. The constraint eliminates perfectionism and removes the guilt of "not doing enough."',
    highlight: 'Every entry that meets the constraint is complete.',
  },
  {
    id: '3',
    title: 'Presence Over Perfection',
    description:
      'Once submitted, your entry cannot be edited. Your words stand as written, capturing how you felt in that moment.',
    highlight: 'Done is better than perfect.',
  },
  {
    id: '4',
    title: 'Grace Without Guilt',
    description:
      'The 363 philosophy means committing to 363 days out of 365. Missed days are simply empty—not failures, not broken streaks.',
    highlight: 'Return when you return, without shame.',
  },
];

export default function OnboardingScreen() {
  const activeColors = colors.dark;

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
          // Loop back to start? Or stop? 
          // Usually auto-rotation loops.
          flatListRef.current?.scrollToIndex({
            index: 0,
            animated: true,
          });
        }
      }, 4000); // 4 seconds per slide
    }

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/signup');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleScrollBegin = () => {
    setIsAutoPlaying(false);
  };

  const handleScrollEnd = () => {
    // Optionally resume auto-play after a delay? 
    // Or just keep it paused if user interacted.
    // Let's keep it paused to not annoy user.
    // Or resume after 5 seconds of inactivity.
    // For simplicity, let's keep it paused if user swipes manually.
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

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideContent}>
        {item.subtitle && (
          <Text variant="sm" color="secondary" style={styles.subtitle}>
            {item.subtitle}
          </Text>
        )}
        <Text variant="3xl" weight="bold" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="lg" color="secondary" style={styles.description}>
          {item.description}
        </Text>
        {item.highlight && (
          <View style={[styles.highlightBox, { backgroundColor: activeColors.surface }]}>
            <Text
              variant="base"
              weight="medium"
              style={[styles.highlight, { color: activeColors.textPrimary }]}
            >
              {item.highlight}
            </Text>
          </View>
        )}
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
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? activeColors.accent
                    : activeColors.surfaceHover,
              },
              index === currentIndex && styles.dotActive,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
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
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {renderPagination()}
        <Button
          title="Get Started"
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
  // skipContainer removed
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  slideContent: {
    maxWidth: 400,
    alignSelf: 'center',
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
    marginBottom: spacing[6], // Increased spacing for clear separation
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
  nextButton: {
    width: '100%',
  },
});
