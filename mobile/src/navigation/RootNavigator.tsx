import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useResponsive } from '../hooks/useResponsive';
import { ContactsScreen } from '../screens/ContactsScreen';
import { MessageThreadScreen } from '../screens/MessageThreadScreen';
import { PendingScreen } from '../screens/PendingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { destinations } from './destinations';
import type { RootStackParamList, TabParamList } from './routes';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNav = NavigationProp<RootStackParamList>;

/**
 * Stands in for the five destinations other team members own. One component
 * serves all of them; it reads which one it is from the route.
 */
function PendingRoute() {
  const route = useRoute();
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();
  const entry = destinations.find((item) => item.destination === route.name);

  return (
    <PendingScreen
      title={entry?.label ?? route.name}
      owner={entry?.owner ?? 'A teammate'}
      // The tablet sidebar already lists Settings, so the header gear would
      // be a second way to reach the same place — hidden there exactly as
      // the Flutter client's AppScaffold hides it.
      onOpenSettings={isTablet ? undefined : () => navigation.navigate('Settings')}
    />
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
function TabsNavigator() {
  const navigation = useNavigation<RootNav>();
  const { isTablet } = useResponsive();

  return (
    <Tab.Navigator
      initialRouteName="Contacts"
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
      <Tab.Screen name="Home" component={PendingRoute} />
      <Tab.Screen name="MyDay" component={PendingRoute} />
      <Tab.Screen name="Appointments" component={PendingRoute} />
      <Tab.Screen name="Medicines" component={PendingRoute} />
      <Tab.Screen name="Memories" component={PendingRoute} />
      <Tab.Screen name="Contacts" component={ContactsRoute} />
    </Tab.Navigator>
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
    />
  );
}

/**
 * The root stack.
 *
 * A conversation and the Settings screen sit above the tabs rather than inside
 * them, so each covers the bottom bar the way a screen you come back from
 * should. Settings appears without an animation, matching the Flutter client;
 * a conversation keeps the platform's push animation because it is a
 * drill-down and the back-swipe should feel normal.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="MessageThread" component={MessageThreadRoute} />
      <Stack.Screen name="Settings" component={SettingsRoute} options={{ animation: 'none' }} />
    </Stack.Navigator>
  );
}
