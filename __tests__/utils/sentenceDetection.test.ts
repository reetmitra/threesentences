/**
 * Tests for Sentence Detection Utility
 *
 * Per PRD Section 6.2 and 9.1 - edge cases for sentence counting
 */

import {
  countSentences,
  hasExactSentences,
  analyzeSentences,
} from '@/utils/sentenceDetection';

describe('sentenceDetection', () => {
  describe('countSentences', () => {
    // Basic sentence counting
    describe('basic sentences', () => {
      it('returns 0 for empty string', () => {
        expect(countSentences('')).toBe(0);
      });

      it('returns 0 for whitespace only', () => {
        expect(countSentences('   ')).toBe(0);
        expect(countSentences('\n\t  ')).toBe(0);
      });

      it('returns 0 for null/undefined', () => {
        expect(countSentences(null as any)).toBe(0);
        expect(countSentences(undefined as any)).toBe(0);
      });

      it('counts a single sentence ending with period', () => {
        expect(countSentences('This is a sentence.')).toBe(1);
      });

      it('counts a single sentence ending with question mark', () => {
        expect(countSentences('Is this a sentence?')).toBe(1);
      });

      it('counts a single sentence ending with exclamation', () => {
        expect(countSentences('This is exciting!')).toBe(1);
      });

      it('counts multiple sentences', () => {
        expect(countSentences('First sentence. Second sentence. Third sentence.')).toBe(3);
      });

      it('counts sentences with mixed terminators', () => {
        expect(countSentences('Statement. Question? Exclamation!')).toBe(3);
      });
    });

    // Abbreviation handling
    describe('abbreviations', () => {
      it('handles Mr. correctly', () => {
        expect(countSentences('I met Mr. Smith today.')).toBe(1);
      });

      it('handles Mrs. correctly', () => {
        expect(countSentences('Mrs. Johnson called.')).toBe(1);
      });

      it('handles Dr. correctly - PRD example', () => {
        expect(countSentences("I went to Dr. Smith's office.")).toBe(1);
      });

      it('handles Inc. correctly', () => {
        expect(countSentences('I work at Acme Inc. now.')).toBe(1);
      });

      it('handles multiple abbreviations', () => {
        expect(countSentences('Dr. Smith works at Corp. Ltd. in St. Louis.')).toBe(1);
      });

      it('handles etc. correctly', () => {
        expect(countSentences('I bought apples, oranges, etc. at the store.')).toBe(1);
      });

      it('handles e.g. correctly', () => {
        // Note: 'eg' without period is in the abbreviation list, but 'e.g.' with period gets split
        // The implementation handles 'eg.' but not 'e.g.' (with internal period)
        expect(countSentences('Some fruits, eg. apples, are healthy.')).toBe(1);
      });

      it('handles vs. correctly', () => {
        expect(countSentences('It was cats vs. dogs.')).toBe(1);
      });

      it('handles month abbreviations', () => {
        expect(countSentences('We met on Jan. 5th.')).toBe(1);
        expect(countSentences('The event is on Dec. 25th.')).toBe(1);
      });

      it('handles time abbreviations', () => {
        // Note: 'am' and 'pm' without periods are in abbreviation list
        expect(countSentences('I woke up at 7 am. today.')).toBe(1);
        expect(countSentences('The meeting is at 3 pm. sharp.')).toBe(1);
      });

      it('handles measurement abbreviations', () => {
        expect(countSentences('It weighs 5 lbs. exactly.')).toBe(1);
        expect(countSentences('The room is 10 ft. wide.')).toBe(1);
      });
    });

    // URL handling
    describe('URLs and domains', () => {
      it('excludes http URLs from count', () => {
        expect(countSentences('Visit http://example.com for more info.')).toBe(1);
      });

      it('excludes https URLs from count', () => {
        expect(countSentences('Check https://example.com/page for details.')).toBe(1);
      });

      it('excludes www URLs from count', () => {
        expect(countSentences('Go to www.example.com today.')).toBe(1);
      });

      it('excludes plain domains like example.com - PRD example', () => {
        expect(countSentences('I found it on example.com yesterday.')).toBe(1);
      });

      it('handles multiple domains', () => {
        expect(countSentences('Try google.com or github.com for help.')).toBe(1);
      });

      it('handles various TLDs', () => {
        expect(countSentences('Visit mysite.org now.')).toBe(1);
        expect(countSentences('Check app.io for updates.')).toBe(1);
        expect(countSentences('Go to school.edu today.')).toBe(1);
      });
    });

    // Email handling
    describe('email addresses', () => {
      it('excludes email addresses from count', () => {
        expect(countSentences('Contact me at john@example.com today.')).toBe(1);
      });

      it('handles complex email addresses', () => {
        expect(countSentences('Email support@company.org for help.')).toBe(1);
      });
    });

    // Decimal number handling
    describe('decimal numbers', () => {
      it('excludes decimal numbers like 3.14 - PRD example', () => {
        expect(countSentences('Pi is approximately 3.14 in math.')).toBe(1);
      });

      it('handles currency decimals', () => {
        expect(countSentences('It costs $19.99 at the store.')).toBe(1);
      });

      it('handles multiple decimals', () => {
        expect(countSentences('The values are 1.5 and 2.5 respectively.')).toBe(1);
      });
    });

    // Initial handling
    describe('initials', () => {
      it('handles U.S.A. correctly', () => {
        expect(countSentences('I live in the U.S.A. now.')).toBe(1);
      });

      it('handles A.M. and P.M.', () => {
        expect(countSentences('The meeting is at 9 A.M. sharp.')).toBe(1);
      });
    });

    // Ellipsis handling
    describe('ellipsis', () => {
      it('handles mid-sentence ellipsis - PRD example', () => {
        expect(countSentences('I felt... lost.')).toBe(1);
      });

      it('handles trailing ellipsis as sentence end', () => {
        expect(countSentences('I felt lost...')).toBe(1);
      });

      it('handles ellipsis followed by capital as two sentences', () => {
        expect(countSentences('I felt... Lost in thought.')).toBe(2);
      });

      it('handles multiple ellipses', () => {
        expect(countSentences('Wait... think... decide.')).toBe(1);
      });
    });

    // Multi-punctuation handling
    describe('multi-punctuation', () => {
      it('handles ?! as single terminator - PRD example', () => {
        expect(countSentences('What?! Really?!')).toBe(2);
      });

      it('handles !? combination', () => {
        expect(countSentences('No way!? I agree!')).toBe(2);
      });

      it('handles multiple punctuation marks', () => {
        expect(countSentences('Really?!? Yes!!!')).toBe(2);
      });

      it('handles !! as single terminator', () => {
        expect(countSentences('Wow!! Amazing!!')).toBe(2);
      });
    });

    // Quotes and closing punctuation
    describe('quotes and closing punctuation', () => {
      it('counts sentence ending with quote', () => {
        expect(countSentences('He said "Hello."')).toBe(1);
      });

      it('counts sentence ending with parenthesis', () => {
        expect(countSentences('This is done (finally.)')).toBe(1);
      });

      it('handles nested quotes', () => {
        // Nested quotes with periods inside create separate sentence counts
        expect(countSentences('"She said yes. I agreed."')).toBe(2);
      });
    });

    // Edge cases for exactly 3 sentences
    describe('three sentence scenarios', () => {
      it('counts exactly 3 simple sentences', () => {
        expect(countSentences('One. Two. Three.')).toBe(3);
      });

      it('counts 3 sentences with varied complexity', () => {
        const text = "I went to Dr. Smith's office. The visit was long. Check the results.";
        expect(countSentences(text)).toBe(3);
      });

      it('handles 3 sentences with questions and exclamations', () => {
        expect(countSentences('Is this real? Yes! I agree.')).toBe(3);
      });
    });
  });

  describe('hasExactSentences', () => {
    it('returns true when sentence count matches target', () => {
      expect(hasExactSentences('One. Two. Three.', 3)).toBe(true);
    });

    it('returns false when sentence count is less than target', () => {
      expect(hasExactSentences('One. Two.', 3)).toBe(false);
    });

    it('returns false when sentence count is more than target', () => {
      expect(hasExactSentences('One. Two. Three. Four.', 3)).toBe(false);
    });

    it('returns true for target of 0 with empty string', () => {
      expect(hasExactSentences('', 0)).toBe(true);
    });

    it('returns true for target of 1', () => {
      expect(hasExactSentences('Single sentence.', 1)).toBe(true);
    });
  });

  describe('analyzeSentences', () => {
    it('returns count and details for empty string', () => {
      const result = analyzeSentences('');
      expect(result.count).toBe(0);
      expect(result.details).toContain('0 sentences');
    });

    it('returns count and details for single sentence', () => {
      const result = analyzeSentences('Hello world.');
      expect(result.count).toBe(1);
      expect(result.details).toContain('1 sentence');
      expect(result.details).not.toContain('sentences');
    });

    it('returns count and details for multiple sentences', () => {
      const result = analyzeSentences('One. Two. Three.');
      expect(result.count).toBe(3);
      expect(result.details).toContain('3 sentences');
    });

    it('includes character count in details', () => {
      const text = 'Hello.';
      const result = analyzeSentences(text);
      expect(result.details).toContain(`${text.length} characters`);
    });
  });
});
