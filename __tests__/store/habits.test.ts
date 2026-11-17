import { addHabit } from '@/store/habits';
import { THREE_HABITS_ERROR } from '@/types/tracking';

let mockRead: { data: unknown; error: unknown } = { data: [], error: null };

jest.mock('@/config/supabase', () => {
  const selectChain = {
    is: jest.fn(() => ({ order: jest.fn(() => Promise.resolve(mockRead)) })),
  };
  return {
    supabase: {
      auth: { getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'u' } } }, error: null })) },
      from: jest.fn(() => ({
        select: jest.fn(() => selectChain),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { code: '23505' } })),
          })),
        })),
      })),
    },
  };
});

describe('addHabit', () => {
  beforeEach(() => {
    mockRead = { data: [], error: null };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('maps 23505 to the three-habit message', async () => {
    await expect(addHabit('Read')).rejects.toThrow(THREE_HABITS_ERROR);
  });
  it('a failed habits read asks to check the connection, not "three habits"', async () => {
    mockRead = { data: null, error: { message: 'Network request failed' } };
    await expect(addHabit('Read')).rejects.toThrow(
      'Could not add that habit. Check your connection.',
    );
  });
});
