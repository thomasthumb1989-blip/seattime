import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';
import {
  useFonts,
  Outfit_700Bold,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'metric';

interface HeadingProps {
  children: React.ReactNode;
  variant?: HeadingVariant;
  style?: TextStyle;
  color?: string;
}

export function Heading({ children, variant = 'h1', style, color }: HeadingProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Outfit_600SemiBold,
  });

  const variantStyles: Record<HeadingVariant, TextStyle> = {
    h1: {
      fontFamily: fontsLoaded ? 'Outfit_700Bold' : undefined,
      fontWeight: fontsLoaded ? undefined : '700',
      fontSize: 28,
    },
    h2: {
      fontFamily: fontsLoaded ? 'Outfit_600SemiBold' : undefined,
      fontWeight: fontsLoaded ? undefined : '600',
      fontSize: 22,
    },
    h3: {
      fontFamily: fontsLoaded ? 'Outfit_600SemiBold' : undefined,
      fontWeight: fontsLoaded ? undefined : '600',
      fontSize: 18,
    },
    metric: {
      fontFamily: fontsLoaded ? 'Outfit_700Bold' : undefined,
      fontWeight: fontsLoaded ? undefined : '700',
      fontSize: 48,
    },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: color ?? colors.text },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
