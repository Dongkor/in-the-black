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
      className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-base font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
    >
      <img src="/google.svg" className="h-5 w-5"/>
      <span>{loading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
    </button>
  )
}
