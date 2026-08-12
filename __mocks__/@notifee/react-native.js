const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

const TriggerType = {
  TIMESTAMP: 0,
  INTERVAL: 1,
};

const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  LOW: 2,
  MIN: 1,
  NONE: 0,
};

const EventType = {
  PRESS: 1,
  DISMISSED: 2,
};

const scheduledNotificationsMap = new Map();

const notifee = {
  createChannel: jest.fn().mockImplementation(async (channel) => channel.id),
  getNotificationSettings: jest.fn().mockResolvedValue({
    authorizationStatus: AuthorizationStatus.AUTHORIZED,
  }),
  requestPermission: jest.fn().mockResolvedValue({
    authorizationStatus: AuthorizationStatus.AUTHORIZED,
  }),
  createTriggerNotification: jest.fn().mockImplementation(async (notification, trigger) => {
    scheduledNotificationsMap.set(notification.id, { notification, trigger });
    return notification.id;
  }),
  cancelNotification: jest.fn().mockImplementation(async (id) => {
    scheduledNotificationsMap.delete(id);
  }),
  cancelAllNotifications: jest.fn().mockImplementation(async () => {
    scheduledNotificationsMap.clear();
  }),
  getTriggerNotificationIds: jest.fn().mockImplementation(async () => {
    return Array.from(scheduledNotificationsMap.keys());
  }),
  onForegroundEvent: jest.fn().mockReturnValue(() => {}),
  onBackgroundEvent: jest.fn(),
  getInitialNotification: jest.fn().mockResolvedValue(null),
};

export { AuthorizationStatus, TriggerType, AndroidImportance, EventType };
export default notifee;
