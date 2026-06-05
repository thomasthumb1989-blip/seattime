import { useFonts } from 'expo-font';
import {
  Outfit_700Bold,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@/theme/theme-provider';
import { AppErrorBoundary } from '@src/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@src/contexts/AuthContext';
import { SyncProvider } from '@src/hooks/useFirestoreSync';
import { hasCompletedOnboarding } from '@src/hooks/useOnboarding';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Outfit_700Bold,
    Outfit_600SemiBold,
    DMSans_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

function RootLayoutInner() {
  const { user, loading: authLoading, isSkipped } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const completed = await hasCompletedOnboarding();
        setNeedsOnboarding(!completed);
      } catch {
        setNeedsOnboarding(true);
      }
      setOnboardingChecked(true);
    }
    check();
  }, []);

  useEffect(() => {
    if (onboardingChecked && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [onboardingChecked, authLoading]);

  useEffect(() => {
    if (!onboardingChecked || authLoading) return;

    if (needsOnboarding) {
      router.replace('/onboarding' as any);
    } else if (!user && !isSkipped) {
      router.replace('/auth' as any);
    }
  }, [onboardingChecked, authLoading, needsOnboarding, user, isSkipped]);

  if (!onboardingChecked || authLoading) return null;

  return (
    <SyncProvider>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="auth"
            options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="drive"
            options={{ headerShown: false, gestureEnabled: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="drive-complete"
            options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </SyncProvider>
  );
}
