import '../models/contact.dart';

/// The contact list exactly as the Week 3 prototype shows it: Joyce marked
/// Primary at the top, then the GP, the two children, and the medical helpline.
///
/// Avatar initials are carried explicitly rather than derived, because the
/// prototype's own choices ("Joyce" → JO, "NHS 111" → NH) do not follow one
/// mechanical rule.
const List<Contact> kMockContacts = <Contact>[
  Contact(
    id: 'c1',
    name: 'Joyce',
    role: ContactRole.careTeam,
    relationship: 'Caregiver · Daughter',
    avatarInitials: 'JO',
    textNumber: '07700 900 456',
    channels: <ContactChannel>[
      ContactChannel.message,
      ContactChannel.videoRelay,
    ],
    isPrimary: true,
  ),
  Contact(
    id: 'c2',
    name: 'Dr. Sharma',
    role: ContactRole.doctor,
    relationship: 'GP — Greenfield Surgery',
    avatarInitials: 'DS',
    textNumber: '01234 567 890',
    channels: <ContactChannel>[
      ContactChannel.message,
      ContactChannel.videoRelay,
    ],
  ),
  Contact(
    id: 'c3',
    name: 'Maria',
    role: ContactRole.family,
    relationship: 'Daughter',
    avatarInitials: 'MA',
    textNumber: '07700 900 123',
    channels: <ContactChannel>[
      ContactChannel.message,
      ContactChannel.videoRelay,
    ],
  ),
  Contact(
    id: 'c4',
    name: 'James',
    role: ContactRole.family,
    relationship: 'Son',
    avatarInitials: 'JA',
    textNumber: '07700 900 789',
    channels: <ContactChannel>[ContactChannel.message],
  ),
  Contact(
    id: 'c5',
    name: 'NHS 111',
    role: ContactRole.helpline,
    relationship: 'Medical helpline',
    avatarInitials: 'NH',
    textNumber: '18001 111',
    channels: <ContactChannel>[
      ContactChannel.textRelay,
      ContactChannel.message,
    ],
    isEmergency: true,
  ),
];
