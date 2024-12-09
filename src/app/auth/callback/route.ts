import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    // Handle both code from query params and hash fragment
    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to login page after verification
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    // Redirect to login page with error
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
  }
} 