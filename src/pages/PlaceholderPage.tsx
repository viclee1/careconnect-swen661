import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Construction, Heart, MessageCircle } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Who is building each screen this branch does not carry (Assignment 11 split). */
export type PageOwner = 'Justin Zhang' | 'Upneet Bir';

/**
 * The page shown for a screen another team member is building.
 *
 * Victor's branch carries Contacts, Messaging and Accessibility Settings; the
 * rest arrive from Justin's and Upneet's branches, as on the desktop client's
 * first build. The routes and navigation stay wired so the shell is complete
 * and testable, and a reviewer who follows a link finds an explanation instead
 * of a dead end.
 *
 * Inside the app it renders in the normal layout and offers a way to Contacts.
 * Standing in for the sign-in screens (`standalone`), it offers to continue as
 * the demo care recipient instead, since there is no sign-in on this branch to
 * get past.
 */
export default function PlaceholderPage({
  title,
  owner,
  standalone = false,
}: {
  title: string;
  /** Omitted for screens the Assignment 11 split does not assign to anyone. */
  owner?: PageOwner;
  standalone?: boolean;
}) {
  const body = (
    <div className="space-y-6 page-container max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
        <p className="text-neutral-600 mt-1">Coming from another branch</p>
      </div>

      <div className="card p-6 md:p-8 flex flex-col items-center text-center gap-4">
        <span
          className="w-16 h-16 rounded-full bg-warm-100 border-2 border-warm-300 flex items-center justify-center"
          aria-hidden="true"
        >
          <Construction className="w-8 h-8 text-warm-800" />
        </span>
        <h2 className="text-xl font-bold text-neutral-800">{title} is not on this branch yet</h2>
        <p className="text-neutral-700 max-w-md">
          {!owner
            ? 'This page is still being built. It is not part of the Assignment 11 screen split yet.'
            : standalone
              ? `${owner} is building this page for the web app. Until it arrives, continue straight to Contacts as the demo care recipient.`
              : `${owner} is building this page for the web app. Everything the navigation does for it already works — only the page itself is missing.`}
        </p>
        <p className="badge badge-neutral">{owner ? `Owner: ${owner}` : 'Owner: not yet assigned'}</p>
        {standalone ? <ContinueAsDemo /> : <GoToContacts />}
      </div>
    </div>
  );

  return standalone ? <StandaloneFrame title={title}>{body}</StandaloneFrame> : body;
}

/**
 * Outside the app the page supplies what the layout otherwise would: the
 * skip link, a banner, <main> and the tab title.
 */
function StandaloneFrame({ title, children }: { title: string; children: ReactNode }) {
  useDocumentTitle(title);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <header className="bg-white border-b-2 border-neutral-200 px-4 md:px-8 py-3">
          <span className="flex items-center gap-2 font-bold text-neutral-800">
            <span className="w-8 h-8 rounded-lg bg-calm-600 flex items-center justify-center" aria-hidden="true">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </span>
            <span>
              Care<span className="text-calm-600">Connect</span>
            </span>
          </span>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-10 md:py-16">
          {children}
        </main>
      </div>
    </>
  );
}

function GoToContacts() {
  return (
    <Link to="/app/contacts" className="btn btn-primary no-underline">
      <MessageCircle className="w-5 h-5" aria-hidden="true" />
      Go to Contacts
    </Link>
  );
}

const DEMO = { name: 'Margaret Whitfield', email: 'margaret@example.com', password: 'demo' };

/** Signs in as the demo care recipient, since sign-in itself is not on this branch. */
function ContinueAsDemo() {
  const { signIn, signUp, setRole } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    // Mock auth: the account exists after the first visit, so sign in, and
    // create it only when that fails.
    const signedIn = await signIn(DEMO.email, DEMO.password);
    if (signedIn.error) await signUp(DEMO.name, DEMO.email, DEMO.password);
    setRole('patient');
    navigate('/app/contacts');
  }

  return (
    <button
      type="button"
      className="btn btn-primary whitespace-normal text-center w-full sm:w-auto"
      onClick={() => void start()}
      disabled={busy}
    >
      <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      Continue to Contacts as {DEMO.name}
    </button>
  );
}
