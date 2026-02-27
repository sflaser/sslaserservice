import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type CaseStudy = {
  id: string
  title: string
  description: string
  image_url: string | null
  client_name: string
  industry: string
  results: Record<string, unknown> | null
  featured: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export type Podcast = {
  id: string
  title: string
  description: string
  image_url: string | null
  audio_url: string
  duration: number | null
  episode_number: number | null
  guest_name: string | null
  published_at: string
  created_at: string
  updated_at: string
}
