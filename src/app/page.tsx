import GoogleSignInButton from '@/components/GoogleSignInButton'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ auth_error?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const authError = params.auth_error

  async function signOutAction() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  // Phase 2: If user is authenticated, display session verification placeholder
  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Session Verified
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Phase 2: Google OAuth is working.
          </p>

          <div className="mt-6 rounded-lg bg-zinc-50 p-3.5 text-left text-xs dark:bg-zinc-800/60">
            <div className="text-zinc-500">Logged in as:</div>
            <div className="font-medium text-zinc-900 break-all dark:text-zinc-100">
              {user.email}
            </div>
          </div>

          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    )
  }

  // Phase 2: If user is not authenticated, show Google login
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          In the Black
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Radically simple finances for trades.
        </p>

        {authError && (
          <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            Authentication failed. Please try again.
          </div>
        )}

        <div className="mt-8 w-full flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  )
}
