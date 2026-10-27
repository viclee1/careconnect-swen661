import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

import QuickReplies from './QuickReplies';
import { canSend, charactersRemaining, maxMessageLength, validateMessage } from '../../utils/validators';

export interface ComposerHandle {
  focus: () => void;
}

/**
 * The form at the bottom of a conversation where a message is typed.
 *
 * Validation is visible rather than silent: the reason a message cannot be
 * sent appears under the field as text and is announced, because a greyed-out
 * button on its own is a colour-only signal. The field is linked to the error
 * with aria-describedby and marked aria-invalid.
 *
 * Enter starts a new line, as it does in a letter; Ctrl+Enter (⌘+Enter on a
 * Mac) sends, and so does the Send button. The quick-replies menu on the left
 * drops a ready-made reply into the field.
 */
const MessageComposer = forwardRef<
  ComposerHandle,
  { contactName: string; onSend: (body: string) => void }
>(function MessageComposer({ contactName, onSend }, ref) {
  const [draft, setDraft] = useState('');
  // Only shown once the user has tried to send, so the field does not scold
  // them for an empty box they have not touched yet.
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();
  const errorId = useId();
  const hintId = useId();

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  const error = showError ? validateMessage(draft) : null;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend(draft)) {
      setShowError(true);
      inputRef.current?.focus();
      return;
    }
    onSend(draft.trim());
    setDraft('');
    setShowError(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  }

  const remaining = charactersRemaining(draft);

  function insertReply(reply: string) {
    setDraft((current) => (current.trim().length > 0 ? `${current.trimEnd()} ${reply}` : reply));
    setShowError(false);
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={`Message ${contactName}`}
      className="border-t-2 border-neutral-200 bg-white rounded-b-2xl px-3 pt-3 pb-2 md:px-4 space-y-1.5"
    >
      {/* Named for screen readers; the placeholder says the same thing on screen. */}
      <label htmlFor={fieldId} className="sr-only">
        Message {contactName}
      </label>
      <div className="flex items-end gap-2 md:gap-3">
        <QuickReplies onChoose={insertReply} />
        <textarea
          ref={inputRef}
          id={fieldId}
          data-testid="composer-input"
          rows={1}
          value={draft}
          maxLength={maxMessageLength + 100}
          placeholder={`Message ${contactName}…`}
          aria-describedby={[error ? errorId : '', hintId].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className={[
            // Two lines tall on phones, where "Message Maria…" wraps at the
            // base 18px size rather than being cut off; one line from 768px.
            'flex-1 min-w-0 min-h-[4.75rem] md:min-h-touch rounded-xl border-2 bg-white px-3 md:px-4 py-2.5 text-base text-neutral-800',
            'placeholder:text-neutral-500 resize-y',
            error ? 'border-alert-500' : 'border-neutral-400 hover:border-neutral-500 focus:border-calm-600',
          ].join(' ')}
        />
        <button
          type="submit"
          data-testid="composer-send"
          className="inline-flex items-center justify-center gap-2 min-h-touch min-w-touch rounded-xl bg-calm-600 px-0 md:px-4 font-semibold text-white hover:bg-calm-700 flex-shrink-0"
        >
          <Send className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">Send</span>
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-alert-700 font-semibold">
          {error}
        </p>
      )}

      <p id={hintId} className="flex flex-wrap justify-between gap-x-4 text-sm text-neutral-600">
        <span>
          <kbd className="font-mono font-semibold">Ctrl</kbd>+
          <kbd className="font-mono font-semibold">Enter</kbd> sends. Enter starts a new line.
        </span>
        {/* Polite: the count changes on every keystroke, so an assertive region
            here would talk over the user's own typing. */}
        <span role="status">{remaining} characters left</span>
      </p>
    </form>
  );
});

export default MessageComposer;
