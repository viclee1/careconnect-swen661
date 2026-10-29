import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Save } from 'lucide-react';

import Field from '../Field';
import {
  categoryLabel,
  firstErrorField,
  memoryLimits,
  validateMemoryDraft,
  type MemoryCategory,
  type MemoryDraft,
  type MemoryErrors,
} from '../../models/memory';

const categoryOptions = Object.entries(categoryLabel) as Array<[MemoryCategory, string]>;

/**
 * Scrolls `el` into view below the sticky header, at once. Focus alone is not
 * enough: WebKit's focus scroll ignores `scroll-padding-top` (or does not
 * scroll up at all), and `scrollIntoView` animates in Chromium even under
 * reduced motion, so the field can be measured — and seen — under the header.
 */
function revealBelowHeader(el: HTMLElement) {
  const clearance = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const { top, bottom } = el.getBoundingClientRect();
  if (top < clearance || bottom > window.innerHeight) {
    window.scrollTo({ top: window.scrollY + top - clearance, behavior: 'instant' });
  }
}

/**
 * The Add a memory form.
 *
 * Errors are checked on Save, not while typing, so nobody is told off for a
 * field they have not finished. Each one is printed under its field, linked
 * with `aria-describedby`, and focus moves to the first field to fix. After
 * that first Save, errors clear as soon as the field is put right.
 *
 * Escape closes the form and keeps the draft, so a slip of the finger does not
 * throw away a story the user was halfway through typing.
 */
export default function AddMemoryForm({
  draft,
  onDraftChange,
  onSave,
  onCancel,
}: {
  draft: MemoryDraft;
  onDraftChange: (draft: MemoryDraft) => void;
  onSave: (draft: MemoryDraft) => void;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<MemoryErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingId = useId();
  const categoryId = useId();
  const categoryErrorId = useId();
  const pinId = useId();
  // The field to focus after Save, set as a fresh object each time so that a
  // second failed Save moves focus again. Handled after render, once the error
  // messages are in the layout and can no longer shift the field.
  const [focusRequest, setFocusRequest] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (!focusRequest) return;
    const field = formRef.current?.elements.namedItem(focusRequest.name);
    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true });
      revealBelowHeader(field);
    }
  }, [focusRequest]);

  function update(change: Partial<MemoryDraft>) {
    const next = { ...draft, ...change };
    onDraftChange(next);
    if (submitted) setErrors(validateMemoryDraft(next));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const found = validateMemoryDraft(draft);
    setErrors(found);
    const first = firstErrorField(found);
    if (first) {
      setFocusRequest({ name: first });
      return;
    }
    onSave(draft);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  }

  const bodyLeft = memoryLimits.body - draft.body.trim().length;

  return (
    <form
      ref={formRef}
      id="add-memory-form"
      aria-labelledby={headingId}
      noValidate
      onSubmit={submit}
      onKeyDown={handleKeyDown}
      className="rounded-2xl bg-white border-2 border-calm-300 shadow-card p-5 md:p-6 space-y-5"
    >
      <div>
        <h2 id={headingId} className="text-xl font-bold text-neutral-800">
          Add a memory
        </h2>
        <p className="text-neutral-600 mt-1">
          Fields marked <span aria-hidden="true">*</span>
          <span className="sr-only">required</span> are needed. Your memory is saved on this
          device, so it works without a connection.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Name of the memory"
          name="title"
          required
          value={draft.title}
          onChange={(event) => update({ title: event.target.value })}
          hint={`For example, “Our wedding day”. Up to ${memoryLimits.title} characters.`}
          error={errors.title}
          autoComplete="off"
        />
        <Field
          label="When"
          name="when"
          value={draft.when}
          onChange={(event) => update({ when: event.target.value })}
          hint="Optional. For example, “Summer 1975”."
          error={errors.when}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={categoryId} className="block text-base font-semibold text-neutral-700">
          Kind of memory
          <span className="ml-1 text-alert-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <select
          id={categoryId}
          name="category"
          required
          aria-required="true"
          aria-invalid={errors.category ? 'true' : undefined}
          aria-describedby={errors.category ? categoryErrorId : undefined}
          value={draft.category}
          onChange={(event) => update({ category: event.target.value as MemoryDraft['category'] })}
          className={[
            'block w-full md:w-80 min-h-[2.75rem] rounded-lg border-2 bg-white px-4 py-3 text-base text-neutral-800',
            errors.category ? 'border-alert-500' : 'border-neutral-500 hover:border-neutral-600',
          ].join(' ')}
        >
          <option value="">Choose one…</option>
          {categoryOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p
            id={categoryErrorId}
            role="alert"
            className="flex items-center gap-1.5 text-sm font-medium text-alert-700 leading-snug"
          >
            <span aria-hidden="true" className="font-bold">
              !
            </span>
            {errors.category}
          </p>
        )}
      </div>

      <Field
        multiline
        label="The memory"
        name="body"
        required
        rows={4}
        value={draft.body}
        onChange={(event) => update({ body: event.target.value })}
        hint={
          bodyLeft >= 0
            ? `Who was there, where it was, what made it special. ${bodyLeft} characters left.`
            : `${-bodyLeft} characters over the limit of ${memoryLimits.body}.`
        }
        error={errors.body}
      />

      <div className="flex items-center gap-3">
        <input
          id={pinId}
          type="checkbox"
          checked={draft.pinned}
          onChange={(event) => update({ pinned: event.target.checked })}
          className="w-6 h-6 accent-calm-600 cursor-pointer"
        />
        <label htmlFor={pinId} className="text-base font-semibold text-neutral-700 cursor-pointer min-h-[2.75rem] inline-flex items-center">
          Pin to the top of my memories
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center min-h-[2.75rem] px-5 py-3 rounded-lg border-2 border-neutral-500 bg-white font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 min-h-[2.75rem] px-5 py-3 rounded-lg border-2 border-calm-600 bg-calm-600 font-semibold text-white hover:bg-calm-700 hover:border-calm-700"
        >
          <Save className="w-5 h-5" aria-hidden="true" />
          Save memory
        </button>
      </div>
    </form>
  );
}
