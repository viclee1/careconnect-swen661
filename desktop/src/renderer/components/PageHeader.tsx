import type { ReactNode } from 'react';

import { Button } from './Button';

/**
 * The header every page wears.
 *
 * The title is a real `<h1>`: on desktop, where a screen-reader user navigates
 * by heading far more than by swipe, the page's identity has to be reachable
 * with a single `H` keystroke. The sidebar's `aria-current` says the same thing
 * a second way.
 */
export function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  trailing,
}: {
  title: string;
  subtitle?: string;
  /** Renders a back button when supplied. */
  onBack?: () => void;
  backLabel?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="page-header on-dark">
      {onBack ? (
        <Button
          variant="onDark"
          icon="back"
          label={backLabel}
          onClick={onBack}
        />
      ) : null}

      <div className="page-header__titles">
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      {trailing}
    </header>
  );
}
