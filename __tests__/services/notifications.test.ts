/**
 * Tests for the local notification scheduling (wind-down nudge and its neighbours).
 * expo-notifications is the system boundary, so it is mocked; the scheduling rules are real.
 */

import * as Notifications from 'expo-notifications';
import {
  cancelWindDown,
  scheduleDailyReminder,
  scheduleWindDown,
} from '@/services/notifications';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

const schedule = Notifications.scheduleNotificationAsync as jest.Mock;
const cancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  cancel.mockResolvedValue(undefined);
});

describe('scheduleWindDown', () => {
  it('schedules one daily nudge on the hour with its own identifier', async () => {
    await scheduleWindDown(23);
    expect(schedule).toHaveBeenCalledTimes(1);
    const arg = schedule.mock.calls[0][0];
    expect(arg.identifier).toBe('wind-down');
    expect(arg.trigger).toEqual({ type: 'daily', hour: 23, minute: 0 });
  });

  it('replaces the earlier nudge instead of stacking a second one', async () => {
    await scheduleWindDown(22);
    expect(cancel).toHaveBeenCalledWith('wind-down');
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(schedule.mock.invocationCallOrder[0]);
  });

  it('works for midnight (hour 0) and 1am', async () => {
    await scheduleWindDown(0);
    await scheduleWindDown(1);
    expect(schedule.mock.calls.map((c) => c[0].trigger.hour)).toEqual([0, 1]);
  });

  it('is an invitation: no scolding words in the copy', async () => {
    await scheduleWindDown(23);
    const { title, body } = schedule.mock.calls[0][0].content;
    expect(`${title} ${body}`).not.toMatch(/\b(must|should|failed|don't|stop|bad)\b/i);
  });

  it('does not touch the daily reminder or the streak warning', async () => {
    await scheduleWindDown(23);
    expect(cancel).not.toHaveBeenCalledWith('daily-reminder');
    expect(cancel).not.toHaveBeenCalledWith('streak-warning');
  });
});

describe('cancelWindDown', () => {
  it('cancels only the wind-down nudge', async () => {
    await cancelWindDown();
    expect(cancel).toHaveBeenCalledWith('wind-down');
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('ignores a nudge that was never scheduled', async () => {
    cancel.mockRejectedValueOnce(new Error('not found'));
    await expect(cancelWindDown()).resolves.toBeUndefined();
  });
});

describe('the daily reminder is unchanged', () => {
  it('still schedules under its own identifier', async () => {
    await scheduleDailyReminder(20, 0);
    expect(schedule.mock.calls[0][0].identifier).toBe('daily-reminder');
  });
});
