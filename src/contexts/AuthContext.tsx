import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth } from '@src/lib/firebase';
import { KEYS, getItem, setItem, removeItem } from '@src/utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSkipped: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  skipAuth: () => Promise<void>;
  clearSkip: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSkipped: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithApple: async () => {},
  skipAuth: async () => {},
  clearSkip: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSkipped, setIsSkipped] = useState(false);
  const [skipChecked, setSkipChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    getItem<boolean>(KEYS.auth_skipped)
      .then((val) => {
        if (val) setIsSkipped(true);
      })
      .finally(() => setSkipChecked(true));

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    await removeItem(KEYS.auth_skipped);
    setIsSkipped(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    await removeItem(KEYS.auth_skipped);
    setIsSkipped(false);
  }, []);

  const signOutHandler = useCallback(async () => {
    await firebaseSignOut(auth);
    await removeItem(KEYS.family_id);
  }, []);

  const signInWithAppleHandler = useCallback(async () => {
    if (Platform.OS !== 'ios') return;

    const nonce = Crypto.randomUUID().replace(/-/g, '');
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce,
    );

    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!appleCredential.identityToken) {
      throw new Error('No identity token from Apple');
    }

    const oauthCredential = new OAuthProvider('apple.com').credential({
      idToken: appleCredential.identityToken,
      rawNonce: nonce,
    });

    await signInWithCredential(auth, oauthCredential);
    await removeItem(KEYS.auth_skipped);
    setIsSkipped(false);
  }, []);

  const skipAuth = useCallback(async () => {
    await setItem(KEYS.auth_skipped, true);
    setIsSkipped(true);
  }, []);

  const clearSkip = useCallback(async () => {
    await removeItem(KEYS.auth_skipped);
    setIsSkipped(false);
  }, []);

  const isReady = !loading && skipChecked;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !isReady,
        isSkipped,
        signIn,
        signUp,
        signOut: signOutHandler,
        signInWithApple: signInWithAppleHandler,
        skipAuth,
        clearSkip,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
