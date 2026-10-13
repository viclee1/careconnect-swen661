import { Icon, type IconName } from './Icon';

/**
 * A small pill that always shows **an icon and a word**.
 *
 * The Assignment 3 design philosophy is explicit that status is "always a word
 * plus a shape" and that information is never carried by colour alone. Making
 * both `icon` and `label` required means a caller cannot accidentally ship a
 * colour-only indicator.
 *
 * Hidden from assistive technology by default, because most badges sit inside
 * a control whose accessible name already spells the same fact out. `announce`
 * keeps the word in the tree for a control whose name is built from its
 * visible text, where hiding it would make the name differ from the label.
 */
export function StatusBadge({
  icon,
  label,
  variant,
  announce = false,
}: {
  icon: IconName;
  label: string;
  variant?: 'waiting';
  announce?: boolean;
}) {
  return (
    <span
      className={`badge${variant ? ` badge--${variant}` : ''}`}
      aria-hidden={announce ? undefined : 'true'}
    >
      <Icon name={icon} size={16} />
      {label}
    </span>
  );
}
