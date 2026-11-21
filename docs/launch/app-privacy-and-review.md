# App Privacy answers, compliance notes and App Review notes

Drafted 2026-11-21 from the schema (`supabase/schema.sql`), the app code and the live privacy policy. Check every answer against what you actually ship; Apple compares the label with the binary and the policy.

## 1. App Privacy ("nutrition label") in App Store Connect

**Do you or your third-party partners collect data from this app?** Yes.

| Apple category | Data type | Why collected | Linked to the user | Used for tracking |
|----------------|-----------|---------------|--------------------|-------------------|
| Contact Info | Email Address | Account, app functionality | Yes | No |
| Contact Info | Name | Profile (`profiles.name`) | Yes | No |
| Identifiers | User ID: account ID and your @handle | Account, app functionality | Yes | No |
| User Content | Other User Content: journal entries, mood and habit check-ins, AI reflections, profile bio and interests | App functionality | Yes | No |
| User Content | Emails or Text Messages: in-app messages between friends | App functionality | Yes | No |
| Health & Fitness | Health: the daily mood word and habits you log | App functionality | Yes | No |
| Other Data | Other Data Types: age (optional, asked on profile setup) | App functionality | Yes | No |

Notes
- **Health:** Apple's "Health" type includes user-provided health information. Mood and habit logs are not HealthKit data and the app makes no medical claims, but they are private wellbeing data. Declaring them is the safe choice; under-declaring is the risk, over-declaring is not penalised. Your call.
- **Not collected:** Location, Contacts, Photos or Videos (the profile photo stays on the device, per the privacy policy), Browsing or Search History, Purchases, Financial Info, Usage Data, Diagnostics. The app has no analytics or crash SDK. If you add one later, update this.
- **Tracking:** None. No advertising identifier, no cross-app tracking, no data brokers. Answer "No" to tracking.
- **Age:** profile setup asks for an age (optional) and stores it in `profiles.age`, so it is listed above under Other Data. Sign-up itself asks only for a confirmation that the user is 18 or older.
- **Third party (AI):** only when the user opts in and asks for a reflection, their entries go to Anthropic (Claude) for processing. The in-app opt-in names Anthropic and says the entries are not used for training. Say so in the review notes (section 4).

## 2. Export compliance
`ITSAppUsesNonExemptEncryption = NO` is already in `Info.plist`. The app uses only standard HTTPS and no custom cryptography. Answer "No" to non-exempt encryption.

## 3. Guideline checklist

| Guideline | Requirement | State |
|-----------|-------------|-------|
| 1.2 User-generated content | Terms that forbid objectionable content | Done: Terms section on conduct (`/terms`) |
| 1.2 | A way to report content | Done: report from a conversation (`reports` table) |
| 1.2 | A way to block users | Done: block from a conversation (`blocks` table) |
| 1.2 | Published contact information | Done: support@three63.com on the site |
| 1.2 | Act on reports promptly | **Open.** Terms promise review within 24 hours; nothing alerts you. See the README item 9 |
| 1.2 | Filter objectionable content | Not built. Mitigated: no public feed, messages only within the friends circle. State this in the review notes |
| 5.1.1(v) | In-app account deletion | Done: Settings → Delete account (`delete_my_account`, verified live on a test account) |
| 5.1.1(i) | Privacy policy link in app and metadata | Done in app; add the URL in App Store Connect |
| 5.1.2(i) | Consent before sharing personal data with third-party AI | Done: opt-in modal names Anthropic; AI is off by default |
| 4.8 Sign in with Apple | Needed only when other third-party login is offered | Not needed: email and password only. The unused capability was removed |
| 2.1 Completeness | Demo account, working backend during review | **Open.** Create the two demo accounts first (section 4); keep Supabase on a paid plan so it cannot pause |
| 5.1.1 Age | App is 18+ | Enforced in Terms and sign-up consent |

## 4. App Review notes (paste into "Notes" in App Store Connect)

> Three Sentences is a private journaling app. Each day the user writes exactly three sentences; the Submit button unlocks at exactly three. Entries lock when the user's day ends (4am by default).
>
> **Demo accounts** (both already email-confirmed and friends with each other, with sample entries):
> - Account A: `<email>` / `<password>`
> - Account B: `<email>` / `<password>`
>
> **How to test**
> 1. Sign in with Account A. On Today, write three sentences and tap Submit. Optionally answer the mood and habit check-in.
> 2. Open Patterns to see the calendar, mood and habit views.
> 3. Open The Circle, open the chat with Account B, send a message. In the chat menu you can Report or Block the other user (Guideline 1.2).
> 4. Patterns tab → "AI reflection" card → "Learn more" (off by default; also a toggle in Settings). The consent screen names Anthropic (Claude) as the processor; entries are sent only when the user taps "Generate reflection" and are not used for training (Guideline 5.1.2(i)).
> 5. Settings → Delete account removes the account and all its data (Guideline 5.1.1(v)).
>
> There is no public feed, no public profiles and no purchases. The app is for adults 18 and over. Support: support@three63.com. Privacy policy: https://three63.com/privacy

**Creating the demo accounts:** sign up twice in the app yourself (never share passwords in chat), confirm both emails, add each other as friends, and write two or three entries on each so every screen has content. Do this on the production project and keep these two accounts out of any data wipe.
