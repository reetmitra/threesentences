import { getLogicalDateString } from '@/types/entry';

const originalTz = process.env.TZ;
beforeAll(() => { process.env.TZ = 'America/New_York'; });
afterAll(() => { process.env.TZ = originalTz; });

it('spring-forward night stays on the previous logical day until 4am', () => {
  expect(getLogicalDateString(new Date(2026, 2, 8, 3, 30), 4)).toBe('2026-03-07');
  expect(getLogicalDateString(new Date(2026, 2, 8, 4, 30), 4)).toBe('2026-03-08');
});
it('fall-back night stays on the previous logical day', () => {
  expect(getLogicalDateString(new Date(2026, 10, 1, 1, 30), 4)).toBe('2026-10-31');
  expect(getLogicalDateString(new Date(2026, 10, 1, 3, 59), 4)).toBe('2026-10-31');
});
