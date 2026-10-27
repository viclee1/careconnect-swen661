import { Video } from 'lucide-react';

/**
 * Asks a contact to join a video call with live captions.
 *
 * This replaces "Call now": a voice call is the one channel a deaf or
 * hard-of-hearing user cannot rely on, so the only call CareConnect offers is a
 * captioned video call, and it never rings — the other person sees a banner.
 * The accessible name starts with the printed words (WCAG 2.5.3) and adds what
 * the icon cannot say.
 */
export default function VideoCallButton({
  contactName,
  onRequest,
}: {
  contactName: string;
  onRequest: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="video-call"
      onClick={onRequest}
      aria-label={`Video call ${contactName} with live captions`}
      className="btn btn-primary rounded-xl"
    >
      <Video className="w-5 h-5" aria-hidden="true" />
      Video call {contactName}
    </button>
  );
}
