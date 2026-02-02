/**
 * ThreeSixtyThree™ Three Sentences - Crisis Resources Card
 * 
 * Displays crisis support resources when indicators are detected.
 * Per PRD FR-AI-06: Crisis detection triggers resource display instead of analysis.
 */

import React from 'react';
import { View, StyleSheet, useColorScheme, Linking, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { CRISIS_RESOURCES } from '@/services/aiReflection';
import { Phone, MessageCircle, Globe } from 'lucide-react-native';

interface CrisisResourcesCardProps {
  onDismiss: () => void;
}

export function CrisisResourcesCard({ onDismiss }: CrisisResourcesCardProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  const handleResourcePress = async (resource: typeof CRISIS_RESOURCES.resources[0]) => {
    try {
      switch (resource.type) {
        case 'call':
          await Linking.openURL(`tel:${resource.contact}`);
          break;
        case 'text':
          // Can't directly open SMS with specific message, just show info
          break;
        case 'website':
          await Linking.openURL(resource.contact);
          break;
      }
    } catch (error) {
      console.error('Failed to open resource:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={20} color={activeColors.textPrimary} />;
      case 'text': return <MessageCircle size={20} color={activeColors.textPrimary} />;
      case 'website': return <Globe size={20} color={activeColors.textPrimary} />;
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.surface }]}>
      {/* Header */}
      <Text variant="xl" weight="bold" style={styles.title}>
        {CRISIS_RESOURCES.title}
      </Text>

      <Text variant="base" color="secondary" style={styles.message}>
        {CRISIS_RESOURCES.message}
      </Text>

      {/* Resources */}
      <View style={styles.resources}>
        {CRISIS_RESOURCES.resources.map((resource, index) => (
          <Pressable
            key={index}
            style={[styles.resourceRow, { backgroundColor: activeColors.surfaceHover }]}
            onPress={() => handleResourcePress(resource)}
            accessibilityRole="button"
            accessibilityLabel={`${resource.name}: ${resource.contact}`}
          >
            <View style={styles.resourceIcon}>
              {getIcon(resource.type)}
            </View>
            <View style={styles.resourceContent}>
              <Text variant="base" weight="medium">
                {resource.name}
              </Text>
              <Text variant="sm" color="secondary">
                {resource.contact}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { borderTopColor: activeColors.border }]}>
        <Text variant="xs" color="tertiary" style={styles.disclaimerText}>
          {CRISIS_RESOURCES.disclaimer}
        </Text>
      </View>

      {/* Dismiss button */}
      <Button
        title="I Understand"
        variant="ghost"
        onPress={onDismiss}
        style={styles.dismissButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing[5],
  },
  title: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[4],
    lineHeight: 24,
  },
  resources: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 8,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  resourceContent: {
    flex: 1,
  },
  disclaimer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing[3],
    marginBottom: spacing[3],
  },
  disclaimerText: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
  dismissButton: {
    marginTop: spacing[2],
  },
});
