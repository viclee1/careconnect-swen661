# Cross-browser testing — web client

The Playwright end-to-end suite ([`e2e/`](../../e2e), config in [`playwright.config.ts`](../../playwright.config.ts)) runs against the production build (`vite preview`, service worker active) in five browser projects. Every project runs the same 41 tests; the differences between browsers are listed below, with the reason for each.

## Browsers

| Project | Engine | Version | Viewport | Where it runs |
|:--|:--|:--|:--|:--|
| `chromium` | Chromium (Blink) | 148.0.7778.96 | 1440 × 900 | Locally and in CI |
| `edge` | Microsoft Edge, stable channel (Blink) | 156.0.4314.58 | 1440 × 900 | CI (Ubuntu); locally only where Edge is installed |
| `firefox` | Firefox (Gecko) | 150.0.2 (Playwright build 1522) | 1440 × 900 | CI (Ubuntu) only — see [Firefox on macOS 27](#firefox-does-not-launch-on-macos-27) |
| `webkit` | WebKit (Safari) | 26.4 | 1440 × 900 | Locally and in CI |
| `mobile-safari` | WebKit, iPhone 13 Mini profile (touch, `isMobile`) | 26.4 | 375 × 629 | Locally and in CI |

Playwright 1.60.0. All projects run with `prefers-reduced-motion: reduce` (see [#21](https://github.com/viclee1/careconnect-swen661/pull/21)).

```bash
npx playwright install chromium firefox webkit   # once
npx playwright install msedge                    # once, optional; needs sudo
npm run test:e2e                                 # every installed browser
npm run test:e2e -- --project=edge               # one browser
```

## Results

**Local** — macOS 27, three repeats of the whole suite (`--repeat-each=3`), 3 November 2026 (after the target-size tests from #47 and the My Day test from #42):

| Project | Passed | Failed | Flaky | Skipped by design |
|:--|--:|--:|--:|--:|
| `chromium` | 120 | 0 | 0 | 3 |
| `webkit` | 114 | 0 | 0 | 9 |
| `mobile-safari` | 111 | 0 | 0 | 12 |
| **Total** | **345** | **0** | **0** | **24** |

**CI** — GitHub Actions, Ubuntu 24.04, one run with up to two retries ([run 41589834513](https://github.com/viclee1/careconnect-swen661/actions/runs/41589834513/job/125763766320), the last run of #47, 3 November 2026):

| Project | Passed | Failed | Retried | Skipped by design |
|:--|--:|--:|--:|--:|
| `chromium` | 39 | 0 | 0 | 1 |
| `edge` | 39 | 0 | 0 | 1 |
| `firefox` | 37 | 0 | 0 | 3 |
| `webkit` | 37 | 0 | 0 | 3 |
| `mobile-safari` | 36 | 0 | 0 | 4 |
| **Total** | **188** | **0** | **0** | **12** |

### Per test

✓ passed · — skipped by design (reason in the next section). Edge and Firefox from CI; the others from both.

| Spec | Test | Chromium | Edge | Firefox | WebKit | Mobile Safari |
|:--|:--|:-:|:-:|:-:|:-:|:-:|
| care-pages | Tick medicines from the keyboard; the count is announced and survives a reload | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | A medicine ticked on Medicines is ticked on My Day and counted on Home, and back | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | Add a visit to My Day, export every visit to a calendar file with silent reminders | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | Add a memory: errors, save, focus, pin, reload, remove | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | Filter memories with the arrow keys; Escape keeps the draft | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | The memory book, photos included, opens with no connection | ✓ | ✓ | — | — | — |
| care-pages | Appointments, Medicines, Memories at every width: no sideways scroll, 44px targets, axe (3 tests) | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | Old screen addresses redirect (3 tests) | ✓ | ✓ | ✓ | ✓ | ✓ |
| care-pages | Five links outside the care pages are at least 44px (6 tests) | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Find a contact, open the conversation, send a message that survives a reload | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | A voicemail arrives as a transcript; an empty message is refused with a reason | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Alert someone silently: a worded flash and a written record | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Ask for a captioned video call instead of a voice call | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Quick replies are a keyboard menu that fills the message field | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | A video message shows its captions over the video and in full below it | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Messages written offline are queued and sent when the connection returns | ✓ | ✓ | ✓ | ✓ | ✓ |
| contacts-messaging | Contacts and a conversation open with no connection once visited | ✓ | ✓ | — | — | — |
| high-contrast | The header switch turns it on and is remembered on the sign-in screens | ✓ | ✓ | ✓ | ✓ | — |
| high-contrast | Eight screens pass AA and AAA contrast with high contrast on (8 tests) | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings-keyboard | Operated with the keyboard alone, and remembered after a reload | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings-keyboard | Sign out asks in a dialog that Escape closes and returns focus | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings-keyboard | Captions switched off warn inside a conversation with a video message | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings-keyboard | Each alert type previews its own flash, named in words | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings-keyboard | Settings is reachable at every width | ✓ | ✓ | ✓ | ✓ | ✓ |
| branch-placeholders | Teammate placeholder screens | — | — | — | — | — |

## Skipped by design

| Test | Skipped in | Why |
|:--|:--|:--|
| Memory book offline; Contacts offline | Firefox, WebKit, mobile Safari | Playwright's offline emulation (`context.setOffline`) does not reliably route through the service worker outside Chromium-based browsers, so the test would fail for a test-harness reason, not an app one. Offline *queueing* of messages, which does not depend on the service worker, runs everywhere. |
| High-contrast header switch | Mobile Safari | The switch is in the header only from 1024px; on phones it is in the Menu drawer, covered by *Settings is reachable at every width*. |
| Teammate placeholders | Every browser | All teammate screens are now built, so there are no placeholders to find. Kept for branches that hide them. |

## Where the browsers differ, and how the tests handle it

Each difference below was found by the suite failing in one browser and not the others. Each test keeps its intent — keyboard-only steps stay keyboard-only.

| Difference | Browsers | What the test does |
|:--|:--|:--|
| Tab skips checkboxes, radios and buttons unless macOS *Full Keyboard Access* is on | WebKit, mobile Safari | Focus the control directly, then press Space or Enter (Medicines ticks, Settings text size, Memories filter). |
| Arrow keys do not move through a radio group without Full Keyboard Access | WebKit, mobile Safari | Focus the target radio and press Space ([#21](https://github.com/viclee1/careconnect-swen661/pull/21)). |
| A tap on a page that is still scrolling is treated as a scroll and fires no click | WebKit, mobile Safari | Reduced motion on in every project ([#21](https://github.com/viclee1/careconnect-swen661/pull/21)); keyboard activation where the page can move under the tap (below). |
| Offline emulation does not reach the service worker | Firefox, WebKit | Offline-launch tests run in Chromium and Edge only (see above). |
| Edge | — | No differences found: Edge shares Chromium's engine and takes the same code paths (`browserName` is `chromium`). It is still run separately because it ships its own build, settings and accessibility features (for example Immersive Reader and its own high-contrast handling). |

## Browser issues found and fixed

### WebKit: the Memories filter click that selected nothing ([#21](https://github.com/viclee1/careconnect-swen661/pull/21))

**Symptom.** *Memories › filter memories with the arrow keys…* failed intermittently in mobile Safari: after clicking the **Pets** filter pill, Pets was not selected.

**Investigation.** Two causes, found with diagnostic CI runs (#20, 20 runs; #22, 60 runs):

1. **Reduced motion was silently off.** `playwright.config.ts` set `reducedMotion: 'reduce'` at the top level of `use`, where Playwright ignores it. `matchMedia('(prefers-reduced-motion: reduce)')` was `false` in every browser, so smooth scrolling stayed on and pages were still moving when Playwright tapped. WebKit treats a tap on a moving page as a scroll and fires no click. The same cause made *Medicines › tick medicines from the keyboard* flaky in mobile Safari.
2. **Hit-testing on release.** In the one failing run out of 60, the mousedown landed on the Pets pill and the mouseup was hit-tested onto the gap between the pills — with the page not moving — so the click went to the container and nothing was selected. This is WebKit-specific; Chromium and Firefox never did it.

**Fix.** `contextOptions: { reducedMotion: 'reduce' }`, which Playwright applies, so the app's own reduced-motion styles (no smooth scroll, no animation) are now active in every project. In WebKit, the filter step focuses the Pets radio and presses Space instead of clicking the label, so no hit-testing is involved and the test stays keyboard-only (WebKit cannot arrow through radios without Full Keyboard Access). The app was unchanged — it already respected reduced motion.

**Result.** 30/30 runs of the filter test in Chromium, WebKit and mobile Safari; full suite in three browsers, three repeats, 177 passed, 0 failed; CI green with Firefox, 0 flaky.

### WebKit: the Remove tap after a reload (this change)

**Symptom.** *Memories › add a memory… then removed* timed out once in mobile Safari: after `page.reload()`, the tap on **Remove: Our wedding day** completed but the confirmation dialog never opened.

**Investigation.** The Playwright trace shows the page at `scrollTop` 429 at the moment of the tap — WebKit restoring the scroll position from before the reload — and at 0 immediately after. The page jumped to the top under the tap, so WebKit took it as a scroll and fired no click. This is the same mechanism as #21. The app does not scroll on load; the only `scrollTo` in `src/` is in the add-memory form.

**Fix.** In WebKit the test focuses **Remove** and presses Enter (for both the opening that is cancelled with Escape and the one that is confirmed). The other browsers still click.

**Result.** Memories tests 15 repeats each in Chromium, WebKit and mobile Safari: 150 passed, 0 failed (offline test skipped outside Chromium by design).

### Firefox does not launch on macOS 27

Playwright's Firefox build hangs at its sandbox on macOS 27, so the `firefox` project cannot run on our development machines. This is an incompatibility between that Firefox build and the OS, not the app. CI runs Firefox on Ubuntu on every pull request, and the team's merge checklist requires that run to be green.

## What is not covered

- **Real mobile devices and desktop Safari itself.** `webkit` and `mobile-safari` are Playwright's WebKit builds with Safari's and an iPhone's settings, not Safari.app or iOS Safari. Touch, viewport and user-agent are emulated; Safari-specific system settings (Full Keyboard Access, VoiceOver) are not. Manual VoiceOver checks are in the [accessibility documentation](accessibility/README.md).
- **Chrome on Android, Samsung Internet.** Not run; Chromium at 375px is covered by the responsive tests in `care-pages`, but not with Android's touch and font settings.
- **Older browser versions.** Only the versions in the table above.
