import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AppDestination } from './destinations';

/**
 * Every page and its parameters in one place.
 *
 * Typed so `navigate` calls are checked at compile time.
 */
export type Route =
  | { name: AppDestination }
  | { name: 'Splash' }
  | { name: 'SignIn' }
  | { name: 'SignUp' }
  | { name: 'MessageThread'; contactId: string }
  | { name: 'Settings' };

export type RouteName = Route['name'];

export interface NavigationValue {
  route: Route;
  /** Oldest first; the last entry is the current route. */
  history: Route[];
  navigate: (route: Route) => void;
  back: () => void;
  canGoBack: boolean;
  /** The top-level page the sidebar should mark as current. */
  activeDestination: AppDestination;
  isPublic: boolean;
}

const NavigationContext = createContext<NavigationValue | null>(null);

/**
 * The router.
 */
export function NavigationProvider({
  initialRoute = { name: 'Contacts' },
  children,
}: {
  initialRoute?: Route;
  children: ReactNode;
}) {
  const [history, setHistory] = useState<Route[]>([initialRoute]);

  const navigate = useCallback((next: Route) => {
    setHistory((current) => {
      const previous = current[current.length - 1];
      if (isSameRoute(previous, next)) return current;
      return isTopLevel(next) || isPublicRoute(next) ? [next] : [...current, next];
    });
  }, []);

  const back = useCallback(() => {
    setHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, []);

  const route = history[history.length - 1];

  const value = useMemo<NavigationValue>(
    () => ({
      route,
      history,
      navigate,
      back,
      canGoBack: history.length > 1,
      activeDestination: destinationOf(history),
      isPublic: isPublicRoute(route),
    }),
    [route, history, navigate, back],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationValue {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('useNavigation must be used inside a NavigationProvider');
  return value;
}

const topLevelNames: RouteName[] = [
  'Home',
  'MyDay',
  'Appointments',
  'Medicines',
  'Memories',
  'Contacts',
];

export function isTopLevel(route: Route): route is { name: AppDestination } {
  return topLevelNames.includes(route.name);
}

export function isPublicRoute(route: Route): boolean {
  return route.name === 'Splash' || route.name === 'SignIn' || route.name === 'SignUp';
}

function isSameRoute(a: Route | undefined, b: Route): boolean {
  if (!a || a.name !== b.name) return false;
  if (a.name === 'MessageThread' && b.name === 'MessageThread') {
    return a.contactId === b.contactId;
  }
  return true;
}

/**
 * Which sidebar entry to mark as current.
 */
function destinationOf(history: Route[]): AppDestination {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (isTopLevel(entry)) return entry.name;
    if (entry.name === 'MessageThread') return 'Contacts';
  }
  return 'Contacts';
}
