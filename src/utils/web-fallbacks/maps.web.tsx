import React from 'react';
import { View, Text, type ViewProps } from 'react-native';

export function MapView(props: ViewProps) {
  return (
    <View style={[{ backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }, props.style]}>
      <Text>Map unavailable on web</Text>
    </View>
  );
}

export const Marker = () => null;
export const Polyline = () => null;

export default MapView;
