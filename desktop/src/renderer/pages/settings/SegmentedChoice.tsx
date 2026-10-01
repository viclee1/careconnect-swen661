import { useRef, type KeyboardEvent } from 'react';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * A row of mutually exclusive choices.
 *
 * Implemented as a WAI-ARIA radio group rather than a set of buttons, which is
 * what gives it the behaviour a desktop user expects: one Tab stop for the
 * whole group, arrow keys to move the selection within it, and an announcement
 * of "2 of 3" rather than three unrelated buttons.
 *
 * The selected segment is filled *and* carries `aria-checked`, so the choice is
 * legible without colour vision and audible to a screen reader.
 */
export function SegmentedChoice<T extends string>({
  segments,
  value,
  onChange,
  disabled = false,
  groupLabel,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  groupLabel: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  const move = (step: number) => {
    const index = segments.findIndex((segment) => segment.value === value);
    const next = segments[(index + step + segments.length) % segments.length];
    onChange(next.value);
    // Focus follows the selection, as it does in every native radio group.
    requestAnimationFrame(() => {
      groupRef.current
        ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        ?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={groupRef}
      className="segmented"
      role="radiogroup"
      aria-label={groupLabel}
      onKeyDown={onKeyDown}
    >
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            data-value={segment.value}
            data-testid={`segment-${segment.value}`}
            className="segmented__option"
            aria-checked={selected}
            // A roving tabindex: one Tab reaches the group, arrows move inside.
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(segment.value)}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
