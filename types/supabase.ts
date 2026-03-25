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
                    entry_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    entry_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    entry_id?: string
                    content?: string
                    created_at?: string
                }
            }
            waitlist: {
                Row: {
                    id: string
                    name: string
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            friend_status: 'pending' | 'accepted' | 'blocked'
            mood_type: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']
