import { addHabit } from '@/store/habits';
import { THREE_HABITS_ERROR } from '@/types/tracking';

jest.mock('@/config/supabase', () => {
  const selectChain = {
    is: jest.fn(() => ({ order: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
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
  it('maps 23505 to the three-habit message', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(addHabit('Read')).rejects.toThrow(THREE_HABITS_ERROR);
  });
});
