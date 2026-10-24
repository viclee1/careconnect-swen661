import { useEffect, useId, useRef, useState } from 'react';
import { Play } from 'lucide-react';

import {
  patternDuration,
  patternSemanticLabel,
  pulseTimeline,
  type VibrationPattern,
} from '../../models/vibrationPattern';

/**
 * One vibration rhythm: the alert type, the rhythm's name and a printed shape
 * for it, so the rhythm is legible as well as feelable.
 *
 * Activating the row plays the rhythm two ways at once. On a phone browser that
 * supports the Vibration API the device buzzes it; everywhere, a lamp beside
 * the name fills for each buzz and empties for each gap in the pattern's real
 * timing — the same information through the one channel every device has.
 */
export default function VibrationPatternRow({
  pattern,
  enabled,
}: {
  pattern: VibrationPattern;
  /** False when vibration is switched off; the row still explains itself. */
  enabled: boolean;
}) {
  const [lampOn, setLampOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hintId = useId();

  function stop() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLampOn(false);
    setPlaying(false);
  }

  // Timers outlive a click, so they are cleared if the page goes away
  // mid-playback.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play() {
    stop();
    setPlaying(true);
    if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern.pulses);
    pulseTimeline(pattern).forEach((step) => {
      timers.current.push(setTimeout(() => setLampOn(step.on), step.at));
    });
    timers.current.push(
      setTimeout(() => {
        setLampOn(false);
        setPlaying(false);
      }, patternDuration(pattern)),
    );
  }

  return (
    <div className="px-2 py-3 sm:p-4">
      <button
        type="button"
        data-testid={`pattern-${pattern.id}`}
        disabled={!enabled}
        aria-describedby={hintId}
        onClick={play}
        className="w-full flex items-center gap-3 sm:gap-4 text-left rounded-lg border-2 border-neutral-300 bg-white hover:bg-calm-50 px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="font-semibold text-neutral-800">{pattern.alertType}</span>{' '}
          <span className="text-sm text-neutral-600">{pattern.rhythmName}</span>
          {/* Phones: the rhythm's shape sits under its name, so the three
              never compete for one narrow line. */}
          <span className="sm:hidden font-mono text-lg text-neutral-700 whitespace-pre" aria-hidden="true">
            {pattern.glyph}
          </span>
        </span>

        <span className="hidden sm:inline font-mono text-lg text-neutral-700 whitespace-pre" aria-hidden="true">
          {pattern.glyph}
        </span>

        {/* The lamp is the visual stand-in for the buzz. Hidden from assistive
            technology: a light blinking nine times in two seconds is not
            something to narrate. */}
        <span
          data-testid={`pattern-lamp-${pattern.id}`}
          data-on={lampOn}
          aria-hidden="true"
          className={`pattern-lamp w-5 h-5 rounded-full border-2 border-warm-700 flex-shrink-0 ${
            lampOn ? 'bg-warm-400 shadow-[0_0_12px_4px_rgba(240,169,14,0.7)]' : 'bg-white'
          }`}
        />

        <Play className="w-6 h-6 text-calm-600 flex-shrink-0" aria-hidden="true" />
      </button>

      <span id={hintId} className="sr-only">
        {enabled ? patternSemanticLabel(pattern) : 'Turn vibration on to play it.'}
      </span>

      {/* Announced once, rather than on every pulse. */}
      <span role="status" className="sr-only">
        {playing ? `Playing the ${pattern.rhythmName} rhythm.` : ''}
      </span>
    </div>
  );
}
