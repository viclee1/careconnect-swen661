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
 * One memory: photo, category, title, when, the story (cut to three lines
 * behind "Read more" when long), then Pin and, for memories the user added,
 * Remove behind a confirmation.
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
      className="h-full flex flex-col bg-white rounded-card shadow-card border border-neutral-200 overflow-hidden"
    >
      {memory.imageUrl && (
        // A fixed 16:9 box: every card's photo is the same height and the page
        // does not jump as photos arrive (no layout shift).
        <div className="w-full aspect-[16/9] overflow-hidden bg-neutral-100">
          <img
            src={memory.imageUrl}
            srcSet={memory.imageSrcSet}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
            alt={memory.imageAlt ?? ''}
            width={480}
            height={270}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col p-5 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-calm text-xs">
            <Icon className="w-3 h-3" aria-hidden="true" />
            {categoryLabel[memory.category]}
          </span>
          {memory.pinned && (
            <span className="badge badge-neutral text-xs">
              <Pin className="w-3 h-3" aria-hidden="true" />
              Pinned
            </span>
          )}
        </div>

        <div>
          {/* tabIndex -1: focus lands here after the memory is saved, so a
              screen reader announces what was just added. */}
          <h3 id={headingId} tabIndex={-1} className="text-lg font-bold text-neutral-800 leading-tight">
            {memory.title}
          </h3>
          {memory.when && <p className="text-sm font-medium text-neutral-600 mt-1">{memory.when}</p>}
        </div>

        <div>
          <p
            id={bodyId}
            className={['text-neutral-700 text-base leading-relaxed', long && !expanded ? 'line-clamp-3' : ''].join(' ')}
          >
            {memory.body}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={bodyId}
              aria-label={`${expanded ? 'Show less' : 'Read more'} about ${memory.title}`}
              className="mt-1 min-h-[2.75rem] text-base font-semibold text-calm-700 hover:text-calm-800 underline underline-offset-2"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Each button's name starts with its printed words (WCAG 2.5.3) and
            adds the memory's title, so "Pin to top" is not heard six times. */}
        <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-neutral-200">
          <button
            id={memoryPinId(memory.id)}
            type="button"
            onClick={onTogglePinned}
            aria-label={`${memory.pinned ? 'Unpin' : 'Pin to top'}: ${memory.title}`}
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-3 rounded-lg border-2 border-neutral-400 bg-white text-neutral-800 font-semibold hover:bg-neutral-50"
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
                className="inline-flex items-center gap-2 min-h-[2.75rem] px-3 rounded-lg border-2 border-alert-600 bg-white text-alert-700 font-semibold hover:bg-alert-50"
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
