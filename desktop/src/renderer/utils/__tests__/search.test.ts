import { mockContacts } from '../../data/mockContacts';
import { filterContacts, searchResultSummary } from '../search';

describe('filterContacts', () => {
  it('returns everyone for a blank query', () => {
    // A search box that hides the list until you type has hidden your contacts.
    expect(filterContacts(mockContacts, '')).toHaveLength(mockContacts.length);
    expect(filterContacts(mockContacts, '   ')).toHaveLength(mockContacts.length);
  });

  it('matches a name regardless of case', () => {
    expect(filterContacts(mockContacts, 'joyce').map((c) => c.id)).toEqual(['c1']);
    expect(filterContacts(mockContacts, 'JOYCE').map((c) => c.id)).toEqual(['c1']);
  });

  it('matches part of a relationship', () => {
    expect(filterContacts(mockContacts, 'daughter').map((c) => c.id)).toEqual(['c1', 'c3']);
  });

  it('matches the role in the words a user would type', () => {
    // Someone looking for their GP is as likely to type "doctor" as "Sharma".
    expect(filterContacts(mockContacts, 'doctor').map((c) => c.id)).toEqual(['c2']);
    expect(filterContacts(mockContacts, 'helpline').map((c) => c.id)).toEqual(['c5']);
  });

  it('ignores accents, so a name typed plainly still finds the person', () => {
    const contacts = [{ ...mockContacts[0], name: 'Zoë' }];
    expect(filterContacts(contacts, 'zoe')).toHaveLength(1);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterContacts(mockContacts, 'zzzz')).toEqual([]);
  });
});

describe('searchResultSummary', () => {
  it('says how many there are when nothing is filtered', () => {
    expect(searchResultSummary(5, '')).toBe('Showing all 5 contacts.');
  });

  it('names the query when the list is empty, rather than just saying none', () => {
    expect(searchResultSummary(0, 'bob')).toBe('No contacts match "bob".');
  });

  it('agrees in number', () => {
    expect(searchResultSummary(1, 'joyce')).toBe('1 contact matches "joyce".');
    expect(searchResultSummary(2, 'daughter')).toBe('2 contacts match "daughter".');
  });
});
