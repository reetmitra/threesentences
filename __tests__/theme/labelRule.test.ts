/**
 * The label rule from the design review (§5): mono is for time and counts.
 * One tracked uppercase line per screen, the dateline. Anything a person reads
 * as a sentence or a heading is set in Schibsted (UI) or Newsreader (entries).
 *
 * New uppercase or mono usage fails here on purpose: if it really is a clock or
 * a counter, add the file below with a reason; otherwise set it in sentence case.
 */
import * as fs from 'fs';
import * as path from 'path';
import { TypeStyle } from '@/theme/typography';

const ROOT = path.resolve(__dirname, '../..');

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...sourceFiles(rel));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const files = ['app', 'components'].flatMap(sourceFiles);
const read = (f: string) => fs.readFileSync(path.join(ROOT, f), 'utf8');

describe('tracked uppercase lines', () => {
  const upper = /\buppercase\b|textTransform:\s*'uppercase'/;
  // file -> number of lines allowed to set uppercase, and why.
  const allowed: Record<string, number> = {
    'app/(tabs)/index.tsx': 2, // the dateline, in the writing state and in the done state
    'components/patterns/DayDetail.tsx': 1, // the selected day's date
    'components/EntryCard.tsx': 1, // an entry's date header
    'components/ui/LoadingScreen.tsx': 1, // splash tagline (brand moment, not a label)
    'components/social/MessageBubble.tsx': 1, // failed-send marker (replace with an Icon later)
    'components/DailyRules.tsx': 2, // not rendered anywhere today
  };

  it('appears only on datelines and the listed brand moments', () => {
    const found: Record<string, number> = {};
    for (const f of files) {
      if (f === path.normalize('components/ui/Text.tsx')) continue; // defines the prop itself
      const n = read(f).split('\n').filter((l) => upper.test(l)).length;
      if (n > 0) found[path.normalize(f)] = n;
    }
    const want: Record<string, number> = {};
    for (const [f, n] of Object.entries(allowed)) want[path.normalize(f)] = n;
    expect(found).toEqual(want);
  });
});

describe('mono face', () => {
  const mono = /family="mono|IBMPlexMono_/;
  // Files that may set text in mono, all for time or counts.
  const allowed = [
    'app/(auth)/interests.tsx', // "3 of 3+ selected"
    'app/(auth)/profile-setup.tsx', // bio length counter
    'app/(tabs)/chat/[id].tsx', // message times
    'app/(tabs)/index.tsx', // dateline
    'app/(tabs)/social.tsx', // tab count badges
    'app/_layout.tsx', // font loading
    'components/Calendar.tsx', // weekday initials on the grid
    'components/EntryCard.tsx', // date and time
    'components/ReflectionCard.tsx', // date and range badge
    'components/SentenceCounter.tsx', // the counter
    'components/StreakCounter.tsx', // x/363 figure
    'components/patterns/DayDetail.tsx', // the selected day's date
    'components/patterns/HabitGrid.tsx', // done/answered counts
    'components/social/MessageBubble.tsx', // failed-send marker
    'components/ui/Text.tsx', // the family type itself
  ].map((f) => path.normalize(f));

  it('is used only for time and counts', () => {
    const users = files.filter((f) => mono.test(read(f))).map((f) => path.normalize(f));
    expect(users.sort()).toEqual([...allowed].sort());
  });
});

describe('type tokens', () => {
  it('has no style below the 11pt floor', () => {
    for (const [name, style] of Object.entries(TypeStyle)) {
      expect({ name, size: style.fontSize }).toEqual({ name, size: expect.any(Number) });
      expect(style.fontSize).toBeGreaterThanOrEqual(11);
    }
  });
});
