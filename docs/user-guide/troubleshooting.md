# Troubleshooting

← [User documentation](README.md)

Find the problem below. If none of these help, [open an issue](https://github.com/viclee1/careconnect-swen661/issues) and say which device, which version of CareConnect, and what you see on screen.

- [Signing in](#signing-in)
- [Web app and installing it](#web-app-and-installing-it)
- [Alerts, flashes and vibration](#alerts-flashes-and-vibration)
- [Android app](#android-app)
- [Desktop app on macOS](#desktop-app-on-macos)
- [Desktop app on Windows](#desktop-app-on-windows)
- [My data](#my-data)
- [Start over with fresh sample data](#start-over-with-fresh-sample-data)

---

## Signing in

| You see | Do this |
|:--------|:--------|
| *Please enter a valid email address.* | Use the form `name@example.com`, with an **@** and a dot after it. It doesn't have to be a real address. |
| *Password must be at least 6 characters.* | When creating an account, use 6 or more characters. Signing in accepts any password. |
| *Passwords do not match.* | Type the same password in **Password** and **Confirm password**. |
| You land on **Choose your role** every time | Choose **I am the Care Recipient** or **I am the Caregiver**. CareConnect remembers your choice until you sign out, unless your browser clears site data when it closes (see [My data](#my-data)). |
| You are sent back to the welcome page | You have been signed out. This happens after a sign out, or after the browser's data was cleared. Sign in again. |

---

## Web app and installing it

### I don't see the "Install CareConnect" box

The box appears only in Chrome and Edge, and not again for two weeks after you choose **Not now**. You don't need it:

- **Chrome or Edge on a computer:** use the install icon in the address bar, or the browser menu. See [Installing the web app](installation.md#chrome-or-edge-on-windows-macos-linux-or-a-chromebook).
- **iPhone or iPad:** the box never appears there. Use **Share** → **Add to Home Screen** in Safari.
- **Firefox:** Firefox can't install web apps on most systems. Use Chrome, Edge or Safari.
- **Already installed?** If CareConnect is already installed, the browser doesn't offer to install it again. Look for it in your Start menu, Dock, app launcher or Home screen.
- **Private or incognito window:** browsers don't allow installing from these. Use a normal window.

### The installed app shows "404: NOT_FOUND" or "The page could not be found"

This was fixed on 3 November 2026. Close CareConnect completely and open it again while you are online. If it still happens, [start over](#start-over-with-fresh-sample-data), or uninstall and reinstall the app.

### I see an old version after an update

CareConnect updates itself the next time it opens while online. To get the update now:

1. Close **every** CareConnect window and browser tab.
2. Open CareConnect again.

If you still see the old version, reload the page with **Ctrl + Shift + R** (**⌘ Shift R** on a Mac).

### The bottom bar says "Offline · changes will sync when you reconnect"

Your device has no internet connection. CareConnect keeps working, and your changes are saved on this device. Check your Wi-Fi or mobile data.

### The page is blank or doesn't load

- Check that you are online for your **first** visit. CareConnect can't open offline until it has loaded once.
- Update your browser. CareConnect needs a current version of Chrome, Edge, Safari or Firefox.
- If your browser blocks JavaScript or site storage, allow both for `careconnect-swen661.vercel.app`.

---

## Alerts, flashes and vibration

| Problem | Do this |
|:--------|:--------|
| *Your browser blocked notifications…* under **Desktop notifications** | You chose **Block** when the browser asked earlier. Select the icon at the left of the address bar → **Site settings** (or **Permissions**) → set **Notifications** to **Allow**. Then turn **Desktop notifications** off and on again in **Settings**. |
| *This browser cannot show notifications…* | Your browser doesn't support notifications. Screen flashes, banners and vibration still work. Use Chrome, Edge or the desktop app if you want notifications. |
| Desktop notifications don't appear on Windows | Check **Settings** → **System** → **Notifications**: notifications must be on for your browser (or for CareConnect), and **Do not disturb** must be off. |
| Desktop notifications don't appear on a Mac | Check  menu → **System Settings** → **Notifications** → your browser (or CareConnect): **Allow notifications** must be on, and **Focus** must be off. |
| The screen doesn't flash | Make sure **Screen flash alerts** is on in **Settings**. If *reduce motion* is on in your device's accessibility settings, a steady coloured panel appears instead of a flash. This is on purpose. |
| The flash cue or vibration **Play** buttons are greyed out | Turn on **Screen flash alerts** (for flash cues) or **Vibration alerts** (for patterns) first. |
| My phone doesn't vibrate (web app) | Websites can only vibrate phones in Chrome on Android, and only after you have touched the page. iPhones never allow it. Also check that the phone isn't in **Do not disturb**, and that **Vibration alerts** is on. |
| My phone doesn't vibrate (Android app) | Check that **Vibration alerts** is on in CareConnect's **Settings**. Then check the phone's **Settings** → **Sound & vibration** → **Vibration & haptics**: touch or haptic feedback must be on. |
| I hear no alert sound | Sound is optional in CareConnect. Check **Alert volume** in **Settings**, and your device's volume. |
| Captions don't appear on a video | Turn on **Show captions** in **Settings**. If the video has no captions, CareConnect says *No captions on this video*. |

---

## Android app

| Problem | Do this |
|:--------|:--------|
| The download is blocked or warns *this type of file can harm your device* | Choose **Download anyway**. The APK comes from the project's GitHub release page. |
| Nothing happens when I open the APK | Allow your browser or **Files** app to install apps: **Settings** → **Apps** → **Special app access** → **Install unknown apps** → choose the app → **Allow from this source**. |
| *Blocked by Play Protect* / *Unsafe app blocked* | The app isn't from the Play Store, so Play Protect doesn't recognise it. Choose **More details** → **Install anyway**. |
| *App not installed as package conflicts with an existing package* | An older CareConnect, built with a different signature, is already installed. Uninstall it first (touch and hold its icon → **Uninstall**), then install the new APK. |
| *There was a problem parsing the package* | The phone runs a version of Android older than 7.0, which CareConnect doesn't support, or the download didn't finish. Check **Settings** → **About phone** → **Android version**, and download the file again. Use the [web app](installation.md#the-web-app-pwa) on older phones. |
| I tried to install an `.aab` file | `.aab` files are for the Google Play Store and can't be installed on a phone. Download an `.apk` instead. |
| I can't find the app after installing | The Flutter build is called **careconnect_mobile** on your phone, and the React Native build is called **CareConnect**. Search your app drawer for "care". |
| My changes are gone after closing the app | The Android app keeps only your accessibility settings. Everything else goes back to the sample data. See [Your data](using-careconnect.md#your-data). |

---

## Desktop app on macOS

| Problem | Do this |
|:--------|:--------|
| *"CareConnect" Not Opened*, *Apple could not verify "CareConnect"…* or *cannot be opened because the developer cannot be verified* | The app isn't signed by Apple. Choose **Done**. Then open  menu → **System Settings** → **Privacy & Security**, scroll down, and choose **Open Anyway** next to the message about CareConnect. |
| *"CareConnect" is damaged and can't be opened* | macOS says this about some unsigned downloads. Move CareConnect to **Applications**, then run this in Terminal: `xattr -dr com.apple.quarantine /Applications/CareConnect.app`, and open it again. |
| *You can't open the application "CareConnect" because this application is not supported on this Mac*, or it won't start on an Intel Mac | The build is for Apple silicon Macs (M1 or newer) only. On an Intel Mac, use the [web app](installation.md#the-web-app-pwa). |
| The window opens off-screen or is too small | Choose **Window** → **Zoom** from the menu bar, or press **Ctrl** + **⌘** + **F** for full screen. CareConnect moves itself back on screen if a display it used is no longer connected. |
| Opening CareConnect again doesn't open a second window | That's on purpose: CareConnect runs one copy and brings its window to the front. |

---

## Desktop app on Windows

| Problem | Do this |
|:--------|:--------|
| *Windows protected your PC* | The installer isn't signed. Choose **More info** → **Run anyway**. |
| The installer is blocked or deleted by antivirus software | Some antivirus tools block unsigned installers. Allow the file in your antivirus software, or use the [web app](installation.md#the-web-app-pwa) instead. |
| *This app can't run on your PC* | The installer is for 64-bit Windows 10 and 11. On 32-bit Windows or Windows on ARM, use the web app. |
| There are no caregiver screens | The Windows installer predates the caregiver tools. Use the web app in Chrome or Edge for the caregiver role. |
| I can't reach the menus with the keyboard | Press **Alt** to move to the menu bar, then use the arrow keys. **Alt** + an underlined letter opens a menu directly (for example, **Alt** + **F** for **File**). |

---

## My data

**My medicines, memories or messages disappeared (web app)**

The web app keeps your data in the browser you used, on that device. It disappears if:

- you used a **private or incognito** window, which forgets everything when it closes;
- your browser is set to **clear cookies and site data** when it closes;
- you, or a cleaning tool, cleared the browser's data;
- you are now using a **different browser or device**, which has its own separate copy.

Caregiver notes are not saved in any version yet.

**My changes disappeared (Android or desktop app)**

These versions keep only your settings (the desktop app also keeps your sign-in, role and My Day ticks). Everything else goes back to the sample data when the app closes.

---

## Start over with fresh sample data

This deletes everything you entered in the web app and signs you out.

- **Chrome or Edge:** open CareConnect in the browser, select the icon at the left of the address bar → **Site settings** → **Delete data** (or **Clear data**), and confirm.
- **Safari on a Mac:** **Safari** → **Settings** → **Privacy** → **Manage Website Data…**, search for `careconnect`, select it and choose **Remove**.
- **Safari on iPhone or iPad:** **Settings** → **Apps** → **Safari** → **Advanced** → **Website Data**, find `careconnect-swen661.vercel.app`, swipe left and tap **Delete**.
- **Firefox:** select the padlock at the left of the address bar → **Clear cookies and site data…** → **Remove**.

Then open <https://careconnect-swen661.vercel.app> again.

On the Android app, use **Settings** → **Apps** → **CareConnect** (or **careconnect_mobile**) → **Storage** → **Clear storage**.

On the desktop app, quit CareConnect and delete its data folder. Uninstalling alone keeps this folder.

- **macOS:** in Finder choose **Go** → **Go to Folder…**, enter `~/Library/Application Support/CareConnect`, and move that folder to the Trash.
- **Windows:** press **Windows** + **R**, enter `%APPDATA%\CareConnect`, and delete that folder.
