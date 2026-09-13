import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon, type IconName } from '../components/Icon';
import { AppButton } from '../components/AppButton';
import { StatusBadge } from '../components/StatusBadge';

export function WelcomeScreen({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Icon name="favorite" size={28} color={colors.primaryLight} />
            <Text style={styles.logoText}>CareConnect</Text>
          </View>
          <StatusBadge
            icon="accessibility-new"
            label="Accessible"
            fill="transparent"
            foreground={colors.primaryLight}
          />
        </View>

        <View style={styles.hero}>
          <Text style={styles.display}>Your daily companion for calm, confident care.</Text>
          <Text style={styles.tagline}>
            For people who need a little help remembering, and the people who care for them.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureCardTitle}>Built for hearing accessibility</Text>
          <FeatureItem
            icon="remove-red-eye"
            title="Visual alerts"
            description="Flashing banners for every notification"
          />
          <FeatureItem
            icon="description"
            title="Captions everywhere"
            description="Adjustable text for all audio & video"
          />
          <FeatureItem
            icon="vibration"
            title="Vibration patterns"
            description="A unique buzz for each reminder"
          />
        </View>

        <View style={styles.footer}>
          <AppButton
            label="Get started — it's free →"
            onPress={onGetStarted}
            tone={colors.primaryLight}
            labelColor={colors.primaryDark}
            variant="filled"
            fullWidth
          />
          <View style={{ height: 12 }} />
          <AppButton
            label="I already have an account"
            onPress={onSignIn}
            tone={colors.primaryLight}
            variant="outlined"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Icon name={icon} size={24} color={colors.primaryLight} />
      <View style={styles.featureItemText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.gutter,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    ...type.screenTitle,
    color: colors.primaryLight,
  },
  hero: {
    marginVertical: 32,
  },
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 16,
  },
  tagline: {
    ...type.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featureCard: {
    padding: 20,
    backgroundColor: 'rgba(52, 110, 138, 0.5)',
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 16,
  },
  featureCardTitle: {
    ...type.cardTitle,
    color: colors.primaryLight,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureItemText: {
    flex: 1,
  },
  featureTitle: {
    ...type.label,
    color: colors.primaryLight,
  },
  featureDescription: {
    ...type.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
});
