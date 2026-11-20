import { Reveal } from "./Reveal";

const ITEMS: [string, string][] = [
  [
    "Why exactly three sentences?",
    "Three is the sweet spot between too little and too much. One sentence feels like a tweet. Five starts to feel like homework. Three forces you to choose what actually mattered, and it's short enough that you'll do it even on your worst days.",
  ],
  [
    "Can I edit my entries?",
    "Until your day ends (4am by default, or whenever you set it). After that, they stand as written, because the words you write in the moment are true in a way that edited words are not. Three Sentences is a record of who you were, not who you wish you had been.",
  ],
  [
    "What does “363/365” mean?",
    "Two days of grace, built in. We don't track streaks as shame; we track them as a record of relentlessness. Miss a day. Miss two. Return on the third and keep going. Empty days are not failures.",
  ],
  [
    "What are the mood and habit check-ins?",
    "An optional ten seconds after your three sentences: how was today, in one word (rough, low, okay, good or great), and up to three habits you choose, answered yes or no. Patterns shows them over 7, 30 or 90 days next to your calendar. They are private to you, never shown to friends, and either can be switched off in Settings.",
  ],
  [
    "What is “The Circle”?",
    "An optional feature: up to eight people you trust with your practice. No feeds, no public profiles, no follower counts. Just private messages between people who actually know each other.",
  ],
  [
    "Is the AI reflection safe?",
    "The AI reflection is off by default. You opt in, and you can opt out at any time. It reads across your entries to find themes and patterns; it never rewrites your words, never shares them, and never uses them to train anything.",
  ],
  [
    "Who is Three for?",
    "Adults, 18 and over. Three is a private journal with an optional small circle of friends, built for people trying to put some shape back into their days.",
  ],
  [
    "When does it launch?",
    "Q4 2026, iOS first. We're opening access in small waves. Request access from the waitlist and we'll send you in when there's room. The waitlist is not a marketing gimmick; we genuinely want to keep the first cohort small.",
  ],
  [
    "How is my journal protected?",
    "Your entries are yours, not ours. They're encrypted in transit and at rest, visible only to you in the app, never sold, and never used to train AI. They only reach an AI model if you turn on AI Reflection and ask for one. The business model is a simple subscription, not your data.",
  ],
];

export function Faq() {
  return (
    <section id="faq" data-stop="faq" className="faq">
      <div className="faq-grid">
        <Reveal as="h2">Questions, answered.</Reveal>
        <div className="faq-text">
          {ITEMS.map(([q, a]) => (
            <p key={q}>
              <strong>{q}</strong> {a}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
