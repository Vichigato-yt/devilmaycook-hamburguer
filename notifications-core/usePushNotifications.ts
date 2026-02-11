import { useEffect } from 'react';
import { NotificationAdapter } from './NotificationAdapter';

export type UsePushNotificationsOptions = {
  enabled?: boolean;
  projectId?: string;
  onToken?: (token: string) => void | Promise<void>;
};

export const usePushNotifications = (
  userId?: string,
  options: UsePushNotificationsOptions = {}
) => {
  const { enabled, projectId, onToken } = options;
  const shouldRun = enabled ?? Boolean(userId);

  useEffect(() => {
    if (!shouldRun) return;

    NotificationAdapter.setup();

    const register = async () => {
      const token = await NotificationAdapter.registerForPushNotificationsAsync({
        projectId,
      });

      if (token && onToken) {
        await onToken(token);
      }
    };

    register();
  }, [shouldRun, projectId, onToken]);
};
