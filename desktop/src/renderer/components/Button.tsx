import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'filled' | 'outlined' | 'danger' | 'quiet' | 'onDark';

const variantClass: Record<ButtonVariant, string> = {
  filled: '',
  outlined: 'btn--outlined',
  danger: 'btn--danger',
  quiet: 'btn--quiet',
  onDark: 'btn--on-dark',
};

/**
 * The application's button.
 *
 * A real `<button>` rather than a styled div, which is what gives it Enter and
 * Space, the focus ring, the correct role, and sane rendering in Windows High
 * Contrast — all for free, and all things a div would have to fake badly.
 *
 * A disabled button is dimmed *and* carries the `disabled` attribute, so the
 * state reaches a screen reader rather than living only in the colour.
 */
export const Button = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    icon?: IconName;
    variant?: ButtonVariant;
    fullWidth?: boolean;
    /** Extra content after the label, e.g. a `<kbd>` shortcut hint. */
    trailing?: ReactNode;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
>(function Button(
  { label, icon, variant = 'filled', fullWidth = false, trailing, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'btn',
        variantClass[variant],
        fullWidth ? 'btn--full' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon ? <Icon name={icon} className="btn__icon" /> : null}
      <span>{label}</span>
      {trailing}
    </button>
  );
});
