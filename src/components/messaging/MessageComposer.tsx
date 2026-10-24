import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

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
 * Mac) sends, and so does the Send button.
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

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={`Message ${contactName}`}
      className="border-t-2 border-neutral-200 pt-4 space-y-2"
    >
      <label htmlFor={fieldId} className="block text-base font-semibold text-neutral-800">
        Message {contactName}
      </label>
      <div className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          id={fieldId}
          data-testid="composer-input"
          rows={2}
          value={draft}
          maxLength={maxMessageLength + 100}
          placeholder={`Write to ${contactName}…`}
          aria-describedby={[error ? errorId : '', hintId].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className={[
            'flex-1 min-w-0 rounded-lg border-2 bg-white px-4 py-3 text-base text-neutral-800',
            'placeholder:text-neutral-500 resize-y focus:outline-none',
            error ? 'border-alert-500' : 'border-neutral-400 hover:border-neutral-500 focus:border-calm-600',
          ].join(' ')}
        />
        <button type="submit" data-testid="composer-send" className="btn btn-primary flex-shrink-0">
          <Send className="w-5 h-5" aria-hidden="true" />
          Send
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-alert-700 font-semibold">
          {error}
        </p>
      )}

      <p id={hintId} className="flex flex-wrap justify-between gap-x-4 text-sm text-neutral-600">
        <span>
          Press <kbd className="font-mono font-semibold">Ctrl</kbd>+
          <kbd className="font-mono font-semibold">Enter</kbd> to send. Enter starts a new line.
        </span>
        {/* Polite: the count changes on every keystroke, so an assertive region
            here would talk over the user's own typing. */}
        <span role="status">{remaining} characters left</span>
      </p>
    </form>
  );
});

export default MessageComposer;
