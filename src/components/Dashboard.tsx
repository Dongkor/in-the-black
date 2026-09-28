'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface DashboardProps {
  userId: string
  initialMoneyIn: number
  initialMoneyOut: number
  monthName: string
  signOutAction: () => Promise<void>
}

export default function Dashboard({
  userId,
  initialMoneyIn,
  initialMoneyOut,
  monthName,
  signOutAction,
}: DashboardProps) {
  // Screen numbers
  const [moneyIn, setMoneyIn] = useState(initialMoneyIn)
  const [moneyOut, setMoneyOut] = useState(initialMoneyOut)

  // Modal open states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [jobName, setJobName] = useState('')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')

  // Loading indicator
  const [isSaving, setIsSaving] = useState(false)

  // Calculations
  const profit = moneyIn - moneyOut
  const isPositive = profit >= 0

  // Authenticated Supabase Realtime Listener (Passes JWT so RLS allows broadcast)
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true

    async function setupRealtime() {
      // 1. Get current session token from cookies
      const { data: { session } } = await supabase.auth.getSession()

      // 2. Hand the token to the WebSocket before subscribing so auth.uid() is NOT null
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token)
      }

      if (!isMounted) return

      // 3. Create channel and listen for Postgres inserts
      channel = supabase
        .channel(`dashboard-sync-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'jobs' },
          (payload) => {
            console.log('REALTIME EVENT: New job received!', payload)
            if (payload.new && payload.new.user_id === userId) {
              setMoneyIn((prev) => prev + Number(payload.new.price))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'expenses' },
          (payload) => {
            console.log('REALTIME EVENT: New expense received!', payload)
            if (payload.new && payload.new.user_id === userId) {
              setMoneyOut((prev) => prev + Number(payload.new.amount))
            }
          }
        )
        .subscribe((status, err) => {
          console.log('REALTIME STATUS:', status, err)
        })
    }

    setupRealtime()

    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  // Save Job Handler
  async function handleSaveJob(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || !jobName || !price) return

    setIsSaving(true)
    const supabase = createClient()
    const jobPrice = Number(price)

    const { error } = await supabase.from('jobs').insert({
      customer_name: customerName,
      job_name: jobName,
      price: jobPrice,
      user_id: userId,
    })

    setIsSaving(false)

    if (error) {
      alert('Error saving job: ' + error.message)
      return
    }

    // Reset and close (Realtime listener updates moneyIn on both Tab 1 and Tab 2!)
    setCustomerName('')
    setJobName('')
    setPrice('')
    setIsJobModalOpen(false)
  }

  // Save Expense Handler
  async function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return

    setIsSaving(true)
    const supabase = createClient()
    const expenseAmount = Number(amount)

    const { error } = await supabase.from('expenses').insert({
      amount: expenseAmount,
      user_id: userId,
    })

    setIsSaving(false)

    if (error) {
      alert('Error saving expense: ' + error.message)
      return
    }

    // Reset and close (Realtime listener updates moneyOut on both Tab 1 and Tab 2!)
    setAmount('')
    setIsExpenseModalOpen(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center w-full">
      <div className="flex min-h-screen flex-col justify-between p-6 max-w-md w-full">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-sm font-semibold tracking-tight">In the Black</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </header>

        {/* Main Numbers */}
        <div className="my-auto py-8 text-center space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Month of {monthName}
            </p>
            <div className="mt-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                Profit
              </span>
              <p
                className={`text-6xl font-black tracking-tight ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive
                  ? `$${profit.toLocaleString()}`
                  : `-$${Math.abs(profit).toLocaleString()}`}
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
            onClick={() => setIsJobModalOpen(true)}
            className="w-full rounded-2xl bg-zinc-900 dark:bg-zinc-100 py-4 text-lg font-bold text-white dark:text-zinc-900 shadow-md active:scale-95 transition cursor-pointer"
          >
            Job done
          </button>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition cursor-pointer"
          >
            + Expense
          </button>
        </div>
      </div>

      {/* "Job Done" Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Job Done</h2>
            <p className="text-xs text-zinc-500 mt-1">Enter details to add to Money In</p>

            <form onSubmit={handleSaveJob} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mowing the lawn"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Price ($ AUD)
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 py-3.5 text-sm font-bold text-white dark:text-zinc-900 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  disabled={isSaving}
                  className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* "+ Expense" Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Add Expense</h2>
            <p className="text-xs text-zinc-500 mt-1">Enter amount to add to Money Out</p>

            <form onSubmit={handleSaveExpense} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Amount ($ AUD)
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 py-3.5 text-sm font-bold text-white dark:text-zinc-900 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSaving}
                  className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
