import { useId, useRef, useState } from 'react';
import { Calendar, Heart, Leaf, MapPin, Pin, PinOff, Trash2, Users, type LucideIcon } from 'lucide-react';

import ConfirmDialog from '../ConfirmDialog';
import {
  categoryLabel,
  isLongStory,
  memoryHeadingId,
  memoryPinId,
  type MemoryCard as Memory,
  type MemoryCategory,
} from '../../models/memory';

const categoryIcon: Record<MemoryCategory, LucideIcon> = {
  family: Users,
  place: MapPin,
  event: Calendar,
  hobby: Leaf,
  pet: Heart,
};

/**
 * One memory as a row of the design's list: a small photo (or the category's
 * icon), title, when, the story (cut to two lines behind "Read more" when
 * long), then Pin and, for memories the user added, Remove behind a
 * confirmation.
 */
export default function MemoryCard({
  memory,
  onTogglePinned,
  onRemove,
}: {
  memory: Memory;
  onTogglePinned: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const removeRef = useRef<HTMLButtonElement>(null);
  const bodyId = useId();
  const headingId = memoryHeadingId(memory.id);
  const Icon = categoryIcon[memory.category];
  const long = isLongStory(memory.body);
  const PinIcon = memory.pinned ? PinOff : Pin;

  return (
    <article
      aria-labelledby={headingId}
      className="bg-white rounded-xl p-4 flex items-start gap-4"
    >
      {memory.imageUrl ? (
        // A fixed square: every row's picture is the same size and the list
        // does not jump as photos arrive (no layout shift).
        <img
          src={memory.imageUrl}
          srcSet={memory.imageSrcSet}
          sizes="4.5rem"
          alt={memory.imageAlt ?? ''}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-xl object-cover flex-shrink-0 bg-neutral-100"
        />
      ) : (
        <span
          className="w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-xl bg-calm-50 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-calm-700" />
        </span>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {/* tabIndex -1: focus lands here after the memory is saved, so a
              screen reader announces what was just added. */}
          <h3 id={headingId} tabIndex={-1} className="text-lg font-normal text-neutral-800 leading-tight m-0">
            {memory.title}
          </h3>
          <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {categoryLabel[memory.category]}
            {memory.pinned && (
              <>
                <span aria-hidden="true"> · </span>
                <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                Pinned
              </>
            )}
          </span>
        </div>
        {memory.when && <p className="text-sm text-calm-700 m-0">{memory.when}</p>}

        <p
          id={bodyId}
          className={['text-neutral-700 text-base leading-relaxed m-0', long && !expanded ? 'line-clamp-2' : ''].join(' ')}
        >
          {memory.body}
        </p>

        {/* Each button's name starts with its printed words (WCAG 2.5.3) and
            adds the memory's title, so "Pin to top" is not heard six times. */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 pt-1">
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={bodyId}
              aria-label={`${expanded ? 'Show less' : 'Read more'} about ${memory.title}`}
              className="min-h-[2.75rem] px-2 text-base text-calm-700 hover:text-calm-800 underline underline-offset-2"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
          <button
            id={memoryPinId(memory.id)}
            type="button"
            onClick={onTogglePinned}
            aria-label={`${memory.pinned ? 'Unpin' : 'Pin to top'}: ${memory.title}`}
            className="inline-flex items-center gap-1.5 min-h-[2.75rem] px-2 rounded-lg text-base text-neutral-700 hover:bg-neutral-100"
          >
            <PinIcon className="w-4 h-4" aria-hidden="true" />
            {memory.pinned ? 'Unpin' : 'Pin to top'}
          </button>
          {memory.addedByUser && (
            <>
              <button
                ref={removeRef}
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Remove: ${memory.title}`}
                className="inline-flex items-center gap-1.5 min-h-[2.75rem] px-2 rounded-lg text-base text-alert-700 hover:bg-alert-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Remove
              </button>
              <ConfirmDialog
                open={confirming}
                title={`Remove “${memory.title}”?`}
                description="This memory will be taken out of your memory book. This cannot be undone."
                confirmLabel="Remove memory"
                triggerRef={removeRef}
                onConfirm={() => {
                  setConfirming(false);
                  onRemove();
                }}
                onCancel={() => setConfirming(false)}
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
