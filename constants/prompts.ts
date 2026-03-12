/**
 * Three™ - Daily Writing Prompts
 *
 * 80 prompts across 6 categories for optional daily inspiration.
 * Selection is deterministic by date so the prompt doesn't change mid-day.
 */

export interface Prompt {
  id: number;
  text: string;
  category: 'gratitude' | 'reflection' | 'growth' | 'creativity' | 'relationships' | 'general';
}

export const PROMPTS: Prompt[] = [
  // Gratitude (14)
  { id: 1, text: "What made you smile today?", category: 'gratitude' },
  { id: 2, text: "What's something small you're grateful for right now?", category: 'gratitude' },
  { id: 3, text: "Who made a positive impact on your day?", category: 'gratitude' },
  { id: 4, text: "What's a comfort you often take for granted?", category: 'gratitude' },
  { id: 5, text: "What recent experience are you thankful for?", category: 'gratitude' },
  { id: 6, text: "What about today surprised you in a good way?", category: 'gratitude' },
  { id: 7, text: "What's one thing that went right today?", category: 'gratitude' },
  { id: 8, text: "Who would you thank if you could right now?", category: 'gratitude' },
  { id: 9, text: "What part of your routine do you actually enjoy?", category: 'gratitude' },
  { id: 10, text: "What's beautiful about where you are right now?", category: 'gratitude' },
  { id: 11, text: "What made this week better than last week?", category: 'gratitude' },
  { id: 12, text: "What's a skill you have that you're glad you developed?", category: 'gratitude' },
  { id: 13, text: "What's the best thing you ate recently?", category: 'gratitude' },
  { id: 14, text: "What song or sound lifted your mood today?", category: 'gratitude' },

  // Reflection (14)
  { id: 15, text: "What's been on your mind the most today?", category: 'reflection' },
  { id: 16, text: "What would you tell your past self about today?", category: 'reflection' },
  { id: 17, text: "What pattern have you noticed in yourself lately?", category: 'reflection' },
  { id: 18, text: "What are you avoiding and why?", category: 'reflection' },
  { id: 19, text: "What decision are you currently wrestling with?", category: 'reflection' },
  { id: 20, text: "How are you really feeling right now?", category: 'reflection' },
  { id: 21, text: "What's something you've been putting off?", category: 'reflection' },
  { id: 22, text: "What did you learn about yourself this week?", category: 'reflection' },
  { id: 23, text: "What's the hardest thing you did today?", category: 'reflection' },
  { id: 24, text: "What would make tomorrow better than today?", category: 'reflection' },
  { id: 25, text: "What's one thing you'd change about how today went?", category: 'reflection' },
  { id: 26, text: "What are you overthinking right now?", category: 'reflection' },
  { id: 27, text: "What conversation stayed with you today?", category: 'reflection' },
  { id: 28, text: "What's the gap between who you are and who you want to be?", category: 'reflection' },

  // Growth (14)
  { id: 29, text: "What's one thing you learned today?", category: 'growth' },
  { id: 30, text: "What fear did you face recently?", category: 'growth' },
  { id: 31, text: "What habit are you trying to build?", category: 'growth' },
  { id: 32, text: "Where did you push yourself outside your comfort zone?", category: 'growth' },
  { id: 33, text: "What would you attempt if you knew you couldn't fail?", category: 'growth' },
  { id: 34, text: "What's a mistake that taught you something valuable?", category: 'growth' },
  { id: 35, text: "What's your biggest priority this week?", category: 'growth' },
  { id: 36, text: "How did you invest in yourself today?", category: 'growth' },
  { id: 37, text: "What's one step closer to your goal you took today?", category: 'growth' },
  { id: 38, text: "What's a challenge you're currently working through?", category: 'growth' },
  { id: 39, text: "What would your ideal morning routine look like?", category: 'growth' },
  { id: 40, text: "What's something you need to let go of to grow?", category: 'growth' },
  { id: 41, text: "What book, podcast, or idea is shaping your thinking?", category: 'growth' },
  { id: 42, text: "What did you do today that your future self will thank you for?", category: 'growth' },

  // Creativity (12)
  { id: 43, text: "If today were a movie scene, what would it be?", category: 'creativity' },
  { id: 44, text: "What sounds can you hear right now?", category: 'creativity' },
  { id: 45, text: "Describe today in three words.", category: 'creativity' },
  { id: 46, text: "What color represents your mood right now?", category: 'creativity' },
  { id: 47, text: "What would you build if you had unlimited resources?", category: 'creativity' },
  { id: 48, text: "Write about a small moment you want to remember.", category: 'creativity' },
  { id: 49, text: "What's the most interesting thing you saw today?", category: 'creativity' },
  { id: 50, text: "If you could have dinner with anyone, who and why?", category: 'creativity' },
  { id: 51, text: "What does your ideal day look like?", category: 'creativity' },
  { id: 52, text: "Describe a place that makes you feel at peace.", category: 'creativity' },
  { id: 53, text: "What's a memory that always makes you laugh?", category: 'creativity' },
  { id: 54, text: "What would you name this chapter of your life?", category: 'creativity' },

  // Relationships (13)
  { id: 55, text: "Who energized you today?", category: 'relationships' },
  { id: 56, text: "What's a relationship you want to nurture more?", category: 'relationships' },
  { id: 57, text: "What did someone do for you recently that meant a lot?", category: 'relationships' },
  { id: 58, text: "Who do you need to reach out to?", category: 'relationships' },
  { id: 59, text: "What's the best advice someone gave you recently?", category: 'relationships' },
  { id: 60, text: "How did you show up for someone today?", category: 'relationships' },
  { id: 61, text: "What conversation do you need to have but keep avoiding?", category: 'relationships' },
  { id: 62, text: "Who inspires you and what can you learn from them?", category: 'relationships' },
  { id: 63, text: "What do you appreciate most about your closest friend?", category: 'relationships' },
  { id: 64, text: "How did you connect with someone today?", category: 'relationships' },
  { id: 65, text: "What's a boundary you need to set or maintain?", category: 'relationships' },
  { id: 66, text: "What would you say to someone who needs encouragement?", category: 'relationships' },
  { id: 67, text: "What's the kindest thing you witnessed recently?", category: 'relationships' },

  // General (13)
  { id: 68, text: "What are you looking forward to?", category: 'general' },
  { id: 69, text: "What gave you energy today?", category: 'general' },
  { id: 70, text: "What drained your energy today?", category: 'general' },
  { id: 71, text: "What's something you want to remember about today?", category: 'general' },
  { id: 72, text: "What are you proud of this week?", category: 'general' },
  { id: 73, text: "What's on your mind right now?", category: 'general' },
  { id: 74, text: "What does success look like for you this month?", category: 'general' },
  { id: 75, text: "What's the best use of your time right now?", category: 'general' },
  { id: 76, text: "What would you do differently if you could redo today?", category: 'general' },
  { id: 77, text: "What's one thing you want to accomplish this week?", category: 'general' },
  { id: 78, text: "How do you want to feel at the end of this week?", category: 'general' },
  { id: 79, text: "What's the simplest thing that could improve your day?", category: 'general' },
  { id: 80, text: "What matters most to you right now?", category: 'general' },
];

/**
 * Get a deterministic daily prompt based on date string (YYYY-MM-DD).
 * Same prompt will show all day regardless of app restarts.
 */
export function getDailyPrompt(dateString: string): Prompt {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % PROMPTS.length;
  return PROMPTS[index];
}
