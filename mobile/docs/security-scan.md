# Security scan — CareConnect React Native client

Run 2026-09-15, against `WK5-Victor` (Node's `npm audit`, Expo SDK 57), covering
the full merged app: Victor's Contacts/Messaging/Settings, the shared shell,
Justin's Welcome/Sign In/Sign Up/Home/My Day, and Rehman's Appointments/
Medicines/Memories.

## Dependency vulnerabilities — `npm audit`

```
$ npm audit --omit=dev

13 moderate severity vulnerabilities
```

All 13 are **moderate**, and every one resolves to build-time tooling rather
than code that ships on a device:

| Package | Reached through | Nature |
|:--------|:-----------------|:-------|
| `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/metro-config`, `@expo/prebuild-config`, `@expo/local-build-cache-provider` | `expo` (dev-time CLI/bundler tooling) | Transitive advisories in Expo's own build tooling, not in any module bundled into the app |
| `xcode`, `uuid` | `@expo/config-plugins` → `xcode` → `uuid` | `uuid` v3/v5/v6 buffer-bounds issue (CWE-787); only reached through the native-project generator (`expo prebuild`), never called at runtime |
| `query-string`, `decode-uri-component` | `@react-navigation/core` | ReDoS-style advisory in a URL-decoding helper; CareConnect never parses a URL supplied by an untrusted party — navigation params are typed and constructed in-app (see `src/navigation/routes.ts`) |

None are **high** or **critical**. `npm audit`'s suggested fix
(`expo@46.0.21`) is a major *downgrade* from the SDK 57 this app is built
against and would break the app outright — not a viable fix. There is no
patched SDK 57-compatible release yet for the Expo-tooling advisories; they
are tracked upstream and should be re-checked (`npm audit`) before each
future dependency bump.

## Code-level review

`eslint .` and `tsc --noEmit` both report zero issues. In addition, the
following manual checks were run against `src/`:

| Check | Result |
|:------|:-------|
| Hardcoded API keys / secrets / passwords | None found |
| Plaintext `http://` network calls | None found (no network calls at all yet — data is mocked in-memory or in `AsyncStorage`, per [Known issues](../README.md#known-issues-and-limitations)) |
| `eval`, `Function(...)`, `child_process`, other dynamic execution | None found |
| Sensitive data in `AsyncStorage` | Only accessibility preferences (caption size/colour, volume, vibration pattern) are persisted under one key (`careconnect.a11y`) — no PII, credentials, or health data |
| Sign In / Sign Up credential handling | Forms take input but do not validate, transmit, or store it anywhere — "Sign in" and "Create account" navigate straight into the app regardless of what was typed, since there is no backend yet |

## Notes / follow-up

- No backend or network layer exists yet on this branch (contacts, messages,
  appointments, medicines and memories are all local — either mock fixtures
  or discarded after form validation), so there is no attack surface for
  injection, TLS, or auth vulnerabilities to scan for at this stage. That
  changes once a real auth backend lands — re-scan then.
- Re-run `npm audit --omit=dev` after any dependency bump, and before final
  submission, to catch newly disclosed CVEs.
