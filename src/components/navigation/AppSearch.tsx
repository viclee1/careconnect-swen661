import { useId, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useAppointments } from '../../context/appointments';
import { useMedicines } from '../../context/medicines';
import { useMessages } from '../../context/messages';
import { formatLongDate, formatTime12 } from '../../utils/dates';
import { normalise } from '../../utils/search';
import type { AppView } from '../../types';
import { navItems, settingsItem } from './navItems';

interface Entry {
  id: string;
  label: string;
  /** The second line: what kind of thing it is, and when or who. */
  detail: string;
  to: string;
}

const MAX_RESULTS = 8;

function useEntries(view: AppView): Entry[] {
  const { medications } = useMedicines();
  const { appointments } = useAppointments();
  const { contacts } = useMessages();

  return useMemo(() => {
    const pages = [...navItems[view], settingsItem].map((item) => ({
      id: `page-${item.to}`,
      label: item.label,
      detail: 'Page',
      to: item.to,
    }));
    if (view !== 'patient') return pages;
    return [
      ...pages,
      ...medications.map((m) => ({
        id: `medicine-${m.id}`,
        label: m.name,
        detail: `Medicine · ${m.dosage}`,
        to: '/app/medicines',
      })),
      ...appointments.map((a) => ({
        id: `appointment-${a.id}`,
        label: a.title,
        detail: `Appointment · ${formatLongDate(a.date)}, ${formatTime12(a.time)}`,
        to: '/app/appointments',
      })),
      ...contacts.map((c) => ({
        id: `contact-${c.id}`,
        label: c.name,
        detail: `Contact · ${c.relationship}`,
        to: `/app/contacts/${c.id}`,
      })),
    ];
  }, [view, medications, appointments, contacts]);
}

/**
 * "Search medicines, appointments, people…" — the design's header search, as
 * an ARIA combobox: type, move through the matches with the arrow keys, Enter
 * opens one. Ctrl+K (⌘K on a Mac) jumps here from anywhere; Layout handles
 * that. The number of matches is announced, because rows appearing under a
 * field are invisible to a screen-reader user.
 */
export default function AppSearch({
  view,
  onNavigate,
  showShortcut = false,
  autoFocus = false,
}: {
  view: AppView;
  onNavigate?: () => void;
  showShortcut?: boolean;
  /** Marks the field as where an opening dialog puts focus (useFocusTrap). */
  autoFocus?: boolean;
}) {
  const id = useId();
  const listId = `${id}-results`;
  const navigate = useNavigate();
  const entries = useEntries(view);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const needle = normalise(query);
  const results = needle
    ? entries
        .filter((e) => normalise(`${e.label} ${e.detail}`).includes(needle))
        .slice(0, MAX_RESULTS)
    : [];
  const expanded = open && needle.length > 0;

  function go(entry: Entry) {
    setQuery('');
    setOpen(false);
    onNavigate?.();
    navigate(entry.to);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && expanded && results[active]) {
      event.preventDefault();
      go(results[active]);
    } else if (event.key === 'Escape' && (expanded || query)) {
      // Clears the search only; a second Escape reaches the drawer or page.
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
      setQuery('');
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search medicines, appointments and people
      </label>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        data-app-search
        data-autofocus={autoFocus || undefined}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && results[active] ? `${listId}-${active}` : undefined}
        aria-keyshortcuts={showShortcut ? 'Control+K Meta+K' : undefined}
        placeholder="Search medicines, appointments, people…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={`w-full h-12 rounded-xl border border-neutral-300 bg-white pl-11 ${
          showShortcut ? 'pr-20' : 'pr-4'
        } text-base text-neutral-800 placeholder:text-neutral-500 focus:border-calm-600`}
      />
      {showShortcut && (
        <kbd
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-sm font-mono text-neutral-600"
          aria-hidden="true"
        >
          Ctrl K
        </kbd>
      )}

      <ul
        id={listId}
        role="listbox"
        aria-label="Search results"
        hidden={!expanded}
        className="absolute z-50 left-0 right-0 mt-2 max-h-[22rem] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg list-none p-1 m-0"
      >
        {results.map((entry, index) => (
          <li
            key={entry.id}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            // mousedown, not click: the input's blur would close the list first.
            onMouseDown={(e) => {
              e.preventDefault();
              go(entry);
            }}
            onMouseEnter={() => setActive(index)}
            className={`cursor-pointer rounded-lg px-3 py-2 ${index === active ? 'bg-calm-50' : ''}`}
          >
            <span className="block text-base text-neutral-800">{entry.label}</span>
            <span className="block text-sm text-neutral-600">{entry.detail}</span>
          </li>
        ))}
      </ul>
      <p role="status" className="sr-only">
        {expanded
          ? results.length === 0
            ? `No matches for “${query.trim()}”.`
            : `${results.length} match${results.length === 1 ? '' : 'es'}. Use the arrow keys to choose, Enter to open.`
          : ''}
      </p>
      {expanded && results.length === 0 && (
        <p className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-neutral-200 bg-white shadow-lg px-4 py-3 text-base text-neutral-600 m-0">
          No matches for “{query.trim()}”.
        </p>
      )}
    </div>
  );
}
