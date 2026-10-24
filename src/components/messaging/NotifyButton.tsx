import { BellRing } from 'lucide-react';

/**
 * CareConnect's answer to "give me a ring": it lights up the other person's
 * screen and buzzes their phone, and plays nothing. The second line says
 * exactly what will happen, because a user who cannot hear a ringtone has no
 * way to verify it afterwards and should not have to guess.
 *
 * No aria-label: the name is the printed title and subtitle, so what is
 * announced is what is on screen (WCAG 2.5.3).
 */
export default function NotifyButton({
  contactName,
  vibrationEnabled,
  onActivate,
}: {
  contactName: string;
  /** Mirrors the user's own vibration setting, which the wording reflects. */
  vibrationEnabled: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="notify-button"
      onClick={onActivate}
      className="w-full flex items-center gap-4 text-left rounded-xl border-2 border-warm-300 bg-warm-50 hover:bg-warm-100 px-4 py-3 min-h-[3.5rem] transition-colors"
    >
      <BellRing className="w-7 h-7 flex-shrink-0 text-warm-800" aria-hidden="true" />
      <span className="flex flex-col">
        <span className="font-bold text-neutral-800">Alert {contactName} you want to talk</span>{' '}
        <span className="text-sm text-neutral-700">
          {vibrationEnabled
            ? 'Sends a visual flash and vibration — no sound'
            : 'Sends a visual flash — vibration is off in your settings'}
        </span>
      </span>
    </button>
  );
}
