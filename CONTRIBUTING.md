# Contributing to CareConnect

How the team works on this repository from Week 12 on. The README's
[Git workflow](README.md#git-workflow) section has the reasoning; this file is
the checklist.

## 1. Start from an issue

Every piece of work starts as an issue, opened from one of the forms — **Bug
report**, **Feature** or **Accessibility issue** — and added to the project
board. Assign it to yourself when you start. If the work is bigger than about
two days, split it.

## 2. Branch

Branch from the latest `main`, named `type/short-kebab-description`:

| Prefix | Use |
|:--|:--|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `a11y/` | Accessibility change |
| `test/` | Tests only |
| `docs/` | Documentation only |
| `chore/` | Tooling, CI, dependencies, config |

```bash
git switch main && git pull
git switch -c a11y/caption-contrast
```

## 3. Commit

- Subject line: imperative, at most about 72 characters, saying what the commit
  does — `Fix message composer hidden by the keyboard`, not `fix`, `Update` or
  `testing`.
- Body, when the change is not obvious: why, and anything a reviewer or a future
  reader needs to know. Wrap at about 72 characters.
- One logical change per commit. Commit tests with the code they test.

## 4. Test before you push

Run the checks for every client you touched. CI runs the same ones on the pull
request, and each client has a coverage threshold its test run enforces.

| Client | Commands (from that client's folder) |
|:--|:--|
| Web (repository root) | `npm run lint && npm run typecheck && npm run test:coverage`, then `npm run test:e2e` for anything user-visible |
| Desktop (`desktop/`) | `npm run lint && npm run typecheck && npm run test:coverage` |
| React Native (`mobile/`) | `npm run lint && npm run typecheck && npm run test:coverage` |
| Flutter (`flutter/`) | `flutter analyze && flutter test --coverage` |

Tests check what the user sees, hears announced, or can do next — query by role
and accessible name, not by test ID, wherever the platform allows. No snapshot
tests.

For anything a care recipient sees, also check by hand that nothing is
communicated by sound alone, and that it works with the keyboard alone and with
a screen reader. Web changes: `npm run a11y:web` must still report 0 violations.

## 5. Open a pull request

- Rebase on the latest `main` first: `git fetch && git rebase origin/main`.
- Fill in the template. Link the issue with `Closes #<number>` so merging closes it.
- Screenshots for anything user-visible.
- Request a review from a teammate. Rotate reviewers.

## 6. Review

- At least one approving review from someone who did not write the change.
  **Nobody merges their own pull request.**
- Run the branch for anything user-visible; do not review only the diff.
- Prefix non-blocking comments with `nit:`. Authors answer every comment, with a
  change or a reason.

## 7. Merge

- CI green on every workflow the change triggers.
- **Squash and merge**, editing the squash message so `main` gets one clear,
  meaningful commit per pull request.
- Delete the branch after merging.
