import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon, type IconName } from '../components/Icon';
import { AppHeader } from '../components/AppHeader';
import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { useDailyTasks } from '../state/DailyTasksProvider';

export function HomeScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isActiveCall, setIsActiveCall] = useState(false);
  const flashAnim = useRef(new Animated.Value(0.6)).current;

  const [volume, setVolume] = useState(80);
  const [balance, setBalance] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(true);

  const { showNotification, dismissNotification, progress, doneCount, totalCount } = useDailyTasks();

  useEffect(() => {
    if (isIncomingCall) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1.0,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      flashAnim.stopAnimation();
    }
  }, [isIncomingCall, flashAnim]);

  const simulateCall = () => setIsIncomingCall(true);
  const declineCall = () => setIsIncomingCall(false);
  const answerCall = () => {
    setIsIncomingCall(false);
    setIsActiveCall(true);
  };
  const endCall = () => setIsActiveCall(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryLight }}>
      <AppHeader title="Dashboard" onOpenSettings={onOpenSettings} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showNotification && (
          <View style={{ marginBottom: 24 }}>
            <AlertBanner
              tone="info"
              title="Upcoming appointment"
              message="You have a video call with Maria today at 3:00 PM."
              action={<AppButton label="OK" onPress={dismissNotification} variant="filled" />}
            />
            <View style={styles.upcomingHighlight}>
              <View style={styles.ccBadge}>
                <Text style={styles.ccBadgeText}>CC</Text>
              </View>
              <Text style={styles.upcomingText}>Upcoming: Video call with Maria at 3:00 PM</Text>
            </View>
          </View>
        )}

        <Text style={styles.greeting}>{"Here's your day, Margaret"}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {doneCount} of {totalCount} done
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Next thing to do</Text>
        <View style={styles.nextTaskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIconCircle}>
              <Icon name="video-call" size={32} color="white" />
            </View>
            <View style={styles.taskTitles}>
              <Text style={styles.taskTitle}>Video call with Maria</Text>
              <Text style={styles.taskSubtitle}>3:00 PM · Starts in 10 mins</Text>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <AppButton
              label="Simulate incoming call"
              onPress={simulateCall}
              icon="phone-callback"
              fullWidth
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Later today</Text>
        <TaskCard
          icon="medication"
          title="Atorvastatin"
          subtitle="Take 1 pill with water"
          time="5:00 PM"
        />
        <TaskCard
          icon="monitor-heart"
          title="Blood pressure check"
          subtitle="Standard daily measurement"
          time="8:00 PM"
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={isIncomingCall} transparent animationType="none" statusBarTranslucent>
        <Animated.View
          style={[
            styles.incomingOverlay,
            {
              backgroundColor: flashAnim.interpolate({
                inputRange: [0.6, 1.0],
                outputRange: ['rgba(0,0,0,0.48)', 'rgba(0,0,0,0.8)'],
              }),
            },
          ]}
        >
          <SafeAreaView style={styles.incomingContent} edges={['top', 'bottom']}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.incomingAvatar}>
                <Icon name="person" size={80} color="white" />
              </View>
              <Text style={styles.incomingName}>Maria</Text>
              <Text style={styles.incomingSubtitle}>Your daughter</Text>
            </View>

            <View style={styles.incomingActions}>
              <CallButton icon="call-end" label="Decline" color="#FF4B5C" onPress={declineCall} />
              <CallButton icon="videocam" label="Answer" color="#4BCB66" onPress={answerCall} />
            </View>
            <View style={{ height: 60 }} />
          </SafeAreaView>
        </Animated.View>
      </Modal>

      <Modal visible={isActiveCall} animationType="slide">
        <View style={styles.activeCallContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.activeCallHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeCallTitle}>Maria</Text>
                <Text style={styles.activeCallSubtitle}>Your daughter · Video call</Text>
              </View>
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.activeCallContent}>
              <View style={styles.mainAvatarContainer}>
                <View style={styles.mainAvatar}>
                  <Icon name="person" size={140} color="white" />
                </View>
                <View style={styles.selfAvatar}>
                  <Icon name="person" size={50} color={colors.primaryDark} />
                </View>
              </View>
            </View>

            {isCCEnabled && (
              <View style={styles.ccContainer}>
                <Text style={styles.ccText}>
                  [CC LIVE] "Hi Mum! Can you hear me? I'm calling to check in on you."
                </Text>
              </View>
            )}

            <View style={styles.activeCallControls}>
              <View style={styles.controlRow}>
                <Icon name="volume-up" size={28} color="white" />
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  value={volume}
                  onValueChange={setVolume}
                  minimumTrackTintColor="white"
                  maximumTrackTintColor="rgba(255,255,255,0.24)"
                  thumbTintColor="white"
                />
                <Text style={styles.controlValue}>{Math.round(volume)}</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.balanceLabel}>L</Text>
                <Slider
                  style={{ flex: 1, height: 40 }}
                  value={balance}
                  onValueChange={setBalance}
                  minimumTrackTintColor="white"
                  maximumTrackTintColor="rgba(255,255,255,0.24)"
                  thumbTintColor="white"
                />
                <Text style={styles.balanceLabel}>R</Text>
              </View>

              <View style={styles.toggleRow}>
                <ToggleButton
                  icon={isMuted ? 'mic-off' : 'mic'}
                  label="Mute"
                  isActive={isMuted}
                  onPress={() => setIsMuted(!isMuted)}
                />
                <ToggleButton
                  icon={isPaused ? 'play-arrow' : 'pause'}
                  label="Pause"
                  isActive={isPaused}
                  onPress={() => setIsPaused(!isPaused)}
                />
                <ToggleButton
                  icon="closed-caption"
                  label="CC"
                  isActive={isCCEnabled}
                  onPress={() => setIsCCEnabled(!isCCEnabled)}
                />
              </View>

              <View style={{ marginTop: 32 }}>
                <AppButton
                  label="End call"
                  onPress={endCall}
                  tone="#FF4B5C"
                  variant="filled"
                  icon="call-end"
                  fullWidth
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function TaskCard({
  icon,
  title,
  subtitle,
  time,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskCardIconCircle}>
        <Icon name={icon} size={24} color={colors.primaryDark} />
      </View>
      <View style={styles.taskCardTitles}>
        <Text style={styles.taskCardTitle}>{title}</Text>
        <Text style={styles.taskCardSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.taskCardTrailing}>
        <Text style={styles.taskCardTime}>{time}</Text>
        <Icon name="chevron-right" size={20} color={colors.secondaryDark} />
      </View>
    </View>
  );
}

function CallButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: IconName;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.callButtonContainer}>
      <View style={[styles.callButtonCircle, { backgroundColor: color }]}>
        <Icon name={icon} size={40} color="white" />
      </View>
      <Text style={styles.callButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToggleButton({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: IconName;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const color = isActive ? 'white' : 'rgba(255,255,255,0.54)';
  return (
    <TouchableOpacity onPress={onPress} style={styles.toggleButton}>
      <Icon name={icon} size={36} color={color} />
      <Text style={[styles.toggleLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: layout.gutter,
  },
  upcomingHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.secondaryLight,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
    gap: 12,
  },
  ccBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ccBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  upcomingText: {
    ...type.label,
    color: colors.primaryDark,
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.secondaryLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryDark,
  },
  progressText: {
    ...type.label,
    color: colors.secondaryDark,
  },
  sectionTitle: {
    ...type.sectionTitle,
    marginBottom: 12,
  },
  nextTaskCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: layout.gutter,
    marginBottom: 32,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitles: {
    flex: 1,
  },
  taskTitle: {
    ...type.cardTitle,
    color: colors.primaryDark,
  },
  taskSubtitle: {
    ...type.body,
    color: colors.secondaryDark,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
    gap: 16,
  },
  taskCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCardTitles: {
    flex: 1,
  },
  taskCardTitle: {
    ...type.rowTitle,
  },
  taskCardSubtitle: {
    ...type.caption,
    color: colors.secondaryDark,
  },
  taskCardTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  taskCardTime: {
    ...type.label,
    color: colors.secondaryDark,
  },
  incomingOverlay: {
    flex: 1,
    zIndex: 1000,
  },
  incomingContent: {
    flex: 1,
  },
  incomingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  incomingName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  incomingSubtitle: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  callButtonContainer: {
    alignItems: 'center',
  },
  callButtonCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  callButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  activeCallContainer: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  activeCallHeader: {
    flexDirection: 'row',
    padding: layout.gutter,
    alignItems: 'center',
  },
  activeCallTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  activeCallSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  liveBadge: {
    backgroundColor: '#FF4B5C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeCallContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAvatarContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAvatar: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ccContainer: {
    backgroundColor: 'rgba(0,0,0,0.87)',
    margin: layout.gutter,
    padding: 20,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ccText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
  },
  activeCallControls: {
    padding: layout.gutter,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlValue: {
    color: 'white',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  balanceLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 16,
  },
  toggleButton: {
    alignItems: 'center',
    padding: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
