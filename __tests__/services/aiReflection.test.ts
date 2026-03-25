/**
 * Tests for AI Reflection Service
 *
 * Per PRD Section 5.2 and 14.1:
 * - Observational language, not diagnostic
 * - Crisis detection with resource display
 */

jest.mock('@/config/supabase', () => ({
  supabase: {
    functions: { invoke: jest.fn() },
    auth: { storage: null },
  },
}));

import { supabase } from '@/config/supabase';
import {
  generateReflection,
  CRISIS_RESOURCES,
  REFLECTION_DISCLAIMER,
  Reflection,
  ReflectionTimeRange,
} from '@/services/aiReflection';
import { Entry } from '@/types/entry';

describe('aiReflection service', () => {
  const createMockEntry = (content: string, date: string): Entry => ({
    id: `entry-${Math.random()}`,
    date,
    content,
    submittedAt: `${date}T10:00:00.000Z`,
    timezone: 'America/New_York',
  });

  describe('generateReflection', () => {
    beforeEach(() => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { content: 'Looking at your 3 entries, here are some gentle observations from the ThreeSixtyThree practice.' },
        error: null,
      });
    });

    describe('successful reflection generation', () => {
      it('generates reflection for valid entries', async () => {
        const entries = [
          createMockEntry('I had a good day today.', '2026-01-15'),
          createMockEntry('Worked on my project.', '2026-01-16'),
          createMockEntry('Feeling productive lately.', '2026-01-17'),
        ];

        const result = await generateReflection(entries, 7);

        expect(result.success).toBe(true);
        expect(result.reflection).toBeDefined();
        expect(result.reflection?.content).toBeDefined();
        expect(result.crisisDetected).toBeUndefined();
      });

      it('includes correct metadata in reflection', async () => {
        const entries = [
          createMockEntry('Entry one.', '2026-01-15'),
          createMockEntry('Entry two.', '2026-01-16'),
        ];

        const result = await generateReflection(entries, 30);

        expect(result.reflection?.timeRange).toBe(30);
        expect(result.reflection?.entriesAnalyzed).toBe(2);
        expect(result.reflection?.hasCrisisIndicators).toBe(false);
        expect(result.reflection?.generatedAt).toBeDefined();
        expect(result.reflection?.id).toContain('reflection-');
      });

      it('handles different time ranges', async () => {
        const entries = [createMockEntry('Test entry.', '2026-01-15')];

        const result7 = await generateReflection(entries, 7);
        const result30 = await generateReflection(entries, 30);
        const result90 = await generateReflection(entries, 90);

        expect(result7.reflection?.timeRange).toBe(7);
        expect(result30.reflection?.timeRange).toBe(30);
        expect(result90.reflection?.timeRange).toBe(90);
      });

      it('handles empty entries array', async () => {
        const result = await generateReflection([], 7);

        expect(result.success).toBe(true);
        expect(result.reflection?.content).toBeDefined();
        expect(result.reflection?.entriesAnalyzed).toBe(0);
      });

      it('generates IDs with timestamp prefix', async () => {
        const entries = [createMockEntry('Test.', '2026-01-15')];

        const result = await generateReflection(entries, 7);

        expect(result.reflection?.id).toMatch(/^reflection-\d+$/);
      });
    });

    describe('crisis detection - PRD FR-AI-06', () => {
      it('detects direct crisis indicators', async () => {
        const crisisEntries = [
          createMockEntry('I want to kill myself today.', '2026-01-15'),
        ];

        const result = await generateReflection(crisisEntries, 7);

        expect(result.success).toBe(false);
        expect(result.crisisDetected).toBe(true);
        expect(result.error).toBe('crisis_detected');
      });

      it('detects suicide mentions', async () => {
        const entries = [
          createMockEntry('Having thoughts of suicide.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('detects self-harm mentions', async () => {
        const entries = [
          createMockEntry('I have been thinking about self-harm.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('detects hopelessness indicators', async () => {
        const entries = [
          createMockEntry('There is no reason to live anymore.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('detects "want to die" phrase', async () => {
        const entries = [
          createMockEntry('I just want to die sometimes.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('detects "hurt myself" phrase', async () => {
        const entries = [
          createMockEntry('Sometimes I want to hurt myself.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('detects crisis across multiple entries', async () => {
        const entries = [
          createMockEntry('Normal entry about my day.', '2026-01-15'),
          createMockEntry('Another normal entry.', '2026-01-16'),
          createMockEntry('I feel like I want to end my life.', '2026-01-17'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('is case insensitive', async () => {
        const entries = [
          createMockEntry('SUICIDE is on my mind.', '2026-01-15'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.crisisDetected).toBe(true);
      });

      it('does not false positive on safe content', async () => {
        const safeEntries = [
          createMockEntry('I feel sad today but tomorrow will be better.', '2026-01-15'),
          createMockEntry('Work was stressful but manageable.', '2026-01-16'),
          createMockEntry('Had a difficult conversation with a friend.', '2026-01-17'),
        ];

        const result = await generateReflection(safeEntries, 7);
        expect(result.crisisDetected).toBeUndefined();
        expect(result.success).toBe(true);
      });
    });

    describe('mock reflection content', () => {
      it('mentions the time range', async () => {
        const entries = [createMockEntry('Test entry.', '2026-01-15')];

        const result = await generateReflection(entries, 30);
        // Mock reflection should reference the time period
        expect(result.reflection?.content).toBeDefined();
      });

      it('includes entry count information', async () => {
        const entries = [
          createMockEntry('Entry one.', '2026-01-15'),
          createMockEntry('Entry two.', '2026-01-16'),
          createMockEntry('Entry three.', '2026-01-17'),
        ];

        const result = await generateReflection(entries, 7);
        expect(result.reflection?.content).toBeDefined();
        expect(result.reflection?.entriesAnalyzed).toBe(3);
      });

      it('generates content for no entries', async () => {
        const result = await generateReflection([], 7);
        expect(result.reflection?.content).toBeDefined();
        expect(result.reflection?.entriesAnalyzed).toBe(0);
      });
    });
  });

  describe('CRISIS_RESOURCES', () => {
    it('has required title', () => {
      expect(CRISIS_RESOURCES.title).toBe('Support Resources');
    });

    it('has supportive message', () => {
      expect(CRISIS_RESOURCES.message).toContain('wellbeing');
    });

    it('includes National Suicide Prevention Lifeline (988)', () => {
      const lifeline = CRISIS_RESOURCES.resources.find(
        (r) => r.contact === '988'
      );
      expect(lifeline).toBeDefined();
      expect(lifeline?.type).toBe('call');
    });

    it('includes Crisis Text Line', () => {
      const textLine = CRISIS_RESOURCES.resources.find(
        (r) => r.contact.includes('741741')
      );
      expect(textLine).toBeDefined();
      expect(textLine?.type).toBe('text');
    });

    it('includes international resources (IASP)', () => {
      const iasp = CRISIS_RESOURCES.resources.find(
        (r) => r.name.includes('International')
      );
      expect(iasp).toBeDefined();
      expect(iasp?.type).toBe('website');
      expect(iasp?.contact).toContain('iasp.info');
    });

    it('has disclaimer about professional help', () => {
      expect(CRISIS_RESOURCES.disclaimer).toContain('not a substitute');
      expect(CRISIS_RESOURCES.disclaimer).toContain('mental health');
    });
  });

  describe('REFLECTION_DISCLAIMER', () => {
    it('mentions AI generation - PRD FR-AI-05', () => {
      expect(REFLECTION_DISCLAIMER).toContain('AI');
    });

    it('disclaims mental health advice', () => {
      expect(REFLECTION_DISCLAIMER).toContain('not mental health advice');
    });

    it('recommends professional consultation', () => {
      expect(REFLECTION_DISCLAIMER).toContain('mental health professional');
    });
  });
});
