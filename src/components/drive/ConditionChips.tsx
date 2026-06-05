import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, CloudFog, Home, Route, Trees, ParkingCircle } from 'lucide-react-native';
import { BodyText } from '@src/components/ui/BodyText';
import { Strings } from '@src/constants/strings';
import type { TimeOfDay, Weather, RoadType } from '@src/types';

const S = Strings.DRIVE;

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  tealColor: string;
}

function Chip({ label, selected, onPress, icon, tealColor }: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            borderColor: selected ? tealColor : 'rgba(255,255,255,0.2)',
            backgroundColor: selected ? tealColor + '20' : 'rgba(255,255,255,0.05)',
          },
          animatedStyle,
        ]}
      >
        {icon}
        <BodyText
          style={{
            color: selected ? tealColor : 'rgba(255,255,255,0.7)',
            fontSize: 13,
            fontWeight: '500',
          }}
        >
          {label}
        </BodyText>
      </Animated.View>
    </Pressable>
  );
}

interface ConditionChipsProps {
  timeOfDay: TimeOfDay;
  weather: Weather;
  roadType: RoadType;
  onTimeOfDayChange: (v: TimeOfDay) => void;
  onWeatherChange: (v: Weather) => void;
  onRoadTypeChange: (v: RoadType) => void;
  tealColor: string;
}

export function ConditionChips({
  timeOfDay,
  weather,
  roadType,
  onTimeOfDayChange,
  onWeatherChange,
  onRoadTypeChange,
  tealColor,
}: ConditionChipsProps) {
  const iconSize = 14;
  const iconColor = (selected: boolean) =>
    selected ? tealColor : 'rgba(255,255,255,0.7)';

  return (
    <View style={styles.container}>
      <BodyText style={styles.sectionLabel}>{S.CONDITIONS_LABEL}</BodyText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <Chip
          label={S.TIME_OF_DAY_DAY}
          selected={timeOfDay === 'day'}
          onPress={() => onTimeOfDayChange('day')}
          icon={<Sun size={iconSize} color={iconColor(timeOfDay === 'day')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.TIME_OF_DAY_NIGHT}
          selected={timeOfDay === 'night'}
          onPress={() => onTimeOfDayChange('night')}
          icon={<Moon size={iconSize} color={iconColor(timeOfDay === 'night')} />}
          tealColor={tealColor}
        />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <Chip
          label={S.WEATHER_CLEAR}
          selected={weather === 'clear'}
          onPress={() => onWeatherChange('clear')}
          icon={<Cloud size={iconSize} color={iconColor(weather === 'clear')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.WEATHER_RAIN}
          selected={weather === 'rain'}
          onPress={() => onWeatherChange('rain')}
          icon={<CloudRain size={iconSize} color={iconColor(weather === 'rain')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.WEATHER_SNOW}
          selected={weather === 'snow'}
          onPress={() => onWeatherChange('snow')}
          icon={<CloudSnow size={iconSize} color={iconColor(weather === 'snow')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.WEATHER_FOG}
          selected={weather === 'fog'}
          onPress={() => onWeatherChange('fog')}
          icon={<CloudFog size={iconSize} color={iconColor(weather === 'fog')} />}
          tealColor={tealColor}
        />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <Chip
          label={S.ROAD_RESIDENTIAL}
          selected={roadType === 'residential'}
          onPress={() => onRoadTypeChange('residential')}
          icon={<Home size={iconSize} color={iconColor(roadType === 'residential')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.ROAD_HIGHWAY}
          selected={roadType === 'highway'}
          onPress={() => onRoadTypeChange('highway')}
          icon={<Route size={iconSize} color={iconColor(roadType === 'highway')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.ROAD_RURAL}
          selected={roadType === 'rural'}
          onPress={() => onRoadTypeChange('rural')}
          icon={<Trees size={iconSize} color={iconColor(roadType === 'rural')} />}
          tealColor={tealColor}
        />
        <Chip
          label={S.ROAD_PARKING}
          selected={roadType === 'parking'}
          onPress={() => onRoadTypeChange('parking')}
          icon={<ParkingCircle size={iconSize} color={iconColor(roadType === 'parking')} />}
          tealColor={tealColor}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
});
