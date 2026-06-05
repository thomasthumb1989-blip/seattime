import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import { Copy, Share2, X } from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useSync } from '@src/hooks/useFirestoreSync';

const F = Strings.FAMILY;

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InviteModal({ visible, onClose }: InviteModalProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const { generateInvite } = useSync();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && !code) {
      setLoading(true);
      generateInvite()
        .then((c) => setCode(c))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (!visible) {
      setCode('');
      setCopied(false);
    }
  }, [visible, code, generateInvite]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join my family on SeatTime! Use invite code: ${code}`,
      });
    } catch {
      // cancelled
    }
  }, [code]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={theme} style={StyleSheet.absoluteFill} />
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.content, { backgroundColor: colors.bg }]}
        >
          <View style={styles.header}>
            <Heading variant="h2">{F.INVITE_TITLE}</Heading>
            <Pressable onPress={onClose} hitSlop={16}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <BodyText secondary style={styles.subtitle}>{F.INVITE_SUBTITLE}</BodyText>

          <View style={[styles.codeContainer, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '08' }]}>
            {loading ? (
              <BodyText secondary>{F.INVITE_GENERATING}</BodyText>
            ) : (
              <Heading
                variant="metric"
                color={colors.primary}
                style={styles.codeText}
              >
                {code.split('').join(' ')}
              </Heading>
            )}
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleCopy}
              style={[styles.btn, styles.secondaryBtn, { borderColor: colors.primary }]}
              disabled={!code}
            >
              <Copy size={18} color={colors.primary} />
              <BodyText color={colors.primary} style={styles.btnLabel}>
                {copied ? F.INVITE_COPIED : F.INVITE_COPY}
              </BodyText>
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={[styles.btn, styles.primaryBtn, { backgroundColor: colors.primary }]}
              disabled={!code}
            >
              <Share2 size={18} color="#FFFFFF" />
              <BodyText style={styles.shareBtnLabel}>{F.INVITE_SHARE}</BodyText>
            </Pressable>
          </View>

          <BodyText variant="caption" secondary style={styles.expiryNote}>
            {F.INVITE_EXPIRES}
          </BodyText>
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
  codeContainer: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 88,
  },
  codeText: {
    fontSize: 42,
    letterSpacing: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtn: {
    borderWidth: 1.5,
  },
  primaryBtn: {},
  btnLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  shareBtnLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  expiryNote: {
    textAlign: 'center',
  },
});
