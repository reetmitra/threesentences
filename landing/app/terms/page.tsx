import type { Metadata } from "next";
import { LegalPage, SUPPORT_EMAIL } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Use · Three Sentences" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="19 November 2026"
      sections={[
        {
          heading: "Using Three",
          body: [
            "By creating an account you agree to these Terms and our Privacy Policy. You must be 18 or older to use Three.",
            "Keep your password safe; you're responsible for activity on your account.",
          ],
        },
        {
          heading: "Your content",
          body: [
            "You own what you write. You give us permission to store, process and display it only as needed to run the app for you (for example, syncing entries and delivering messages).",
          ],
        },
        {
          heading: "Be decent",
          body: [
            "Don't harass, threaten, impersonate or spam anyone, and don't share illegal, hateful or sexually explicit content. You can report or block anyone from a conversation.",
            "We review reports within 24 hours and may remove content or suspend accounts that break these rules.",
          ],
        },
        {
          heading: "AI reflections are not advice",
          body: [
            "AI reflections are generated automatically, may be wrong, and are not medical, psychological or professional advice. If you are in crisis, contact your local emergency number (in the US, call or text 988).",
          ],
        },
        {
          heading: "Ending your account",
          body: [
            "You can delete your account at any time in Settings → Delete Account. We may suspend accounts that break these Terms.",
          ],
        },
        {
          heading: "No warranty",
          body: [
            "Three is provided \"as is\". We work hard to keep it running and your data safe, but we can't promise it will always be available or error-free. To the extent the law allows, we aren't liable for indirect or consequential losses from using the app.",
          ],
        },
        {
          heading: "Changes and contact",
          body: [
            `We may update these Terms; we'll tell you in the app before material changes take effect. Questions: ${SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
