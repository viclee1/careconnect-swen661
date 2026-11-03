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
import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { useCheckedForm } from '../hooks/useCheckedForm';
import { fixSummary, formErrorSummary, validateSignUp, type SignUpField } from '../utils/validators';

export function SignUpScreen({
  onSignUp,
  onSignIn,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
}) {
  // Checked on Create account, as on the web and desktop.
  const { values, errors, errorCount, setInput, change, submit } = useCheckedForm<SignUpField>(
    ['name', 'email', 'password', 'confirm'],
    { name: '', email: '', password: '', confirm: '' },
    validateSignUp,
    () => onSignUp(),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="favorite" size={28} color={colors.primaryDark} />
          <Text style={styles.logoText} accessibilityRole="header">
            CareConnect
          </Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline} accessibilityRole="header">
            Create your account
          </Text>
          <Text style={styles.subheadline}>Free, private, and takes under two minutes.</Text>
        </View>

        <View style={styles.form}>
          {errorCount > 0 ? (
            <View style={styles.summary}>
              <AlertBanner tone="error" title={formErrorSummary} message={`${fixSummary(errorCount)}.`} />
            </View>
          ) : null}

          <Text style={styles.label}>Your name *</Text>
          <Text style={styles.hint}>This is how CareConnect will greet you.</Text>
          <TextInput
            ref={(input) => setInput('name', input)}
            testID="sign-up-name"
            value={values.name}
            onChangeText={(text) => change('name', text)}
            style={[styles.input, errors.name ? styles.inputInvalid : null]}
            placeholder="e.g. Alex Johnson"
            autoComplete="name"
            accessible
            accessibilityLabel="Your name"
            accessibilityHint={errors.name ?? 'How you would like to be addressed in the app'}
          />
          {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Email address *</Text>
          <TextInput
            ref={(input) => setInput('email', input)}
            testID="sign-up-email"
            value={values.email}
            onChangeText={(text) => change('email', text)}
            style={[styles.input, errors.email ? styles.inputInvalid : null]}
            placeholder="e.g. alex@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessible
            accessibilityLabel="Email address"
            accessibilityHint={errors.email ?? 'A valid email address for account notifications'}
          />
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Password *</Text>
          <Text style={styles.hint}>At least 6 characters.</Text>
          <TextInput
            ref={(input) => setInput('password', input)}
            testID="sign-up-password"
            value={values.password}
            onChangeText={(text) => change('password', text)}
            style={[styles.input, errors.password ? styles.inputInvalid : null]}
            placeholder="Create a password"
            secureTextEntry
            autoComplete="new-password"
            accessible
            accessibilityLabel="Password"
            accessibilityHint={errors.password ?? 'Must be at least 6 characters long'}
          />
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          <View style={{ height: 24 }} />

          <Text style={styles.label}>Confirm password *</Text>
          <TextInput
            ref={(input) => setInput('confirm', input)}
            testID="sign-up-confirm"
            value={values.confirm}
            onChangeText={(text) => change('confirm', text)}
            style={[styles.input, errors.confirm ? styles.inputInvalid : null]}
            placeholder="Re-enter your password"
            secureTextEntry
            autoComplete="new-password"
            accessible
            accessibilityLabel="Confirm password"
            accessibilityHint={errors.confirm ?? 'Must match the password entered above'}
          />
          {errors.confirm ? <Text style={styles.error}>{errors.confirm}</Text> : null}

          <View style={{ height: 32 }} />

          <AppButton
            label="Create account"
            onPress={submit}
            variant="filled"
            fullWidth
            accessibilityHint="Creates your CareConnect account and logs you in"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={onSignIn}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              accessibilityRole="link"
              accessibilityLabel="Sign in"
              accessibilityHint="Navigates to the sign in screen"
            >
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
  inputInvalid: { borderColor: colors.errorText, borderWidth: 2 },
  error: { ...type.label, color: colors.errorText, marginTop: 6 },
  summary: { marginBottom: 24 },
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
