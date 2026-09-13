import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { canSend, charactersRemaining, validateMessage } from '../../utils/validators';

/**
 * The box at the bottom of a conversation where a message is typed.
 *
 * Validation is deliberately visible rather than silent: the explanation
 * appears under the field as text, because a greyed-out button on its own is a
 * colour-only signal.
 */
export function MessageComposer({
  contactName,
  onSend,
}: {
  contactName: string;
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState('');
  // Only shown once the user has tried to send, so the field does not scold
  // them for an empty box they have not touched yet.
  const [showError, setShowError] = useState(false);

  const error = showError ? validateMessage(draft) : null;

  const handleSend = () => {
    if (!canSend(draft)) {
      setShowError(true);
      return;
    }
    onSend(draft.trim());
    setDraft('');
    setShowError(false);
  };

  return (
    <View style={styles.composer}>
      <View style={styles.row}>
        <TextInput
          testID="composer-input"
          value={draft}
          onChangeText={setDraft}
          multiline
          placeholder={`Message ${contactName}…`}
          placeholderTextColor={colors.secondaryDark}
          accessibilityLabel={`Message ${contactName}`}
          style={styles.input}
        />
        <AppButton
          testID="composer-send"
          label="Send"
          icon="send"
          onPress={handleSend}
          accessibilityLabel={
            canSend(draft) ? `Send message to ${contactName}` : 'Send. Type a message first.'
          }
        />
      </View>

      <Text style={styles.counter}>{charactersRemaining(draft)} characters left</Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.primaryLight,
    padding: 12,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondaryLight,
    color: colors.primaryDark,
    ...type.body,
  },
  counter: { ...type.caption, color: colors.secondaryDark },
  error: { ...type.bodySmall, color: colors.errorText, fontWeight: '600' },
});
