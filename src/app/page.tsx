import GoogleSignInButton from '@/components/GoogleSignInButton'
import Dashboard from '@/components/Dashboard'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ auth_error?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

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

  // Not logged in -> Show Google Sign In with dark glassmorphic styling
  if (!user) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center text-slate-100 select-none">
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8 flex flex-col items-center overflow-hidden">
          {/* Subtle inner top glare */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF66]/30 to-transparent" />

          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              One Login
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            In the Black
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-xs">
            Simple cash-flow tracking.
          </p>

          {authError && (
            <div className="mt-4 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
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

  // Current month range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  // Fetch jobs for this month
  const { data: jobs } = await supabase
    .from('jobs')
    .select('price')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth)

  // Fetch expenses for this month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth)

  // Calculate initial sums
  let initialMoneyIn = 0
  if (jobs) {
    for (const job of jobs) {
      initialMoneyIn += Number(job.price)
    }
  }

  let initialMoneyOut = 0
  if (expenses) {
    for (const expense of expenses) {
      initialMoneyOut += Number(expense.amount)
    }
  }

  return (
    <Dashboard
      userId={user.id}
      initialMoneyIn={initialMoneyIn}
      initialMoneyOut={initialMoneyOut}
      monthName={months[now.getMonth()]}
      signOutAction={signOutAction}
    />
  )
}
