import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car } from 'lucide-react-native';
import { type FirebaseError } from 'firebase/app';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { useAuth } from '@src/contexts/AuthContext';

const S = Strings.AUTH;

function getErrorMessage(error: unknown): string {
  const code = (error as FirebaseError)?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return S.ERROR_EMAIL_IN_USE;
    case 'auth/invalid-email':
      return S.ERROR_INVALID_EMAIL;
    case 'auth/user-not-found':
      return S.ERROR_USER_NOT_FOUND;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return S.ERROR_WRONG_PASSWORD;
    case 'auth/weak-password':
      return S.ERROR_WEAK_PASSWORD;
    default:
      return S.ERROR_GENERIC;
  }
}

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInWithApple, skipAuth } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleEmailAuth = useCallback(async () => {
    if (loading) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(S.ERROR_INVALID_EMAIL);
      return;
    }
    if (password.length < 6) {
      setError(S.ERROR_WEAK_PASSWORD);
      return;
    }

    setError('');
    setLoading(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isSignUp) {
        await signUp(trimmedEmail, password);
      } else {
        await signIn(trimmedEmail, password);
      }
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)' as any);
    } catch (err) {
      setError(getErrorMessage(err));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [email, password, isSignUp, loading, signIn, signUp]);

  const handleApple = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithApple();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)' as any);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== 'ERR_REQUEST_CANCELED') {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [signInWithApple]);

  const handleSkip = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await skipAuth();
    router.replace('/(tabs)' as any);
  }, [skipAuth]);

  const toggleMode = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSignUp((prev) => !prev);
    setError('');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '12' }]}>
              <Car size={48} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Heading variant="h1" style={styles.title}>{S.TITLE}</Heading>
            <BodyText secondary style={styles.subtitle}>{S.SUBTITLE}</BodyText>
          </Animated.View>

          {/* Apple Sign-In (iOS only) */}
          {Platform.OS === 'ios' && (
            <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.appleWrap}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={
                  theme === 'dark'
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={16}
                style={styles.appleButton}
                onPress={handleApple}
              />
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <BodyText variant="caption" secondary style={styles.dividerText}>
                  {S.OR_DIVIDER}
                </BodyText>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>
            </Animated.View>
          )}

          {/* Email/Password Form */}
          <Animated.View
            entering={FadeIn.delay(200).duration(300)}
            style={[styles.form, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder={S.EMAIL_PLACEHOLDER}
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              editable={!loading}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder={S.PASSWORD_PLACEHOLDER}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleEmailAuth}
              editable={!loading}
            />

            {error.length > 0 && (
              <Animated.View entering={FadeIn.duration(200)}>
                <BodyText variant="caption" color={colors.error} style={styles.error}>
                  {error}
                </BodyText>
              </Animated.View>
            )}

            <Pressable
              onPress={handleEmailAuth}
              onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
              onPressOut={() => { btnScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
              disabled={loading}
            >
              <Animated.View
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 },
                  btnStyle,
                ]}
              >
                <BodyText style={styles.primaryBtnText}>
                  {loading
                    ? isSignUp ? S.CREATING_ACCOUNT : S.SIGNING_IN
                    : isSignUp ? S.CREATE_ACCOUNT : S.SIGN_IN}
                </BodyText>
              </Animated.View>
            </Pressable>

            <Pressable onPress={toggleMode} style={styles.toggleBtn} disabled={loading}>
              <BodyText variant="caption" color={colors.primary}>
                {isSignUp ? S.SWITCH_TO_SIGN_IN : S.SWITCH_TO_SIGN_UP}
              </BodyText>
            </Pressable>
          </Animated.View>

          {/* Skip */}
          <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.skipWrap}>
            <Pressable onPress={handleSkip} disabled={loading}>
              <BodyText variant="caption" secondary style={styles.skipText}>
                {S.SKIP_FOR_NOW}
              </BodyText>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  appleWrap: {
    marginBottom: 8,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    textTransform: 'lowercase',
  },
  form: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    textAlign: 'center',
    marginTop: -4,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  skipText: {
    textDecorationLine: 'underline',
  },
});
