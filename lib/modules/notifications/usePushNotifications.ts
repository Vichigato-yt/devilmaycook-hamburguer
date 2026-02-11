import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import {
    NotificationAdapter,
    type NotificationData,
} from '../../core/notifications/notification.adapter';
import { supabase } from '../../core/supabase/client.supabase';

// Inicializar el handler de notificaciones una sola vez
NotificationAdapter.setup();

/**
 * Navega a la ruta indicada en data.url si existe.
 */
function handleNotificationNavigation(
  data: NotificationData | undefined,
  router: ReturnType<typeof useRouter>
) {
  if (data?.url && typeof data.url === 'string') {
    // Pequeño delay para que el router esté listo (killed state)
    setTimeout(() => {
      router.push(data.url as any);
    }, 500);
  }
}

/**
 * Hook que:
 * 1. Registra el dispositivo y persiste el token en Supabase.
 * 2. Escucha notificaciones en FOREGROUND → muestra Alert in-app.
 * 3. Escucha interacción (tap) en BACKGROUND/KILLED → deep link con data.url.
 * 4. Revisa si la app fue abierta desde una notificación (KILLED state).
 */
export const usePushNotifications = (userId?: string) => {
  const router = useRouter();
  const hasCheckedInitial = useRef(false);

  // ─── Registro del token ───
  useEffect(() => {
    if (!userId) return;

    const register = async () => {
      const token =
        await NotificationAdapter.registerForPushNotificationsAsync();

      if (token) {
        await saveTokenToDatabase(token, userId);
      }
    };

    register();
  }, [userId]);

  // ─── Escenario 1: FOREGROUND ───
  // La app está abierta. Mostramos un Alert in-app con el contenido.
  useEffect(() => {
    const subscription =
      NotificationAdapter.addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;

        Alert.alert(
          title ?? 'Notificación',
          body ?? '',
          [
            { text: 'Cerrar', style: 'cancel' },
            ...(data?.url
              ? [
                  {
                    text: 'Ver',
                    onPress: () =>
                      handleNotificationNavigation(
                        data as NotificationData,
                        router
                      ),
                  },
                ]
              : []),
          ]
        );
      });

    return () => subscription.remove();
  }, [router]);

  // ─── Escenarios 2 y 3: BACKGROUND + KILLED (tap en notificación) ───
  // Se activa cuando el usuario toca la notificación desde la bandeja.
  useEffect(() => {
    const subscription =
      NotificationAdapter.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content
            .data as NotificationData;

          handleNotificationNavigation(data, router);
        }
      );

    return () => subscription.remove();
  }, [router]);

  // ─── Escenario 3 extra: KILLED STATE (cold start) ───
  // Si la app fue abierta desde una notificación estando cerrada,
  // getLastNotificationResponseAsync captura esa respuesta inicial.
  useEffect(() => {
    if (hasCheckedInitial.current) return;
    hasCheckedInitial.current = true;

    NotificationAdapter.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;

      const data = response.notification.request.content
        .data as NotificationData;

      handleNotificationNavigation(data, router);
    });
  }, [router]);
};

async function saveTokenToDatabase(token: string, userId: string) {
  const { error } = await supabase.from('devices').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'token' }
  );

  if (error) {
    console.error('Error guardando dispositivo:', error);
  }
}
