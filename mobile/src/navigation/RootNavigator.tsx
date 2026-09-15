import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useResponsive } from '../hooks/useResponsive';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MedicinesScreen } from '../screens/MedicinesScreen';
import { MemoriesScreen } from '../screens/MemoriesScreen';
import { MessageThreadScreen } from '../screens/MessageThreadScreen';
import { MyDayScreen } from '../screens/MyDayScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { AppDestination } from './destinations';
import type { RootStackParamList, TabParamList } from './routes';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNav = NavigationProp<RootStackParamList>;

function AppointmentsRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <AppointmentsScreen
      onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')}
    />
  );
}

function MedicinesRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <MedicinesScreen
      onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')}
    />
  );
}

function MemoriesRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <MemoriesScreen
      onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')}
    />
  );
}

function HomeRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <HomeScreen onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')} />
  );
}

function MyDayRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <MyDayScreen onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')} />
  );
}

function ContactsRoute() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  return (
    <ContactsScreen
      onOpenThread={(contact) => navigation.navigate('MessageThread', { contactId: contact.id })}
      onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')}
    />
  );
}

/**
 * The six top-level destinations.
 *
 * `animation: 'none'` is the point: switching tabs swaps the page underneath
 * and nothing else moves. The bar itself belongs to the navigator rather than
 * to any screen, so it is mounted once and never animates in or out.
 *
 * From the tablet breakpoint up, `tabBarPosition: 'left'` turns the bar into
 * a left sidebar — the layout the bottom-tabs navigator lays out natively —
 * and `TabBar` draws it with full labels plus Settings, matching the Flutter
 * client's `AppShell`.
 */
function TabsNavigator({ initialRouteName = 'Home' }: { initialRouteName?: AppDestination }) {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      backBehavior="none"
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarPosition: isTablet ? 'left' : 'bottom',
      }}
      tabBar={(props) => (
        <TabBar
          {...props}
          isTablet={isTablet}
          onOpenSettings={() => navigation.navigate('Settings')}
        />
      )}
    >
      <Tab.Screen name="Home" component={HomeRoute} />
      <Tab.Screen name="MyDay" component={MyDayRoute} />
      <Tab.Screen name="Appointments" component={AppointmentsRoute} />
      <Tab.Screen name="Medicines" component={MedicinesRoute} />
      <Tab.Screen name="Memories" component={MemoriesRoute} />
      <Tab.Screen name="Contacts" component={ContactsRoute} />
    </Tab.Navigator>
  );
}

function WelcomeRoute() {
  const navigation = useNavigation<RootNav>();
  return (
    <WelcomeScreen
      onGetStarted={() => navigation.navigate('SignUp')}
      onSignIn={() => navigation.navigate('SignIn')}
    />
  );
}

function SignInRoute() {
  const navigation = useNavigation<RootNav>();
  return (
    <SignInScreen
      onSignIn={() => navigation.navigate('Tabs')}
      onSignUp={() => navigation.navigate('SignUp')}
    />
  );
}

function SignUpRoute() {
  const navigation = useNavigation<RootNav>();
  return (
    <SignUpScreen
      onSignUp={() => navigation.navigate('Tabs')}
      onSignIn={() => navigation.navigate('SignIn')}
    />
  );
}

function MessageThreadRoute() {
  const navigation = useNavigation<RootNav>();
  const route = useRoute<RouteProp<RootStackParamList, 'MessageThread'>>();

  return (
    <MessageThreadScreen
      contactId={route.params.contactId}
      onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs'))}
      onOpenSettings={() => navigation.navigate('Settings')}
    />
  );
}

function SettingsRoute() {
  const navigation = useNavigation<RootNav>();
  return (
    <SettingsScreen
      onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs'))}
      onSignOut={() => navigation.navigate('Welcome')}
    />
  );
}

/**
 * The root stack.
 *
 * Welcome, Sign In and Sign Up sit below the tabs and are where the app
 * starts by default; a conversation and the Settings screen sit above the
 * tabs, so each covers the bar the way a screen you come back from should.
 * Settings appears without an animation, matching the Flutter client; a
 * conversation keeps the platform's push animation because it is a
 * drill-down and the back-swipe should feel normal.
 */
export function RootNavigator({
  initialRouteName = 'Welcome',
  initialTabName = 'Home',
}: {
  initialRouteName?: keyof RootStackParamList;
  initialTabName?: AppDestination;
}) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeRoute} />
      <Stack.Screen name="SignIn" component={SignInRoute} />
      <Stack.Screen name="SignUp" component={SignUpRoute} />
      <Stack.Screen name="Tabs">
        {() => <TabsNavigator initialRouteName={initialTabName} />}
      </Stack.Screen>
      <Stack.Screen name="MessageThread" component={MessageThreadRoute} />
      <Stack.Screen name="Settings" component={SettingsRoute} options={{ animation: 'none' }} />
    </Stack.Navigator>
  );
}
