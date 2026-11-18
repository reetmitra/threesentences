import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPatternsCache, getCachedPatterns, getPatterns } from '@/store/patterns';
import { buildRange, monthRange } from '@/types/patterns';

let mockRpc: jest.Mock;
let mockUserId: string | null;

jest.mock('@/config/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const ROWS = [{ date: '2026-03-01', has_entry: true, mood: 4, habit_answers: { h1: true } }];
const MAPPED = [{ date: '2026-03-01', hasEntry: true, mood: 4, answers: { h1: true } }];
const FAIL = { data: null, error: { message: 'boom' } };

describe('patterns store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockRpc = jest.fn();
    mockUserId = 'user-a';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('writes the cache on success', async () => {
    const r = buildRange('2026-03-10', 7);
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    expect(await getPatterns(mockUserId, r.from, r.to)).toEqual(MAPPED);
    expect(mockRpc).toHaveBeenCalledWith('get_patterns', { p_from: '2026-03-04', p_to: '2026-03-10' });
    expect(await getCachedPatterns(mockUserId, r.from, r.to)).toEqual(MAPPED);
  });

  it('returns cache when the RPC fails', async () => {
    const r = buildRange('2026-03-10', 30);
    mockRpc.mockResolvedValueOnce({ data: ROWS, error: null });
    await getPatterns(mockUserId, r.from, r.to);
    mockRpc.mockResolvedValueOnce(FAIL);
    expect(await getPatterns(mockUserId, r.from, r.to)).toEqual(MAPPED);
  });

  it('throws when the RPC fails and nothing is cached', async () => {
    const r = buildRange('2026-03-10', 30);
    mockRpc.mockResolvedValue(FAIL);
    await expect(getPatterns(mockUserId, r.from, r.to)).rejects.toThrow("Couldn't load your patterns.");
    expect(await getCachedPatterns(mockUserId, r.from, r.to)).toBeNull();
  });

  it('keeps one key per user and slot as the days move on, and ignores an older day in it', async () => {
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    const day1 = buildRange('2026-03-10', 30);
    const day2 = buildRange('2026-03-11', 30);
    const march = monthRange(2026, 3);
    await getPatterns(mockUserId, day1.from, day1.to);
    await getPatterns(mockUserId, day2.from, day2.to);
    await getPatterns(mockUserId, march.from, march.to);
    expect([...(await AsyncStorage.getAllKeys())].sort()).toEqual([
      '@threesentences/patterns/user-a/m2026-03',
      '@threesentences/patterns/user-a/r30',
    ]);
    // The r30 slot now holds day 2's range: day 1's request gets no cache.
    expect(await getCachedPatterns(mockUserId, day1.from, day1.to)).toBeNull();
    expect(await getCachedPatterns(mockUserId, day2.from, day2.to)).toEqual(MAPPED);
    mockRpc.mockResolvedValue(FAIL);
    await expect(getPatterns(mockUserId, day1.from, day1.to)).rejects.toThrow("Couldn't load your patterns.");
  });

  it("never serves one user's cache to another", async () => {
    const r = buildRange('2026-03-10', 7);
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    await getPatterns(mockUserId, r.from, r.to);
    mockUserId = 'user-b';
    expect(await getCachedPatterns(mockUserId, r.from, r.to)).toBeNull();
    mockRpc.mockResolvedValue(FAIL);
    await expect(getPatterns(mockUserId, r.from, r.to)).rejects.toThrow("Couldn't load your patterns.");
    expect(await AsyncStorage.getAllKeys()).toEqual(['@threesentences/patterns/user-a/r7']);
  });

  it('neither reads nor writes the cache when signed out', async () => {
    const r = buildRange('2026-03-10', 7);
    mockUserId = null;
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    expect(await getPatterns(mockUserId, r.from, r.to)).toEqual(MAPPED);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('ignores a cached value whose days are not a list', async () => {
    const r = buildRange('2026-03-10', 7);
    await AsyncStorage.setItem(
      '@threesentences/patterns/user-a/r7',
      JSON.stringify({ from: r.from, to: r.to, days: { bad: true } }),
    );
    expect(await getCachedPatterns(mockUserId, r.from, r.to)).toBeNull();
  });

  it('clears only patterns keys on sign-out', async () => {
    const r = buildRange('2026-03-10', 7);
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    await getPatterns(mockUserId, r.from, r.to);
    await AsyncStorage.setItem('@threesentences/draft', 'keep');
    await clearPatternsCache();
    expect(await AsyncStorage.getAllKeys()).toEqual(['@threesentences/draft']);
  });
});
