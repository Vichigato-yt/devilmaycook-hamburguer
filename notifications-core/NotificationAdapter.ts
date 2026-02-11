import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let isSetup = false;

export type RegisterPushOptions = {
  projectId?: string;
};

export const NotificationAdapter = {
  setup: () => {
    if (isSetup) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    isSetup = true;
  },

  registerForPushNotificationsAsync: async (
    options: RegisterPushOptions = {}
  ): Promise<string | null> => {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const resolvedProjectId =
      options.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;

    token = (
      await Notifications.getExpoPushTokenAsync({ projectId: resolvedProjectId })
    ).data;

    return token;
  },
};
