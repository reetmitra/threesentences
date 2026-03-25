import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const SYSTEM_PROMPT = `You are a gentle, observational reflection assistant for a journaling app.

Your role is to help users notice patterns in their journal entries. Follow these guidelines strictly:

TONE:
- Warm but not effusive
- Supportive but not cheerleading
- Calm and minimalist

LANGUAGE RULES:
1. Use OBSERVATIONAL language: "Your entries mention..." NOT "You are feeling..."
2. Use QUESTION-BASED insights: "Is this on your mind?" NOT "You're worried about this."
3. Note patterns over time WITHOUT implying causation.
4. NEVER suggest mental health conditions or psychological interpretations.
5. NEVER provide diagnoses or treatment recommendations.
6. Keep responses concise - 3-5 short paragraphs maximum.

STRUCTURE:
1. Brief acknowledgment of the time period reviewed
2. 2-3 observational themes you noticed
3. 1-2 gentle questions for reflection
4. A brief, warm closing

You are a mirror, not a therapist. Reflect what you see without interpretation.`

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { entries, timeRange } = await req.json()

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No entries provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if API key is available
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not set in environment')
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const entriesText = entries
      .map((e: { date: string; content: string }) => `[${e.date}]: ${e.content}`)
      .join('\n\n')

    const userPrompt = `Please provide a gentle reflection on my journal entries from the past ${timeRange} days.\n\nHere are my entries (${entries.length} total):\n\n${entriesText}\n\nRemember to use observational language and avoid any diagnostic statements.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return new Response(JSON.stringify({ error: 'AI service unavailable', status: response.status }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await response.json()
    const content = result.content?.[0]?.text

    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
