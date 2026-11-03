import { useRef, useState } from 'react';
import { AccessibilityInfo, type TextInput } from 'react-native';

import { fixSummary } from '../utils/validators';

type Errors<K extends string> = Partial<Record<K, string>>;

/**
 * A form checked on submit, the way EditForm and the web and desktop clients
 * do it: nothing is flagged while the user is still typing; on submit each
 * problem is printed under its field, the count and the first problem are
 * announced, and focus moves to the first field to fix. After that, an error
 * clears as soon as its field is put right — and a field that depends on
 * another (Confirm password) is re-checked when the other changes.
 *
 * `order` is the screen order, which decides the field focused first. Each
 * input registers itself with `ref={(input) => setInput(name, input)}`.
 */
export function useCheckedForm<K extends string>(
  order: K[],
  initial: Record<K, string>,
  validate: (values: Record<K, string>) => Errors<K>,
  onValid: (values: Record<K, string>) => void,
) {
  const [values, setValues] = useState<Record<K, string>>(initial);
  const [errors, setErrors] = useState<Errors<K>>({});
  const inputs = useRef<Partial<Record<K, TextInput | null>>>({});

  function setInput(name: K, input: TextInput | null) {
    inputs.current[name] = input;
  }

  function change(name: K, next: string) {
    const nextValues = { ...values, [name]: next };
    setValues(nextValues);
    // Only fields already flagged are re-checked: typing never adds an error.
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const fresh = validate(nextValues);
      const kept: Errors<K> = {};
      for (const key of Object.keys(current) as K[]) {
        if (fresh[key]) kept[key] = fresh[key];
      }
      return kept;
    });
  }

  function submit() {
    const found = validate(values);
    setErrors(found);
    const first = order.find((name) => found[name]);
    if (first) {
      AccessibilityInfo.announceForAccessibility(
        `${fixSummary(Object.keys(found).length)}. ${found[first]}`,
      );
      inputs.current[first]?.focus();
      return;
    }
    onValid(values);
  }

  return { values, errors, errorCount: Object.keys(errors).length, setInput, change, submit };
}
