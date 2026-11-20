# TestFlight QA checklist (run on a real iPhone, production build)

Tick each line on the build you will submit. Items marked NEVER RUN were not exercised in any earlier test.
Use two accounts (A and B) on two devices, or one device plus the simulator.

## 1. Accounts and sign-in
- [ ] Sign up with a real email you control (NEVER RUN on TestFlight). With "Confirm email" OFF you land in onboarding; with it ON you get the Resend email from no-reply@three63.com, tap the link, then sign in.
- [ ] Sign-up shows the 18+ and Terms/Privacy consent line, and both links open.
- [ ] Wrong password shows a readable message, not a crash.
- [ ] Forgot password: request, open the email link on the phone (not a desktop browser), set a new password, sign in with it.
- [ ] Sign out, kill the app, reopen: still signed out. Sign in, kill, reopen: still signed in.

## 2. Onboarding and profile (login, sign-up, interests, profile setup were restyled and never viewed)
- [ ] Every auth and onboarding screen is readable (labels, contrast, no clipped text) at the smallest iPhone you own.
- [ ] Username taken: clear message. Username invalid: clear message.
- [ ] Age is optional; leaving it empty works.
- [ ] Profile photo: camera and library prompts show the two purpose strings; cancelling is fine.

## 3. Writing (the core loop)
- [ ] Today shows the date and an empty writing surface. Submit stays disabled below three and above three sentences.
- [ ] Submit at exactly three locks the entry; "Edit entry" works until the day ends; the toast wording is sentence case.
- [ ] Change "Day ends at" in Settings and confirm the lock moment moves. Cross 4am (or your set hour) and confirm the entry is immutable.
- [ ] Close the app mid-sentence and reopen: the draft is still there.
- [ ] Airplane mode: write and submit; the app says what happened and recovers when the network returns.

## 3b. Check-in, Patterns, History
- [ ] Mood word and up to three habits save; skipping both is fine; switching mood or habits off in Settings hides them.
- [ ] Patterns: 7, 30 and 90 day ranges, calendar rings on full-habit days, the mood line, the habit grid, "Your week" card after a week with entries.
- [ ] Tap a calendar day: the day's entry opens. History tab (NEVER RUN) lists past entries and opens them.

## 4. Notifications
- [ ] Settings → wind-down nudge: turning it on shows the iOS permission prompt (NEVER RUN: tap Allow). Pick a time two minutes ahead, lock the phone, confirm the notification arrives. Turn it off and confirm it stops.
- [ ] Daily reminder (if enabled) arrives at the set time.

## 5. The Circle (NEVER RUN between two accounts)
- [ ] A finds B by @handle and sends a request; B accepts.
- [ ] A sends B a message; it arrives on B's device without a refresh. Typing indicator and read receipt show.
- [ ] Create a group with A, B and a third account; messages reach everyone.
- [ ] Report a message: confirmation shown, and one row appears in the `reports` table.
- [ ] Block B from A: B can no longer message A; unblocking restores it.
- [ ] Nothing in the Circle shows entries, mood or habits to friends.

## 6. AI reflection (NEVER RUN)
- [ ] Patterns → AI reflection → "Learn more" shows the consent screen naming Anthropic. Decline: nothing is sent.
- [ ] Opt in, generate a 7-day reflection with several entries: a theme, an observation and a question come back; the disclaimer is visible.
- [ ] Generate more than 10 in a day: a clear "limit reached" message, no crash.
- [ ] Opt out in Settings: the card returns to "Learn more".

## 7. Account deletion (NEVER RUN)
- [ ] Create a throwaway account C, write an entry and add a friend, then Settings → Delete account: a confirmation appears, deletion succeeds, you are signed out, and signing in as C fails.
- [ ] In the database the user, profile, entries and friendships for C are gone.

## 8. Settings, links, legal
- [ ] About rows open Privacy Policy, Terms and Support; the support mail composer addresses support@three63.com.
- [ ] Version number shown matches the build.

## 9. Device and accessibility
- [ ] Smallest iPhone (SE) and largest iPhone: no clipped or overlapping UI on Today, Patterns, Circle, Settings.
- [ ] Larger Text (Settings → Accessibility → Display & Text Size): text grows, nothing is cut off.
- [ ] VoiceOver: the writing field, Submit, tab bar, check-in buttons and calendar days have sensible labels.
- [ ] Reduce Motion on: animations are replaced by instant changes.
- [ ] Low Power Mode, backgrounding for an hour, then reopening: no crash, data intact.
- [ ] Rotate the phone: the app stays portrait.

## 10. Before you submit
- [ ] Version 1.0 and a build number higher than any earlier upload.
- [ ] Production Supabase is on a paid plan (cannot pause); "Confirm email" ON; test accounts removed except the two demo accounts.
- [ ] Both demo accounts are confirmed, friended and have entries; credentials are in the review notes.
