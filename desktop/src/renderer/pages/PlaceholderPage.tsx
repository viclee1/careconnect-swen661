import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { destinations, type AppDestination } from '../navigation/destinations';
import { useNavigation } from '../navigation/NavigationProvider';

/**
 * The page shown for a destination another team member is building.
 *
 * Victor owns Contacts, Messaging and Accessibility Settings plus the shell on
 * this branch, matching the split on the React Native client; the other four
 * pages arrive from Justin's and Rehman's branches. They are wired into the
 * sidebar and the menu now rather than later, so the navigation and the
 * keyboard shortcuts are complete and testable, and so a reviewer pressing
 * Ctrl+3 finds an explanation instead of a dead tab.
 */
export function PlaceholderPage({ destination }: { destination: AppDestination }) {
  const { navigate } = useNavigation();
  const entry = destinations.find((item) => item.destination === destination);
  const owner = entry?.owner;

  return (
    <>
      <PageHeader
        title={entry?.label ?? destination}
        subtitle="Coming from another branch"
      />
      <div className="page-body">
        <div className="readable">
          <EmptyState
            icon={entry?.icon ?? 'home'}
            title={`${entry?.label ?? destination} is not on this branch yet`}
            message={
              owner
                ? `${owner} is porting this page to the desktop client. Everything the sidebar and the keyboard shortcuts do for it already works — only the page itself is missing.`
                : 'This page is still being built.'
            }
            action={
              <>
                {owner ? <span className="placeholder-owner">Owner: {owner}</span> : null}
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    label="Go to Contacts"
                    icon="contacts"
                    onClick={() => navigate({ name: 'Contacts' })}
                  />
                </div>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
