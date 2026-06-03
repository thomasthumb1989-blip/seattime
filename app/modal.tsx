import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';

export default function ModalScreen() {
  const background = useColor('background');
  const border = useColor('border');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text variant="title">Modal</Text>
      <View style={[styles.separator, { backgroundColor: border }]} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
