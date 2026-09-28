'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Error signing in with Google:', error.message)
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error during Google sign in:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-6 py-4 text-base font-semibold text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_0_8px_rgba(0,255,102,0.15)] backdrop-blur-xl transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
    >
      <img src="/google.svg" className="h-5 w-5" alt="Google logo" />
      <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  )
}
