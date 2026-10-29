import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { ReadableWidth } from '../../components/ReadableWidth';
import {
  formatEventDay,
  formatEventTime,
  notePriorities,
  notePriorityLabel,
  type NotePriority,
} from '../../models/caregiver';
import { useCaregiver } from '../../state/CaregiverProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { Notice } from './EditableCard';

/** The badge colours for each priority — shape and word, never colour alone. */
const priorityStyle: Record<NotePriority, { fill: string; text: string }> = {
  routine: { fill: colors.secondaryLight, text: colors.primaryDark },
  note: { fill: colors.warningFill, text: colors.warningText },
  urgent: { fill: colors.errorFill, text: colors.errorText },
};

/** Notes caregivers leave for each other about Margaret, newest first. */
export function NotesScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { notes, addNote } = useCaregiver();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<NotePriority>('routine');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<TextInput>(null);

  function save() {
    if (!text.trim()) {
      const message = 'Write the note before saving it.';
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      input.current?.focus();
      return;
    }
    addNote(text.trim(), priority);
    const message = `${notePriorityLabel[priority]} note saved.`;
    setText('');
    setPriority('routine');
    setError('');
    setNotice(message);
    AccessibilityInfo.announceForAccessibility(message);
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Care notes"
        subtitle="Notes caregivers leave for each other"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.heading} accessibilityRole="header">
              Add a note
            </Text>
            <TextInput
              ref={input}
              testID="note-text"
              value={text}
              multiline
              numberOfLines={4}
              accessibilityLabel="Note"
              accessibilityHint={error || undefined}
              placeholder="What happened, and what the next caregiver should know"
              onChangeText={(next) => {
                setText(next);
                if (error && next.trim()) setError('');
              }}
              style={[styles.input, error ? styles.inputInvalid : null]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.choices} accessibilityRole="radiogroup" accessibilityLabel="Priority">
              {notePriorities.map((value) => {
                const selected = priority === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setPriority(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={notePriorityLabel[value]}
                    style={[styles.choice, selected ? styles.choiceSelected : null]}
                  >
                    <View style={[styles.dot, selected ? styles.dotSelected : null]} />
                    <Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>
                      {notePriorityLabel[value]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <AppButton label="Save note" icon="check" onPress={save} />
          </View>

          {notice ? <Notice message={notice} onDismiss={() => setNotice('')} /> : null}

          <Text style={styles.sectionTitle} accessibilityRole="header">
            Notes
          </Text>
          {notes.map((note) => {
            const when = `${formatEventDay(note.at)}, ${formatEventTime(note.at)}`;
            const label = notePriorityLabel[note.priority];
            return (
              <View
                key={note.id}
                style={styles.note}
                accessible
                accessibilityLabel={`${label} note from ${note.author}, ${when}. ${note.text}`}
              >
                <View style={styles.noteBody}>
                  <Text style={styles.noteText}>{note.text}</Text>
                  <Text style={styles.noteMeta}>
                    {note.author} · {when}
                  </Text>
                </View>
                <View
                  style={[styles.badge, { backgroundColor: priorityStyle[note.priority].fill, borderColor: priorityStyle[note.priority].text }]}
                >
                  <Text style={[styles.badgeText, { color: priorityStyle[note.priority].text }]}>
                    {label}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  form: {
    gap: 12,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  heading: { ...type.cardTitle, color: colors.primaryDark },
  label: { ...type.label, color: colors.primaryDark },
  input: {
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    padding: 14,
    fontSize: 17,
    color: colors.primaryDark,
    textAlignVertical: 'top',
  },
  inputInvalid: { borderColor: colors.errorText, borderWidth: 2 },
  error: { ...type.label, color: colors.errorText },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 14,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceSelected: { borderColor: colors.primaryDark, borderWidth: 2, backgroundColor: colors.secondaryLight },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.primaryDark },
  dotSelected: { backgroundColor: colors.primaryDark },
  choiceText: { ...type.bodySmall, color: colors.primaryDark },
  choiceTextSelected: { fontWeight: '700', textDecorationLine: 'underline' },
  sectionTitle: { ...type.sectionTitle, color: colors.primaryDark },
  note: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  noteBody: { flex: 1, gap: 4 },
  noteText: { ...type.label, color: colors.primaryDark },
  noteMeta: { ...type.caption, color: colors.secondaryDark },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: layout.radius,
    borderWidth: 1.5,
  },
  badgeText: { ...type.caption, fontWeight: '700' },
});
