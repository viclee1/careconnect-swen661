import { useId, useState, type FormEvent } from 'react';

import { Button } from '../../components/Button';

export interface EditField<K extends string> {
  name: K;
  label: string;
  placeholder?: string;
  hint?: string;
}

/**
 * The caregiver's add / edit form: labelled text fields, all required.
 *
 * Errors are checked on Save, not while typing. Each is printed under its
 * field and linked with `aria-describedby`, a summary is announced, and focus
 * moves to the first field to fix — the same pattern as the web client.
 */
export function EditForm<K extends string>({
  heading,
  fields,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  heading: string;
  fields: EditField<K>[];
  initial: Record<K, string>;
  submitLabel: string;
  onSubmit: (values: Record<K, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<K, string>>(initial);
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  const idPrefix = useId();
  const headingId = `${idPrefix}-heading`;
  const fieldId = (name: K) => `${idPrefix}-${name}`;

  function submit(event: FormEvent) {
    event.preventDefault();
    const found: Partial<Record<K, string>> = {};
    for (const field of fields) {
      if (!values[field.name].trim()) found[field.name] = `${field.label} is required.`;
    }
    setErrors(found);
    const first = fields.find((field) => found[field.name]);
    if (first) {
      document.getElementById(fieldId(first.name))?.focus();
      return;
    }
    const trimmed = Object.fromEntries(
      fields.map((field) => [field.name, values[field.name].trim()]),
    ) as Record<K, string>;
    onSubmit(trimmed);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <section className="care-form" aria-labelledby={headingId}>
      <h2 id={headingId} className="care-form__heading">
        {heading}
      </h2>
      {errorCount > 0 ? (
        <p className="auth-error-banner" role="alert">
          {errorCount === 1 ? '1 thing needs fixing' : `${errorCount} things need fixing`} before
          this can be saved.
        </p>
      ) : null}
      <form noValidate onSubmit={submit} className="stack">
        {fields.map((field) => {
          const error = errors[field.name];
          const id = fieldId(field.name);
          const describedBy = [field.hint ? `${id}-hint` : '', error ? `${id}-error` : '']
            .filter(Boolean)
            .join(' ');
          return (
            <div className="field" key={field.name}>
              <label className="field__label" htmlFor={id}>
                {field.label}
              </label>
              <input
                id={id}
                className="field__input"
                value={values[field.name]}
                placeholder={field.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((current) => ({ ...current, [field.name]: next }));
                  if (error && next.trim()) {
                    setErrors((current) => {
                      const rest = { ...current };
                      delete rest[field.name];
                      return rest;
                    });
                  }
                }}
              />
              {field.hint ? (
                <span className="field__hint" id={`${id}-hint`}>
                  {field.hint}
                </span>
              ) : null}
              {error ? (
                <span className="field__error" id={`${id}-error`}>
                  {error}
                </span>
              ) : null}
            </div>
          );
        })}
        <div className="care-form__actions">
          <Button type="submit" label={submitLabel} icon="check" />
          <Button type="button" variant="outlined" label="Cancel" onClick={onCancel} />
        </div>
      </form>
    </section>
  );
}
