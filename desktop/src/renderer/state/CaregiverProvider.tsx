import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

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

export interface CaregiverValue {
  /** Newest first. */
  activity: ActivityEvent[];
  record: (kind: ActivityKind, label: string) => void;
  /** Newest first. */
  notes: CaregiverNote[];
  addNote: (text: string, priority: NotePriority) => void;
}

const CaregiverContext = createContext<CaregiverValue | null>(null);

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

/**
 * The caregiver's side of the shared plan: what the care recipient has done
 * (recorded as they tick things off) and the notes caregivers leave for each
 * other. In memory, like the rest of the desktop client's care data.
 */
export function CaregiverProvider({
  children,
  author = 'Joyce Adeyemi',
  initialNotes,
}: {
  children: ReactNode;
  /** Who a new note is signed by. */
  author?: string;
  initialNotes?: CaregiverNote[];
}) {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [notes, setNotes] = useState<CaregiverNote[]>(() => initialNotes ?? seedNotes());
  const nextId = useRef(1);

  const record = useCallback((kind: ActivityKind, label: string) => {
    const event: ActivityEvent = { id: `evt-${nextId.current++}`, kind, label, at: new Date() };
    setActivity((current) => [event, ...current]);
  }, []);

  const addNote = useCallback(
    (text: string, priority: NotePriority) => {
      const note: CaregiverNote = {
        id: `note-new-${nextId.current++}`,
        author,
        text,
        priority,
        at: new Date(),
      };
      setNotes((current) => [note, ...current]);
    },
    [author],
  );

  const value = useMemo<CaregiverValue>(
    () => ({ activity, record, notes, addNote }),
    [activity, record, notes, addNote],
  );

  return <CaregiverContext.Provider value={value}>{children}</CaregiverContext.Provider>;
}

export function useCaregiver(): CaregiverValue {
  const value = useContext(CaregiverContext);
  if (!value) throw new Error('useCaregiver must be used inside a CaregiverProvider');
  return value;
}

const ignore = () => undefined;

/**
 * Records an event in the activity log when one is mounted, and does nothing
 * when it is not, so the care recipient's pages and providers work on their
 * own in tests and never depend on the caregiver's.
 */
export function useActivityRecorder(): (kind: ActivityKind, label: string) => void {
  return useContext(CaregiverContext)?.record ?? ignore;
}
