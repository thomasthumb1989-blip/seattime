import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  MapPin,
  Users,
  UserPlus,
  FileText,
  Download,
  Sun,
  Moon,
  Smartphone,
  Info,
  Star,
  Mail,
  Trash2,
  RotateCcw,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Loader,
} from 'lucide-react-native';

import { Heading } from '@src/components/ui/Heading';
import { BodyText } from '@src/components/ui/BodyText';
import { SettingsRow } from '@src/components/settings/SettingsRow';
import { StatePickerModal } from '@src/components/settings/StatePickerModal';
import { InviteModal } from '@src/components/settings/InviteModal';
import { JoinFamilyModal } from '@src/components/settings/JoinFamilyModal';
import { Colors } from '@src/constants/colors';
import { Strings } from '@src/constants/strings';
import { KEYS, setItem, removeItem } from '@src/utils/storage';
import { exportSessionsAsJson } from '@src/utils/exportData';
import { useDriveSessions } from '@src/hooks/useDriveSessions';
import { useAuth } from '@src/contexts/AuthContext';
import { useSync } from '@src/hooks/useFirestoreSync';
import { getOnboardingData } from '@src/hooks/useOnboarding';
import { getStateByAbbreviation } from '@src/data/stateRequirements';
import type { OnboardingData } from '@src/types';

const SS = Strings.SETTINGS;
const SF = Strings.FAMILY;

type AppearanceMode = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const { sessions, reload } = useDriveSessions();
  const { user, isSkipped, signOut } = useAuth();
  const { familyId, syncState, familyMembers, familyCreator, removeMember, loadFamily } = useSync();

  const [teenName, setTeenName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceMode>('system');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOnboardingData();
      if (data) {
        setTeenName(data.teenName);
        setStateCode(data.state);
      }
    })();
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await getOnboardingData();
    if (data) {
      setTeenName(data.teenName);
      setStateCode(data.state);
    }
    await reload();
    await loadFamily();
    setRefreshing(false);
  }, [reload, loadFamily]);

  const stateData = stateCode ? getStateByAbbreviation(stateCode) : undefined;
  const stateName = stateData?.state ?? stateCode;
  const stateHoursLabel = stateData
    ? stateData.hasRequirement
      ? SS.HOURS_REQUIRED(stateData.totalHours)
      : SS.NO_REQUIREMENT
    : '';

  const saveOnboardingField = useCallback(
    async (updates: Partial<OnboardingData>) => {
      const current = await getOnboardingData();
      const updated: OnboardingData = {
        state: current?.state ?? '',
        teenName: current?.teenName ?? '',
        completedOnboarding: current?.completedOnboarding ?? true,
        ...updates,
      };
      await setItem(KEYS.onboarded, updated);
    },
    []
  );

  const handleNameEdit = useCallback(() => {
    setNameInput(teenName);
    setEditingName(true);
  }, [teenName]);

  const handleNameSave = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      setTeenName(trimmed);
      await saveOnboardingField({ teenName: trimmed });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingName(false);
  }, [nameInput, saveOnboardingField]);

  const handleStateChange = useCallback(
    async (abbreviation: string) => {
      setStateCode(abbreviation);
      await saveOnboardingField({ state: abbreviation });
    },
    [saveOnboardingField]
  );

  const handleExportJson = useCallback(async () => {
    if (sessions.length === 0) {
      Alert.alert(SS.EXPORT_JSON, SS.EXPORT_EMPTY);
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await exportSessionsAsJson(sessions);
    } catch {
      // User cancelled sharing
    }
  }, [sessions]);

  const handleSupport = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${SS.SUPPORT_EMAIL}`);
  }, []);

  const handleRate = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(SS.COMING_SOON, 'App Store listing will be available after launch.');
  }, []);

  const handleSignOut = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
  }, [signOut]);

  const handleGoToAuth = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth' as any);
  }, []);

  const handleRemoveMember = useCallback((uid: string, email: string) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      SF.MEMBER_REMOVE_CONFIRM_TITLE,
      SF.MEMBER_REMOVE_CONFIRM_MSG,
      [
        { text: SS.DELETE_CONFIRM_NO, style: 'cancel' },
        {
          text: SF.MEMBER_REMOVE,
          style: 'destructive',
          onPress: async () => {
            await removeMember(uid);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [removeMember]);

  const handleDeleteData = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      SS.DELETE_CONFIRM_TITLE,
      SS.DELETE_CONFIRM_MSG(sessions.length),
      [
        { text: SS.DELETE_CONFIRM_NO, style: 'cancel' },
        {
          text: SS.DELETE_CONFIRM_YES,
          style: 'destructive',
          onPress: async () => {
            await removeItem(KEYS.sessions);
            await reload();
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [sessions.length, reload]);

  const handleResetApp = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      SS.RESET_CONFIRM_TITLE,
      SS.RESET_CONFIRM_MSG,
      [
        { text: SS.RESET_CONFIRM_NO, style: 'cancel' },
        {
          text: SS.RESET_CONFIRM_YES,
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              SS.RESET_DOUBLE_TITLE,
              SS.RESET_DOUBLE_MSG,
              [
                { text: SS.RESET_CONFIRM_NO, style: 'cancel' },
                {
                  text: SS.RESET_CONFIRM_YES,
                  style: 'destructive',
                  onPress: async () => {
                    await signOut().catch(() => {});
                    await removeItem(KEYS.sessions);
                    await removeItem(KEYS.onboarded);
                    await removeItem(KEYS.profile);
                    await removeItem(KEYS.auth_skipped);
                    await removeItem(KEYS.family_id);
                    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/onboarding' as any);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [signOut]);

  const appearanceIcon = appearance === 'dark'
    ? <Moon size={18} color={colors.textSecondary} />
    : appearance === 'light'
      ? <Sun size={18} color={colors.textSecondary} />
      : <Smartphone size={18} color={colors.textSecondary} />;

  const syncIcon = syncState === 'synced'
    ? <Cloud size={18} color={colors.success} />
    : syncState === 'syncing'
      ? <Loader size={18} color={colors.primary} />
      : syncState === 'offline'
        ? <CloudOff size={18} color={colors.textSecondary} />
        : null;

  const syncLabel = syncState === 'synced' ? SF.SYNCED
    : syncState === 'syncing' ? SF.SYNCING
    : syncState === 'offline' ? SF.OFFLINE
    : '';

  const isCreator = user && familyCreator === user.uid;
  const otherMembers = familyMembers.filter((m) => m.uid !== user?.uid);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <Heading variant="h2" style={styles.title}>{SS.TITLE}</Heading>
        </Animated.View>

        {/* Teen Profile */}
        <Animated.View entering={FadeIn.delay(80).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SS.TEEN_PROFILE}</Heading>
          <View style={[styles.section, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={[styles.nameInput, { color: colors.text, borderColor: colors.primary }]}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleNameSave}
                  onBlur={handleNameSave}
                />
              </View>
            ) : (
              <SettingsRow
                label={SS.TEEN_NAME}
                value={teenName}
                icon={<User size={18} color={colors.textSecondary} />}
                onPress={handleNameEdit}
                colors={colors}
              />
            )}
            <SettingsRow
              label={stateName}
              value={stateHoursLabel}
              icon={<MapPin size={18} color={colors.textSecondary} />}
              onPress={() => setShowStatePicker(true)}
              colors={colors}
              isLast
            />
          </View>
        </Animated.View>

        {/* Family */}
        <Animated.View entering={FadeIn.delay(160).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SS.FAMILY}</Heading>
          <View style={[styles.section, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {user ? (
              <>
                {/* Account row */}
                <SettingsRow
                  label={SF.SIGNED_IN_AS}
                  value={user.email ?? ''}
                  icon={<User size={18} color={colors.primary} />}
                  showChevron={false}
                  colors={colors}
                />
                {/* Sync status */}
                {syncIcon && (
                  <SettingsRow
                    label={syncLabel}
                    icon={syncIcon}
                    showChevron={false}
                    colors={colors}
                  />
                )}
                {/* Invite */}
                <SettingsRow
                  label={SS.INVITE_COPARENT}
                  icon={<UserPlus size={18} color={colors.textSecondary} />}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowInvite(true);
                  }}
                  colors={colors}
                />
                {/* Join */}
                <SettingsRow
                  label={SF.JOIN_TITLE}
                  icon={<Users size={18} color={colors.textSecondary} />}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowJoin(true);
                  }}
                  colors={colors}
                  isLast={otherMembers.length === 0}
                />
                {/* Family members */}
                {otherMembers.map((member, i) => (
                  <SettingsRow
                    key={member.uid}
                    label={member.email}
                    value={member.uid === familyCreator ? SF.MEMBER_CREATOR : ''}
                    icon={<User size={18} color={colors.textSecondary} />}
                    onPress={isCreator ? () => handleRemoveMember(member.uid, member.email) : undefined}
                    showChevron={!!isCreator}
                    colors={colors}
                    isLast={i === otherMembers.length - 1}
                  />
                ))}
              </>
            ) : (
              <>
                {/* Not signed in */}
                <SettingsRow
                  label={SF.SIGN_IN_REQUIRED}
                  icon={<LogIn size={18} color={colors.primary} />}
                  onPress={handleGoToAuth}
                  colors={colors}
                  isLast
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Data & Export */}
        <Animated.View entering={FadeIn.delay(240).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SS.DATA}</Heading>
          <View style={[styles.section, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {/* TODO: Wire in feature #9 — PDF Export */}
            <SettingsRow
              label={SS.EXPORT_PDF}
              icon={<FileText size={18} color={colors.textSecondary} />}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(SS.COMING_SOON, SS.COMING_SOON_MSG);
              }}
              colors={colors}
            />
            <SettingsRow
              label={SS.EXPORT_JSON}
              icon={<Download size={18} color={colors.textSecondary} />}
              onPress={handleExportJson}
              colors={colors}
              isLast
            />
          </View>
        </Animated.View>

        {/* App */}
        <Animated.View entering={FadeIn.delay(320).duration(300)}>
          <Heading variant="h3" style={styles.sectionTitle}>{SS.APP}</Heading>
          <View style={[styles.section, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <View style={styles.appearanceRow}>
              <View style={styles.appearanceLabel}>
                {appearanceIcon}
                <BodyText style={{ fontWeight: '500' }}>{SS.APPEARANCE}</BodyText>
              </View>
              <View style={[styles.segmented, { borderColor: colors.border }]}>
                {(['light', 'dark', 'system'] as AppearanceMode[]).map((mode) => {
                  const active = appearance === mode;
                  const label = mode === 'light' ? SS.APPEARANCE_LIGHT
                    : mode === 'dark' ? SS.APPEARANCE_DARK
                    : SS.APPEARANCE_SYSTEM;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setAppearance(mode);
                      }}
                      style={[
                        styles.segmentedBtn,
                        {
                          backgroundColor: active ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      <BodyText
                        variant="caption"
                        style={{
                          fontWeight: '600',
                          color: active ? '#FFFFFF' : colors.textSecondary,
                        }}
                      >
                        {label}
                      </BodyText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }} />
            <SettingsRow
              label={SS.ABOUT}
              value={SS.VERSION}
              icon={<Info size={18} color={colors.textSecondary} />}
              showChevron={false}
              colors={colors}
            />
            <SettingsRow
              label={SS.RATE}
              icon={<Star size={18} color={colors.textSecondary} />}
              onPress={handleRate}
              colors={colors}
            />
            <SettingsRow
              label={SS.SUPPORT}
              value={SS.SUPPORT_EMAIL}
              icon={<Mail size={18} color={colors.textSecondary} />}
              onPress={handleSupport}
              colors={colors}
              isLast={!user}
            />
            {user && (
              <SettingsRow
                label={SF.SIGN_OUT}
                icon={<LogOut size={18} color={colors.textSecondary} />}
                onPress={handleSignOut}
                colors={colors}
                isLast
              />
            )}
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Heading variant="h3" color={colors.error} style={styles.sectionTitle}>{SS.DANGER}</Heading>
          <View style={[styles.section, styles.dangerSection, { backgroundColor: colors.error + '08', borderColor: colors.error + '25' }]}>
            <SettingsRow
              label={SS.DELETE_DATA}
              icon={<Trash2 size={18} color={colors.error} />}
              onPress={handleDeleteData}
              destructive
              showChevron={false}
              colors={colors}
            />
            <SettingsRow
              label={SS.RESET_APP}
              icon={<RotateCcw size={18} color={colors.error} />}
              onPress={handleResetApp}
              destructive
              showChevron={false}
              colors={colors}
              isLast
            />
          </View>
        </Animated.View>
      </ScrollView>

      <StatePickerModal
        visible={showStatePicker}
        currentState={stateCode}
        onSelect={handleStateChange}
        onClose={() => setShowStatePicker(false)}
      />
      <InviteModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
      />
      <JoinFamilyModal
        visible={showJoin}
        onClose={() => setShowJoin(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  dangerSection: {
    borderWidth: 1,
  },
  nameEditRow: {
    paddingVertical: 8,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  appearanceRow: {
    paddingVertical: 14,
    gap: 12,
  },
  appearanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segmentedBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
