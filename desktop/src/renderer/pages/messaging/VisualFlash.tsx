import { useEffect, useState } from 'react';

import { Icon } from '../../components/Icon';

/**
 * Plays a single bright pulse over the window when `trigger` changes.
 *
 * This is the visual half of the Notify action — what the other person's device
 * does instead of ringing, previewed here so the sender can see what they just
 * sent.
 *
 * It is deliberately **one** slow fade rather than a strobe. Anything flashing
 * more than three times a second risks triggering a seizure (WCAG 2.2 success
 * criterion 2.3.1), and this application's users are precisely the people most
 * likely to rely on a visual alert, so the pattern that helps them must not be
 * the pattern that harms someone else. Under `prefers-reduced-motion` the
 * stylesheet holds it as a steady panel instead, which says the same thing
 * without moving.
 *
 * The words are the point: a wordless flash tells a deaf user that *something*
 * happened, which is exactly the failure this application exists to fix. The
 * overlay is also `pointer-events: none`, so it can never swallow a click or
 * trap focus on its way out.
 */
export function VisualFlash({
  trigger,
  message,
  durationMs = 900,
}: {
  /** Increment this to play the pulse. Its value carries no meaning. */
  trigger: number;
  /** The words shown on the pulse, so the flash is never wordless. */
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

  if (!visible) return null;

  return (
    <div className="visual-flash" data-testid="visual-flash" role="status">
      <Icon name="notify" size={64} />
      <p className="visual-flash__message">{message}</p>
    </div>
  );
}
