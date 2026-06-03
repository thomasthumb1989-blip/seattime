import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';

export default function TabTwoScreen() {
  const background = useColor('background');
  const border = useColor('border');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text variant="title">Tab Two</Text>
      <View style={[styles.separator, { backgroundColor: border }]} />
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
