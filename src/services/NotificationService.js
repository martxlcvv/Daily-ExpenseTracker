/**
 * NotificationService.js — Improved
 * Features:
 *   • requestNotificationPermissions
 *   • scheduleDailyReminder (configurable hour)
 *   • cancelDailyReminder
 *   • scheduleShoppingReminder (for due-date items)
 *   • schedulePaymentReminder (for planned payments)
 *   • cancelAllNotifications
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DAILY_REMINDER_ID_KEY = 'daily_reminder';

const NotificationService = {
  /**
   * Request permission. Returns true if granted.
   */
  async requestNotificationPermissions() {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Schedule a daily reminder at a given hour (0–23) and minute.
   * Cancels any existing daily reminder first.
   */
  async scheduleDailyReminder(hour = 20, minute = 0) {
    try {
      await this.cancelDailyReminder();

      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_REMINDER_ID_KEY,
        content: {
          title: '💰 Daily Ledger Reminder',
          body:  "Don't forget to log today's expenses!",
          data:  { type: 'daily_reminder' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      return true;
    } catch (e) {
      console.error('scheduleDailyReminder error:', e);
      return false;
    }
  },

  /**
   * Cancel the daily reminder notification.
   */
  async cancelDailyReminder() {
    try {
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID_KEY);
    } catch (_) {
      // may not exist, ignore
    }
  },

  /**
   * Schedule a one-time reminder for a shopping item due date.
   * @param {object} item  — { id, name, dueDate (ISO string) }
   */
  async scheduleShoppingReminder(item) {
    if (!item.dueDate) return;
    try {
      const due = new Date(item.dueDate);
      // Remind at 9:00 AM on the due date
      due.setHours(9, 0, 0, 0);
      if (due <= new Date()) return; // already past

      await Notifications.scheduleNotificationAsync({
        identifier: `shopping_${item.id}`,
        content: {
          title: '🛒 Shopping Reminder',
          body:  `Don't forget: ${item.name} is due today!`,
          data:  { type: 'shopping', itemId: item.id },
        },
        trigger: { date: due },
      });
    } catch (e) {
      console.error('scheduleShoppingReminder error:', e);
    }
  },

  /**
   * Schedule a payment due reminder.
   * @param {object} payment  — { id, title, dueDate (YYYY-MM-DD or 'No date') }
   */
  async schedulePaymentReminder(payment) {
    if (!payment.dueDate || payment.dueDate === 'No date') return;
    try {
      const due = new Date(payment.dueDate);
      due.setHours(8, 0, 0, 0);
      if (due <= new Date()) return;

      await Notifications.scheduleNotificationAsync({
        identifier: `payment_${payment.id}`,
        content: {
          title: '📅 Planned Payment Due',
          body:  `"${payment.title}" is due today!`,
          data:  { type: 'payment', paymentId: payment.id },
        },
        trigger: { date: due },
      });
    } catch (e) {
      console.error('schedulePaymentReminder error:', e);
    }
  },

  /**
   * Cancel notification for a specific shopping item.
   */
  async cancelShoppingReminder(itemId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`shopping_${itemId}`);
    } catch (_) {}
  },

  /**
   * Cancel notification for a specific payment.
   */
  async cancelPaymentReminder(paymentId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`payment_${paymentId}`);
    } catch (_) {}
  },

  /**
   * Cancel ALL scheduled notifications.
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('cancelAllNotifications error:', e);
    }
  },

  /**
   * Get all currently scheduled notifications (for debugging / display).
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (_) {
      return [];
    }
  },

  /**
   * Send an immediate local notification (e.g. after wallet update).
   */
  async sendInstantNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger:  null, // fire immediately
      });
    } catch (e) {
      console.error('sendInstantNotification error:', e);
    }
  },
};

export default NotificationService;