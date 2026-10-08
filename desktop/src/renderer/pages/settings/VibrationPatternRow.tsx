import { useEffect, useId, useRef, useState } from 'react';

import { Icon } from '../../components/Icon';
import {
  patternDuration,
  pulseTimeline,
  patternSemanticLabel,
  type VibrationPattern,
} from '../../models/vibrationPattern';

/**
 * One row of the "Vibration patterns" list: the alert type, the rhythm's name,
 * and a printed shape for it.
 *
 * The glyph matters. A rhythm you can only learn by feeling it is useless to
 * someone comparing two of them in a settings page, so each pattern is drawn as
 * well as played.
 *
 * "Played" means something different here than on the phone. A desktop machine
 * has no vibration motor, so activating a row plays the rhythm back *visually*
 * — a lamp that fills for each buzz and empties for each gap, in the pattern's
 * real timing. That is the same information through the one channel this device
 * actually has, which is the whole premise of the application.
 */
export function VibrationPatternRow({
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

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLampOn(false);
    setPlaying(false);
  };

  // Timers outlive a click, so they have to be cleared if the page goes away
  // mid-playback — otherwise React is asked to set state on a dead component.
  useEffect(() => stop, []);

  const play = () => {
    stop();
    setPlaying(true);
    pulseTimeline(pattern).forEach((step) => {
      timers.current.push(setTimeout(() => setLampOn(step.on), step.at));
    });
    timers.current.push(
      setTimeout(() => {
        setLampOn(false);
        setPlaying(false);
      }, patternDuration(pattern)),
    );
  };

  // The name is the words on the row (WCAG 2.5.3 Label in Name), so a
  // voice-control user can say what they see. What activating it does is the
  // description, kept outside the button so it is not folded into the name.
  const hintId = useId();

  return (
    <>
      <button
        type="button"
        data-testid={`pattern-${pattern.id}`}
        className="pattern-row"
        disabled={!enabled}
        aria-describedby={hintId}
        onClick={play}
      >
        <span className="pattern-row__text">
          <span className="pattern-row__type">{pattern.alertType}</span>{' '}
          <span className="pattern-row__rhythm">{pattern.rhythmName}</span>
        </span>

        <span className="pattern-row__glyph" aria-hidden="true">
          {pattern.glyph}
        </span>

        {/* The lamp is the visual stand-in for the buzz. It is hidden from
            assistive technology: a light blinking nine times in two seconds is
            not something to narrate, and the row's own name already says what
            the rhythm is. */}
        <span
          data-testid={`pattern-lamp-${pattern.id}`}
          className={`pattern-row__lamp${lampOn ? ' pattern-row__lamp--on' : ''}`}
          aria-hidden="true"
        />

        <Icon name="play" size={26} />
      </button>

      <span className="visually-hidden" id={hintId}>
        {enabled ? patternSemanticLabel(pattern) : 'Turn vibration on to play it.'}
      </span>

      {/* Announced once, rather than on every pulse. */}
      <span className="visually-hidden" role="status">
        {playing ? `Playing the ${pattern.rhythmName} rhythm.` : ''}
      </span>
    </>
  );
}
