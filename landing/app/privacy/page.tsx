import type { Metadata } from "next";
import { LegalPage, SUPPORT_EMAIL } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · Three Sentences" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="17 November 2026"
      sections={[
        {
          heading: "Who we are",
          body: [
            `Three Sentences ("Three", "we", "us") is a private journaling app by ThreeSixtyThree. Questions about this policy or your data: ${SUPPORT_EMAIL}.`,
          ],
        },
        {
          heading: "What we collect",
          body: [
            "Account: your email address, name, username and password (stored hashed by our authentication provider; we never see it).",
            "Profile (optional): age, bio and interests. If you add a profile photo, the image stays on your device.",
            "Your content: journal entries, daily mood and habit check-ins, AI reflections you generate, friend connections, direct messages, and any blocks or reports you make.",
            "Service limits: a daily count of AI reflections per account, used only to prevent abuse.",
            "We do not collect your location, contacts or advertising identifiers. We have no ads, no third-party analytics and no cross-app tracking.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To run the app: sync your entries across devices, show your friends, deliver messages, and generate reflections when you ask for them.",
            "To keep people safe: reviewing reports, enforcing our Terms, and preventing abuse.",
            "To answer you when you contact support. We never sell your data or use it for advertising.",
          ],
        },
        {
          heading: "Who processes your data",
          body: [
            "Supabase hosts our database and sign-in (servers in Singapore). Data is encrypted in transit (TLS) and at rest.",
            "Anthropic (Claude) generates AI reflections, only if you turn on AI Reflection, and only with the entries from the period you choose, at the moment you request a reflection. Anthropic does not use this data to train its models.",
            "We may disclose data if the law requires it, or to protect someone's safety.",
          ],
        },
        {
          heading: "Who can see your entries",
          body: [
            "Only you. Journal entries, reflections, and your daily mood and habit check-ins are private to you and never shown to friends or other users. Direct messages are visible to you and the person you're talking to.",
            "Your entries are not end-to-end encrypted. We don't read them, except where needed to investigate a report, fix a problem you ask us to fix, or comply with the law.",
          ],
        },
        {
          heading: "Health information",
          body: [
            "What you write may include information about your health or mood. We use it only to provide the features you choose, never for advertising, and we never sell it. AI reflections are observational and are not medical advice.",
          ],
        },
        {
          heading: "Keeping and deleting your data",
          body: [
            "We keep your data while your account exists. Settings → Delete Account permanently deletes your account, entries, reflections, friends and messages straight away. Copies may remain in encrypted backups for up to 30 days before they are overwritten.",
            "Reports someone else filed about your account may be kept as a safety record.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can export your entries (Settings → Export Entries), correct your profile (Settings → Edit Profile) and delete everything (Settings → Delete Account).",
            `Depending on where you live (for example under the GDPR, UK GDPR or California law), you may have further rights to access, correct, delete or restrict use of your data. Email ${SUPPORT_EMAIL} and we will respond within 30 days.`,
          ],
        },
        {
          heading: "Children",
          body: [
            "Three is not for children under 13 (or under 16 in the EEA and UK). If you believe a child has created an account, contact us and we will delete it.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "If we change this policy, we'll update the date above and tell you in the app before material changes take effect.",
          ],
        },
      ]}
    />
  );
}
