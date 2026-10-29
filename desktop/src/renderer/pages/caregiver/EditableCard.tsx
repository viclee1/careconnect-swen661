import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';

/**
 * One item a caregiver can change: its details, then Edit and Delete.
 *
 * Delete asks first, in place — "Delete Amlodipine?" with Yes / Cancel —
 * rather than in a modal, so focus never leaves the card and Cancel puts it
 * straight back on Delete.
 */
export function EditableCard({
  icon,
  title,
  children,
  onEdit,
  onDelete,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (wasConfirming.current) deleteRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  return (
    <li>
      <article className="info-card care-card" aria-label={title}>
        <span className="info-card__icon" aria-hidden="true">
          <Icon name={icon} size={22} />
        </span>
        <div className="info-card__details">
          <h2 className="info-card__title">{title}</h2>
          {children}
          {confirming ? (
            <div className="care-card__actions" role="group" aria-label={`Delete ${title}?`}>
              <span className="care-card__question">Delete {title}?</span>
              <Button
                ref={confirmRef}
                variant="danger"
                label="Yes, delete"
                onClick={() => {
                  // The card is about to go; nothing to send focus back to.
                  wasConfirming.current = false;
                  onDelete();
                }}
              />
              <Button variant="outlined" label="Cancel" onClick={() => setConfirming(false)} />
            </div>
          ) : (
            <div className="care-card__actions">
              <Button
                variant="outlined"
                icon="edit"
                label="Edit"
                aria-label={`Edit ${title}`}
                onClick={onEdit}
              />
              <Button
                ref={deleteRef}
                variant="quiet"
                icon="remove"
                label="Delete"
                aria-label={`Delete ${title}`}
                onClick={() => setConfirming(true)}
              />
            </div>
          )}
        </div>
      </article>
    </li>
  );
}
