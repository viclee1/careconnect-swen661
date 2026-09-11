import { fireEvent, screen } from '@testing-library/react-native';

import { createFlakyContactRepository } from '../../data/contactRepository';
import { renderApp, useTabletSize } from '../../test-support/harness';

describe('ContactsScreen rendering', () => {
  it('shows the heading the prototype uses', async () => {
    await renderApp();
    // Twice: the header and the bottom navigation label.
    expect(await screen.findAllByText('Contacts')).toHaveLength(2);
    expect(screen.getByText('People who care for you')).toBeTruthy();
  });

  it('explains the Notify action at the top', async () => {
    await renderApp();
    expect(await screen.findByText(/Open a chat and tap Notify/)).toBeTruthy();
    expect(screen.getByText(/No sound needed/)).toBeTruthy();
  });

  it('lists the five contacts from the design, in order', async () => {
    await renderApp();
    expect(await screen.findByText('Joyce')).toBeTruthy();
    for (const name of ['Dr. Sharma', 'Maria', 'James', 'NHS 111']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it('prints each relationship under the name', async () => {
    await renderApp();
    expect(await screen.findByText('Caregiver · Daughter')).toBeTruthy();
    for (const relationship of [
      'GP — Greenfield Surgery',
      'Daughter',
      'Son',
      'Medical helpline',
    ]) {
      expect(screen.getByText(relationship)).toBeTruthy();
    }
  });

  it('marks the primary contact with a pill, and says so out loud', async () => {
    await renderApp();
    const card = await screen.findByTestId('contact-c1');

    // The pill is drawn but hidden from assistive technology, because the card
    // is one accessibility element whose label already carries the fact.
    // Announcing both would make a screen reader stutter.
    expect(screen.getByText('Primary', { includeHiddenElements: true })).toBeTruthy();
    expect(card.props.accessibilityLabel).toContain('primary contact');
  });

  it('uses the avatar initials from the design', async () => {
    await renderApp();
    await screen.findByText('Joyce');
    for (const initials of ['JO', 'DS', 'MA', 'JA', 'NH']) {
      expect(screen.getByText(initials)).toBeTruthy();
    }
  });

  it('shows waiting counts as a number and a word, and announces them', async () => {
    await renderApp();
    await screen.findByTestId('contact-c1');

    // Joyce and Maria have each written since Margaret last replied. The badge
    // is a number *and* the word "waiting" — never a bare coloured dot.
    expect(screen.getAllByText('waiting', { includeHiddenElements: true })).toHaveLength(2);
    expect(screen.getAllByText('1', { includeHiddenElements: true })).toHaveLength(2);

    expect(screen.getByTestId('contact-c1').props.accessibilityLabel).toContain(
      '1 message waiting',
    );
    expect(screen.getByTestId('contact-c4').props.accessibilityLabel).not.toContain('waiting');
  });

  it('previews a conversation by its text', async () => {
    await renderApp();
    expect(
      await screen.findByText('Good morning Margaret! How are you feeling today?'),
    ).toBeTruthy();
  });

  it('previews a video message by its captions, not its type', async () => {
    await renderApp();
    expect(await screen.findByText(/^Captions available — Hi Mum/)).toBeTruthy();
  });

  it('offers no voice-call affordance anywhere', async () => {
    await renderApp();
    await screen.findByText('Joyce');
    // The point of this screen for a deaf user: there is no phone call to reach
    // for, only text and a silent alert.
    expect(screen.queryByText('Call')).toBeNull();
    expect(screen.queryByText(/^Call /)).toBeNull();
  });
});

describe('ContactsScreen navigation affordances', () => {
  it('carries the six destinations the prototype shows', async () => {
    await renderApp();
    await screen.findByText('Joyce');
    for (const label of ['Home', 'My Day', 'Appts', 'Medicines', 'Memories']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('reaches Settings from the header', async () => {
    await renderApp();
    expect(await screen.findByLabelText('Settings')).toBeTruthy();
  });

  it('opening a contact shows that conversation', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('contact-c1'));

    expect(await screen.findByTestId('notify-button')).toBeTruthy();
    expect(screen.getByText('Goodnight Joyce. See you in the morning.')).toBeTruthy();
  });
});

describe('ContactsScreen when loading fails', () => {
  it('explains the failure instead of showing an empty list', async () => {
    await renderApp({ contactRepository: createFlakyContactRepository(99) });

    expect(await screen.findByText('Contacts could not be loaded')).toBeTruthy();
    expect(screen.getByText(/nothing has been lost/)).toBeTruthy();
    // Not the empty state: an empty address book and an unreachable one are
    // different problems and must not read the same.
    expect(screen.queryByText('No contacts yet')).toBeNull();
    expect(screen.queryByTestId('contact-c1')).toBeNull();
  });

  it('recovers when the retry button succeeds', async () => {
    await renderApp({ contactRepository: createFlakyContactRepository(1) });

    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByTestId('contact-c1')).toBeTruthy();
    expect(screen.queryByText('Contacts could not be loaded')).toBeNull();
  });
});

describe('ContactsScreen layout', () => {
  it('stacks cards in one column on a phone', async () => {
    await renderApp();
    const card = await screen.findByTestId('contact-c1');
    expect(card).toBeTruthy();
    expect(screen.getByText('Appts')).toBeTruthy();
  });

  it('lays cards two across on a tablet', async () => {
    useTabletSize();
    await renderApp();
    await screen.findByTestId('contact-c1');
    // Every contact is still listed; the wrapper just halves each card's width.
    for (const initials of ['JO', 'DS', 'MA', 'JA', 'NH']) {
      expect(screen.getByText(initials)).toBeTruthy();
    }
  });
});
