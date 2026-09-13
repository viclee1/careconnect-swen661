import type { Contact } from '../models/contact';

/**
 * The contact list exactly as the Week 3 prototype shows it: Joyce marked
 * Primary at the top, then the GP, the two children, and the medical helpline.
 *
 * Avatar initials are carried explicitly rather than derived, because the
 * prototype's own choices ("Joyce" → JO, "NHS 111" → NH) do not follow one
 * mechanical rule.
 */
export const mockContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Joyce',
    role: 'careTeam',
    relationship: 'Caregiver · Daughter',
    avatarInitials: 'JO',
    textNumber: '07700 900 456',
    channels: ['message', 'videoRelay'],
    isPrimary: true,
  },
  {
    id: 'c2',
    name: 'Dr. Sharma',
    role: 'doctor',
    relationship: 'GP — Greenfield Surgery',
    avatarInitials: 'DS',
    textNumber: '01234 567 890',
    channels: ['message', 'videoRelay'],
  },
  {
    id: 'c3',
    name: 'Maria',
    role: 'family',
    relationship: 'Daughter',
    avatarInitials: 'MA',
    textNumber: '07700 900 123',
    channels: ['message', 'videoRelay'],
  },
  {
    id: 'c4',
    name: 'James',
    role: 'family',
    relationship: 'Son',
    avatarInitials: 'JA',
    textNumber: '07700 900 789',
    channels: ['message'],
  },
  {
    id: 'c5',
    name: 'NHS 111',
    role: 'helpline',
    relationship: 'Medical helpline',
    avatarInitials: 'NH',
    textNumber: '18001 111',
    channels: ['textRelay', 'message'],
    isEmergency: true,
  },
];
