# M1/M2: Wire AI Reflections to Real API + Sync to Supabase

## Current State

### M1: Mock AI responses
`services/aiReflection.ts:202` calls `generateMockReflection()` which returns hardcoded word-frequency analysis. The system/user prompts are already well-crafted (lines 89-131) but never sent to an API.

### M2: Reflections stored only in AsyncStorage
`store/reflections.ts` reads/writes reflections to `@threesentences/reflections` in AsyncStorage. The DB has a `reflections` table (`schema.sql:92-98`) with columns `id, user_id, entry_id, content, created_at` — never used.

### Schema gap
The DB `reflections` table has `entry_id UUID REFERENCES entries(id)` (single entry reference), but the app generates reflections from multiple entries over a time range. The `entry_id` column doesn't fit the actual data model.

## Target State

1. AI reflections generated via Supabase Edge Function calling Claude API
2. Reflections stored in Supabase with AsyncStorage as offline cache
3. DB schema updated to match actual usage (time range, entries count)

## Approach: Supabase Edge Function

Direct client-to-AI-API calls expose the API key. An Edge Function keeps the key server-side, enables rate limiting, and allows prompt iteration without app updates.

## Files to Modify/Create

| File | Change |
|------|--------|
| `supabase/schema.sql` | Update `reflections` table schema |
| `supabase/functions/generate-reflection/index.ts` | New Edge Function |
| `services/aiReflection.ts` | Replace mock with Edge Function call |
| `store/reflections.ts` | Add Supabase sync alongside AsyncStorage cache |

## Step-by-Step Implementation

### Step 1: Update reflections table schema

Migration SQL:
```sql
-- Drop and recreate reflections table to match actual usage
DROP TABLE IF EXISTS public.reflections CASCADE;

CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    time_range INTEGER NOT NULL CHECK (time_range IN (7, 30, 90)),
    entries_analyzed INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    has_crisis_indicators BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX idx_reflections_created_at ON public.reflections(created_at DESC);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reflections_select" ON public.reflections
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "reflections_insert" ON public.reflections
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "reflections_delete" ON public.reflections
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
```

### Step 2: Create Supabase Edge Function

`supabase/functions/generate-reflection/index.ts`:

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

serve(async (req) => {
    // 1. Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Parse request
    const { entries, timeRange } = await req.json()
    // entries: Array<{ date: string, content: string }>
    // timeRange: 7 | 30 | 90

    // 3. Rate limit: max 1 reflection per time range per day
    // (implement via DB check or Redis)

    // 4. Build prompts (same as existing generateSystemPrompt/generateUserPrompt)
    const systemPrompt = `You are a gentle, observational reflection assistant...` // full prompt
    const userPrompt = `Please provide a gentle reflection on my journal entries from the past ${timeRange} days.\n\n${entries.map(e => `[${e.date}]: ${e.content}`).join('\n\n')}`

    // 5. Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',  // fast + cheap for reflections
            max_tokens: 500,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        }),
    })

    const result = await response.json()
    const content = result.content[0].text

    // 6. Return reflection
    return new Response(JSON.stringify({ content }), {
        headers: { 'Content-Type': 'application/json' },
    })
})
```

Deploy:
```bash
supabase functions deploy generate-reflection
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### Step 3: Update `services/aiReflection.ts`

Replace the mock call with an Edge Function invocation:

```ts
export async function generateReflection(
    entries: Entry[],
    timeRange: ReflectionTimeRange
): Promise<ReflectionResult> {
    // Crisis check stays client-side (no need to send crisis content to API)
    if (detectCrisis(entries)) {
        return { success: false, crisisDetected: true, error: 'crisis_detected' };
    }

    try {
        const supabase = getAuthenticatedSupabase();
        const { data, error } = await supabase.functions.invoke('generate-reflection', {
            body: {
                entries: entries.map(e => ({ date: e.date, content: e.content })),
                timeRange,
            },
        });

        if (error) throw error;

        const reflection: Reflection = {
            id: `reflection-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            timeRange,
            content: data.content,
            entriesAnalyzed: entries.length,
            hasCrisisIndicators: false,
        };

        return { success: true, reflection };
    } catch (error) {
        console.error('Failed to generate reflection:', error);
        return {
            success: false,
            error: 'Failed to generate reflection. Please try again.',
        };
    }
}
```

### Step 4: Update `store/reflections.ts` with Supabase sync

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthenticatedSupabase } from '@/config/supabase';
import { Reflection } from '@/services/aiReflection';

const STORAGE_KEY = '@threesentences/reflections';

/** Save to both Supabase and AsyncStorage */
export async function saveReflection(
    userId: string,
    reflection: Reflection
): Promise<void> {
    // Save to Supabase
    try {
        await getAuthenticatedSupabase()
            .from('reflections')
            .insert({
                user_id: userId,
                time_range: reflection.timeRange,
                entries_analyzed: reflection.entriesAnalyzed,
                content: reflection.content,
                has_crisis_indicators: reflection.hasCrisisIndicators,
            });
    } catch (error) {
        console.error('Failed to save reflection to Supabase:', error);
    }

    // Save to AsyncStorage as cache
    const all = await getAllReflections();
    all.push(reflection);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Get from Supabase, fallback to AsyncStorage */
export async function getAllReflections(userId?: string): Promise<Reflection[]> {
    if (userId) {
        try {
            const { data, error } = await getAuthenticatedSupabase()
                .from('reflections')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Map DB rows to Reflection type
                const reflections = data.map(r => ({
                    id: r.id,
                    generatedAt: r.created_at,
                    timeRange: r.time_range as ReflectionTimeRange,
                    content: r.content,
                    entriesAnalyzed: r.entries_analyzed,
                    hasCrisisIndicators: r.has_crisis_indicators,
                }));
                // Update cache
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
                return reflections;
            }
        } catch {
            // Fall through to AsyncStorage
        }
    }

    // Fallback: AsyncStorage cache
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}
```

### Step 5: Update callers of `saveReflection` to pass `userId`

Search for calls to `saveReflection` and ensure they pass `userId` as the first argument.

## Cost Control

- Use `claude-haiku-4-5-20251001` for reflections (~$0.001 per reflection)
- Rate limit: 1 reflection per time range per day per user
- Implement in Edge Function: check `reflections` table for existing reflection with same `user_id`, `time_range`, and `created_at::date = CURRENT_DATE`

## Testing

1. **Edge Function**: Call directly via `curl` with test entries → verify Claude response
2. **End-to-end**: Generate reflection in app → verify it appears in Supabase `reflections` table
3. **Offline fallback**: Disable network → verify cached reflections load from AsyncStorage
4. **Crisis detection**: Submit entries with crisis keywords → verify API is never called, resources shown
5. **Rate limit**: Generate 2 reflections for same time range same day → second should be blocked
6. **Delete all**: Call `deleteAllReflections` → verify both Supabase and AsyncStorage are cleared
