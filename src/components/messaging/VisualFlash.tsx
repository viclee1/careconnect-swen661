import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';

/**
 * Plays a single bright pulse over the page when `trigger` changes — the
 * visual half of the Alert action, previewed so the sender sees what they
 * just sent.
 *
 * Deliberately **one** slow fade rather than a strobe: anything flashing more
 * than three times a second risks a seizure (WCAG 2.3.1). Under
 * prefers-reduced-motion the global stylesheet removes the animation, leaving a
 * steady panel that says the same thing.
 *
 * The words are the point — a wordless flash tells a deaf user only that
 * *something* happened. The overlay is pointer-events: none, so it can never
 * swallow a click or trap focus.
 */
export default function VisualFlash({
  trigger,
  message,
  durationMs = 1600,
}: {
  /** Increment to play the pulse. Its value carries no meaning. */
  trigger: number;
  message: string;
  durationMs?: number;
}) {
  const [visible, setVisible] = useState(false);

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
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-warm-100/90 visual-flash"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white border-4 border-warm-400 px-8 py-6 shadow-lg max-w-sm mx-4 text-center">
            <BellRing className="w-16 h-16 text-warm-800" aria-hidden="true" />
            <p className="text-xl font-bold text-neutral-800 whitespace-pre-line">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
