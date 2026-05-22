# Mobile Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete motion system for the Three Sentences React Native + Expo mobile app, as specified in the motion prompt (sections 0–1 and 3.1).

**Architecture:** All animations use `react-native-reanimated` v4 shared values and animated styles. A single `BRAND_EASING` constant is defined once and imported everywhere. Each component is updated in isolation — no new navigation structure, no new screens.

**Tech Stack:** React Native + Expo, `react-native-reanimated` ~4.1.1, `expo-blur` (to be installed), `expo-haptics`.

---

## File map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `hooks/useReducedMotion.ts` | Wraps Reanimated's `useReducedMotion`, exposes `reducedMotion` bool |
| Modify | `components/ui/LoadingScreen.tsx` | Replace logo sequence with three-dot juggle splash |
| Modify | `components/ui/Toast.tsx` | Use brand easing (280ms), auto-dismiss at 2400ms |
| Modify | `components/ui/Skeleton.tsx` | Sync at 1400ms, opacity range 0.35→0.7 |
| Modify | `components/ui/BottomSheet.tsx` | Brand easing (280ms in, 220ms out), BlurView backdrop |
| Modify | `components/SentenceCounter.tsx` | Add fade-up animation to advisory text (300ms) |
| Modify | `components/CategoryChip.tsx` | Remove scale-on-press; color flip 120ms ease only |
| Modify | `app/(tabs)/index.tsx` | Toast "STREAK +1 · LOCKED" on submit, milestone modal trigger |
| Modify | `app/(tabs)/reflect.tsx` | 800ms skeleton delay on timeframe chip change |
| Modify | `app/(tabs)/_layout.tsx` | Add `animation: 'fade'` to screen options for pt-screen-in |
| Modify | `app/(onboarding)/index.tsx` | Page indicator dot → pill (22×6) transition on active slide |
| Modify | `components/social/ChatInput.tsx` | No scale on send button press; clear input on send |
| Modify | `components/social/MessageBubble.tsx` | Replace spring scale entrance with fade-up (240ms); add failed bubble |

---

## Task 1: `useReducedMotion` hook + install `expo-blur`

**Files:**
- Create: `hooks/useReducedMotion.ts`

- [ ] **Step 1: Install expo-blur (needed for backdrop BlurView in Task 6)**

```bash
npx expo install expo-blur
```

Expected output: `expo-blur` added to `package.json`. A native rebuild is required before the blur appears on device, but JS-side code can be written now.

- [ ] **Step 2: Write the hook**

```ts
// hooks/useReducedMotion.ts
import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

export function useReducedMotion(): boolean {
  return useReanimatedReducedMotion();
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add hooks/useReducedMotion.ts package.json package-lock.json
git commit -m "feat(motion): add useReducedMotion hook and install expo-blur"
```

---

## Task 2: LoadingScreen — three-dot juggle splash

**Files:**
- Modify: `components/ui/LoadingScreen.tsx`

The current implementation renders an SVG logo mark, wordmark, separator and tagline. The spec wants three 22px ivory dots that juggle with an overshoot easing, then wordmark and tagline fade up.

- [ ] **Step 1: Verify the current file is read** (already done in planning — the file is at `components/ui/LoadingScreen.tsx`)

- [ ] **Step 2: Replace the file content entirely**

```tsx
// components/ui/LoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Brand easing: cubic-bezier(0.16, 1, 0.3, 1)
const BRAND = Easing.bezier(0.16, 1, 0.3, 1);
// Juggle easing (overshoot): cubic-bezier(0.34, 1.5, 0.64, 1)
const JUGGLE = Easing.bezier(0.34, 1.5, 0.64, 1);

const t = (ms: number, easing = BRAND) => ({ duration: ms, easing });

function JuggleDot({ delay, arcHeight }: { delay: number; arcHeight: number }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(
      delay,
      withSequence(
        withTiming(-arcHeight, t(420, JUGGLE)),
        withTiming(arcHeight * 0.2, t(350, JUGGLE)),
        withTiming(0, t(430, JUGGLE)),
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function LoadingScreen() {
  const reduced = useReducedMotion();
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(12);
  const tagOpacity = useSharedValue(0);
  const tagY = useSharedValue(12);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      wordOpacity.value = 1;
      wordY.value = 0;
      tagOpacity.value = 1;
      tagY.value = 0;
      ctaOpacity.value = 1;
      return;
    }
    wordOpacity.value = withDelay(950, withTiming(1, t(800)));
    wordY.value = withDelay(950, withTiming(0, t(800)));
    tagOpacity.value = withDelay(1350, withTiming(1, t(700)));
    tagY.value = withDelay(1350, withTiming(0, t(700)));
    ctaOpacity.value = withDelay(2400, withTiming(1, t(400)));
  }, []);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.dark.background }]}>
      {/* Three juggling dots */}
      <View style={styles.dotsRow}>
        <JuggleDot delay={0}   arcHeight={40} />
        <JuggleDot delay={140} arcHeight={48} />
        <JuggleDot delay={280} arcHeight={40} />
      </View>

      {/* Wordmark */}
      <Animated.Text style={[styles.wordMark, { color: colors.dark.textPrimary }, wordStyle]}>
        Three Sentences
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { color: colors.dark.textSecondary }, tagStyle]}>
        BE BETTER. DO BETTER.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
    marginBottom: 32,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFF0', // ivory
  },
  wordMark: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "loadingscreen\|error" | head -10
```

Expected: no errors for this file.

- [ ] **Step 4: Commit**

```bash
git add components/ui/LoadingScreen.tsx
git commit -m "feat(motion): replace splash with three-dot juggle sequence per spec §1.2"
```

---

## Task 3: Toast — brand easing + correct dismiss

**Files:**
- Modify: `components/ui/Toast.tsx`

The current Toast uses the legacy `Animated` API with simple ease. The spec says pt-toast-in: `opacity 0→1, translateY(-10)→0, 240ms ease-out`. Also auto-dismiss at 2400ms (current is 3000ms default).

- [ ] **Step 1: Read the current file** (already done — see `components/ui/Toast.tsx`)

- [ ] **Step 2: Rewrite using Reanimated with brand easing and correct timing**

```tsx
// components/ui/Toast.tsx
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  /** Default 2400ms per spec */
  duration?: number;
  onDismiss: () => void;
}

const BRAND = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_OUT = Easing.out(Easing.ease);

export function Toast({ type, message, visible, duration = 2400, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-10);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180, easing: EASE_OUT });
    translateY.value = withTiming(-10, { duration: 180, easing: EASE_OUT }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      // pt-toast-in: 240ms ease-out
      translateY.value = withTiming(0, { duration: 240, easing: EASE_OUT });
      opacity.value = withTiming(1, { duration: 240, easing: EASE_OUT });

      const timer = setTimeout(() => hide(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const borderColor = type === 'error' ? colors.dark.warn : colors.dark.frame;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing[3],
          borderColor,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      <Pressable onPress={hide} hitSlop={8}>
        <Text
          family="monoMedium"
          variant="sm"
          fixedSize
          uppercase
          style={styles.message}
        >
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    zIndex: 9999,
    elevation: 10,
  },
  message: {
    color: colors.dark.textPrimary,
    letterSpacing: 1.4,
  },
});
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "toast\|error" | head -10
```

- [ ] **Step 4: Verify "STREAK +1 · LOCKED" message is shown on submit** (will be wired in Task 8)

- [ ] **Step 5: Commit**

```bash
git add components/ui/Toast.tsx
git commit -m "feat(motion): update Toast to brand easing + 2400ms auto-dismiss per spec §1.1"
```

---

## Task 4: Skeleton — sync timing, corrected opacity range

**Files:**
- Modify: `components/ui/Skeleton.tsx`

The spec says `pt-skel`: 1400ms, ease-in-out, infinite, opacity range 0.35→0.7. All skeletons must loop in sync (all start at same phase). Current: 1000ms, 0.3→0.7, no sync guarantee.

- [ ] **Step 1: Update the base `Skeleton` component's loop timing**

Find the `Skeleton` function in `components/ui/Skeleton.tsx` and replace the `useEffect`:

```tsx
// In the Skeleton function, replace useEffect:
useEffect(() => {
  opacity.value = 0.35;
  opacity.value = withRepeat(
    withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );
}, []);
```

Also set the initial shared value to `0.35`:
```tsx
const opacity = useSharedValue(0.35);
```

The total cycle is 1400ms (700ms up + 700ms down) matching spec. All skeletons start their loop on mount with the same initial value, so they stay in phase.

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "skeleton\|error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/Skeleton.tsx
git commit -m "feat(motion): sync skeleton pulse at 1400ms, opacity 0.35→0.7 per spec §1.11"
```

---

## Task 5: SentenceCounter — fade-up animation for advisory text

**Files:**
- Modify: `components/SentenceCounter.tsx`

The spec says: when `count > 3`, the italic advisory "The constraint is the point. Cut one." appears via `pt-fade-up` 300ms. Currently it appears instantly.

- [ ] **Step 1: Read current file** (already done)

- [ ] **Step 2: Add Reanimated imports and animated advisory**

Replace the file:

```tsx
// components/SentenceCounter.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const EASE_OUT = Easing.out(Easing.ease);

interface SentenceCounterProps {
  count: number;
  target?: number;
}

export function SentenceCounter({ count, target = 3 }: SentenceCounterProps) {
  const c = colors.dark;
  const isOver = count > target;
  const isComplete = count === target;

  const advisoryOpacity = useSharedValue(0);
  const advisoryY = useSharedValue(12);

  useEffect(() => {
    if (isOver) {
      advisoryOpacity.value = withTiming(1, { duration: 300, easing: EASE_OUT });
      advisoryY.value = withTiming(0, { duration: 300, easing: EASE_OUT });
    } else {
      advisoryOpacity.value = withTiming(0, { duration: 150, easing: EASE_OUT });
      advisoryY.value = withTiming(12, { duration: 150, easing: EASE_OUT });
    }
  }, [isOver]);

  const advisoryStyle = useAnimatedStyle(() => ({
    opacity: advisoryOpacity.value,
    transform: [{ translateY: advisoryY.value }],
  }));

  const statusText = isOver
    ? 'too many'
    : isComplete
    ? 'ready'
    : `${target - count} more`;

  // Spec: 0/1/2 → grey, 3 → bright, 4+ → amber
  const counterColor = isOver ? c.warn : isComplete ? c.textBright : c.textSecondary;

  return (
    <View style={styles.container} accessibilityLabel={`${count} of ${target} sentences`}>
      <Text
        family="monoMedium"
        variant="base"
        fixedSize
        style={{ color: counterColor, letterSpacing: 1 }}
      >
        {count} / {target} · {statusText}
      </Text>

      <Animated.View style={advisoryStyle}>
        <Text
          family="serifItalic"
          variant="sm"
          style={{ color: c.warn }}
        >
          The constraint is the point. Cut one.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: 6,
  },
});
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "sentencecounter\|error" | head -10
```

- [ ] **Step 4: Commit**

```bash
git add components/SentenceCounter.tsx
git commit -m "feat(motion): animate advisory text fade-up on sentence overflow per spec §1.4"
```

---

## Task 6: CategoryChip — remove scale-on-press, 120ms color flip

**Files:**
- Modify: `components/CategoryChip.tsx`

Spec rule 0: "No scale-on-press." Spec §1.8: chip background/border-color/color transition 120ms ease. The `CategoryChip` currently has `scale` spring on press-in/out. Remove it. The `HobbyChip` similarly should not scale.

- [ ] **Step 1: Remove scale animation from `CategoryChip`**

In `components/CategoryChip.tsx`:

a) Remove `scale` shared value and all references to it.  
b) Remove `handlePressIn` and `handlePressOut` callbacks.  
c) Remove `onPressIn` and `onPressOut` from `AnimatedPressable`.  
d) Change `selection` animation from `withSpring` to `withTiming(selected ? 1 : 0, { duration: 120, easing: Easing.ease })`.  
e) The `animatedContainerStyle` no longer includes `scale` transform.

The updated `CategoryChip` function (key changes shown):

```tsx
// Remove these shared values and callbacks:
// const scale = useSharedValue(1);
// const handlePressIn = ...
// const handlePressOut = ...

// Change selection update:
React.useEffect(() => {
  selection.value = withTiming(selected ? 1 : 0, {
    duration: 120,
    easing: Easing.ease,
  });
}, [selected, selection]);

// animatedContainerStyle — remove scale from transform:
const animatedContainerStyle = useAnimatedStyle(() => {
  const backgroundColor = interpolateColor(
    selection.value,
    [0, 1],
    [activeColors.surface, activeColors.accent],
  );
  const borderColor = interpolateColor(
    selection.value,
    [0, 1],
    [activeColors.border, activeColors.accent],
  );
  return {
    transform: [{ translateY: interpolate(entrance.value, [0, 1], [20, 0]) }],
    opacity: entrance.value,
    backgroundColor,
    borderColor,
  };
});
```

For `AnimatedPressable` — remove `onPressIn` and `onPressOut` props entirely.

For `HobbyChip` — similarly remove `scale` shared value, `handlePressIn`, `handlePressOut`, remove scale transform from `animatedStyle`.

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "categorychip\|error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add components/CategoryChip.tsx
git commit -m "feat(motion): remove scale-on-press from chips; 120ms ease color flip per spec §1.8"
```

---

## Task 7: BottomSheet — brand easing, blur backdrop

**Files:**
- Modify: `components/ui/BottomSheet.tsx`

Spec §1.5: Bottom-sheet in = backdrop `pt-fade-in` 180ms + sheet `translateY 100%→0, opacity 0→1, 280ms brand easing`. Out = `translateY 0→100%, 220ms brand easing`. Backdrop `rgba(0,0,0,0.55) + backdrop-filter: blur(6px)`.

For the blur, use `expo-blur`'s `BlurView` (installed in Task 1). On Android, fallback gracefully with just the opacity.

- [ ] **Step 1: Rewrite `components/ui/BottomSheet.tsx`**

```tsx
// components/ui/BottomSheet.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_OUT = Easing.out(Easing.ease);

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
}

export function BottomSheet({ visible, onClose, children, maxHeight = 0.6 }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetHeight = SCREEN_HEIGHT * maxHeight;

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 180, easing: EASE_OUT });
      translateY.value = withTiming(0, { duration: 280, easing: BRAND });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220, easing: BRAND });
      backdropOpacity.value = withTiming(0, { duration: 220, easing: EASE_OUT });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="none"
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={20}
              tint="dark"
              style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.backdrop]} />
          )}
        </Pressable>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom + spacing[4],
            backgroundColor: colors.dark.surface,
          },
          sheetStyle,
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.dark.frame }]} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "bottomsheet\|error" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/BottomSheet.tsx
git commit -m "feat(motion): BottomSheet brand easing 280ms/220ms + BlurView backdrop per spec §1.5"
```

---

## Task 8: Today screen — "STREAK +1 · LOCKED" toast + correct milestone trigger

**Files:**
- Modify: `app/(tabs)/index.tsx`

The spec §1.3 says on submit: toast "STREAK +1 · LOCKED" (mono uppercase, 1.4em tracking). Check if the existing `showToast` call in `handleSubmit` shows this exact message. Update if not. Also ensure `isMilestone` triggers the modal correctly.

- [ ] **Step 1: Find the submit handler in `app/(tabs)/index.tsx`**

Search for the `showToast` call after entry save. It likely says something like `showToast('success', 'Entry saved')`.

- [ ] **Step 2: Update the toast message and milestone trigger**

In the submit handler, after saving the entry and computing the new streak, replace the generic toast with:

```tsx
// After saving entry and getting newStreak:
showToast('success', `STREAK +${newStreak} · LOCKED`);

// Trigger milestone modal (per spec — fires INSTEAD of generic toast for milestones)
if (isMilestone(newStreak)) {
  setMilestoneStreak(newStreak);
  setShowMilestone(true);
  // For milestone, we still show the same toast but modal takes precedence visually
}
```

Wait — spec says: "If new streak ∈ {7, 30, 100, 363}, immediately open `milestone:N` modal after submit (no toast for milestone — the modal is the celebration)."

So for milestone streaks, skip the toast entirely:

```tsx
if (isMilestone(newStreak)) {
  setMilestoneStreak(newStreak);
  setShowMilestone(true);
  // No toast for milestones
} else {
  showToast('success', `STREAK +${newStreak} · LOCKED`);
}
```

Find the exact submit/save block and apply this logic. The call site is within `handleSubmit` or `handleSave` in `app/(tabs)/index.tsx` after `await saveEntry(...)`.

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "index\|error" | head -20
```

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "feat(motion): toast 'STREAK +N · LOCKED' on submit; milestone modal skips toast per spec §1.3"
```

---

## Task 9: Reflect screen — 800ms skeleton delay on timeframe chip change

**Files:**
- Modify: `app/(tabs)/reflect.tsx`

Spec §1.12: When user changes timeframe chip (7d/30d/90d), content swaps to skeleton state. After exactly 800ms, real content fades in via pt-fade-up 280ms.

- [ ] **Step 1: Read the reflect screen's chip change handler** (already done — `selectedRange` state drives generation)

- [ ] **Step 2: Add a `isSwapping` state and 800ms delay**

Find the `handleChipChange` or `setSelectedRange` call site. Add:

```tsx
// Add state:
const [isSwapping, setIsSwapping] = useState(false);

// When chip changes:
const handleRangeChange = useCallback((range: ReflectionTimeRange) => {
  if (range === selectedRange) return;
  setSelectedRange(range);
  setIsSwapping(true);
  setTimeout(() => setIsSwapping(false), 800);
}, [selectedRange]);
```

- [ ] **Step 3: Show skeleton during swapping**

In the JSX, where the reflection content renders, add:

```tsx
{(isLoading || isSwapping) ? (
  <SkeletonReflect />
) : latestReflection ? (
  // existing content
) : (
  // empty state
)}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "reflect\|error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/reflect.tsx"
git commit -m "feat(motion): 800ms skeleton delay on reflect timeframe chip change per spec §1.12"
```

---

## Task 10: Tab layout — screen-in animation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

Spec §1.6: Tab content swaps via `pt-screen-in` keyed by `${flow}-${tab}`. In expo-router, add `animation: 'fade'` to `screenOptions`. For a translateY(6px)→0 + opacity effect, use a custom `animationDuration` and the `FadeIn` entering preset from Reanimated on each tab screen's root `Animated.View`.

- [ ] **Step 1: Add `animation` to Tabs screenOptions**

In `app/(tabs)/_layout.tsx`, update `screenOptions`:

```tsx
screenOptions={{
  headerShown: false,
  animation: 'fade',        // pt-screen-in equivalent
  animationDuration: 280,
  tabBarStyle: {
    backgroundColor: c.background,
    borderTopWidth: 0,
    elevation: 0,
    paddingTop: 10,
    paddingBottom: 10,
    height: 64,
  },
  tabBarActiveTintColor: c.textBright,
  tabBarInactiveTintColor: c.textSecondary,
  tabBarShowLabel: false,
}}
```

Note: expo-router uses `animation` and `animationDuration` from React Navigation under the hood. `'fade'` gives opacity-only; for the slight translateY(6px) we'd need a custom native interpolator which is out of scope — fade is the closest expo-router native option.

- [ ] **Step 2: Verify no tab bar animation (icon stays instant)**

The tab bar icons use `tabBarActiveTintColor` / `tabBarInactiveTintColor` — these are instant color changes with no transition, which is correct per spec §1.6.

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat(motion): 280ms fade screen-in on tab navigation per spec §1.6"
```

---

## Task 11: Chat — send bubble fade-up + failed bubble

**Files:**
- Modify: `components/social/MessageBubble.tsx`
- Modify: `components/social/ChatInput.tsx`

Spec §1.10: New message bubble appears via `pt-fade-up` 240ms (not spring scale). For offline failed sends, show a failed bubble at right side: amber-bordered, "✕ Failed · tap to retry".

- [ ] **Step 1: Update `MessageBubble` entrance animation**

Replace the spring scale+opacity entrance with a fade-up:

```tsx
// In MessageBubble, replace the useEffect:
useEffect(() => {
  const delay = Math.min(index * 30, 200);
  opacity.value = withDelay(delay, withTiming(1, { duration: 240, easing: Easing.out(Easing.ease) }));
  translateY.value = withDelay(delay, withTiming(0, { duration: 240, easing: Easing.out(Easing.ease) }));
}, []);

// Add translateY shared value:
const translateY = useSharedValue(12);

// Update initial opacity to 0:
const opacity = useSharedValue(0);

// animatedStyle:
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ translateY: translateY.value }],
}));
```

Remove the `scale` shared value entirely.

- [ ] **Step 2: Add `failed` prop support to `MessageBubble`**

```tsx
interface MessageBubbleProps {
  // ...existing
  failed?: boolean;
  onRetry?: () => void;
}
```

In the render, after the message content, add:

```tsx
{failed && isOwn && (
  <Pressable onPress={onRetry} style={styles.retryRow}>
    <Text variant="xs" style={{ color: colors.dark.warn }}>
      ✕ Failed · tap to retry
    </Text>
  </Pressable>
)}
```

And update the bubble border style:

```tsx
const bubbleStyle = {
  ...existingBubbleStyle,
  ...(failed ? { borderWidth: 1, borderColor: colors.dark.warn, backgroundColor: 'transparent' } : {}),
};
```

- [ ] **Step 3: Update `ChatInput` — remove send button scale animation**

Per spec rule 0, no scale on press. In `ChatInput.tsx`, remove the `sendButtonScale.value = withSpring(0.8...)` block in `handleSend`. The send button scale animation on press-in/out violates the spec. Keep only the show/hide animation based on `hasMessage`.

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "chat\|message\|error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add components/social/MessageBubble.tsx components/social/ChatInput.tsx
git commit -m "feat(motion): bubble fade-up 240ms, failed bubble state, no scale-on-press per spec §1.10"
```

---

## Task 12: Onboarding — page indicator pill

**Files:**
- Modify: `app/(onboarding)/index.tsx`

Spec §1.14: Active dot = 22×6 pill; inactive = 6×6. Width transitions 240ms ease.

- [ ] **Step 1: Find the page indicator in `app/(onboarding)/index.tsx`**

Search for the dot/indicator render. It likely uses `StyleSheet` `width` based on active state.

- [ ] **Step 2: Create an animated `PageDot` component inline**

Add a local component near the top of the onboarding file:

```tsx
function PageDot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 22 : 6);

  useEffect(() => {
    width.value = withTiming(active ? 22 : 6, { duration: 240, easing: Easing.ease });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
  }));

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
```

Then render the indicator row using this component instead of static dots.

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "onboard\|error" | head -10
```

- [ ] **Step 4: Commit**

```bash
git add "app/(onboarding)/index.tsx"
git commit -m "feat(motion): onboarding page indicator pill 22×6 active, 240ms ease per spec §1.14"
```

---

## Task 13: Reduced motion pass

**Files:**
- Modify: `components/ui/LoadingScreen.tsx` (already done in Task 2)
- Modify: `components/ui/Toast.tsx` (already uses timing — acceptable)
- Modify: `components/ui/Skeleton.tsx`
- Modify: `components/ui/BottomSheet.tsx`
- Modify: `components/SentenceCounter.tsx`

Spec §0: Honor `prefers-reduced-motion: reduce`. Disable splash juggle, loading loops. Modals still open (functional) but with duration 0.

- [ ] **Step 1: Add reduced motion to `Skeleton`**

In the `Skeleton` component's `useEffect`:

```tsx
const reduced = useReducedMotion();
useEffect(() => {
  if (reduced) {
    opacity.value = 0.5; // static midpoint, no loop
    return;
  }
  opacity.value = withRepeat(
    withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );
}, [reduced]);
```

Import `useReducedMotion` from `@/hooks/useReducedMotion`.

- [ ] **Step 2: Add reduced motion to `BottomSheet`**

```tsx
const reduced = useReducedMotion();

useEffect(() => {
  const dur = reduced ? 0 : 280;
  const outDur = reduced ? 0 : 220;
  if (visible) {
    backdropOpacity.value = withTiming(1, { duration: reduced ? 0 : 180, easing: EASE_OUT });
    translateY.value = withTiming(0, { duration: dur, easing: BRAND });
  } else {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: outDur, easing: BRAND });
    backdropOpacity.value = withTiming(0, { duration: outDur, easing: EASE_OUT });
  }
}, [visible, reduced]);
```

- [ ] **Step 3: Add reduced motion to `SentenceCounter`**

```tsx
const reduced = useReducedMotion();
useEffect(() => {
  const dur = reduced ? 0 : 300;
  if (isOver) {
    advisoryOpacity.value = withTiming(1, { duration: dur, easing: EASE_OUT });
    advisoryY.value = withTiming(0, { duration: dur, easing: EASE_OUT });
  } else {
    advisoryOpacity.value = withTiming(0, { duration: reduced ? 0 : 150, easing: EASE_OUT });
    advisoryY.value = withTiming(12, { duration: reduced ? 0 : 150, easing: EASE_OUT });
  }
}, [isOver, reduced]);
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Skeleton.tsx components/ui/BottomSheet.tsx components/SentenceCounter.tsx
git commit -m "feat(motion): honor prefers-reduced-motion in Skeleton, BottomSheet, SentenceCounter per spec §0"
```

---

---

## Task 14: Settings — toggle switch 180ms ease

**Files:**
- Modify: `app/(tabs)/settings.tsx`

Spec §1.7: Toggle 44×26px. Off→On: background and thumb transition 180ms ease. React Native's built-in `<Switch>` component accepts `ios_backgroundColor` and `trackColor` / `thumbColor` but not duration control. The spec visual (dark fill → bright, thumb slides) is handled by native Switch on iOS — it already animates. No custom implementation is needed unless targeting Android parity. To ensure the 180ms timing matches the spec's intent on both platforms, wrap the native Switch in a custom animated component only if the native animation is noticeably faster/slower than 180ms.

- [ ] **Step 1: Read how Switch is used in `app/(tabs)/settings.tsx`**

```bash
grep -n "Switch\|toggle\|Toggle" "app/(tabs)/settings.tsx" | head -20
```

- [ ] **Step 2: Verify native Switch timing on iOS is acceptable**

On iOS, `<Switch>` animates ~200ms natively — close to 180ms spec. Accept this. No custom implementation needed.

On Android, the native Switch animates ~120ms. If Android parity is required, wrap with a custom `AnimatedSwitch`:

```tsx
// Inline component in settings.tsx if needed for Android:
function AnimatedSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const track = useSharedValue(value ? 1 : 0);
  const EASE = Easing.bezier(0.16, 1, 0.3, 1);
  const c = colors.dark;

  useEffect(() => {
    track.value = withTiming(value ? 1 : 0, { duration: 180, easing: EASE });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(track.value, [0, 1], [c.frame, c.textBright]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(track.value, [0, 1], [2, 18]) }],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={8}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View style={[styles.switchThumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switchTrack: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center' },
  switchThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#0a0a0a',
    position: 'absolute',
  },
});
```

Only implement `AnimatedSwitch` if native Switch timing is visually wrong on device.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat(motion): settings toggle — verify/accept native 180ms animation per spec §1.7"
```

---

## Task 15: Social — friend accept/reject animations

**Files:**
- Modify: `app/(tabs)/social.tsx` (or wherever friend requests are rendered)

Spec §1.9: Accept → request row disappears immediately, new friend slides in via `pt-fade-up` 300ms at top of list. Reject → row disappears immediately, no animation.

- [ ] **Step 1: Read the social screen**

```bash
cat "app/(tabs)/social.tsx" | head -120
```

- [ ] **Step 2: Find the friend request accept handler and add optimistic animation**

Locate where the "accept" button triggers. After the optimistic state update, the friend list should re-render with the new friend at the top. The `pt-fade-up` happens naturally via `MessageBubble`-style logic if each friend card enters with:

In the friend card component (or `FriendCard.tsx`), add an entering animation when `isNew` prop is passed:

```tsx
// In components/social/FriendCard.tsx, add entering prop:
interface FriendCardProps {
  // ...existing
  isNew?: boolean;
}

// In the return:
<Animated.View
  entering={isNew ? FadeInUp.duration(300) : undefined}
  style={styles.container}
>
```

In the social screen, when a friend is accepted, add them with `isNew: true`. The flag can be cleared after 500ms to avoid re-animating on re-render.

- [ ] **Step 3: Verify reject has no animation**

Confirm that when "reject" is pressed, the row is removed from state immediately with no transition. If the current implementation uses a FlatList, the item just unmounts — no animation needed.

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep -i "social\|friend\|error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/social.tsx" components/social/FriendCard.tsx
git commit -m "feat(motion): friend accept fade-up 300ms, reject instant per spec §1.9"
```

---

## Task 16: Offline state — amber banner + wifi icon

**Files:**
- Modify: `app/(tabs)/_layout.tsx` (or wherever the status bar lives)

Spec §1.15: When `prefs.online` flips false, an amber banner appears above the status bar via `pt-fade-up` 200ms. Content: "Offline · drafts saved locally". Wifi icon swaps instantly.

- [ ] **Step 1: Check if `prefs.online` state exists**

```bash
grep -r "online\|offline\|network" store/ hooks/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -20
```

- [ ] **Step 2: Add a network status hook if missing**

If no network detection exists, add to `hooks/useNetworkStatus.ts`:

```ts
// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsub;
  }, []);
  return isConnected;
}
```

Note: `@react-native-community/netinfo` must be installed if not already:
```bash
npx expo install @react-native-community/netinfo
```

- [ ] **Step 3: Add `OfflineBanner` component in `_layout.tsx`**

```tsx
// Add inline to app/(tabs)/_layout.tsx:
function OfflineBanner({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(-8);
  const EASE_OUT = Easing.out(Easing.ease);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200, easing: EASE_OUT });
      y.value = withTiming(0, { duration: 200, easing: EASE_OUT });
    } else {
      opacity.value = withTiming(0, { duration: 200, easing: EASE_OUT });
      y.value = withTiming(-8, { duration: 200, easing: EASE_OUT });
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[bannerStyles.container, style]}>
      <Text family="monoMedium" variant="xs" uppercase style={{ color: '#F59E0B', letterSpacing: 1 }}>
        · Offline · drafts saved locally
      </Text>
    </Animated.View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.2)',
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 100,
  },
});
```

Use `useNetworkStatus()` in `TabLayout` to control `visible`.

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/_layout.tsx" hooks/useNetworkStatus.ts
git commit -m "feat(motion): offline banner fade-up 200ms per spec §1.15"
```

---

## Sign-off checklist (mobile)

Manually verify these before marking the branch ready:

- [ ] Splash: three dots juggle with overshoot, wordmark fades in at ~950ms, CTAs at ~2400ms
- [ ] `prefers-reduced-motion` set: splash shows static dots, no skeleton loop, modals open instantly
- [ ] Type 3 sentences → submit: toast "STREAK +1 · LOCKED" appears, auto-dismisses at 2400ms
- [ ] Type 4 sentences: counter goes amber, advisory fades up 300ms
- [ ] Open a BottomSheet: backdrop blurs, sheet slides up 280ms, tap backdrop dismisses
- [ ] Select a CategoryChip: color flips in 120ms, no scale
- [ ] Switch between tabs: content fades in 280ms, icons change color instantly
- [ ] AI Reflect: change timeframe chip → skeleton 800ms → content
- [ ] Send a chat message: bubble slides up 240ms, no scale
- [ ] Skeleton components pulse in sync at 1400ms
- [ ] Onboarding: active dot is 22×6 pill, width animates on slide change
- [ ] Settings toggles: 180ms native or custom animation
- [ ] Accept a friend request: row disappears, new friend slides up 300ms
- [ ] Reject a friend request: row disappears instantly, no animation
- [ ] Toggle offline mode: amber banner fades up 200ms above tabs; wifi icon swaps instantly
