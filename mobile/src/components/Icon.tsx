import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * A Material icon.
 *
 * Hidden from assistive technology by default. Every icon in CareConnect sits
 * next to a word that says the same thing, so announcing the icon as well would
 * only make a screen reader stutter. Pass `decorative={false}` in the rare case
 * where an icon carries meaning on its own — and then give it a label.
 */
export function Icon({
  name,
  size = 22,
  color,
  decorative = true,
  accessibilityLabel,
}: {
  name: IconName;
  size?: number;
  color: string;
  decorative?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
    />
  );
}
