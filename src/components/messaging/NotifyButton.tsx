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
      className="w-full flex items-center gap-3 text-left rounded-xl border-2 border-warm-400 bg-warm-50 hover:bg-warm-100 px-4 py-3 min-h-[3.5rem] transition-colors"
    >
      <BellRing className="w-6 h-6 flex-shrink-0 text-warm-800" aria-hidden="true" />
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="font-semibold text-warm-900">Alert {contactName} you want to talk</span>{' '}
        <span className="text-sm text-warm-800">
          {vibrationEnabled
            ? 'Sends a visual flash and vibration — no sound'
            : 'Sends a visual flash — vibration is off in your settings'}
        </span>
      </span>
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-warm-700 text-white"
        aria-hidden="true"
      >
        <BellRing className="w-5 h-5" />
      </span>
    </button>
  );
}
