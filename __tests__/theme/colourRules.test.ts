/**
 * Source guards for the two colour rules of the design review:
 *  1. Words are never set in textTertiary (1.7:1). It is for non-text marks.
 *  2. Moonlight ("kept") appears only on the surfaces that mean "kept".
 */
import * as fs from 'fs';
import * as path from 'path';

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

describe('textTertiary never sets words', () => {
  // `color: …textTertiary` (a text style) or a placeholder colour. Icons use the
  // `color={…}` prop and fills use backgroundColor, so they do not match.
  const wordUse = /(\bcolor:|placeholderTextColor=\{)[^,}\n]*textTertiary/;

  it('has no text style or placeholder in textTertiary (disabled calendar days are exempt)', () => {
    const offenders: string[] = [];
    for (const f of files) {
      fs.readFileSync(path.join(ROOT, f), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (wordUse.test(line) && !line.includes('// disabled')) offenders.push(`${f}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });

  it('maps Text color="tertiary" to the readable tier', () => {
    const text = fs.readFileSync(path.join(ROOT, 'components/ui/Text.tsx'), 'utf8');
    expect(text).toMatch(/tertiary:\s*activeColors\.textSecondary/);
  });
});

describe('moonlight means "kept" and nothing else', () => {
  // Habit ✓, calendar dots/rings, habit grid, 363 progress. Never chrome, mood, errors or buttons.
  const allowed = [
    'components/Calendar.tsx',
    'components/HabitCheckList.tsx',
    'components/StreakCounter.tsx',
    'components/patterns/HabitGrid.tsx',
  ].map((f) => path.normalize(f));

  it('is referenced only by the kept surfaces', () => {
    const users = files.filter((f) => /\.moon\b/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
    expect(users.map(path.normalize).sort()).toEqual([...allowed].sort());
  });
});
