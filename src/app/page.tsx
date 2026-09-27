import GoogleSignInButton from '@/components/GoogleSignInButton'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ auth_error?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
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

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            In the Black
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Track your finances.
          </p>
          <div className="mt-8 w-full flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>
      </main>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  // Fetch jobs for this month
  const { data: jobs } = await supabase
    .from('jobs')
    .select('price')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth)

  // Fethch expenses for this month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth)

  // Calculate for profit/loss
  let moneyIn = 0
  if (jobs) {
    for (const job of jobs) {
      moneyIn += Number(job.price)
    }
  }

  let moneyOut = 0
  if (expenses) {
    for (const expense of expenses) {
      moneyOut += Number(expense.amount)
    }
  }

  const profit = moneyIn - moneyOut
  const isPositive = profit >= 0

  return (
        <main className='flex min-h-screen flex-col items-center  w-full'>
        <div className="flex min-h-screen flex-col justify-between p-6 max-w-md w-full">
          <header className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm font-semibold tracking-tight">In the Black</span>
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer">
                Sign out
              </button>
            </form>
          </header>

          <div className="my-auto py-8 text-center space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Month of {months[now.getMonth()]}
              </p>
              <div className="mt-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                  Profit
                </span>
                <p className={`text-6xl font-black tracking-tight ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isPositive ? `$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-4 text-center">
                <span className="text-xs text-zinc-400 font-medium block">Money In</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  ${moneyIn.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-4 text-center">
                <span className="text-xs text-zinc-400 font-medium block">Money Out</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  ${moneyOut.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pb-6">
            <button
              type="button"
              className="w-full rounded-2xl bg-zinc-900 dark:bg-zinc-100 py-4 text-lg font-bold text-white dark:text-
  zinc-900 shadow-md active:scale-95 transition cursor-pointer"
            >
              Job done
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 text-sm font-medium
  text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition cursor-pointer"
            >
              + Expense
            </button>
          </div>
          </div>
        </main>
      )
}
