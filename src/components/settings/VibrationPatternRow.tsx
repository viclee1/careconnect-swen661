import { useEffect, useId, useRef, useState } from 'react';
import { Play } from 'lucide-react';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  patternDuration,
  patternSemanticLabel,
  pulseTimeline,
  type VibrationPattern,
} from '../../models/vibrationPattern';

/** How long the filled bars stay up after the last buzz, so they can be read. */
const HOLD_MS = 600;

/**
 * One vibration rhythm: the alert type, the rhythm's name and the rhythm drawn
 * as bars — one per buzz, as long as the buzz, spaced by its pauses — so the
 * rhythm is legible as well as feelable.
 *
 * Activating the row plays the rhythm two ways at once. On a phone browser that
 * supports the Vibration API the device buzzes it; everywhere, the bars fill
 * left to right in the pattern's real timing — the same information through
 * the one channel every device has.
 *
 * The bars fill and stay filled rather than blinking a single lamp on and off:
 * the "missed" rhythm is about seven buzzes a second, and a light flashing that
 * fast fails WCAG 2.3.2 Three Flashes. Each bar changes once on the way up and
 * once at the end. Under reduced motion they all fill together.
 */
export default function VibrationPatternRow({
  pattern,
  enabled,
}: {
  pattern: VibrationPattern;
  /** False when vibration is switched off; the row still explains itself. */
  enabled: boolean;
}) {
  const [litBars, setLitBars] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hintId = useId();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const buzzStarts = pulseTimeline(pattern)
    .filter((step) => step.on)
    .map((step) => step.at);

  function stop() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLitBars(0);
    setPlaying(false);
  }

  // Timers outlive a click, so they are cleared if the page goes away
  // mid-playback.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play() {
    stop();
    setPlaying(true);
    if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern.pulses);
    if (reduceMotion) {
      setLitBars(buzzStarts.length);
    } else {
      buzzStarts.forEach((at, index) => {
        timers.current.push(setTimeout(() => setLitBars(index + 1), at));
      });
    }
    timers.current.push(
      setTimeout(() => {
        setLitBars(0);
        setPlaying(false);
      }, patternDuration(pattern) + HOLD_MS),
    );
  }

  return (
    <li>
      <button
        type="button"
        data-testid={`pattern-${pattern.id}`}
        disabled={!enabled}
        aria-describedby={hintId}
        onClick={play}
        className="w-full flex items-center gap-3 text-left rounded-xl border-2 border-neutral-300 bg-white hover:bg-calm-50 px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="font-semibold text-neutral-800">{pattern.alertType}</span>{' '}
          <span className="text-sm text-neutral-600">{pattern.rhythmName}</span>
          {/* Hidden from assistive technology: the rhythm's name says it in
              words, and bars filling seven times a second are not something
              to narrate. */}
          <span
            data-testid={`pattern-bars-${pattern.id}`}
            aria-hidden="true"
            className="flex items-center gap-0 h-4 w-40 max-w-full mt-1.5"
          >
            {pattern.pulses.map((ms, index) =>
              index % 2 === 0 ? (
                <span
                  key={index}
                  data-lit={litBars > index / 2}
                  className={`pattern-bar h-full rounded-sm border-2 border-warm-700 ${
                    litBars > index / 2 ? 'bg-warm-400' : 'bg-white'
                  }`}
                  style={{ flexGrow: ms, flexBasis: 0 }}
                />
              ) : (
                <span key={index} style={{ flexGrow: ms, flexBasis: 0 }} />
              ),
            )}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg bg-calm-600 px-3 py-1.5 text-sm font-semibold text-white flex-shrink-0">
          <Play className="w-4 h-4" aria-hidden="true" />
          Play
        </span>
      </button>

      <span id={hintId} className="sr-only">
        {enabled ? patternSemanticLabel(pattern) : 'Turn vibration on to play it.'}
      </span>

      {/* Announced once, rather than on every pulse. */}
      <span role="status" className="sr-only">
        {playing ? `Playing the ${pattern.rhythmName} rhythm.` : ''}
      </span>
    </li>
  );
}
