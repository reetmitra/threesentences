# Three Sentences — Product Review Questions

Answer these to guide feature decisions, simplification, and launch priorities.

---

## Product & Vision

### 1. Who is your day-one user?
You describe "elite, high-achievers" — but is this more like a solo journaler (Headspace/Day One vibes), or is the social/accountability piece the core hook? Which matters more: the writing habit or the community? I think the writing habit matters more but the community is a good addition to have because it can help users stay accountable to their goals.

**Answer:**

### 2. What's your launch strategy?
Are you planning a public launch, invite-only beta, or a closed group pilot? This affects which features are essential vs. premature. I think a closed group pilot is a good idea because it can help us get feedback from users and make sure the product is ready for launch.

**Answer:**

### 3. What's the monetization model?
Free with premium tier? Paid upfront? This affects whether AI Reflect, social features, or data export should be gated. I think a premium tier is a good idea because it can help us cover our costs and make sure the product is ready for launch.

**Answer:**

---

## Feature-Specific

### 4. How central is the Social Hub?
Right now you have full DMs, friend requests, interest-based matching, and even group messaging schema. Is this a journaling app with light social, or a social app built around journaling? Do you actually want people chatting in-app, or is accountability better served another way (e.g., streaks visible to friends, not full messaging)? I think a social app built around journaling is a good idea because it can help users stay accountable to their goals. I don't think DMs are a good idea because they can be a distraction and take away from the writing experience. Streaks visible to friends is a good idea because it can help users stay accountable to their goals. This is a journaling app with light social.

**Answer:**

### 5. AI Reflect — core or nice-to-have?
It's currently mock/template-based. Do you plan to integrate a real LLM (Claude API, etc.)? Is the AI reflection a core differentiator or a nice-to-have? The crisis detection piece is thoughtful but also a liability risk — have you thought about that? I think AI Reflect is a core differentiator because it can help users stay accountable to their goals. I don't think the crisis detection piece is a liability risk because it can help users stay accountable to their goals. I plan to integrate a real LLM (Claude API, etc.) in the future.

**Answer:**

### 6. Does the Guide tab justify a permanent spot?
It's an auto-rotating carousel of your philosophy. Once a user reads it once, do they ever go back? Is a permanent tab justified, or could this be onboarding-only / a settings page? This should be onboarding-only / a settings page. We will modify it to be onboarding-only / a settings page.

**Answer:**

### 7. The 7-second loading screen
This is a bold branding choice. 7 seconds is an eternity in mobile UX. Have you tested this with real users? Do you see this as non-negotiable brand identity, or are you open to shortening it? I am open to shortening it since it does feel like it's dragging on a bit too long.

**Answer:**

### 8. Immutable entries — any grace period?
Users can't edit after submission. This is philosophically strong but could frustrate users who make typos or submit accidentally. Have you considered a short grace period (e.g., 5-minute edit window)? I think we should keep it as it is since it adds to the authenticity of the experience. Or maybe we can add a 15 minute grace period.

**Answer:**

### 9. Exactly 3 sentences — is the constraint causing friction?
The sentence detection logic is complex (100+ hardcoded abbreviations, edge cases). Have you run into issues where users get frustrated because the counter doesn't match their expectation? Would you consider "approximately 3" or a character/word limit instead? I think we should keep it as it is since it adds to the authenticity of the experience.

**Answer:**

### 10. Data export — needed pre-launch?
You support JSON/CSV/TXT export. Is anyone actually asking for this, or is it a "just in case" feature? It adds surface area. I don't think it's needed pre-launch.

**Answer:**

---

## Technical & Complexity

### 11. Groups/group messaging — ship or remove?
You have full database schema for groups (tables, triggers, RLS policies) but no UI. Is this on your roadmap, or dead code you should remove? It definitely is on my roadmap and I will be building the UI for it.

**Answer:**

### 12. Encryption — how important is it really?
You're using XOR cipher as MVP crypto. Is end-to-end encryption a selling point of the app, or is Supabase RLS + auth sufficient? I think Supabase RLS + auth is sufficient.

**Answer:**

### 13. Offline support — needed for your audience?
Right now the app requires connectivity for everything except drafts. Is this acceptable, or do you need offline journaling with sync? I don't think it's needed for my audience.

**Answer:**

### 14. Interest-based discovery — the right approach?
You have 40+ curated "elite" interests for friend matching. Is this actually how you want people to find each other, or would something simpler work (invite codes, shared circles, etc.)? I think we could make it a little more flexible and have an interesection between the invite codes, shared circles along with the interests.

**Answer:**

### 15. Firebase remnants — safe to remove?
There's still a `config/firebase.ts` from a migration. Can it be cleaned up, or is there a reason it's still there? I think it can be cleaned up.

**Answer:**

---

## Prioritization

### 16. If you could only ship 3 features at launch, which would they be?
This helps determine what to cut vs. polish.

Three Sentences, Progress Tracker, Social Hub.
**Answer:**
