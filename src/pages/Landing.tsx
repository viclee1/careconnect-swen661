import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Captions, Bell, Accessibility, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { clearSession } from '../auth/mockAuth';

export default function Landing() {
  useDocumentTitle(null);

  // Clear any existing session when landing page loads so sign in / sign up work cleanly
  useEffect(() => {
    clearSession();
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-[#0d4a67] text-white">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 bg-transparent" role="banner">
          <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
            <span className="w-9 h-9 rounded-lg bg-calm-600 flex items-center justify-center text-white" aria-hidden="true">
              <Heart className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <span>CareConnect</span>
          </div>

          <nav aria-label="Account navigation">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/signin"
                className="px-3 sm:px-5 py-2 rounded-lg text-white border border-white/60 hover:bg-white/10 transition-colors no-underline text-xs sm:text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-3 sm:px-5 py-2 rounded-lg text-white bg-[#0f5272] border border-[#0f5272] hover:bg-[#0d4a67] transition-colors no-underline text-xs sm:text-sm font-semibold"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Hero Section */}
        <main id="main-content" tabIndex={-1} className="flex-1 flex items-center px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/15 rounded-full text-xs sm:text-sm font-semibold text-white">
                <Accessibility className="w-4 h-4" aria-hidden="true" />
                Fully accessible — no sound required
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-white">
                Your daily companion for <span className="text-calm-200">calm, confident</span> care.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white opacity-90 max-w-lg leading-relaxed">
                For people who need a little help remembering, and the people who care for them.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-lg bg-white text-[#0f5272] hover:bg-sky-50 transition-colors no-underline text-base sm:text-lg shadow-sm"
                >
                  Get started — it's free
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-6 sm:px-7 py-3.5 sm:py-4 rounded-lg bg-transparent text-white border-2 border-white/70 hover:border-white hover:bg-white/10 transition-colors no-underline text-base sm:text-lg"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="bg-white/12 border border-white/25 rounded-2xl p-6 sm:p-8 backdrop-blur-md text-white shadow-xl" role="region" aria-label="Hearing accessibility features">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white">Built for hearing accessibility</h2>

              <ul className="space-y-6 list-none p-0 m-0">
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#ffedea] text-[#d9480f] flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-base font-semibold mb-1 text-white">Visual alerts</strong>
                    <p className="text-sm text-white opacity-85 m-0 leading-relaxed">
                      Flashing banners for every notification — no sound needed
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#e7f5ff] text-[#1971c2] flex items-center justify-center flex-shrink-0">
                    <Captions className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-base font-semibold mb-1 text-white">Captions everywhere</strong>
                    <p className="text-sm text-white opacity-85 m-0 leading-relaxed">
                      Adjustable text for all audio &amp; video content
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#fff9db] text-[#f59f00] flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-base font-semibold mb-1 text-white">Screen flash &amp; desktop alerts</strong>
                    <p className="text-sm text-white opacity-85 m-0 leading-relaxed">
                      The screen flashes and a banner pops for every reminder — no sound
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </main>

        {/* Footer Status Bar */}
        <footer className="bg-slate-100 text-neutral-600 px-4 sm:px-8 py-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-200" role="contentinfo">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" aria-hidden="true" />
            <span>&copy; {new Date().getFullYear()} CareConnect</span>
          </div>
          <div>
            <span>WCAG 2.2 AA · No sound required</span>
          </div>
        </footer>
      </div>
    </>
  );
}
