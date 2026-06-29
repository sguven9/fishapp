import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function AccountScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleEmailAuth = () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
    Alert.alert('Coming soon', 'Email authentication will be available soon.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Hero image area */}
      <View style={styles.heroArea}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroFishingRod}>🎣</Text>
        </View>
      </View>

      <ScrollView style={styles.formArea}>
        <View style={styles.appBranding}>
          <View style={styles.appIconWrap}>
            <Text style={styles.appIconEmoji}>🎣</Text>
          </View>
          <View>
            <Text style={styles.signinTitle}>Sign in to</Text>
            <Text style={styles.appNameBold}>Fish App</Text>
          </View>
        </View>

        <Text style={styles.signinDesc}>
          Log in or create a Fish App account to never lose your saved fishing spots and catches.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
          />
        )}

        <TouchableOpacity style={styles.emailBtn} onPress={handleEmailAuth}>
          <Text style={styles.emailBtnIcon}>✉️</Text>
          <Text style={styles.emailBtnText}>{mode === 'login' ? 'Sign in with email' : 'Create account'}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.facebookBtn} onPress={() => Alert.alert('Coming soon', 'Facebook login coming soon')}>
          <Text style={styles.socialIcon}>f</Text>
          <Text style={styles.socialBtnText}>Sign in with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.appleBtn} onPress={() => Alert.alert('Coming soon', 'Apple login coming soon')}>
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={[styles.socialBtnText, { color: COLORS.white }]}>Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchMode}
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink}>{mode === 'login' ? 'Register' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you are indicating that you accept our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' and '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  heroArea: {
    height: 200,
    backgroundColor: '#B0D4F1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  closeBtn: { position: 'absolute', top: 48, left: 16, padding: 8 },
  closeText: { fontSize: 22, color: COLORS.textSecondary },
  heroOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroFishingRod: { fontSize: 80 },
  formArea: { flex: 1, padding: 24 },
  appBranding: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  appIconWrap: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  appIconEmoji: { fontSize: 30 },
  signinTitle: { fontSize: 16, color: COLORS.textSecondary },
  appNameBold: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  signinDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },
  emailBtn: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 10,
  },
  emailBtnIcon: { fontSize: 20 },
  emailBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textSecondary, fontSize: 13 },
  facebookBtn: {
    backgroundColor: '#1877F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 10,
  },
  appleBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 10,
  },
  socialIcon: { color: COLORS.white, fontWeight: 'bold', fontSize: 18, width: 24, textAlign: 'center' },
  socialBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  switchMode: { alignItems: 'center', marginBottom: 16 },
  switchText: { fontSize: 14, color: COLORS.textSecondary },
  switchLink: { color: COLORS.primary, fontWeight: 'bold' },
  termsText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, paddingBottom: 32 },
  termsLink: { color: COLORS.primary },
});
