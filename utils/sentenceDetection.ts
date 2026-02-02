/**
 * ThreeSixtyThree™ Three Sentences - Sentence Detection
 * 
 * Accurate sentence counting is critical to the core experience.
 * Per PRD Section 6.2 and 9.1 edge cases.
 */

const ABBREVIATIONS = new Set([
  // Titles
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'rev', 'hon',
  // Business
  'inc', 'ltd', 'corp', 'co', 'llc', 'plc',
  // Latin/common
  'etc', 'vs', 'eg', 'ie', 'al', 'cf', 'viz',
  // Addresses
  'st', 'ave', 'blvd', 'rd', 'apt', 'ste', 'fl',
  // Months
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
  // Time
  'am', 'pm',
  // Measurements
  'oz', 'lb', 'lbs', 'ft', 'in', 'cm', 'mm', 'kg', 'mg', 'ml',
  // Other common
  'no', 'vol', 'pg', 'pp', 'fig', 'approx', 'est', 'govt',
]);

/**
 * Count sentences in text with edge case handling.
 * 
 * Edge cases handled (per PRD Section 9.1):
 * - "I went to Dr. Smith's office." → 1 sentence (abbreviation)
 * - "What?! Really?!" → 2 sentences (each distinct thought)
 * - "I felt... lost." → 1 sentence (ellipsis within sentence)
 * - URLs like "example.com" → excluded from count
 * - Decimals like "3.14" → excluded from count
 */
export function countSentences(text: string): number {
  if (!text?.trim()) return 0;

  let processed = text;

  // ============ Step 1: Remove non-sentence periods ============

  // Remove URLs (http://, https://, and plain domains)
  processed = processed.replace(/https?:\/\/[^\s]+/gi, ' URL_REMOVED ');
  processed = processed.replace(/www\.[^\s]+/gi, ' URL_REMOVED ');
  // Handle plain domains like "example.com" or "test.org"
  processed = processed.replace(/\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|app|dev|ai)\b/gi, ' URL_REMOVED ');

  // Remove email addresses
  processed = processed.replace(/[^\s]+@[^\s]+\.[^\s]+/gi, ' EMAIL_REMOVED ');

  // Remove decimals (3.14, $19.99, etc.)
  processed = processed.replace(/\d+\.\d+/g, ' DECIMAL_REMOVED ');

  // Remove initials like U.S.A. or A.M.
  processed = processed.replace(/\b([A-Z]\.){2,}/g, ' INITIALS_REMOVED ');

  // ============ Step 2: Handle special punctuation ============

  // Handle ellipsis - but only if it ends a sentence (followed by space + capital or end)
  // "I felt... lost." should be 1 sentence, "I felt... Lost!" should be 2
  // For now, treat trailing ellipsis as sentence end, mid-sentence ellipsis as continuation
  processed = processed.replace(/\.{3,}$/g, ' ELLIPSIS_TERMINAL ');
  processed = processed.replace(/\.{3,}(?=\s+[A-Z])/g, ' ELLIPSIS_TERMINAL ');
  // Remove remaining ellipses (mid-sentence)
  processed = processed.replace(/\.{3,}/g, ' ');

  // ============ Step 3: Handle multi-punctuation ============
  
  // "?!" or "!?" combinations count as ONE terminator for THAT sentence
  // But "What?! Really?!" is TWO sentences because there are two distinct phrases
  // Replace ?! or !? with single marker, then count by the structure
  processed = processed.replace(/[?!]+(?=[?!])/g, ''); // Collapse ?!?! to single char
  
  // ============ Step 4: Protect abbreviations ============

  const words = processed.split(/\s+/);
  const protectedWords = words.map(word => {
    // Match word ending with period, possibly followed by more punctuation
    const match = word.match(/^([a-zA-Z]+)\.([^a-zA-Z]*)$/);
    if (match && ABBREVIATIONS.has(match[1].toLowerCase())) {
      return `ABBR_${match[1]}${match[2]}`;
    }
    return word;
  });
  processed = protectedWords.join(' ');

  // ============ Step 5: Count sentence terminators ============

  // Count standard terminators: . ? !
  // Must be followed by whitespace, end of string, or closing punctuation
  const terminators = processed.match(/[.?!](?:\s|$|["')}\]])/g) || [];
  
  // Count ellipsis terminals
  const ellipsisCount = (processed.match(/ELLIPSIS_TERMINAL/g) || []).length;

  return terminators.length + ellipsisCount;
}

/**
 * Check if text has exactly the target number of sentences
 */
export function hasExactSentences(text: string, target: number): boolean {
  return countSentences(text) === target;
}

/**
 * Get sentence count with detailed breakdown for debugging
 */
export function analyzeSentences(text: string): {
  count: number;
  details: string;
} {
  const count = countSentences(text);
  return {
    count,
    details: `Found ${count} sentence${count !== 1 ? 's' : ''} in text of ${text.length} characters.`,
  };
}
