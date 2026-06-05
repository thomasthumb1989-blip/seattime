import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Check, MapPin, X } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors, type AppColors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { STATE_REQUIREMENTS } from '@src/data/stateRequirements';
import type { StateRequirement } from '@src/types';

const S = Strings.ONBOARDING;

interface StatePickerModalProps {
  visible: boolean;
  currentState: string;
  onSelect: (abbreviation: string) => void;
  onClose: () => void;
}

export function StatePickerModal({
  visible,
  currentState,
  onSelect,
  onClose,
}: StatePickerModalProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentState);

  const filtered = STATE_REQUIREMENTS.filter(
    (s) =>
      s.state.toLowerCase().includes(search.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect(selected);
    setSearch('');
    onClose();
  }, [selected, onSelect, onClose]);

  const handleClose = useCallback(() => {
    setSelected(currentState);
    setSearch('');
    onClose();
  }, [currentState, onClose]);

  const renderItem = useCallback(
    ({ item }: { item: StateRequirement }) => {
      const isSelected = selected === item.abbreviation;
      return (
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelected(item.abbreviation);
          }}
          style={[
            styles.stateRow,
            {
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
            },
          ]}
        >
          <View style={styles.stateInfo}>
            <BodyText style={{ fontWeight: '500' }}>{item.state}</BodyText>
            <BodyText variant="caption" secondary>
              {item.hasRequirement
                ? `${item.totalHours} ${S.STATE_HOURS_LABEL}`
                : S.STATE_NO_REQUIREMENT}
            </BodyText>
          </View>
          {isSelected && (
            <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </Pressable>
      );
    },
    [selected, colors]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={theme} style={StyleSheet.absoluteFill} />
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.content, { backgroundColor: colors.bg }]}
        >
          <View style={styles.header}>
            <Heading variant="h2">{Strings.SETTINGS.CHANGE_STATE}</Heading>
            <Pressable onPress={handleClose} hitSlop={16}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.searchContainer, { borderColor: colors.border }]}>
            <MapPin size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={S.STATE_SEARCH_PLACEHOLDER}
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.abbreviation}
            renderItem={renderItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          <Pressable
            onPress={handleConfirm}
            style={[styles.confirmBtn, { backgroundColor: colors.primary, opacity: selected ? 1 : 0.4 }]}
            disabled={!selected}
          >
            <BodyText style={styles.confirmText}>{S.STATE_CONTINUE}</BodyText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  list: {
    marginBottom: 16,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  stateInfo: {
    flex: 1,
    gap: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
