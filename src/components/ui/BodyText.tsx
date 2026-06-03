import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@src/constants/colors';
import {
  useFonts,
  DMSans_400Regular,
} from '@expo-google-fonts/dm-sans';

type BodyTextVariant = 'body' | 'caption';

interface BodyTextProps {
  children: React.ReactNode;
  variant?: BodyTextVariant;
  secondary?: boolean;
  style?: TextStyle;
  color?: string;
  numberOfLines?: number;
}

export function BodyText({
  children,
  variant = 'body',
  secondary = false,
  style,
  color,
  numberOfLines,
}: BodyTextProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
  });

  const variantStyles: Record<BodyTextVariant, TextStyle> = {
    body: {
      fontFamily: fontsLoaded ? 'DMSans_400Regular' : undefined,
      fontWeight: fontsLoaded ? undefined : '400',
      fontSize: 16,
    },
    caption: {
      fontFamily: fontsLoaded ? 'DMSans_400Regular' : undefined,
      fontWeight: fontsLoaded ? undefined : '400',
      fontSize: 13,
    },
  };

  const textColor = color ?? (secondary ? colors.textSecondary : colors.text);

  return (
    <Text
      style={[variantStyles[variant], { color: textColor }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
