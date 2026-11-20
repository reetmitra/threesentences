# Three Sentences: App Store launch checklist

Last updated 2026-11-21. "Owner" means it needs your Apple, Supabase or Anthropic login, or your decision.

| # | Item | Who | Status |
|---|------|-----|--------|
| 1 | Apple Developer Program active; app record created in App Store Connect with bundle ID `com.threesixtythree.threesentences` | Owner | Xcode project has team `UX9KQJN96P`; record not verified |
| 2 | Remove unused Sign in with Apple and push entitlements | Done | `app.json` + entitlements cleaned (branch `chore/store-prep`) |
| 3 | Archive in Xcode, bump build number (now 1), upload to TestFlight | Owner | Open. Keys come from `.env.local`; an EAS cloud build would ship without them |
| 4 | Real-email sign-up test on TestFlight, then turn Supabase "Confirm email" ON | Owner | Open (it is OFF: anyone can sign up with another person's address) |
| 5 | Supabase Pro (free tier pauses after a week idle), leaked-password protection, backups; Anthropic spend cap | Owner | Open |
| 6 | Final device test, see `testflight-qa-checklist.md` | Owner | Open; DMs, AI reflection, delete account never run |
| 7 | App Store Connect listing, see `app-store-listing.md` | Owner | Copy drafted |
| 8 | App Privacy answers, age rating, review notes + two demo accounts, see `app-privacy-and-review.md` | Owner | Answers drafted; demo accounts not created |
| 9 | Process for the in-app reports (Terms promise a review within 24 hours) | Owner | Open: nothing alerts you; the `reports` table is empty today |
| 10 | Database hardening, see `pending-db-hardening.sql` | Needs OK | Written, not applied |
| 11 | Wipe test accounts from the live database | Needs your list | 13 accounts exist; see below |
| 12 | Decide public release vs invite-only first wave | Owner | Landing says invite-only; app sign-up is open |
| 13 | "Up to eight friends" (landing + FAQ) vs the app | Owner | The app does not enforce a limit; enforce it or change the copy |
| 14 | "Simple subscription" (FAQ) vs the app | Owner | No in-app purchase exists; v1 is free. Keep or reword the FAQ |

## Accounts in the live database (2026-11-21): 13

- 1 is the main account (last sign-in 18 Nov, 11 entries).
- 6 more `re***@gmail.com` accounts (1 from 27 May, 5 from 2 July) share your main account's prefix, so they are probably your own tests. Please confirm.
- 1 `ja***@gmail.com` account (18 Nov) is the sign-up test.
- 5 accounts from 26-27 May (`is***`, `ch***`, `pa***`, `mi***`, `pi***`) have 0 to 2 entries each. If these are real beta testers, tell them before removing anything.
- The waitlist holds 10 real sign-ups (March and May). Keep them.

Nothing has been deleted. Tell me which accounts to remove and I will show the exact statement first.
