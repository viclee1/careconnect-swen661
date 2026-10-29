import { useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TextInput, View } from 'react-native';

import { AlertBanner } from '../../components/AlertBanner';
import { AppButton } from '../../components/AppButton';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { fixSummary, requiredFieldErrors } from '../../utils/validators';

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
 * field, a summary is shown and announced, and focus moves to the first field
 * to fix — the same pattern as the web and desktop clients.
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
  const inputs = useRef<Partial<Record<K, TextInput | null>>>({});

  function submit() {
    const found = requiredFieldErrors(fields, values);
    setErrors(found);
    const first = fields.find((field) => found[field.name]);
    if (first) {
      AccessibilityInfo.announceForAccessibility(
        `${fixSummary(Object.keys(found).length)}. ${found[first.name]}`,
      );
      inputs.current[first.name]?.focus();
      return;
    }
    const trimmed = Object.fromEntries(
      fields.map((field) => [field.name, values[field.name].trim()]),
    ) as Record<K, string>;
    onSubmit(trimmed);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <View style={styles.form} accessibilityLabel={heading}>
      <Text style={styles.heading} accessibilityRole="header">
        {heading}
      </Text>
      {errorCount > 0 ? (
        <AlertBanner
          tone="error"
          title={fixSummary(errorCount)}
          message="Each one is described under its field."
        />
      ) : null}
      {fields.map((field) => {
        const error = errors[field.name];
        return (
          <View key={field.name} style={styles.field}>
            <Text style={styles.label} importantForAccessibility="no" accessibilityElementsHidden>
              {field.label}
            </Text>
            <TextInput
              ref={(input) => {
                inputs.current[field.name] = input;
              }}
              testID={`field-${field.name}`}
              value={values[field.name]}
              placeholder={field.placeholder}
              accessibilityLabel={field.label}
              accessibilityHint={error ?? field.hint}
              onChangeText={(next) => {
                setValues((current) => ({ ...current, [field.name]: next }));
                if (error && next.trim()) {
                  setErrors((current) => {
                    const rest = { ...current };
                    delete rest[field.name];
                    return rest;
                  });
                }
              }}
              style={[styles.input, error ? styles.inputInvalid : null]}
            />
            {field.hint ? <Text style={styles.hint}>{field.hint}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        );
      })}
      <View style={styles.actions}>
        <AppButton label={submitLabel} icon="check" onPress={submit} />
        <AppButton label="Cancel" variant="outlined" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
  },
  heading: { ...type.cardTitle, color: colors.primaryDark },
  field: { gap: 6 },
  label: { ...type.label, color: colors.primaryDark },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    padding: 14,
    fontSize: 17,
    color: colors.primaryDark,
    minHeight: layout.minTouchTarget,
  },
  inputInvalid: { borderColor: colors.errorText, borderWidth: 2 },
  hint: { ...type.caption, color: colors.secondaryDark },
  error: { ...type.label, color: colors.errorText },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
