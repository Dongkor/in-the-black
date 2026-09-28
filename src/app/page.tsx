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

  // Not logged in -> Show Google Sign In
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
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
