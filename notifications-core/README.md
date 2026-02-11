# Notifications Core (Expo)

Small, copyable TypeScript module to register Expo push notifications.

## Files

- NotificationAdapter.ts
- usePushNotifications.ts
- index.ts

## Dependencies

Install in your target app:

```bash
npx expo install expo-notifications expo-device expo-constants
```

If you use Supabase for tokens:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

## Required config

Make sure your app config has the EAS project ID:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }

Optional notifications plugin config (recommended for production if you need icon/colors):

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#bd93f9",
          "sounds": ["./assets/sounds/custom-sound.wav"]
        }
      ]
    ]
  }
}
```
  }
}
```

## Usage

```tsx
import { usePushNotifications } from './notifications-core';

export const AppRoot = ({ userId }: { userId?: string }) => {
  usePushNotifications(userId, {
    onToken: async (token) => {
      // Send token to your backend
      console.log('Push token:', token);
    },
  });

  return null;
};
```

## Notes

- Push tokens only work on physical devices.
- For Android, the default notification channel is created automatically.
- Android notification icon must be a white-on-transparent PNG. Android tints the non-transparent pixels.
- The notification color sets the accent tint (use your brand hex).

## Step 1 - Setup inicial

Before writing complex code, install the official libraries to talk to the OS and backend.

1. Install dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

Why these libraries?

- expo-notifications: handles reception, permissions, and listeners.
- expo-device: detect physical device (push tokens do not work on simulators).
- supabase-js: DB and Auth client.
- AsyncStorage: secure local persistence on mobile. On web, prefer localStorage.

Important: Web support

AsyncStorage is the standard for React Native (mobile), but on web it is not always the default or most optimized choice.
For a robust architecture, isolate storage in a core/storage module and use a platform check to switch between:

- Mobile -> @react-native-async-storage/async-storage
- Web -> localStorage

We already provide a storage adapter example in this repo under core/storage.

## Step 2 - Arquitectura del proyecto (sin UI)

Separating business logic, UI, and external services keeps push notifications scalable.

Data flow overview:

- User app: Expo app with google-services.json (Android) to authenticate with FCM.
- Supabase: stores user tokens and triggers events (Postgres triggers/Edge Functions).
- Expo Push Service: intermediary to deliver notifications without direct Apple/Google setup.
- Credentials and config:
  - eas.json defines build profiles.
  - Credentials: Apple .p8 and Google Service Account uploaded to Expo.

Folder structure (core-only focus, no UI components):

```text
src/
  app/                          # Presentation layer
    (auth)/
      login.tsx
      register.tsx
    (tabs)/
      feed.tsx
      profile.tsx
    _layout.tsx                 # Global providers
    entry.tsx
  lib/
    core/                       # App-agnostic utilities
      constants/
        theme.ts
        layout.ts
      notifications/            # Push infrastructure
        notification.adapter.ts
        usePushNotifications.ts
      storage/
        storage.adapter.ts
      supabase/
        client.supabase.ts
    modules/                    # Feature logic
      auth/
        AuthProvider.tsx
        auth.service.ts
```

Storage adapter (web vs mobile):

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const storageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};
```

Supabase client:

```ts
import { createClient } from '@supabase/supabase-js';
import { storageAdapter } from '../storage/storage.adapter';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Where to find these credentials:

- Supabase Dashboard -> Settings -> API.
- Project URL: copy to EXPO_PUBLIC_SUPABASE_URL.
- anon public key: copy to EXPO_PUBLIC_SUPABASE_ANON_KEY.
- Never expose service_role_key in the frontend.

Add them to a .env file at project root and restart the dev server so process.env loads them.

## Step 3 - Gestion de autenticacion

Push notifications are personal. You need a user session to map a device token to a user.

Token (device) + Session (user) = personalized notifications.

Create an auth context so you do not call the API on every screen.

Example AuthProvider:

```tsx
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../core/supabase/client.supabase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

Wrap your root layout:

```tsx
import { AuthProvider } from '../lib/modules/auth/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

Then, in any component where you need the user id:

```ts
const { session } = useAuth();
const userId = session?.user.id;
```

## Step 4a - Adaptador (infraestructura)

Before business logic, we need the "dirty" code that talks to APNs/FCM.

What this file does:

- Configures notification behavior (sound, alerts).
- Configures Android channels (vibration, LED color).
- Manages OS permissions.
- Gets the Expo push token.

Example adapter:

```ts
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export const NotificationAdapter = {
  setup: () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  },

  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push permission denied by the user.');
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;
    } else {
      console.log('Push requires a physical device.');
    }

    return token || null;
  },
};
```

Android channels:

- Since Android 8.0, notifications must belong to a channel.
- Users can mute specific channels (marketing vs shipments).

Simulators:

- This will return null on iOS/Android simulators.
- Test on a real device or use Expo push testing tools.

## Step 4b - Hook (logica de negocio)

Now that the adapter is ready, the hook orchestrates registration and persists the token in Supabase.

Example hook:

```ts
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../../core/supabase/client.supabase';
import { NotificationAdapter } from '../../core/notifications/notification.adapter';

NotificationAdapter.setup();

export const usePushNotifications = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    const register = async () => {
      const token = await NotificationAdapter.registerForPushNotificationsAsync();

      if (token) {
        console.log('Token obtained:', token);
        await saveTokenToDatabase(token, userId);
      }
    };

    register();
  }, [userId]);
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
    console.error('Error saving device:', error);
  } else {
    console.log('Device registered in Supabase.');
  }
}
```

End-to-end flow:

- Root layout mounts and calls usePushNotifications(session?.user.id).
- If a session exists, the hook calls the adapter.
- The adapter requests permissions.
- Expo returns a token.
- The hook stores the token in the devices table.

## Step 4c - Implementacion global

Plug the hook at the highest level of your authenticated app, usually the main layout.

Example in root layout:

```tsx
import { usePushNotifications } from '@/lib/modules/notifications/usePushNotifications';
import { AuthProvider, useAuth } from '@/lib/modules/auth/AuthProvider';
import { Stack } from 'expo-router';

function AuthLayout() {
  const { session } = useAuth();
  const userId = session?.user.id;

  usePushNotifications(userId);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  );
}
```

Why here?

- The registration runs as soon as the app loads.
- No extra settings screen is needed (set-and-forget experience).

Execution flow:

1. App starts -> layout mounts.
2. Auth provider loads the session.
3. usePushNotifications(userId) receives the id.
4. Hook calls Expo, gets token, stores it in Supabase.

## Step 5 - Backend magia (SQL)

Automate push sending with database functions and HTTP. Flow:

DB insert -> trigger -> function -> Expo API -> device

1) Tables: profiles + devices

Run in Supabase SQL editor:

```sql
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text,
  last_name text,
  updated_at timestamp with time zone
);

create table public.devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  token text not null,
  platform text,
  last_used_at timestamp with time zone default now()
);

create index devices_user_id_idx on public.devices(user_id);
```

2) Function to send a notification

Enable the http extension, then create a function that grabs the latest device token:

```sql
create extension if not exists http with schema extensions;

create or replace function public.send_push_notification(
  target_user_id uuid,
  title text,
  body text,
  data jsonb default '{}'::jsonb
) returns void as $$
declare
  user_token text;
begin
  select token into user_token
  from public.devices
  where user_id = target_user_id
  order by last_used_at desc
  limit 1;

  if user_token is null then
    return;
  end if;

  perform extensions.http((
    'POST',
    'https://exp.host/--/api/v2/push/send',
    ARRAY[http_header('Content-Type', 'application/json')],
    'application/json',
    jsonb_build_object(
      'to', user_token,
      'title', title,
      'body', body,
      'data', data,
      'sound', 'default'
    )::text
  ));
end;
$$ language plpgsql security definer;
```

3) Automatic trigger

Send a welcome notification whenever a new profile is created:

```sql
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  perform public.send_push_notification(
    new.id,
    'New user!',
    new.first_name || ' joined the app.',
    jsonb_build_object('screen', 'profile')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
after insert on public.profiles
for each row execute procedure public.handle_new_profile();
```

Now, every new profile insert triggers a notification.

## Step 5b - Registro de usuarios

Goal: validate the backend trigger by registering a user.

Expected chain:

- Create user in Supabase Auth + profile row.
- Client registers the push token in devices.
- Trigger sends a welcome notification.

Basic register screen:

```tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { supabase } from '../../lib/core/supabase/client.supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user?.id,
          email: user?.email,
          first_name: 'Usuario',
          last_name: 'Nuevo',
        },
      ]);

      if (profileError) {
        console.error('Error creando perfil:', profileError);
      }

      Alert.alert('Exito', 'Usuario creado. Espera tu notificacion...');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Crear Cuenta (Test)</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 4 }}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contrasena"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 8, borderRadius: 4 }}
      />

      <Button
        title={loading ? 'Registrando...' : 'Crear Cuenta'}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}
```

## Step 8 - Proteccion de rutas (auth)

Use expo-router and useAuth to prevent unauthenticated users from seeing private screens.

Guard the root layout:

```tsx
import { usePushNotifications } from '@/lib/modules/notifications/usePushNotifications';
import { AuthProvider, useAuth } from '@/lib/modules/auth/AuthProvider';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

function AuthLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const userId = session?.user.id;
  usePushNotifications(userId);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  );
}
```

About segments:

useSegments() returns the current route segments array. For example, /app/(auth)/login becomes ['(auth)', 'login'].
This lets you detect whether the user is already in the auth group before redirecting, avoiding loops.

## Step 9 - Credenciales y Firebase

To deliver notifications to real Android devices (production or dev builds), you must set up Firebase and link credentials with EAS.

1) Package name

Define a unique Android package in app.json:

```json
{
  "expo": {
    "android": {
      "package": "com.usuario.pushmaster",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

2) Firebase console

- Create a Firebase project.
- Add an Android app and use the exact same package name.
- Download google-services.json and place it at the project root.

3) Security: .gitignore vs .easignore

Keep secrets out of git, but allow EAS to upload them during build.

.gitignore:

```gitignore
node_modules/
.env
google-services.json
service-account.json
```

.easignore (create if missing):

```gitignore
!google-services.json
!service-account.json
```

This keeps the files out of GitHub but allows EAS builds to access them.

4) Upload credentials to EAS

Run:

```bash
eas credentials
```

Follow the wizard:

- Android -> production (or your profile)
- Choose Google Service Account Key for FCM V1
- Create a service account in Google Cloud (Firebase Admin SDK role), download the JSON, upload it
- Confirm google-services.json is configured

## Step 10 - EAS development build

Set up a development environment compatible with EAS Update (using bun).

1) Global setup

```bash
bun install -g eas-cli && eas login
```

2) Install dev client dependencies

```bash
bunx expo install expo-dev-client expo-updates
```

3) Configure eas.json

Generate a base config:

```bash
eas build:configure
```

Example eas.json:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Example with env:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.staging.example.com"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

4) Secrets for sensitive env vars

Option A (web):

- Expo.dev -> Configuration -> Secrets -> Create.
- Add SUPABASE_ANON_KEY (or any secret).

Option B (CLI):

```bash
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "tu-clave-secreta" --type string
```

5) app.json updates

```json
{
  "expo": {
    "plugins": ["expo-router", "expo-updates"],
    "updates": {
      "url": "https://u.expo.dev/TU-PROJECT-ID",
      "enabled": true
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

Project ID:

- It is generated when you run EAS commands.
- If missing, run:

```bash
eas init
```

This writes expo.extra.eas.projectId in app.json.

6) Build the dev client

```bash
eas build --profile development
```

## Step 11 - Testing manual y personalizacion

Before production, test notifications manually with the official Expo tool.

1) Official testing tool

Use the Expo Push Tool and paste the ExponentPushToken from your app logs:

https://expo.dev/notifications

2) The testing triad

Verify all three app states:

- Foreground: app open and visible. The notification does not show in the system tray by default, handle it with an in-app alert or toast.
- Background: app minimized. Notification should appear in the system tray and open the app when tapped.
- Killed: app swiped away. The OS should deliver the message and open the app if applicable.

3) Notification recipe (payload)

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Oferta Relampago",
  "body": "Tu descuento del 50% expira en 1 hora. Toca para reclamar.",
  "sound": "default",
  "priority": "high",
  "badge": 1,
  "data": {
    "url": "/products/promo-50",
    "coupon": "FLASH50"
  },
  "channelId": "default",
  "categoryId": "promo"
}
```

Key fields:

- data: invisible payload for deep linking or actions.
- sound: "default" or a custom sound (requires native config).
- badge: app icon badge number (iOS).

Android channels:

- On Android 8.0+, if you set channelId, you must create it in code with Notifications.setNotificationChannelAsync.

## Step 7 - Debugging y consejos finales

If notifications are not arriving, use this checklist.

Permission handling errors:

- If getPermissionsAsync returns undetermined or denied, are you on a simulator? iOS Simulator does not receive basic push notifications. Use a physical device or Android emulator.
- Verify eas.projectId is correctly set in app.json.

Supabase 403/400 on token insert:

- Check RLS policies. The user should be able to update their own profile.

```sql
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);
```

Android channels:

- If you do not define a channel with MAX importance, notifications may not vibrate or sound.

There are more steps to add after this section.
