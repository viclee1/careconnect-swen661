import { useWindowDimensions } from 'react-native';

import { layout } from '../theme/layout';

export interface Responsive {
  width: number;
  isTablet: boolean;
}

/**
 * One place that answers "is this a tablet?", so every screen answers it the
 * same way. Reads window dimensions rather than screen dimensions so a split
 * view or a rotated device is handled correctly.
 */
export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  return { width, isTablet: width >= layout.tabletBreakpoint };
}
