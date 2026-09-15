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

export function SignInScreen({
  onSignIn,
  onSignUp,
}: {
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="favorite" size={28} color={colors.primaryDark} />
          <Text style={styles.logoText}>CareConnect</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.subheadline}>Sign in to your account.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. alex@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />

          <AppButton
            label="Sign in"
            onPress={onSignIn}
            variant="filled"
            fullWidth
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.linkText}>Create an account</Text>
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
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    padding: 16,
    fontSize: 17,
    marginTop: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    ...type.label,
    color: colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: type.body,
  linkText: {
    ...type.label,
    color: colors.primaryDark,
  },
});
