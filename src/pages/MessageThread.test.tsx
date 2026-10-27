import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import MessageThread from './MessageThread';
import { AuthProvider } from '../auth/AuthContext';
import { MESSAGES_KEY, MessagesProvider } from '../context/MessagesContext';
import { SETTINGS_KEY, SettingsProvider } from '../context/SettingsContext';
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
    // A banner stays behind once the flash has faded, in case it was missed.
    expect(screen.getByText('Alert sent to Joyce')).toBeInTheDocument();
    expect(screen.getByText(/Nothing made a sound/)).toBeInTheDocument();
    expect(screen.getByText(/You alerted Joyce that you want to talk/)).toBeInTheDocument();
  });

  it('buzzes the sender\'s own phone to confirm an alert, unless vibration is off', async () => {
    const user = userEvent.setup();
    const vibrate = jest.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
    try {
      const { unmount } = renderThread('c1');
      await user.click(screen.getByRole('button', { name: /Alert Joyce you want to talk/ }));
      expect(vibrate).toHaveBeenCalledWith(200);
      unmount();

      vibrate.mockClear();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ vibrationEnabled: false }));
      renderThread('c1');
      await user.click(screen.getByRole('button', { name: /Alert Joyce you want to talk/ }));
      expect(vibrate).not.toHaveBeenCalled();
    } finally {
      delete (navigator as { vibrate?: unknown }).vibrate;
    }
  });

  it('shows the relationship beside the name, in words', () => {
    renderThread('c2');
    expect(screen.getByText('GP — Greenfield Surgery')).toBeInTheDocument();
  });

  it('says when vibration is off in the Alert button wording', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ vibrationEnabled: false }));
    renderThread('c1');
    expect(screen.getByRole('button', { name: /vibration is off in your settings/ })).toBeInTheDocument();
  });

  it('requests a captioned video call and lets the banner be dismissed', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    await user.click(screen.getByRole('button', { name: 'Video call Joyce with live captions' }));
    expect(screen.getByText('Captioned video call requested')).toBeInTheDocument();
    await user.click(
      within(screen.getByText('Captioned video call requested').closest('[role="status"]') as HTMLElement).getByRole(
        'button',
        { name: 'Dismiss this message' },
      ),
    );
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
    expect(screen.getByRole('link', { name: 'Open settings' })).toHaveAttribute(
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

  it('puts a quick reply in the field from a keyboard-operable menu', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    const menuButton = screen.getByRole('button', { name: 'Quick replies' });
    menuButton.focus();
    await user.keyboard('{ArrowDown}');
    const menu = screen.getByRole('menu', { name: 'Quick replies' });
    const items = within(menu).getAllByRole('menuitem');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(items[items.length - 1]).toHaveFocus();
    await user.keyboard('{Home}{ArrowDown}');
    expect(items[1]).toHaveFocus();
    await user.keyboard('{End}');
    expect(items[items.length - 1]).toHaveFocus();
    await user.keyboard('{Home}{Enter}');

    const field = screen.getByRole('textbox', { name: 'Message Joyce' });
    expect(field).toHaveValue("I'm fine, thank you.");
    expect(field).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the quick-replies menu with Escape, back on its button, without leaving the page', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    const menuButton = screen.getByRole('button', { name: 'Quick replies' });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    expect(screen.getByRole('heading', { level: 1, name: 'Joyce' })).toBeInTheDocument();
  });

  it('closes the quick-replies menu on Tab or a click elsewhere, and adds to a draft', async () => {
    const user = userEvent.setup();
    renderThread('c1');
    const field = screen.getByRole('textbox', { name: 'Message Joyce' });
    await user.type(field, 'Hello.');
    await user.click(screen.getByRole('button', { name: 'Quick replies' }));
    await user.keyboard('{Tab}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quick replies' }));
    await user.click(screen.getByRole('heading', { level: 1, name: 'Joyce' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quick replies' }));
    await user.click(screen.getByRole('menuitem', { name: "I've taken my medicine." }));
    expect(field).toHaveValue("Hello. I've taken my medicine.");
  });

  it('plays a video message with its captions in the chosen colour, line by line', () => {
    jest.useFakeTimers();
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionColor: 'yellow' }));
      renderThread('c3');
      const caption = screen.getByTestId('video-caption-m6');
      expect(caption).toHaveTextContent('[CC] Hi Mum, the garden is finally done.');
      expect(caption).toHaveStyle({ color: '#FFFF00' });

      fireEvent.click(screen.getByRole('button', { name: 'Play video message from Maria' }));
      act(() => jest.advanceTimersByTime(2500));
      expect(caption).toHaveTextContent('Wait until you see the roses by the back gate.');
      act(() => jest.advanceTimersByTime(2500));
      expect(caption).toHaveTextContent('We will bring more photographs on Sunday.');

      // Pausing returns to the start; playing to the end does too.
      fireEvent.click(screen.getByRole('button', { name: 'Pause video message from Maria' }));
      expect(caption).toHaveTextContent('Hi Mum');
      fireEvent.click(screen.getByRole('button', { name: 'Play video message from Maria' }));
      act(() => jest.advanceTimersByTime(7500));
      expect(screen.getByRole('button', { name: 'Play video message from Maria' })).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('says on the video when captions are switched off', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ captionsEnabled: false }));
    renderThread('c3');
    expect(screen.getByText('Captions are off in your settings')).toBeInTheDocument();
    expect(screen.queryByTestId('video-caption-m6')).not.toBeInTheDocument();
  });

  it('confirms a video call requested from the Contacts header on arrival', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/app/contacts/c1', state: { requestCall: true } }]}>
        <AuthProvider>
          <SettingsProvider>
            <MessagesProvider>
              <Routes>
                <Route path={route} element={<MessageThread />} />
              </Routes>
            </MessagesProvider>
          </SettingsProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Captioned video call requested')).toBeInTheDocument();
  });

  it('keeps the contact list beside the conversation on a desktop', async () => {
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    try {
      renderThread('c3');
      expect(screen.getByRole('heading', { level: 1, name: 'Messages' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Maria' })).toBeInTheDocument();
      expect(screen.getByTestId('contact-c3')).toHaveAttribute('aria-current', 'true');
      expect(screen.getByRole('list', { name: 'Your contacts' })).toBeInTheDocument();
    } finally {
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
    }
  });
});
