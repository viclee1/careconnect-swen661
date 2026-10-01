import { useId, type ReactNode } from 'react';

import { Icon, type IconName } from '../../components/Icon';

/**
 * A titled group of settings.
 *
 * A real `<section>` with a real heading, labelled by it. On desktop a
 * screen-reader user moves through a long settings page by heading and by
 * region, and both of those need actual landmarks rather than a styled div.
 */
export function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section className="settings-section" aria-labelledby={headingId}>
      <div className="settings-section__heading">
        <Icon name={icon} size={24} />
        <h2 className="settings-section__title" id={headingId}>
          {title}
        </h2>
      </div>
      <p className="settings-section__description">{description}</p>
      <div className="settings-section__card">{children}</div>
    </section>
  );
}
