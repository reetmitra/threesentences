import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedPatterns, getPatterns } from '@/store/patterns';

let mockRpc: jest.Mock;

jest.mock('@/config/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

const ROWS = [{ date: '2026-03-01', has_entry: true, mood: 4, habit_answers: { h1: true } }];
const MAPPED = [{ date: '2026-03-01', hasEntry: true, mood: 4, answers: { h1: true } }];

describe('patterns store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockRpc = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('writes the cache on success', async () => {
    mockRpc.mockResolvedValue({ data: ROWS, error: null });
    expect(await getPatterns('2026-03-01', '2026-03-01')).toEqual(MAPPED);
    expect(mockRpc).toHaveBeenCalledWith('get_patterns', { p_from: '2026-03-01', p_to: '2026-03-01' });
    expect(await getCachedPatterns('2026-03-01', '2026-03-01')).toEqual(MAPPED);
  });

  it('returns cache when the RPC fails', async () => {
    mockRpc.mockResolvedValueOnce({ data: ROWS, error: null });
    await getPatterns('2026-03-01', '2026-03-01');
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    expect(await getPatterns('2026-03-01', '2026-03-01')).toEqual(MAPPED);
  });

  it('throws when the RPC fails and nothing is cached', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getPatterns('2026-03-01', '2026-03-01')).rejects.toThrow("Couldn't load your patterns.");
    expect(await getCachedPatterns('2026-03-01', '2026-03-01')).toBeNull();
  });
});
