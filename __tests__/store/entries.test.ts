import { getAllEntries } from '@/store/entries';

const mockRange = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ range: (from: number, to: number) => mockRange(from, to) }),
        }),
      }),
    }),
  },
}));

const row = (i: number) => ({
  id: `e${i}`,
  user_id: 'u1',
  date: '2026-11-18',
  encrypted_content: `entry ${i}`,
  submitted_at: '2026-11-18T12:00:00.000Z',
  timezone: 'UTC',
  created_at: '2026-11-18T12:00:00.000Z',
  updated_at: '2026-11-18T12:00:00.000Z',
});

describe('getAllEntries (export source)', () => {
  beforeEach(() => mockRange.mockReset());

  it('pages past the 1000-row API cap', async () => {
    mockRange
      .mockResolvedValueOnce({ data: Array.from({ length: 1000 }, (_, i) => row(i)), error: null })
      .mockResolvedValueOnce({ data: [row(1000)], error: null });

    const entries = await getAllEntries('u1');

    expect(entries).toHaveLength(1001);
    expect(mockRange).toHaveBeenNthCalledWith(2, 1000, 1999);
  });

  it('throws instead of returning an empty list, so export never shares an empty file', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'network down' } });
    await expect(getAllEntries('u1')).rejects.toEqual({ message: 'network down' });
  });
});
