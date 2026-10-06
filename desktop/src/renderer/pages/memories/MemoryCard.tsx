import { useId } from 'react';

import { Icon } from '../../components/Icon';
import type { Memory } from '../../models/memory';

/**
 * One saved memory: a thumbnail, its title, when it was and what happened.
 *
 * Like the appointment card it is read rather than operated, so it is not a
 * Tab stop; its heading is how a screen-reader user moves between memories.
 */
export function MemoryCard({ memory }: { memory: Memory }) {
  const headingId = useId();

  return (
    <article
      className="memory-card"
      aria-labelledby={headingId}
      data-testid={`memory-${memory.id}`}
    >
      {/* There are no photos yet, so the thumbnail is a placeholder and says
          nothing a screen reader needs to hear. */}
      <div className="memory-card__thumbnail" aria-hidden="true">
        <Icon name="memories" size={36} />
      </div>
      <h2 id={headingId} className="info-card__title">
        {memory.title}
      </h2>
      <p className="memory-card__date">
        <time>{memory.date}</time>
      </p>
      <p className="info-card__subtitle">{memory.description}</p>
    </article>
  );
}
