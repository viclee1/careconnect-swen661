import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  seedNotes,
  type ActivityEvent,
  type ActivityKind,
  type CaregiverNote,
  type NotePriority,
  type Role,
} from '../models/caregiver';

export interface CaregiverValue {
  /** Who is using the app this session. */
  role: Role;
  setRole: (role: Role) => void;
  /** Newest first. */
  activity: ActivityEvent[];
  record: (kind: ActivityKind, label: string) => void;
  /** Newest first. */
  notes: CaregiverNote[];
  addNote: (text: string, priority: NotePriority) => void;
}

const CaregiverContext = createContext<CaregiverValue | null>(null);

/**
 * The caregiver's side of the shared plan: who is using the app, what the
 * care recipient has done (recorded as they tick things off), and the notes
 * caregivers leave for each other. In memory, like the rest of this client's
 * care data; the app starts at Welcome each launch, and the role is chosen
 * after signing in.
 */
export function CaregiverProvider({
  children,
  initialRole = 'patient',
  author = 'Joyce Adeyemi',
  initialNotes,
}: {
  children: ReactNode;
  initialRole?: Role;
  /** Who a new note is signed by. */
  author?: string;
  initialNotes?: CaregiverNote[];
}) {
  const [role, setRole] = useState<Role>(initialRole);
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
    () => ({ role, setRole, activity, record, notes, addNote }),
    [role, activity, record, notes, addNote],
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
 * when it is not, so the care recipient's providers work on their own in
 * tests and never depend on the caregiver's.
 */
export function useActivityRecorder(): (kind: ActivityKind, label: string) => void {
  return useContext(CaregiverContext)?.record ?? ignore;
}
