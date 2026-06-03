import React from 'react';
import { View, type ViewProps } from 'react-native';

export function BlurView(props: ViewProps & { intensity?: number; tint?: string }) {
  const { intensity: _intensity, tint: _tint, style, ...rest } = props;
  return <View style={[{ backgroundColor: 'rgba(255,255,255,0.8)' }, style]} {...rest} />;
}

export default BlurView;
