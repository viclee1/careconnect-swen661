import { contactRoleLabels, type Contact } from '../models/contact';

/**
 * Filters the contact list by a typed query.
 *
 * Name, relationship and role are all searched, because the prototype's roster
 * mixes people and services: a user looking for their GP is as likely to type
 * "doctor" as "Sharma". Matching is case- and accent-insensitive so a name
 * typed without its diacritics still finds the person.
 *
 * A blank query returns the list unchanged rather than an empty one — a search
 * box that hides everything until you type is a search box that has hidden your
 * contacts.
 */
export function filterContacts(contacts: Contact[], query: string): Contact[] {
  const needle = normalise(query);
  if (needle.length === 0) return contacts;

  return contacts.filter((contact) =>
    [contact.name, contact.relationship, contactRoleLabels[contact.role]].some((field) =>
      normalise(field).includes(needle),
    ),
  );
}

function normalise(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * The sentence announced when a filter changes the list.
 *
 * Read out as a live region, because the only visible evidence that a search
 * worked is rows disappearing — which a screen-reader user does not see.
 */
export function searchResultSummary(matches: number, query: string): string {
  if (query.trim().length === 0) return `Showing all ${matches} contacts.`;
  if (matches === 0) return `No contacts match "${query.trim()}".`;
  return matches === 1
    ? `1 contact matches "${query.trim()}".`
    : `${matches} contacts match "${query.trim()}".`;
}
