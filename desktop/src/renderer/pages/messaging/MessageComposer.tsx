import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';

import { Button } from '../../components/Button';
import { isMacPlatform } from '../../platform/bridge';
import { shortcutLabel } from '../../../shared/shortcuts';
import { canSend, charactersRemaining, validateMessage } from '../../utils/validators';

export interface ComposerHandle {
  /** Sends the current draft, if there is one. Returns whether it sent. */
  submit: () => boolean;
  focus: () => void;
}

/**
 * The box at the bottom of a conversation where a message is typed.
 *
 * Validation is deliberately visible rather than silent: the explanation
 * appears under the field as text, because a greyed-out button on its own is a
 * colour-only signal.
 *
 * Two desktop details the phone does not have. The field is a `<textarea>`, so
 * Enter inserts a newline the way it does in every desktop messaging client,
 * and Ctrl/Cmd+Enter sends — the convention this application shares with the
 * rest of the desktop rather than inventing its own. And the character counter
 * is a live region, so a screen-reader user hears the remaining allowance
 * approaching rather than discovering the limit by being refused.
 */
export const MessageComposer = forwardRef<
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

  const error = showError ? validateMessage(draft) : null;

  const send = (): boolean => {
    if (!canSend(draft)) {
      setShowError(true);
      inputRef.current?.focus();
      return false;
    }
    onSend(draft.trim());
    setDraft('');
    setShowError(false);
    return true;
  };

  useImperativeHandle(ref, () => ({
    submit: send,
    focus: () => inputRef.current?.focus(),
  }));

  const remaining = charactersRemaining(draft);
  const sendKeys = shortcutLabel('CmdOrCtrl+Enter', isMacPlatform());

  return (
    <div className="composer">
      <div className="composer__row">
        <label className="visually-hidden" htmlFor={fieldId}>
          Message {contactName}
        </label>
        <textarea
          ref={inputRef}
          id={fieldId}
          data-testid="composer-input"
          className="composer__input"
          rows={2}
          value={draft}
          placeholder={`Message ${contactName}…`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          data-testid="composer-send"
          label="Send"
          icon="send"
          onClick={send}
          aria-label={
            canSend(draft)
              ? `Send message to ${contactName}. ${sendKeys}.`
              : 'Send. Type a message first.'
          }
        />
      </div>

      <div className="composer__meta">
        {/* Announced politely: the count changes on every keystroke, so an
            assertive region here would talk over the user's own typing. */}
        <span role="status">{remaining} characters left</span>
        <span>
          Press <kbd>{sendKeys}</kbd> to send. Enter starts a new line.
        </span>
      </div>

      {error ? (
        <p id={errorId} className="composer__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
