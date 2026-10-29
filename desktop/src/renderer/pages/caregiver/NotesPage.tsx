import { useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { useCaregiver, type NotePriority } from '../../state/CaregiverProvider';
import { formatTime } from './ActivityPage';
import './caregiver.css';

const priorityLabel: Record<NotePriority, string> = {
  routine: 'Routine',
  note: 'Note',
  urgent: 'Urgent',
};

function formatDay(at: Date, now = new Date()): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (at.toDateString() === now.toDateString()) return 'Today';
  if (at.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return at.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Notes caregivers leave for each other about Margaret, newest first. */
export function NotesPage() {
  const { notes, addNote } = useCaregiver();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<NotePriority>('routine');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError('Write the note before saving it.');
      textRef.current?.focus();
      return;
    }
    addNote(text.trim(), priority);
    setText('');
    setPriority('routine');
    setError('');
    setAnnouncement(`${priorityLabel[priority]} note saved.`);
  }

  return (
    <>
      <PageHeader title="Care notes" subtitle="Notes caregivers leave for each other" />
      <div className="page-body">
        <div className="readable stack">
          <section className="care-form" aria-labelledby={`${id}-heading`}>
            <h2 id={`${id}-heading`} className="care-form__heading">
              Add a note
            </h2>
            <form noValidate onSubmit={submit} className="stack">
              <div className="field">
                <label className="field__label" htmlFor={`${id}-text`}>
                  Note
                </label>
                <textarea
                  ref={textRef}
                  id={`${id}-text`}
                  className="field__input"
                  rows={4}
                  value={text}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (error && event.target.value.trim()) setError('');
                  }}
                />
                {error ? (
                  <span className="field__error" id={`${id}-error`} role="alert">
                    {error}
                  </span>
                ) : null}
              </div>
              <fieldset className="priority-choices">
                <legend>Priority</legend>
                {(Object.keys(priorityLabel) as NotePriority[]).map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${id}-priority`}
                      value={value}
                      checked={priority === value}
                      onChange={() => setPriority(value)}
                    />
                    {priorityLabel[value]}
                  </label>
                ))}
              </fieldset>
              <div className="care-form__actions">
                <Button type="submit" icon="check" label="Save note" />
              </div>
            </form>
          </section>

          <p className="visually-hidden" role="status">
            {announcement}
          </p>

          <section aria-labelledby={`${id}-list`} className="stack">
            <h2 id={`${id}-list`}>Notes</h2>
            <ul className="care-list">
              {notes.map((note) => (
                <li key={note.id}>
                  <article
                    className="note-card"
                    aria-label={`${priorityLabel[note.priority]} note from ${note.author}`}
                  >
                    <div className="note-card__body">
                      <p className="note-card__text">{note.text}</p>
                      <p className="note-card__meta">
                        {note.author} · {formatDay(note.at)}, {formatTime(note.at)}
                      </p>
                    </div>
                    <span className={`badge priority-badge--${note.priority}`}>
                      {priorityLabel[note.priority]}
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
