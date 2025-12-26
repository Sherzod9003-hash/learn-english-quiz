import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucigkrocoxeguubthnsc.supabase.co'
const supabaseAnonKey = 'sb_publishable_4-rgKdwcVzJmh3zVaUw-yQ_rtyhdx_P'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Word = {
  id: number
  en: string
  uz: string
  category: string | null
  created_at: string
}