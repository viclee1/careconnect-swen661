import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon } from '../components/Icon';
import { AppButton } from '../components/AppButton';

export function SignUpScreen({
  onSignUp,
  onSignIn,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="favorite" size={28} color={colors.primaryDark} />
          <Text style={styles.logoText}>CareConnect</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>Create your account</Text>
          <Text style={styles.subheadline}>Free, private, and takes under two minutes.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Your name *</Text>
          <Text style={styles.hint}>This is how CareConnect will greet you.</Text>
          <TextInput style={styles.input} placeholder="e.g. Alex Johnson" />

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Email address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. alex@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Password *</Text>
          <Text style={styles.hint}>At least 6 characters.</Text>
          <TextInput style={styles.input} placeholder="Create a password" secureTextEntry />

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Confirm password *</Text>
          <TextInput style={styles.input} placeholder="Re-enter your password" secureTextEntry />

          <View style={{ height: 32 }} />

          <AppButton label="Create account" onPress={onSignUp} variant="filled" fullWidth />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  scrollContent: {
    padding: layout.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 48,
  },
  logoText: {
    ...type.screenTitle,
    color: colors.primaryDark,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  headline: {
    ...type.sectionTitle,
    textAlign: 'center',
  },
  subheadline: {
    ...type.body,
    textAlign: 'center',
    color: colors.secondaryDark,
  },
  form: {
    width: '100%',
  },
  label: type.label,
  hint: {
    ...type.caption,
    color: colors.secondaryDark,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    padding: 16,
    fontSize: 17,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: type.body,
  linkText: {
    ...type.label,
    color: colors.primaryDark,
  },
});
