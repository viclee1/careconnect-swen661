import {
  contactRoleFrom,
  contactSemanticLabel,
  conversationNameOf,
  givenNameOf,
  initialsFor,
  primaryChannelOf,
  supportsVideoRelay,
  type Contact,
} from '../contact';

const base: Contact = {
  id: 'c1',
  name: 'Joyce',
  role: 'careTeam',
  relationship: 'Caregiver · Daughter',
  textNumber: '07700 900 456',
  channels: ['message', 'videoRelay'],
};

const make = (overrides: Partial<Contact> = {}): Contact => ({ ...base, ...overrides });

describe('initialsFor', () => {
  it('uses the value the design supplies', () => {
    // The prototype writes "Joyce" as JO, which no mechanical rule produces.
    expect(initialsFor(make({ avatarInitials: 'JO' }))).toBe('JO');
  });

  it('upper-cases and trims a supplied value', () => {
    expect(initialsFor(make({ name: 'Maria', avatarInitials: ' ma ' }))).toBe('MA');
  });

  it('derives first and last initials when none is supplied', () => {
    expect(initialsFor(make({ name: 'Maria Thompson' }))).toBe('MT');
  });

  it('falls back to one letter for a single-word name', () => {
    expect(initialsFor(make({ name: 'Joyce' }))).toBe('J');
  });

  it('tolerates extra whitespace', () => {
    expect(initialsFor(make({ name: '  maria   thompson  ' }))).toBe('MT');
  });

  it('returns a question mark rather than an empty avatar', () => {
    expect(initialsFor(make({ name: '   ' }))).toBe('?');
  });

  it('an empty supplied value falls back to deriving one', () => {
    expect(initialsFor(make({ name: 'Maria Thompson', avatarInitials: '   ' }))).toBe('MT');
  });
});

describe('naming', () => {
  const doctor = make({ name: 'Dr. Sharma', role: 'doctor' });
  const helpline = make({ name: 'NHS 111', role: 'helpline', channels: ['textRelay'] });

  it('skips an honorific so the composer reads "Message Sharma"', () => {
    expect(givenNameOf(doctor)).toBe('Sharma');
    expect(conversationNameOf(doctor)).toBe('Sharma');
  });

  it('uses the plain first name when there is no honorific', () => {
    expect(givenNameOf(make({ name: 'Joyce' }))).toBe('Joyce');
  });

  it('a helpline keeps its full name', () => {
    expect(givenNameOf(helpline)).toBe('');
    expect(conversationNameOf(helpline)).toBe('NHS 111');
  });

  it('a nameless contact does not crash the label', () => {
    expect(givenNameOf(make({ name: '   ' }))).toBe('');
  });
});

describe('channels', () => {
  it('primaryChannelOf is the first channel offered', () => {
    const interpreter = make({ channels: ['videoRelay', 'message'] });
    expect(primaryChannelOf(interpreter)).toBe('videoRelay');
    expect(supportsVideoRelay(interpreter)).toBe(true);
  });

  it('supportsVideoRelay is false when no video channel is offered', () => {
    expect(supportsVideoRelay(make({ channels: ['message'] }))).toBe(false);
  });
});

describe('contactSemanticLabel', () => {
  it('announces the relationship and the Primary pill', () => {
    expect(contactSemanticLabel(make({ isPrimary: true }))).toBe(
      'Joyce, Caregiver · Daughter, primary contact',
    );
  });

  it('marks an urgent-care service', () => {
    expect(
      contactSemanticLabel(
        make({ name: 'NHS 111', relationship: 'Medical helpline', isEmergency: true }),
      ),
    ).toBe('NHS 111, Medical helpline, urgent care service');
  });

  it('omits the parts that do not apply', () => {
    expect(contactSemanticLabel(make({ name: 'James', relationship: 'Son' }))).toBe(
      'James, Son',
    );
  });
});

describe('contactRoleFrom', () => {
  it('round-trips every role', () => {
    for (const role of ['careTeam', 'family', 'doctor', 'helpline'] as const) {
      expect(contactRoleFrom(role)).toBe(role);
    }
  });

  it('falls back rather than throwing on bad input', () => {
    expect(contactRoleFrom('not-a-role')).toBe('family');
    expect(contactRoleFrom(null)).toBe('family');
    expect(contactRoleFrom(undefined)).toBe('family');
  });
});
