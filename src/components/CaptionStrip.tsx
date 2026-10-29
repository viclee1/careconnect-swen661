import { useSettings } from '../context/settings';
import { captionColors, captionSizes } from '../models/accessibilitySettings';

/**
 * The design's dark "[CC]" strip: the words of a spoken reminder or call
 * announcement, written out. It follows Accessibility Settings — the header's
 * CC button or the Captions switch hides it, and the caption size and colour
 * apply here as they do on video messages.
 */
export default function CaptionStrip({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  if (!settings.captionsEnabled) return null;

  return (
    <p
      className="m-0 rounded-xl bg-neutral-900 px-4 py-2.5 flex items-start gap-3 leading-snug"
      style={{
        color: captionColors[settings.captionColor].hex,
        fontSize: `${0.875 * captionSizes[settings.captionSize].scale}rem`,
      }}
    >
      <span className="flex-shrink-0 text-neutral-300 font-mono" aria-hidden="true">
        [CC]
      </span>
      <span>
        <span className="sr-only">Caption: </span>
        {children}
      </span>
    </p>
  );
}
