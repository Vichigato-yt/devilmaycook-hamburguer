import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let isSetup = false;

export type RegisterPushOptions = {
  projectId?: string;
};

export type NotificationData = {
  url?: string;
  [key: string]: unknown;
};

/**
 * Adaptador de infraestructura para notificaciones push.
 * Gestiona permisos, canales Android, obtención de tokens Expo,
 * y envío local de notificaciones de prueba.
 */
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

    // Crear canal Android de forma temprana para que las notificaciones
    // locales programadas funcionen incluso con la app cerrada.
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    isSetup = true;
  },

  registerForPushNotificationsAsync: async (
    options: RegisterPushOptions = {}
  ): Promise<string | null> => {
    let token: string | null = null;

    // Android 8.0+ requiere un canal de notificaciones
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

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
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
      await Notifications.getExpoPushTokenAsync({
        projectId: resolvedProjectId,
      })
    ).data;

    return token;
  },

  /**
   * Programa una notificación local para testing.
   * Útil para probar foreground/background/killed sin backend.
   */
  scheduleLocalNotification: async (options: {
    title: string;
    body: string;
    data?: NotificationData;
    seconds?: number;
  }) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        sound: 'default',
        data: options.data ?? {},
        ...(Platform.OS === 'android' ? { channelId: 'default', priority: Notifications.AndroidNotificationPriority.MAX } : {}),
      },
      trigger: options.seconds
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: options.seconds }
        : null,
    });
  },

  /** Listeners para las suscripciones de notificaciones */
  addNotificationReceivedListener: Notifications.addNotificationReceivedListener,
  addNotificationResponseReceivedListener: Notifications.addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync: Notifications.getLastNotificationResponseAsync,
};
