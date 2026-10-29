import type { DailyTask } from './DailyTask';

/** Who is using the app: the person cared for, or someone caring for them. */
export type Role = 'patient' | 'caregiver';

/** What the care recipient did, as the caregiver's activity log names it. */
export type ActivityKind = 'med_taken' | 'med_untaken' | 'task_done' | 'check_in';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  /** The sentence the log shows — "Took Amlodipine". */
  label: string;
  at: Date;
}

export type NotePriority = 'routine' | 'note' | 'urgent';

export interface CaregiverNote {
  id: string;
  author: string;
  text: string;
  priority: NotePriority;
  at: Date;
}

export const activityKindLabel: Record<ActivityKind, string> = {
  med_taken: 'Medicine taken',
  med_untaken: 'Medicine unmarked',
  task_done: 'Task finished',
  check_in: 'Checked in',
};

export const notePriorityLabel: Record<NotePriority, string> = {
  routine: 'Routine',
  note: 'Note',
  urgent: 'Urgent',
};

export const notePriorities: NotePriority[] = ['routine', 'note', 'urgent'];

/** The event logged when the care recipient ticks a medicine one way or the other. */
export function activityForMedicine(
  name: string,
  nowTaken: boolean,
): { kind: ActivityKind; label: string } {
  return nowTaken
    ? { kind: 'med_taken', label: `Took ${name}` }
    : { kind: 'med_untaken', label: `Unmarked ${name}` };
}

/** Whether a My Day task is the morning check-in, which the caregiver tracks on its own. */
export function isCheckIn(task: Pick<DailyTask, 'title'>): boolean {
  return /check-in/i.test(task.title);
}

/** The event logged when the care recipient finishes a My Day task. */
export function activityForTask(task: Pick<DailyTask, 'title'>): {
  kind: ActivityKind;
  label: string;
} {
  return isCheckIn(task)
    ? { kind: 'check_in', label: 'Checked in for the day' }
    : { kind: 'task_done', label: `Finished: ${task.title}` };
}

/** "8:35 AM" — the time an event happened. */
export function formatEventTime(at: Date): string {
  return at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** "Today", "Yesterday", or "Wednesday 3 June". */
export function formatEventDay(at: Date, now: Date = new Date()): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (at.toDateString() === now.toDateString()) return 'Today';
  if (at.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return at.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** "1 event" / "3 events". */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** The caregiver's notes the design starts with. */
export function seedNotes(now: Date = new Date()): CaregiverNote[] {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return [
    {
      id: 'note-2',
      author: 'Joyce Adeyemi',
      text: 'Margaret mentioned her left knee is a little sore today. She skipped the garden walk but did gentle seated exercises instead. Worth raising at the GP review.',
      priority: 'note',
      at: now,
    },
    {
      id: 'note-1',
      author: 'Maria Thompson',
      text: "Lovely video call with Mum yesterday. She remembered Ella's school play and asked about the cat.",
      priority: 'routine',
      at: yesterday,
    },
  ];
}
