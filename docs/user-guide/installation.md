# Installing CareConnect

← [User documentation](README.md)

CareConnect comes in three forms. Pick the one that suits your device. [Which version should I use?](README.md#which-version-should-i-use) helps you choose.

- [The web app (PWA)](#the-web-app-pwa): works on any device; nothing to download
- [The Android app (APK)](#the-android-app-apk)
- [The desktop app](#the-desktop-app): [macOS](#macos) or [Windows](#windows)
- [iPhone and iPad](#iphone-and-ipad)

All downloads are on the [latest release page](https://github.com/viclee1/careconnect-swen661/releases/latest).

---

## The web app (PWA)

Open **<https://careconnect-swen661.vercel.app>** in your browser. You can use it right there in the tab.

*Installing* it as a Progressive Web App (PWA) gives CareConnect its own icon and its own window, without the browser's address bar. Once it has loaded, it also opens without an internet connection.

### Chrome or Edge on Windows, macOS, Linux or a Chromebook

1. Open <https://careconnect-swen661.vercel.app> and sign in.
2. A box titled **Install CareConnect** appears at the bottom of the screen. Choose **Install**.
3. If you don't see the box (for example, because you chose **Not now** before), install from the browser instead:
   - **Chrome:** select the install icon (a monitor with a down arrow) at the right of the address bar. Or open the **⋮** menu → **Cast, save, and share** → **Install page as app…**
   - **Edge:** open the **…** menu → **Apps** → **Install this site as an app**.
4. Confirm with **Install**. CareConnect opens in its own window and is added to your Start menu, Dock or app launcher.

**To uninstall:** open CareConnect, select the **⋮** menu in its title bar, and choose **Uninstall CareConnect**.

### Safari on a Mac (macOS Sonoma 14 or newer)

1. Open <https://careconnect-swen661.vercel.app> in Safari.
2. Choose **File** → **Add to Dock…**, then **Add**.

**To uninstall:** drag CareConnect out of the Dock. Then delete it from your **Applications** folder (it is under your home folder's **Applications**).

### Chrome on Android

1. Open <https://careconnect-swen661.vercel.app> in Chrome.
2. Choose **Install** on the **Install CareConnect** box, or open the **⋮** menu → **Add to Home screen** → **Install**.
3. CareConnect appears on your Home screen and in your app drawer.

**To uninstall:** touch and hold the CareConnect icon, then choose **Uninstall** (or drag it to **Uninstall**).

### Safari on iPhone or iPad

The install box does not appear on iPhone or iPad. Install from the Share menu instead:

1. Open <https://careconnect-swen661.vercel.app> in **Safari**.
2. Tap the **Share** button (a square with an upward arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.

**To uninstall:** touch and hold the icon, then tap **Remove App** → **Delete from Home Screen**.

### Firefox

Firefox can use CareConnect in a normal tab, but on most systems it cannot install web apps. To install CareConnect, use Chrome, Edge or Safari.

### Updates and offline use

- **Updates are automatic.** When a new version is published, the installed app picks it up the next time you open it while online. If you still see the old version, close every CareConnect window and open it again.
- **Offline:** after your first visit, CareConnect opens without a connection. The bar at the bottom of the screen says **Offline · changes will sync when you reconnect** until you are back online.

---

## The Android app (APK)

The Android app needs **Android 7.0 or newer**. There are two builds of the same app: one made with Flutter and one made with React Native. They look and work the same, so you only need one. If you want to compare them, both can be installed at the same time.

| File | Name on your phone |
|:-----|:-------------------|
| `CareConnect-ReactNative-release.apk` | **CareConnect** |
| `CareConnect-Flutter-release.apk` | **careconnect_mobile** |

> The `.aab` files on the release page are Android App Bundles for uploading to the Google Play Store. A phone cannot install them directly. Download an `.apk` instead.

### Install on the phone

1. On your Android phone, open the [latest release page](https://github.com/viclee1/careconnect-swen661/releases/latest) and download one of the `.apk` files. Chrome may warn that *this type of file can harm your device*. Choose **Download anyway**.
2. Open the downloaded file from the notification, or from **Files** → **Downloads**.
3. Android asks whether to allow this source to install apps. Choose **Settings**, turn on **Allow from this source**, then go back.
4. Choose **Install**.
5. **Google Play Protect** may say the app is unknown or blocked, because the app is not from the Play Store. Choose **More details** → **Install anyway**. If it offers to scan the app, choosing **Scan app** is safe too.
6. Choose **Open**, or find the app in your app drawer.

The exact wording differs a little between phone makers (Samsung, Pixel, Motorola and so on), but the steps are the same.

### Install from a computer (for helpers and developers)

With USB debugging turned on and the Android SDK platform tools installed:

```bash
adb install CareConnect-ReactNative-release.apk
```

### Update or uninstall

- **To update,** install the newer APK over the old one. If Android says **App not installed**, uninstall the old version first. See [Troubleshooting](troubleshooting.md#android-app).
- **To uninstall,** touch and hold the app icon and choose **Uninstall**. Or go to **Settings** → **Apps** → **CareConnect** → **Uninstall**.

---

## The desktop app

### macOS

Download **`CareConnect-1.0.0-arm64.dmg`** from the [latest release](https://github.com/viclee1/careconnect-swen661/releases/latest).

This build is for Macs with **Apple silicon** (M1, M2, M3, M4 or newer). On a Mac with an Intel processor, use [the web app](#the-web-app-pwa) instead. To check which chip your Mac has, open  menu → **About This Mac** and look at **Chip**.

1. Double-click the `.dmg` file to open it.
2. Drag **CareConnect** onto the **Applications** folder in the window that opens.
3. Eject the disk image: drag it to the Trash, or select it in Finder and press **⌘E**.
4. Open **Applications** and double-click **CareConnect**.
5. The app is not signed by Apple, so macOS stops it the first time with a message such as *"CareConnect" Not Opened* or *Apple could not verify "CareConnect"*. Choose **Done**, not *Move to Trash*.
6. Open  menu → **System Settings** → **Privacy & Security**. Scroll down to the message about CareConnect and choose **Open Anyway**. Enter your Mac password if asked, then choose **Open Anyway** again.

You only need to do steps 5–6 once. After that CareConnect opens normally.

> **If you are comfortable with Terminal,** this one command does the same as steps 5–6:
> `xattr -dr com.apple.quarantine /Applications/CareConnect.app`

**To uninstall:** quit CareConnect, then drag it from **Applications** to the Trash.

### Windows

The Windows installer is **`CareConnect-Setup-1.0.0.exe`**, attached to the [v1.0.0 release](https://github.com/viclee1/careconnect-swen661/releases/tag/v1.0.0). It runs on 64-bit Windows 10 and 11.

> This installer predates the caregiver tools, so it has the care recipient screens only. For the caregiver role on a Windows PC, use [the web app](#the-web-app-pwa) in Chrome or Edge.

1. Download `CareConnect-Setup-1.0.0.exe` and double-click it.
2. The installer is not signed, so Windows shows **Windows protected your PC**. Choose **More info**, then **Run anyway**.
3. If **User Account Control** asks whether to allow changes, choose **Yes**.
4. Follow the setup wizard. You can keep the suggested install folder or choose another one. The wizard adds CareConnect to the Start menu and the desktop.
5. Choose **Finish** to open CareConnect.

**To uninstall:** go to **Settings** → **Apps** → **Installed apps**, find **CareConnect**, and choose **⋯** → **Uninstall**.

### Linux

Linux packages (`.AppImage` and `.deb`) are built by the project's automated builds but are not attached to a release. On Linux, use [the web app](#the-web-app-pwa) in Chrome or Edge.

---

## iPhone and iPad

The release page includes two `.ipa` files. They show that the iOS app builds, but they are **unsigned**, and an iPhone or iPad will only install apps signed with an Apple developer account. To use CareConnect on an iPhone or iPad, [add the web app to your Home Screen](#safari-on-iphone-or-ipad).

If you are a developer with an Apple developer account, you can sign either `.ipa` with your own team and install it through Xcode or Apple Configurator.
