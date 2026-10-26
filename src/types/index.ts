// ── Shared domain types ───────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';
export type StatusBadge = 'success' | 'warning' | 'alert' | 'calm' | 'neutral';

// ── Schedule ─────────────────────────────────────────────────────────────

export interface ScheduleItem {
  id: string;
  time: string;        // "HH:MM" 24h
  label: string;
  description?: string;
  category: 'meal' | 'medication' | 'activity' | 'appointment' | 'rest';
  done: boolean;
}

// ── Medications ──────────────────────────────────────────────────────────

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];     // ["08:00", "20:00"]
  instructions?: string;
  colour: string;      // Tailwind bg class for pill visualisation
  taken: Record<string, boolean>; // date "YYYY-MM-DD" → taken?
}

// ── Memories ─────────────────────────────────────────────────────────────

export interface MemoryCard {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  /** Wider versions of the photo for `srcset`, e.g. "/memories/mc1-800.webp 800w". */
  imageSrcSet?: string;
  /** What the photo shows, for people who cannot see it. */
  imageAlt?: string;
  category: 'family' | 'place' | 'event' | 'hobby' | 'pet';
  pinned: boolean;
  /** When it happened, in the user's own words — "Summer 1975". */
  when?: string;
  /** Saved by the user on the Memories screen, so they may remove it. */
  addedByUser?: boolean;
}

// ── Caregiver notes ───────────────────────────────────────────────────────

export interface CaregiverNote {
  id: string;
  date: string;        // "YYYY-MM-DD"
  author: string;
  note: string;
  priority: Priority;
}

// ── App user context ──────────────────────────────────────────────────────

export type AppView = 'patient' | 'caregiver';
