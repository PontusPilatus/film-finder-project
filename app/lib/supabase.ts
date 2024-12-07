import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfbsbufnmxfkyjbvuuwt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYnNidWZubXhma3lqYnZ1dXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4ODc0MTQsImV4cCI6MjA0NjQ2MzQxNH0.6n6hU4eQVtYndCOWqLM472OXh7hIo34whi7h3ayh-tE'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) 