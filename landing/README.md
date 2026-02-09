# 3hree Landing Page

A minimal, black and white landing page for 3hree with waitlist signup functionality.

## Setup

1. Install dependencies:
```bash
cd landing
npm install
```

2. Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the waitlist table migration in Supabase (see `../supabase/schema.sql`):
```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_insert" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
```

4. Run the development server:
```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Features

- Animated logo with "3hree" branding
- Text scramble and typewriter effects
- Waitlist signup modal with Supabase integration
- Fully responsive black and white design
- Q4 2026 launch date display
