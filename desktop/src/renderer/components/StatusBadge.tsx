import { Icon, type IconName } from './Icon';

/**
 * A small pill that always shows **an icon and a word**.
 *
 * The Assignment 3 design philosophy is explicit that status is "always a word
 * plus a shape" and that information is never carried by colour alone. Making
 * both `icon` and `label` required means a caller cannot accidentally ship a
 * colour-only indicator.
 *
 * Hidden from assistive technology, because every badge in this application
 * sits inside a control whose accessible name already spells the same fact out.
 */
export function StatusBadge({
  icon,
  label,
  variant,
}: {
  icon: IconName;
  label: string;
  variant?: 'waiting';
}) {
  return (
    <span
      className={`badge${variant ? ` badge--${variant}` : ''}`}
      aria-hidden="true"
    >
      <Icon name={icon} size={16} />
      {label}
    </span>
  );
}
