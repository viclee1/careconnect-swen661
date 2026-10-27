import {
  alternativeHeading,
  chronological,
  deliveryStatusLabels,
  isMine,
  isSystem,
  isTextAlternative,
  latestOf,
  messageSemanticLabel,
  previewOf,
  startsNewDay,
  waitingCount,
  type Message,
} from '../message';

const at = (hoursAgo: number) => Date.now() - hoursAgo * 3_600_000;

const make = (overrides: Partial<Message> = {}): Message => ({
  id: 'x1',
  contactId: 'c1',
  author: 'them',
  body: 'Hello there',
  sentAt: at(1),
  ...overrides,
});

describe('message kinds', () => {
  it('a plain text message needs no alternative heading', () => {
    const message = make();
    expect(isTextAlternative(message)).toBe(false);
    expect(alternativeHeading(message)).toBeNull();
  });

  it('a voicemail is headed "Transcript"', () => {
    const message = make({ kind: 'voicemail', mediaLabel: 'Voicemail · 0:34' });
    expect(isTextAlternative(message)).toBe(true);
    expect(alternativeHeading(message)).toBe('Transcript');
  });

  it('a captioned video says captions are available', () => {
    expect(alternativeHeading(make({ kind: 'videoMessage', hasCaptions: true }))).toBe(
      'Captions available',
    );
  });

  it('an uncaptioned video says so rather than staying silent', () => {
    expect(alternativeHeading(make({ kind: 'videoMessage' }))).toBe('Captions unavailable');
  });

  it('an alert carries no media heading', () => {
    expect(alternativeHeading(make({ kind: 'alert' }))).toBeNull();
  });
});

describe('authorship', () => {
  it('identifies outgoing messages', () => {
    expect(isMine(make({ author: 'me' }))).toBe(true);
    expect(isMine(make({ author: 'them' }))).toBe(false);
  });

  it('identifies system alerts', () => {
    expect(isSystem(make({ author: 'system' }))).toBe(true);
    expect(isSystem(make({ author: 'them' }))).toBe(false);
  });
});

describe('messageSemanticLabel', () => {
  it('names the sender and reads the body', () => {
    expect(messageSemanticLabel(make({ body: 'Are you alright?' }), 'Joyce')).toBe(
      'Joyce: Are you alright?',
    );
  });

  it('reads the delivery state back for outgoing messages', () => {
    const message = make({ author: 'me', body: 'All good', status: 'read' });
    expect(messageSemanticLabel(message, 'Joyce')).toBe('You: All good. Read');
  });

  it('announces a transcript before reading it', () => {
    const message = make({ kind: 'voicemail', body: 'Your results are back.' });
    expect(messageSemanticLabel(message, 'Dr. Sharma')).toBe(
      'Dr. Sharma, Transcript: Your results are back.',
    );
  });

  it('announces a system alert as CareConnect, not as a person', () => {
    const message = make({ author: 'system', kind: 'alert', body: 'Amlodipine is due.' });
    expect(messageSemanticLabel(message, 'Joyce')).toBe(
      'CareConnect alert: Amlodipine is due.',
    );
  });
});

describe('deliveryStatusLabels', () => {
  it('writes every status out in words', () => {
    expect(deliveryStatusLabels.sending).toBe('Sending');
    expect(deliveryStatusLabels.sent).toBe('Sent');
    expect(deliveryStatusLabels.delivered).toBe('Delivered');
    expect(deliveryStatusLabels.read).toBe('Read');
  });
});

describe('previews', () => {
  it('shows the most recent message', () => {
    const thread = [make({ id: 'a', sentAt: at(3) }), make({ id: 'b', body: 'Latest', sentAt: at(1) })];
    expect(previewOf(thread)).toBe('Latest');
    expect(latestOf(thread)?.id).toBe('b');
  });

  it('marks an outgoing preview with "You:"', () => {
    expect(previewOf([make({ author: 'me', body: 'On my way' })])).toBe('You: On my way');
  });

  it('previews a voicemail by its transcript, not by the word Voicemail', () => {
    const thread = [make({ kind: 'voicemail', body: 'Your results are back.' })];
    expect(previewOf(thread)).toBe('Transcript — Your results are back.');
  });

  it('says so plainly when a conversation is empty', () => {
    expect(previewOf([])).toBe('No messages yet');
    expect(latestOf([])).toBeNull();
  });
});

describe('waitingCount', () => {
  it('counts the incoming messages at the end of a conversation', () => {
    const thread = [
      make({ id: '1', author: 'me', sentAt: at(4) }),
      make({ id: '2', author: 'them', sentAt: at(2) }),
    ];
    expect(waitingCount(thread)).toBe(1);
  });

  it('counts a run of unanswered incoming messages', () => {
    const thread = [
      make({ id: '1', author: 'them', sentAt: at(3) }),
      make({ id: '2', author: 'them', sentAt: at(2) }),
    ];
    expect(waitingCount(thread)).toBe(2);
  });

  it('an answered conversation has nothing waiting', () => {
    const thread = [
      make({ id: '1', author: 'them', sentAt: at(4) }),
      make({ id: '2', author: 'me', sentAt: at(2) }),
    ];
    expect(waitingCount(thread)).toBe(0);
  });

  it("CareConnect's own alerts do not count as somebody waiting", () => {
    const thread = [
      make({ id: '1', author: 'me', sentAt: at(4) }),
      make({ id: '2', author: 'them', sentAt: at(3) }),
      make({ id: '3', author: 'system', kind: 'alert', sentAt: at(1) }),
    ];
    expect(waitingCount(thread)).toBe(1);
  });

  it('an empty conversation has nothing waiting', () => {
    expect(waitingCount([])).toBe(0);
  });
});

describe('ordering', () => {
  it('sorts oldest first without mutating the input', () => {
    const thread = [make({ id: 'b', sentAt: at(1) }), make({ id: 'a', sentAt: at(5) })];
    expect(chronological(thread).map((m) => m.id)).toEqual(['a', 'b']);
    expect(thread.map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('startsNewDay is true for the first message and at each day boundary', () => {
    const today = new Date();
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const thread = [
      make({ id: '1', sentAt: midnight - 5 * 3_600_000 }),
      make({ id: '2', sentAt: midnight - 4 * 3_600_000 }),
      make({ id: '3', sentAt: midnight + 9 * 3_600_000 }),
    ];
    expect(startsNewDay(thread, 0)).toBe(true);
    expect(startsNewDay(thread, 1)).toBe(false);
    expect(startsNewDay(thread, 2)).toBe(true);
  });
});
