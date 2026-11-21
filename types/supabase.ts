/**
 * Three™ - Supabase Database Types
 *
 * TypeScript types for the Supabase database schema.
 * These types are used by the Supabase client for type safety.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    username: string
                    age: number | null
                    bio: string | null
                    profile_image: string | null
                    interests: string[]
                    is_complete: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    username: string
                    age?: number | null
                    bio?: string | null
                    profile_image?: string | null
                    interests?: string[]
                    is_complete?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    username?: string
                    age?: number | null
                    bio?: string | null
                    profile_image?: string | null
                    interests?: string[]
                    is_complete?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            friends: {
                Row: {
                    id: string
                    user_id: string
                    friend_id: string
                    status: 'pending' | 'accepted' | 'blocked'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    friend_id: string
                    status?: 'pending' | 'accepted' | 'blocked'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    friend_id?: string
                    status?: 'pending' | 'accepted' | 'blocked'
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string | null
                    group_id: string | null
                    content: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id?: string | null
                    group_id?: string | null
                    content: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string | null
                    group_id?: string | null
                    content?: string
                    is_read?: boolean
                    created_at?: string
                }
            }
            entries: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    encrypted_content: string
                    timezone: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    encrypted_content: string
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    encrypted_content?: string
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            reflections: {
                Row: {
                    id: string
                    user_id: string
                    time_range: 7 | 30 | 90
                    entries_analyzed: number
                    content: string
                    has_crisis_indicators: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    time_range: 7 | 30 | 90
                    entries_analyzed?: number
                    content: string
                    has_crisis_indicators?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    time_range?: 7 | 30 | 90
                    entries_analyzed?: number
                    content?: string
                    has_crisis_indicators?: boolean
                    created_at?: string
                }
            }
            waitlist: {
                Row: {
                    id: string
                    name: string | null
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name?: string | null
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    email?: string
                    created_at?: string
                }
            }
            blocks: {
                Row: {
                    blocker_id: string
                    blocked_id: string
                    created_at: string
                }
                Insert: {
                    blocker_id?: string
                    blocked_id: string
                    created_at?: string
                }
                Update: {
                    blocker_id?: string
                    blocked_id?: string
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    reported_user_id: string
                    conversation_id: string | null
                    reason: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    reporter_id?: string
                    reported_user_id: string
                    conversation_id?: string | null
                    reason: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    reporter_id?: string
                    reported_user_id?: string
                    conversation_id?: string | null
                    reason?: string
                    created_at?: string
                }
            }
            ai_usage: {
                Row: {
                    user_id: string
                    day: string
                    count: number
                }
                Insert: {
                    user_id: string
                    day?: string
                    count?: number
                }
                Update: {
                    user_id?: string
                    day?: string
                    count?: number
                }
            }
            user_settings: {
                Row: {
                    user_id: string
                    day_rollover_hour: number
                    trackers: Json
                    updated_at: string
                }
                Insert: {
                    user_id?: string
                    day_rollover_hour?: number
                    trackers?: Json
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    day_rollover_hour?: number
                    trackers?: Json
                    updated_at?: string
                }
            }
            habits: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    position: number
                    link: 'workout' | 'sleep' | null
                    created_at: string
                    archived_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    position: number
                    link?: 'workout' | 'sleep' | null
                    created_at?: string
                    archived_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    position?: number
                    link?: 'workout' | 'sleep' | null
                    created_at?: string
                    archived_at?: string | null
                }
            }
            habit_logs: {
                Row: {
                    habit_id: string
                    user_id: string
                    date: string
                    done: boolean
                    source: 'manual' | 'workout' | 'health'
                    updated_at: string
                }
                Insert: {
                    habit_id: string
                    user_id?: string
                    date: string
                    done: boolean
                    source?: 'manual' | 'workout' | 'health'
                    updated_at?: string
                }
                Update: {
                    habit_id?: string
                    user_id?: string
                    date?: string
                    done?: boolean
                    source?: 'manual' | 'workout' | 'health'
                    updated_at?: string
                }
            }
            checkins: {
                Row: {
                    user_id: string
                    date: string
                    mood: number | null
                    updated_at: string
                }
                Insert: {
                    user_id?: string
                    date: string
                    mood?: number | null
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    date?: string
                    mood?: number | null
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_blocked_with: { Args: { p_other: string }; Returns: boolean }
            bump_ai_usage: { Args: Record<string, never>; Returns: number }
            delete_my_account: { Args: Record<string, never>; Returns: undefined }
            get_patterns: { Args: { p_from: string; p_to: string }; Returns: { date: string; has_entry: boolean; mood: number | null; habit_answers: Json }[] }
        }
        Enums: {
            friend_status: 'pending' | 'accepted' | 'blocked'
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']
