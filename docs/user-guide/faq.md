# Frequently asked questions

← [User documentation](README.md)

- [About CareConnect](#about-careconnect)
- [Accounts and privacy](#accounts-and-privacy)
- [Alerts, sound and captions](#alerts-sound-and-captions)
- [Devices and versions](#devices-and-versions)
- [Caregivers](#caregivers)

---

## About CareConnect

**What is CareConnect for?**
It helps a person who is deaf or hard of hearing keep track of their day: medicines, appointments, memories, and the people who care for them. Caregivers get tools to manage that plan. Every alert shows up as words and a colour flash on screen, so nothing depends on hearing.

**Do I need to hear anything to use it?**
No. Sound is only ever an extra. Every alert also appears as a written banner, can flash the screen, and can vibrate your phone. You can turn alert volume down to zero and miss nothing.

**Is CareConnect a real medical service?**
No. CareConnect is a university project (SWEN 661, University of Maryland Global Campus) and runs on sample data. Do not use it to manage real medicines or appointments. Always follow the advice of your doctor or pharmacist.

**Who is Margaret?**
Margaret is the sample care recipient the app starts with, so there is something to see from the first screen. Maria (her daughter) and the other contacts are sample people too.

**Does it cost anything?**
No. CareConnect is free and open source under the MIT licence.

---

## Accounts and privacy

**Why does any password work?**
CareConnect has no real account system yet. Signing in checks only that you typed a correctly written email address. When you create an account, it also checks that the password has at least 6 characters and that you typed it the same way twice.

**Where is my information stored? Is it sent anywhere?**
Nothing is sent to a server. The web app keeps what you enter in your browser's storage, on your device. The Android and desktop apps keep your settings on the device. See [Your data](using-careconnect.md#your-data) for exactly what each version keeps.

**Can I use my account on another device?**
Not yet. Each browser and each device has its own copy of the data, so changes on your phone don't appear on your computer.

**How do I sign out?**
Select your name at the top right of the screen, then **Sign out**.

**How do I delete everything?**
On the web app, clear the site's data in your browser. See [Start over with fresh sample data](troubleshooting.md#start-over-with-fresh-sample-data). To remove an installed app, uninstall it as described in [Installing CareConnect](installation.md).

---

## Alerts, sound and captions

**Why can't I turn off visual alert banners?**
Because without them, an alert could reach you by sound alone, and that is what CareConnect exists to prevent. The setting is shown so you know it is there, but it stays on. You can still turn off the extras: screen flashes, vibration and sound.

**How can I tell alerts apart without looking at the words?**
Each type has its own flash colour and vibration rhythm. Medication: amber flash and a double pulse. Appointment: teal flash and long-short-long. Missed or escalated: a rapid red double-flash and a rapid burst. You can preview them all in **Settings**. See [How CareConnect alerts you](using-careconnect.md#how-careconnect-alerts-you).

**Will the flashing be a problem if I'm sensitive to motion or flashing light?**
If you turn on *reduce motion* in your device's accessibility settings, CareConnect shows a steady coloured panel instead of a flash. You can also turn off **Screen flash alerts** in **Settings**. The written banner still appears either way.

**Why doesn't my phone vibrate when I use the web app?**
Vibration from a website only works in Chrome (and most other browsers) on Android. iPhones and iPads don't allow websites to vibrate. For vibration, use Chrome on Android or the Android app.

**Can I make captions bigger or a different colour?**
Yes. In **Settings** → **Captions**, choose **Small**, **Medium** or **Large**, and **White** or **Yellow** text.

**Do video calls really connect?**
Not yet. Video calls, incoming calls and their live captions are simulated so you can see how they will work. The same goes for the **Alert** button reaching your contact, smart alert escalation, and alerting connected devices such as smart lights and watches.

**Will I get alerts when CareConnect is closed?**
Not in this version. Alerts appear while CareConnect is open. On a computer, turn on **Desktop notifications** in **Settings** to see them while CareConnect is in the background.

---

## Devices and versions

**Which version should I install?**
For most people, the web app: open <https://careconnect-swen661.vercel.app> and install it from your browser. See [Which version should I use?](README.md#which-version-should-i-use)

**Why are there two Android apps?**
The project built the same app twice, once with Flutter and once with React Native, to compare the two technologies. They work the same, so install either one. The Flutter build shows on your phone as **careconnect_mobile**.

**Can I install the app on my iPhone?**
Add the web app to your Home Screen: open it in Safari, tap **Share**, then **Add to Home Screen**. The iPhone app files (`.ipa`) are unsigned, so an iPhone can't install them.

**Does CareConnect work offline?**
The web app does, once it has loaded at least once. The Android and desktop apps don't need a connection at all.

**Why does my computer warn me about the desktop installer?**
The installers are not signed with a paid Apple or Microsoft certificate, which is normal for a student project. [Installing CareConnect](installation.md#the-desktop-app) shows how to open them safely.

**Can I make the text bigger?**
Yes. Use your browser's zoom (**Ctrl** and **+**, or **⌘** and **+** on a Mac), or on the desktop app **View** → **Zoom In**. CareConnect also follows your phone's text size. The **High contrast** button in the header makes text and borders stronger.

---

## Caregivers

**How do I switch between the care recipient and the caregiver view?**
Select your name at the top right, then **Switch to caregiver** or **Switch to care recipient**.

**If I add a medicine as the caregiver, does the care recipient see it?**
Yes, if you are both using CareConnect on the same device and browser. The new medicine appears on the care recipient's **Medicines** screen with your instructions. Sharing across different devices needs a server, which CareConnect doesn't have yet.

**Why did my caregiver notes disappear?**
Notes are not saved yet. They last until you reload the page or close the app.
