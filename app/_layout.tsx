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
import { hasCompletedOnboarding } from '@src/hooks/useOnboarding';

export {
  ErrorBoundary,
} from 'expo-router';

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
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const completed = await hasCompletedOnboarding();
        setNeedsOnboarding(!completed);
      } catch {
        setNeedsOnboarding(true);
      }
      setOnboardingChecked(true);
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loaded && onboardingChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, onboardingChecked]);

  useEffect(() => {
    if (loaded && onboardingChecked && needsOnboarding) {
      router.replace('/onboarding' as any);
    }
  }, [loaded, onboardingChecked, needsOnboarding]);

  if (!loaded || !onboardingChecked) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
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
  );
}
