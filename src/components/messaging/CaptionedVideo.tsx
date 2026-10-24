import { useEffect, useRef, useState } from 'react';
import { Captions, Pause, Play } from 'lucide-react';

import { useSettings } from '../../context/settings';
import { captionColors, captionFontSize } from '../../models/accessibilitySettings';
import type { Message } from '../../models/message';
import { captionLines } from '../../utils/captions';

/** How long each caption line stays on screen while the message plays. */
export const CAPTION_LINE_MS = 2500;

/**
 * A video message drawn as the design shows it: a dark frame with a play
 * button and the caption track over its lower edge, in the size and colour
 * chosen in Accessibility Settings.
 *
 * Playing it steps through the caption lines in time, the way a captioned
 * player would. The full words are also printed under the frame by the
 * message bubble, so nothing depends on watching the playback.
 */
export default function CaptionedVideo({
  message,
  contactName,
}: {
  message: Message;
  contactName: string;
}) {
  const { settings } = useSettings();
  const lines = captionLines(message.body);
  const [line, setLine] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const playing = line >= 0;
  const showCaptions = settings.captionsEnabled && message.hasCaptions;

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setLine(-1);
  }

  function play() {
    stop();
    setLine(0);
    timer.current = setInterval(() => {
      setLine((current) => {
        if (current + 1 >= lines.length) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          return -1;
        }
        return current + 1;
      });
    }, CAPTION_LINE_MS);
  }

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const caption = playing ? lines[line] : lines[0];

  return (
    <div className="relative flex flex-col items-center justify-between gap-3 bg-neutral-800 px-3 pt-8 pb-3 min-h-[9rem] md:min-h-[11rem]">
      <button
        type="button"
        onClick={playing ? stop : play}
        data-testid={`video-play-${message.id}`}
        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/95 text-calm-700 hover:bg-white"
      >
        {playing ? (
          <Pause className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" aria-hidden="true" />
        )}
        <span className="sr-only">
          {playing ? 'Pause' : 'Play'} video message from {contactName}
        </span>
      </button>

      {showCaptions ? (
        // The caption track is decorative here: the same words are printed in
        // full below the video, so a screen reader reads them once.
        <p
          data-testid={`video-caption-${message.id}`}
          aria-hidden="true"
          className="w-full rounded-md bg-black/80 px-3 py-1.5 font-semibold leading-snug"
          style={{
            color: captionColors[settings.captionColor].hex,
            fontSize: `${Math.min(captionFontSize(settings), 24)}px`,
          }}
        >
          [CC] {caption}
        </p>
      ) : (
        <p className="w-full flex items-center gap-2 rounded-md bg-black/80 px-3 py-1.5 text-sm font-semibold text-white">
          <Captions className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {message.hasCaptions ? 'Captions are off in your settings' : 'No captions on this video'}
        </p>
      )}
    </div>
  );
}
