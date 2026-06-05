import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useSync } from '@src/hooks/useFirestoreSync';

const F = Strings.FAMILY;
const CODE_LENGTH = 6;

interface JoinFamilyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function JoinFamilyModal({ visible, onClose }: JoinFamilyModalProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const { joinFamily } = useSync();
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    setCode(cleaned);
    setError('');
  }, []);

  const handleJoin = useCallback(async () => {
    if (code.length !== CODE_LENGTH || loading) return;
    setLoading(true);
    setError('');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await joinFamily(code);
      if (success) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(F.JOIN_TITLE, F.JOIN_SUCCESS);
        setCode('');
        onClose();
      } else {
        setError(F.JOIN_INVALID);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError(F.JOIN_INVALID);
    } finally {
      setLoading(false);
    }
  }, [code, loading, joinFamily, onClose]);

  const handleClose = useCallback(() => {
    setCode('');
    setError('');
    onClose();
  }, [onClose]);

  const codeChars = code.padEnd(CODE_LENGTH, ' ').split('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={theme} style={StyleSheet.absoluteFill} />
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.content, { backgroundColor: colors.bg }]}
        >
          <View style={styles.header}>
            <Heading variant="h2">{F.JOIN_TITLE}</Heading>
            <Pressable onPress={handleClose} hitSlop={16}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <BodyText secondary style={styles.subtitle}>{F.JOIN_SUBTITLE}</BodyText>

          {/* OTP-style input boxes */}
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.codeRow}
          >
            {codeChars.map((char, i) => (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  {
                    borderColor: i === code.length ? colors.primary : colors.border,
                    backgroundColor: char.trim() ? colors.primary + '08' : 'transparent',
                  },
                ]}
              >
                <Heading variant="h2" color={char.trim() ? colors.primary : colors.textSecondary}>
                  {char.trim() || '·'}
                </Heading>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={CODE_LENGTH}
            autoFocus={visible}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />

          {error.length > 0 && (
            <Animated.View entering={FadeIn.duration(200)}>
              <BodyText variant="caption" color={colors.error} style={styles.error}>
                {error}
              </BodyText>
            </Animated.View>
          )}

          <Pressable
            onPress={handleJoin}
            onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
            onPressOut={() => { btnScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
            disabled={code.length !== CODE_LENGTH || loading}
          >
            <Animated.View
              style={[
                styles.joinBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: code.length === CODE_LENGTH && !loading ? 1 : 0.4,
                },
                btnStyle,
              ]}
            >
              <BodyText style={styles.joinBtnText}>
                {loading ? F.INVITE_GENERATING : F.JOIN_BUTTON}
              </BodyText>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    lineHeight: 22,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  error: {
    textAlign: 'center',
    marginBottom: 12,
  },
  joinBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
