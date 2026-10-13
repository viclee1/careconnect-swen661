# WCAG 2.1 AA conformance — CareConnect desktop

The criterion-by-criterion conformance documentation for Assignment 9. The same
content, in VPAT® 2.5 layout, is in [`vpat/CareConnect-Desktop-VPAT.docx`](vpat/CareConnect-Desktop-VPAT.docx)
and [`.pdf`](vpat/CareConnect-Desktop-VPAT.pdf). Findings and fixes are described in the
[accessibility testing report](README.md).

**Level A**: 30 criteria — 26 Supports, 4 Not Applicable.
**Level AA**: 20 criteria — 3 Not Applicable, 16 Supports, 1 Partially Supports.

## Level A

| Criterion | Conformance | Remarks |
|:--|:--|:--|
| 1.1.1 Non-text Content | Supports | Every icon that sits beside text is hidden from assistive technology; icon-only controls (toolbar Back, Refresh, Home, contrast, alerts and shortcut buttons) have accessible names. Avatars repeat the visible name and are hidden. Vibration rhythms are named in text, with the drawn glyph hidden. The application has no photographs or images of text. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | Not Applicable | The application contains no prerecorded audio or video. |
| 1.2.2 Captions (Prerecorded) | Not Applicable | No prerecorded media. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | No prerecorded media. |
| 1.3.1 Info and Relationships | Supports | One h1 per page with h2 sections; landmarks for the skip link target, the “Main” navigation, main and a single top-level contentinfo (the status bar was moved out of main during this audit). Lists, tables with captions and column headers, a fieldset and legend for medicines, a radio group for segmented choices, and programmatic labels on every field. Field errors on Sign In and Sign Up are now tied to their fields with aria-describedby and aria-invalid (fixed). |
| 1.3.2 Meaningful Sequence | Supports | Reading and focus order follow the visual order on every page; verified by the Tab-order sweep and the accessibility tree. |
| 1.3.3 Sensory Characteristics | Supports | No instruction depends on shape, position, colour or sound. Alerts are described in words (“Sends a visual flash and vibration — no sound”). |
| 1.4.1 Use of Color | Supports | Status is always a word plus a shape: switches print On/Off, the current sidebar item is filled, outlined, bold and marked aria-current, waiting counts say “waiting”, completed tasks are struck through and ticked, and errors are written out. |
| 1.4.2 Audio Control | Supports | The application plays no audio. Alerts are visual by design. |
| 2.1.1 Keyboard | Supports | Every function is reachable with the keyboard: native buttons, inputs, switches (checkbox role="switch"), sliders and a roving-tabindex radio group. My Day tasks were a div with role="button" and are now native toggle buttons; the conversation history and the shortcut card are now focusable so they scroll without a mouse (fixed). 73 of 73 keyboard checks pass. |
| 2.1.2 No Keyboard Trap | Supports | Tab moves through and out of every page. The only contained focus is the modal Keyboard Shortcuts dialog, which Escape or its Close button leaves, returning focus to the control that opened it. |
| 2.1.4 Character Key Shortcuts | Supports | Every shortcut uses Ctrl or Cmd (Alt for Back on Windows); there are no single-character shortcuts. |
| 2.2.1 Timing Adjustable | Supports | Nothing has a time limit, and no in-window message disappears on a timer. The 0.9-second Notify flash is a supplementary cue: the alert is also written into the conversation and posted as a Windows notification that stays in Action Center. |
| 2.2.2 Pause, Stop, Hide | Supports | No content moves, blinks or updates automatically for more than five seconds. The Notify flash lasts 0.9 seconds and the vibration-pattern lamp plays only when asked, for the length of one rhythm. |
| 2.3.1 Three Flashes or Below Threshold | Supports | The Notify flash is one slow fade, not a strobe, and becomes a steady panel under Reduce Motion. The vibration-pattern lamp is a 20-pixel dot, far below the small-area limit for a general flash. |
| 2.4.1 Bypass Blocks | Supports | “Skip to main content” is the first Tab stop on every page and moves focus into main; landmarks allow screen-reader navigation. |
| 2.4.2 Page Titled | Supports | The window is titled “<Page> — CareConnect” (“Conversation with Joyce — CareConnect” in a thread). Previously only Accessibility Settings set a title (fixed). |
| 2.4.3 Focus Order | Supports | Focus order is logical. Opening the shortcut card moves focus into it and closing returns focus; dismissing the export banner returns focus to Export to calendar; a failed Sign In or Sign Up moves focus to the first field to fix (added). |
| 2.4.4 Link Purpose (In Context) | Supports | The only link is the skip link. Buttons are named by their visible text. |
| 2.5.1 Pointer Gestures | Supports | No multipoint or path-based gestures; everything is a single click. |
| 2.5.2 Pointer Cancellation | Supports | Controls activate on click (button release). The shortcut card’s backdrop closed the dialog on mouse-down; it now closes only when press and release both happen on the backdrop (fixed). |
| 2.5.3 Label in Name | Supports | Every control’s accessible name contains its visible text. Seven controls did not — the Settings sidebar item (named “Accessibility”), the status-bar shortcut button, Notify, contact rows, vibration-pattern rows, My Day tasks and the appointment OK button — and all were fixed. |
| 2.5.4 Motion Actuation | Not Applicable | No function is operated by device motion. |
| 3.1.1 Language of Page | Supports | The document declares lang="en". |
| 3.2.1 On Focus | Supports | Focus never changes context. |
| 3.2.2 On Input | Supports | Changing a setting saves it in place and typing in Contacts search filters the list (announced as a status message); neither changes context. |
| 3.3.1 Error Identification | Supports | Sign In and Sign Up name each field in error in text, announce a summary as an alert, mark the field aria-invalid and give it the error as its description (linking fixed). The message composer does the same for an empty or over-length message. |
| 3.3.2 Labels or Instructions | Supports | Every form field has a visible label, except the message composer and the toolbar search, which have a persistent programmatic label and a placeholder giving the same words. Settings rows explain each option in text. |
| 4.1.1 Parsing | Supports | React produces well-formed markup with unique ids (useId). A div nested in a button on Home was replaced with a span (fixed). (This criterion is obsolete in WCAG 2.2 and always satisfied for HTML.) |
| 4.1.2 Name, Role, Value | Supports | All controls are native or carry the correct role and state. Fixed: sidebar buttons had no name below a 960-pixel window width (labels were display:none); the toolbar contrast toggle exposed no state and now has aria-pressed; My Day tasks are native toggle buttons with aria-pressed. |

## Level AA

| Criterion | Conformance | Remarks |
|:--|:--|:--|
| 1.2.4 Captions (Live) | Not Applicable | The video call in this build is a simulated preview with no live audio. Captions are on by default in it, and caption size, colour and visibility are adjustable in Accessibility Settings, ready for a live implementation. |
| 1.2.5 Audio Description (Prerecorded) | Not Applicable | No prerecorded media. |
| 1.3.4 Orientation | Supports | Content is not locked to any orientation; the layout adapts to any window shape. |
| 1.3.5 Identify Input Purpose | Supports | Name, email and password fields carry autocomplete="name", "email", "current-password" and "new-password". |
| 1.4.3 Contrast (Minimum) | Supports | All text meets 4.5:1 (3:1 for large text). Three failures were fixed: the sidebar alerts label (3.98:1, now 7.17:1), the medication badge (2.01:1, now 9.75:1) and completed My Day tasks, which were faded with opacity. Two hover-only failures were also fixed: the selected caption size or colour option turned white on pale blue (1.09:1) under the pointer, and the alerts label fell to 4.17:1 over the hover tint (now #ffec99, 5.01:1). All 149 contrast results axe could not decide, and every control in its hovered state, were measured and pass. |
| 1.4.4 Resize Text | Supports | Every length is in rem, and Ctrl/Cmd + zooms the whole layout to 200% with no loss of content (verified on every page at 640 CSS pixels). |
| 1.4.5 Images of Text | Supports | No images of text are used. |
| 1.4.10 Reflow | Supports | At 400% zoom (320 CSS pixels) no page scrolls horizontally. The splash header, the Home/My Day toolbar and banner, the status bar, long page titles and vibration-pattern rows now wrap, and the narrow sidebar no longer clips the brand and greeting (fixed). |
| 1.4.11 Non-text Contrast | Supports | The focus ring is 8.5:1 on light surfaces and white on dark ones; switches, sliders and radio groups are drawn in the primary colour. Text-field, composer, search-box and check-circle borders were 1.42:1 and now use a 3.96:1 control border (fixed). |
| 1.4.12 Text Spacing | Supports | With line height 1.5, paragraph spacing 2, letter spacing 0.12 and word spacing 0.16 applied, no text is clipped or overlaps on any signed-in page (scripted check). |
| 1.4.13 Content on Hover or Focus | Supports | No custom content appears on hover or focus. The only tooltip is the operating system’s own title tooltip on the account initials. |
| 2.4.5 Multiple Ways | Supports | Every page can be reached from the sidebar, from the native Go menu, and by keyboard shortcut (listed in the Help menu’s shortcut card); Home also links to the next task’s page. |
| 2.4.6 Headings and Labels | Partially Supports | Headings and field labels describe their topic or purpose. Exceptions: the sidebar “3 alerts” item and the toolbar “Alerts” button open Accessibility Settings rather than a list of alerts, and the toolbar “Search CareConnect” field on Home and My Day does not search yet (prototype placeholders, see Known Limitations). |
| 2.4.7 Focus Visible | Supports | One focus ring is defined once and never removed, recoloured on dark surfaces and restated for Windows Contrast Themes. The toolbar search field had no indicator and now draws the ring round the whole box (fixed). Verified at every Tab stop on every page. |
| 3.1.2 Language of Parts | Not Applicable | No passage is in a language other than English. |
| 3.2.3 Consistent Navigation | Supports | The sidebar keeps the same items in the same order on every signed-in page, and the status bar now appears on all of them rather than only Home and My Day (fixed). |
| 3.2.4 Consistent Identification | Supports | Components with the same function look and read the same everywhere: alert banners, status badges, the shortcut buttons and Back. |
| 3.3.3 Error Suggestion | Supports | Every error says how to fix it (“Please enter a valid email address.”, the composer’s 500-character limit and current length); load failures offer Try again. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Supports | No legal or financial transactions and no deletion of stored data. Task and medicine check-offs and every setting can be reversed at once. |
| 4.1.3 Status Messages | Supports | Status messages use live regions without taking focus: the contact search result count, the export confirmation, the Notify flash, loading messages and vibration-pattern playback (role="status"), and sign-in errors (role="alert"). |

## Known limitations and workarounds

| Limitation | Detail | WCAG 2.1 | Workaround |
|:--|:--|:--|:--|
| **Placeholder alert entries.** | The sidebar “3 alerts” item, the toolbar “Alerts” button and the status bar’s “3 active alerts” show a fixed count and open Accessibility Settings, not a list of alerts. | 2.4.6 | Alerts themselves appear as banners on Home and My Day and in each conversation. Accessibility Settings → Visual Alerts configures them. |
| **Toolbar search does not search yet.** | The “Search CareConnect” field on Home and My Day accepts text but returns no results. | 2.4.6 | Use Contacts (Ctrl/Cmd + 6), then Find (Ctrl/Cmd + F), or the sidebar and Go menu to reach any page. |
| **In-app contrast toggle is not remembered.** | The toolbar contrast button on Home and My Day applies the high-contrast palette for the session only. | — | Turn on Windows Contrast Themes or macOS Increase Contrast; CareConnect follows both on every page and remembers nothing it needs to. |
| **Icon-only sidebar in narrow windows.** | Below a 960-pixel window width the sidebar shows icons without visible labels. Screen readers still announce every name. | — | Widen the window, or open the shortcut card (Ctrl/Cmd + /), which lists every page by name with its shortcut. |
| **Fixed orientation text.** | The sidebar greeting and date and the status bar’s “Zoom 100%” are fixed prototype values. | — | The operating system clock shows the real date and time; View → Actual Size resets zoom. |
| **Prototype sign-in and simulated calls.** | Sign In accepts any well-formed email and password, and the video call is a simulation without live audio, so live captions (1.2.4) cannot be evaluated yet. | 1.2.4 (future) | Captions are on by default in the simulated call and are configurable in Accessibility Settings → Captions. |
