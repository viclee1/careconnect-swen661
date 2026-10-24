import { initialsFor, type AvatarTone, type Contact } from '../../models/contact';

// White initials on each tone measure 4.5:1 or more.
const toneClasses: Record<AvatarTone, string> = {
  calm: 'bg-calm-600',
  teal: 'bg-[#1d6b78]',
  green: 'bg-success-600',
  amber: 'bg-[#94540a]',
  rose: 'bg-alert-600',
};

const sizeClasses = {
  md: 'w-12 h-12 text-base',
  lg: 'w-14 h-14 text-lg',
} as const;

/**
 * A contact's lettered avatar, with a red count of messages waiting on its
 * corner as the design draws it.
 *
 * Decorative: the name it stands for is always printed beside it, and the
 * count is written out in words by whoever renders the avatar, so the whole
 * thing is hidden from assistive technology.
 */
export default function ContactAvatar({
  contact,
  waiting = 0,
  size = 'md',
}: {
  contact: Contact;
  waiting?: number;
  size?: keyof typeof sizeClasses;
}) {
  return (
    <span className="relative flex-shrink-0" aria-hidden="true">
      <span
        className={[
          'rounded-full flex items-center justify-center font-bold text-white',
          sizeClasses[size],
          toneClasses[contact.avatarTone ?? 'calm'],
        ].join(' ')}
      >
        {initialsFor(contact)}
      </span>
      {waiting > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.375rem] h-[1.375rem] px-1 rounded-full bg-alert-600 border-2 border-white text-white text-xs font-bold flex items-center justify-center">
          {waiting}
        </span>
      )}
    </span>
  );
}
