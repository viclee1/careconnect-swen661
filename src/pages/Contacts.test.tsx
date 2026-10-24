import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Contacts from './Contacts';
import { renderWithProviders } from '../test-utils/renderWithProviders';

beforeEach(() => localStorage.clear());

function renderContacts() {
  return renderWithProviders(<Contacts />, { path: '/', route: '/' });
}

describe('Contacts', () => {
  it('lists every contact as a link to its conversation, primary contact first', () => {
    renderContacts();
    const list = screen.getByRole('list', { name: 'Your contacts' });
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveAccessibleName(/^Joyce Primary Caregiver · Daughter/);
    expect(links[0]).toHaveAttribute('href', '/app/contacts/c1');
  });

  it('never offers a voice call — every row leads to text', () => {
    renderContacts();
    expect(screen.queryByRole('link', { name: /^call/i })).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('shows a conversation preview and how many messages are waiting', () => {
    renderContacts();
    const joyce = screen.getByTestId('contact-c1');
    expect(joyce).toHaveTextContent('Good morning Margaret!');
    expect(joyce).toHaveTextContent('1 waiting');
    // Dr. Sharma's voicemail was answered, so nothing is waiting there.
    expect(screen.getByTestId('contact-c2')).not.toHaveTextContent('waiting');
  });

  it('tells screen-reader users that the helpline is an urgent care service', () => {
    renderContacts();
    expect(screen.getByTestId('contact-c5')).toHaveAccessibleName(/Urgent care service/);
  });

  it('filters by name, relationship or role and announces the result', async () => {
    const user = userEvent.setup();
    renderContacts();
    const search = screen.getByRole('searchbox', { name: 'Find a contact' });

    await user.type(search, 'daughter');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('2 contacts match "daughter".')).toHaveAttribute('role', 'status');

    await user.clear(search);
    await user.type(search, 'doctor');
    expect(screen.getByText('1 contact matches "doctor".')).toBeInTheDocument();
  });

  it('clears the search with Escape', async () => {
    const user = userEvent.setup();
    renderContacts();
    const search = screen.getByRole('searchbox', { name: 'Find a contact' });
    await user.type(search, 'james');
    await user.keyboard('{Escape}');
    expect(search).toHaveValue('');
    expect(screen.getByText('Showing all 5 contacts.')).toBeInTheDocument();
  });

  it('explains an empty result and offers a way back', async () => {
    const user = userEvent.setup();
    renderContacts();
    const search = screen.getByRole('searchbox', { name: 'Find a contact' });
    await user.type(search, 'zzz');
    expect(screen.getByText('No contacts match your search')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  it('jumps to the search box when "/" is pressed outside a field', async () => {
    const user = userEvent.setup();
    renderContacts();
    const search = screen.getByRole('searchbox', { name: 'Find a contact' });
    expect(search).not.toHaveFocus();
    await user.keyboard('/');
    expect(search).toHaveFocus();
    // Typed inside the field, "/" is just a character.
    await user.keyboard('/');
    expect(search).toHaveValue('/');
  });

  it('opens a conversation when a row is activated with the keyboard', async () => {
    const user = userEvent.setup();
    renderContacts();
    screen.getByTestId('contact-c3').focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: 'Conversation page' })).toBeInTheDocument();
  });
});
