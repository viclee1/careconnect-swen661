import { Eye } from 'lucide-react';

import type { FlashCue, FlashTone } from '../../models/flashCue';

const swatchClasses: Record<FlashTone, string> = {
  warm: 'bg-warm-400',
  calm: 'bg-calm-600',
  alert: 'bg-alert-500',
};

/**
 * One alert type's screen flash: its name, its colour written out in words and
 * a swatch of it. Activating the row plays the flash over the page so the user
 * learns what each colour means before a real alert arrives.
 */
export default function FlashCueRow({
  cue,
  enabled,
  onPreview,
}: {
  cue: FlashCue;
  /** False when screen flashes are switched off; the row still explains itself. */
  enabled: boolean;
  onPreview: (cue: FlashCue) => void;
}) {
  return (
    <li>
      <button
        type="button"
        data-testid={`flash-${cue.id}`}
        disabled={!enabled}
        onClick={() => onPreview(cue)}
        className="w-full flex items-center gap-3 text-left rounded-xl border-2 border-neutral-300 bg-white hover:bg-calm-50 px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="font-semibold text-neutral-800">{cue.alertType}</span>{' '}
          <span className="text-sm text-neutral-600">{cue.colourName}</span>
        </span>
        <span className={`w-10 h-7 rounded-md flex-shrink-0 ${swatchClasses[cue.tone]}`} aria-hidden="true" />
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-calm-700 flex-shrink-0">
          <Eye className="w-4 h-4" aria-hidden="true" />
          Preview
        </span>
      </button>
    </li>
  );
}
