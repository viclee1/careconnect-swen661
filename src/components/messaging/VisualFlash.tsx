import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';

import type { FlashTone } from '../../models/flashCue';

const toneClasses: Record<FlashTone, { wash: string; frame: string; icon: string }> = {
  warm: { wash: 'bg-warm-100/90', frame: 'border-warm-400', icon: 'text-warm-800' },
  calm: { wash: 'bg-calm-100/90', frame: 'border-calm-600', icon: 'text-calm-700' },
  alert: { wash: 'bg-alert-100/90', frame: 'border-alert-500', icon: 'text-alert-700' },
};

/**
 * Plays a bright pulse over the page when `trigger` changes — the visual half
 * of the Alert action, and the preview of each alert type's screen flash.
 *
 * Deliberately slow rather than a strobe: anything flashing more than three
 * times a second risks a seizure (WCAG 2.3.1), and the fastest cue here is two
 * pulses in 1.6 seconds. Under prefers-reduced-motion the global stylesheet
 * removes the animation, leaving a steady panel that says the same thing.
 *
 * The words are the point — a wordless flash tells a deaf user only that
 * *something* happened. The overlay is pointer-events: none, so it can never
 * swallow a click or trap focus.
 */
export default function VisualFlash({
  trigger,
  message,
  durationMs = 1600,
  tone = 'warm',
  flashes = 1,
}: {
  /** Increment to play the pulse. Its value carries no meaning. */
  trigger: number;
  message: string;
  durationMs?: number;
  tone?: FlashTone;
  /** How many pulses fit in `durationMs`. */
  flashes?: 1 | 2;
}) {
  const [visible, setVisible] = useState(false);
  const colours = toneClasses[tone];

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [trigger, durationMs]);

  return (
    // The live region stays mounted so the announcement is reliably read.
    <div role="status">
      {visible && (
        <div
          data-testid="visual-flash"
          data-tone={tone}
          className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center visual-flash ${colours.wash}`}
          style={{ animationDuration: `${durationMs / flashes}ms`, animationIterationCount: flashes }}
        >
          <div
            className={`flex flex-col items-center gap-4 rounded-2xl bg-white border-4 px-8 py-6 shadow-lg max-w-sm mx-4 text-center ${colours.frame}`}
          >
            <BellRing className={`w-16 h-16 ${colours.icon}`} aria-hidden="true" />
            <p className="text-xl font-bold text-neutral-800 whitespace-pre-line">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
