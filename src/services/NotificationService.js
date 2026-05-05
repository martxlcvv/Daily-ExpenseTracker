import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expense-reminders', {
      name: 'Expense Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  return finalStatus === 'granted';
};

export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  try {
    // Cancel existing reminders first
    await cancelDailyReminder();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Expense Reminder',
        body: "Don't forget to log your expenses for today!",
        sound: false,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return identifier;
  } catch (e) {
    console.error('NotificationService.scheduleDailyReminder error:', e);
    return null;
  }
};

export const cancelDailyReminder = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content?.data?.type === 'daily_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (e) {
    console.error('NotificationService.cancelDailyReminder error:', e);
  }
};

export const sendInstantNotification = async (title, body) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: false },
      trigger: null,
    });
  } catch (e) {
    console.error('NotificationService.sendInstantNotification error:', e);
  }
};

const NotificationService = {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendInstantNotification,
};

export default NotificationService;