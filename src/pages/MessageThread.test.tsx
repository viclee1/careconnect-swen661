import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MessageThread from './MessageThread';
import { MESSAGES_KEY } from '../context/MessagesContext';
import { SETTINGS_KEY } from '../context/SettingsContext';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const route = '/app/contacts/:contactId';

function renderThread(contactId = 'c1') {
  return renderWithProviders(<MessageThread />, { path: `/app/contacts/${contactId}`, route });
}

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
});

describe('MessageThread', () => {
  it('shows who the conversation is with and their messages as text', () => {
    renderThread('c1');
    expect(screen.getByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();
    expect(screen.getByText('Caregiver · Daughter')).toBeInTheDocument();
    const messages = screen.getByRole('list', { name: 'Messages with Joyce' });
    expect(within(messages).getByText('Good morning Margaret! How are you feeling today?')).toBeInTheDocument();
    // Delivery state is written out, never a tick alone.
    expect(within(messages).getByText('Read')).toBeInTheDocument();
  });

  it('renders a voicemail as its transcript', () => {
    renderThread('c2');
    expect(screen.getByText('Transcript · Voicemail · 0:34')).toBeInTheDocument();
    expect(screen.getByText(/Your blood test results are back/)).toBeInTheDocument();
  });

  it('labels a video message with whether captions are attached', () => {
    renderThread('c3');
    expect(screen.getByText('Captions available · Video message · 1:12')).toBeInTheDocument();
  });

  it('shows CareConnect alerts as a visible banner with a heading', () => {
    renderThread('c4');
    expect(screen.getByText(/CareConnect alert ·/)).toBeInTheDocument();
    expect(screen.getByText(/Medication reminder: Amlodipine/)).toBeInTheDocument();
  });

  it('groups messages under day headings', () => {
    renderThread('c1');
    expect(screen.getByRole('heading', { level: 2, name: 'Yesterday' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Today' })).toBeInTheDocument();
  });

  it('makes the history a focusable, named region so it can be scrolled by keyboard', () => {
    renderThread('c1');
    const region = screen.getByRole('region', { name: 'Conversation with Joyce' });
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('sends a message with the Send button and keeps it after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = renderThread('c1');
    await user.type(screen.getByRole('textbox', { name: 'Message Joyce' }), 'See you at ten');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('See you at ten')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Message Joyce' })).toHaveValue('');
    expect(localStorage.getItem(MESSAGES_KEY)).toContain('See you at ten');

    unmount();
    renderThread('c1');
    expect(screen.getByText('See you at ten')).toBeInTheDocument();
  });

  it('sends with Ctrl+Enter, while Enter alone starts a new line', async () => {
    const user = userEvent.setup();
    renderThread('c4');
    const field = screen.getByRole('textbox', { name: 'Message James' });
    await user.type(field, 'Line one{Enter}line two');
    expect(field).toHaveValue('Line one\nline two');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(field).toHaveValue('');
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
  });

  it('refuses an empty message and explains why, linked to the field', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    const field = screen.getByRole('textbox', { name: 'Message Joyce' });
    expect(screen.getByRole('alert')).toHaveTextContent('Type a message before sending.');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/Type a message before sending/);
    expect(field).toHaveFocus();
  });

  it('counts the characters left', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.type(screen.getByRole('textbox', { name: 'Message Joyce' }), 'Hello');
    expect(screen.getByText('495 characters left')).toBeInTheDocument();
  });

  it('sends a silent alert: a worded flash and a written record', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.click(screen.getByRole('button', { name: /Alert Joyce you want to talk/ }));
    expect(screen.getByTestId('visual-flash')).toHaveTextContent('Alert sent to Joyce.');
    expect(screen.getByText(/You alerted Joyce that you want to talk/)).toBeInTheDocument();
  });

  it('says when vibration is off in the Alert button wording', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ vibrationEnabled: false }));
    renderThread('c1');
    expect(screen.getByRole('button', { name: /vibration is off in your settings/ })).toBeInTheDocument();
  });

  it('requests a captioned video call and lets the banner be dismissed', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.click(screen.getByRole('button', { name: 'Call Joyce with live captions' }));
    expect(screen.getByText('Captioned video call requested')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss this message' }));
    expect(screen.queryByText('Captioned video call requested')).not.toBeInTheDocument();
  });

  it('offers no video call to a text-only contact', () => {
    renderThread('c4');
    expect(screen.queryByRole('button', { name: /live captions/ })).not.toBeInTheDocument();
  });

  it('warns when captions are off and a video message is in the conversation', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionsEnabled: false }));
    renderThread('c3');
    expect(screen.getByText('Captions are turned off')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open accessibility settings' })).toHaveAttribute(
      'href',
      '/app/settings',
    );
  });

  it('queues messages written offline and sends them when the connection returns', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    setOnline(false);
    expect(screen.getByText('You are offline')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Message Joyce' }), 'Written offline');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText('Sending')).toBeInTheDocument();

    setOnline(true);
    expect(screen.queryByText('You are offline')).not.toBeInTheDocument();
    expect(screen.queryByText('Sending')).not.toBeInTheDocument();
  });

  it('returns to Contacts with Escape, except while typing a message', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.click(screen.getByRole('textbox', { name: 'Message Joyce' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(await screen.findByRole('heading', { name: 'Contacts list' })).toBeInTheDocument();
  });

  it('explains a contact that is not in the list', () => {
    renderThread('nobody');
    expect(screen.getByRole('heading', { level: 1, name: 'That contact is not in your list' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to contacts' })).toHaveAttribute('href', '/app/contacts');
  });
});
