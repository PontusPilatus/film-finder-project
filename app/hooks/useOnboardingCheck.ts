import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export function useOnboardingCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (!preferences || !preferences.onboarding_completed) {
          router.push('/onboarding')
        }
      }
    }

    checkOnboarding()
  }, [router])
} 