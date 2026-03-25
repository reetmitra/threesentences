/**
 * ThreeSixtyThree™ Three Sentences - AI Reflection Service
 * 
 * Per PRD Section 5.2 and 14.1:
 * - Observational language, not diagnostic
 * - Question-based insights
 * - No mental health diagnoses
 * - Crisis detection with resource display
 */

import { Entry } from '@/types/entry';
import { supabase } from '@/config/supabase';

// ============ Types ============

export interface Reflection {
  id: string;
  generatedAt: string;
  timeRange: ReflectionTimeRange;
  content: string;
  entriesAnalyzed: number;
  hasCrisisIndicators: boolean;
}

export type ReflectionTimeRange = 7 | 30 | 90;

export interface ReflectionResult {
  success: boolean;
  reflection?: Reflection;
  error?: string;
  crisisDetected?: boolean;
}

// ============ Crisis Detection ============

/**
 * Keywords and phrases that may indicate crisis.
 * When detected, show resources instead of analysis (per PRD FR-AI-06).
 */
const CRISIS_INDICATORS = [
  // Direct expressions
  'kill myself', 'end my life', 'want to die', 'don\'t want to live',
  'suicide', 'suicidal', 'self-harm', 'hurt myself',
  // Hopelessness
  'no reason to live', 'better off dead', 'can\'t go on',
  'give up', 'no point', 'no hope',
  // Plans or means
  'overdose', 'pills', 'cut myself', 'jump off',
];

/**
 * Check entries for crisis indicators
 */
function detectCrisis(entries: Entry[]): boolean {
  const allContent = entries.map(e => e.content.toLowerCase()).join(' ');
  return CRISIS_INDICATORS.some(indicator => allContent.includes(indicator));
}

// ============ Crisis Resources ============

export const CRISIS_RESOURCES = {
  title: 'Support Resources',
  message: 'Your wellbeing matters. If you\'re struggling, please reach out to a professional.',
  resources: [
    {
      name: 'National Suicide Prevention Lifeline',
      contact: '988',
      type: 'call',
    },
    {
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      type: 'text',
    },
    {
      name: 'International Association for Suicide Prevention',
      contact: 'https://www.iasp.info/resources/Crisis_Centres/',
      type: 'website',
    },
  ],
  disclaimer: 'This app is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or emergency services immediately.',
};

// ============ AI Prompt Generation ============

/**
 * Generate the system prompt for AI reflection.
 * Per PRD Section 14.1 - AI Reflection Prompt Guidelines.
 */
function generateSystemPrompt(): string {
  return `You are a gentle, observational reflection assistant for the ThreeSixtyThree™ journaling app. 

Your role is to help users notice patterns in their journal entries. Follow these guidelines strictly:

TONE:
- Warm but not effusive
- Supportive but not cheerleading
- Calm and minimalist, aligned with the 363 aesthetic

LANGUAGE RULES:
1. Use OBSERVATIONAL language: "Your entries mention..." NOT "You are feeling..."
2. Use QUESTION-BASED insights: "Is this relationship on your mind?" NOT "You're worried about this relationship."
3. Note patterns over time WITHOUT implying causation: "In the first week you mentioned X; by week three this shifted to Y."
4. NEVER suggest mental health conditions, personality types, or psychological interpretations.
5. NEVER provide diagnoses or treatment recommendations.
6. Keep responses concise - 3-5 short paragraphs maximum.

STRUCTURE:
1. Brief acknowledgment of the time period reviewed
2. 2-3 observational themes you noticed
3. 1-2 gentle questions for reflection
4. A brief, warm closing

Remember: You are a mirror, not a therapist. Reflect what you see without interpretation.`;
}

/**
 * Generate the user prompt with entries
 */
function generateUserPrompt(entries: Entry[], timeRange: ReflectionTimeRange): string {
  const entriesText = entries.map(entry => {
    return `[${entry.date}]: ${entry.content}`;
  }).join('\n\n');

  return `Please provide a gentle reflection on my journal entries from the past ${timeRange} days.

Here are my entries (${entries.length} total):

${entriesText}

Remember to use observational language and avoid any diagnostic statements.`;
}

// ============ Mock AI Response ============

/**
 * Generate a mock AI reflection for demo purposes.
 * In production, this would call an actual AI API.
 */
function generateMockReflection(entries: Entry[], timeRange: ReflectionTimeRange): string {
  if (entries.length === 0) {
    return `Over the past ${timeRange} days, you haven't written any entries. That's completely okay - the ThreeSixtyThree™ philosophy embraces grace for imperfect days.

When you're ready to return, your journal will be here.

"Show up. Do the work. Let go of perfection."`;
  }

  const entryCount = entries.length;
  const dateRange = `${entries[0].date} to ${entries[entries.length - 1].date}`;

  // Extract some simple word patterns for the mock
  const allWords = entries.flatMap(e => 
    e.content.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  );
  const wordFreq = new Map<string, number>();
  allWords.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return `Looking at your ${entryCount} entries from ${dateRange}, here are some gentle observations:

${topWords.length > 0 ? `Your entries seem to touch on themes around "${topWords.join('", "')}" - these words appeared multiple times across your reflections.` : 'Your entries cover a variety of topics without strong repetition.'}

${entryCount >= 5 ? 'You\'ve been showing up consistently, which aligns beautifully with the ThreeSixtyThree™ practice of small, steady actions.' : 'Every entry you\'ve written is a step forward, regardless of how many days you\'ve missed.'}

Some questions to sit with: What felt most true when you wrote these words? Is there something you noticed but didn't write about?

Thank you for sharing these moments with your journal.`;
}

// ============ Main Service Function ============

/**
 * Generate an AI reflection for the given entries.
 * 
 * @param entries - Decrypted entries to analyze
 * @param timeRange - Number of days covered (7, 30, or 90)
 * @returns ReflectionResult with reflection or error
 */
export async function generateReflection(
  entries: Entry[],
  timeRange: ReflectionTimeRange
): Promise<ReflectionResult> {
  try {
    // Check for crisis indicators first (FR-AI-06)
    if (detectCrisis(entries)) {
      return {
        success: false,
        crisisDetected: true,
        error: 'crisis_detected',
      };
    }

    // Call Supabase Edge Function

    const { data, error: fnError } = await supabase.functions.invoke('generate-reflection', {
      body: {
        entries: entries.map(e => ({ date: e.date, content: e.content })),
        timeRange,
      },
    });

    if (fnError || !data?.content) {
      throw new Error(fnError?.message || 'Empty response from AI service');
    }

    const content = data.content;

    const reflection: Reflection = {
      id: `reflection-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      timeRange,
      content,
      entriesAnalyzed: entries.length,
      hasCrisisIndicators: false,
    };

    return {
      success: true,
      reflection,
    };
  } catch (error) {
    console.error('Failed to generate reflection:', error);
    return {
      success: false,
      error: 'Failed to generate reflection. Please try again.',
    };
  }
}

// ============ Disclaimer ============

/**
 * Mandatory disclaimer for all reflections (per PRD FR-AI-05)
 */
export const REFLECTION_DISCLAIMER = 
  'This reflection is generated by AI and is not mental health advice. ' +
  'If you have concerns about your wellbeing, please consult a qualified mental health professional.';
