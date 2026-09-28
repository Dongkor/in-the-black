'use client'

import { useState } from 'react'
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

  // Direct Save Job Handler
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

    setMoneyIn((prev) => prev + jobPrice)
    setCustomerName('')
    setJobName('')
    setPrice('')
    setIsJobModalOpen(false)
  }

  // Direct Save Expense Handler
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

    setMoneyOut((prev) => prev + expenseAmount)
    setAmount('')
    setIsExpenseModalOpen(false)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between w-full bg-[#080c14] text-slate-100 overflow-x-hidden select-none">
      {/* 100% FIXED, STATIC background gradient — zero shifting, zero moving bubbles */}
      <div
        className="fixed inset-0 pointer-events-none "
        style={{
          background: `
            radial-gradient(circle 420px at 90% 0%, rgba(0, 255, 102, 0.2), transparent 70%),
            radial-gradient(circle 420px at 40% 50%, rgba(0, 255, 102, 0.1), transparent 70%),
            radial-gradient(circle 380px at 10% 100%, rgba(0, 255, 102, 0.15), transparent 70%),
            #080c14
          `,
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-5 max-w-md w-full">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              In the Black
            </span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </header>

        {/* Hero Section */}
        <div className="my-auto py-6 space-y-4">
          {/* Main Profit Glass Card */}
          <div className="relative rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 text-center overflow-hidden">
            {/* Subtle inner top glare */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Month Badge */}
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-zinc-400">
                <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {monthName}
              </span>
            </div>

            {/* Big Hero Profit Number */}
            <div className="py-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest block">
                Net Profit
              </span>
              <p
                className={`text-6xl sm:text-7xl font-black tracking-tight tabular-nums mt-1 ${
                  isPositive
                    ? 'text-[#00FF66] drop-shadow-[0_0_28px_rgba(0,255,102,0.45)]'
                    : 'text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.35)]'
                }`}
              >
                {isPositive
                  ? `$${profit.toLocaleString()}`
                  : `-$${Math.abs(profit).toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Money In & Money Out Glass Pods */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Money In */}
            <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-4 text-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF66]/20 to-transparent" />
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#00FF66]/15 text-[#00FF66] text-[10px] font-bold">
                  ↑
                </span>
                Money In
              </div>
              <p className="text-2xl font-bold text-white tracking-tight mt-1.5 tabular-nums">
                ${moneyIn.toLocaleString()}
              </p>
            </div>

            {/* Money Out */}
            <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-4 text-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/20 to-transparent" />
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold">
                  ↓
                </span>
                Money Out
              </div>
              <p className="text-2xl font-bold text-white tracking-tight mt-1.5 tabular-nums">
                ${moneyOut.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Area (Thumb Zone) */}
        <div className="space-y-3 pb-4">
          <button
            type="button"
            onClick={() => setIsJobModalOpen(true)}
            className="w-full rounded-2xl bg-[#00FF66] hover:bg-[#00e65c] py-4 text-lg font-black text-black shadow-[0_0_32px_rgba(0,255,102,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Job done
          </button>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] py-3 text-sm font-semibold text-zinc-300 hover:text-white backdrop-blur-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
            </svg>
            Expense
          </button>
        </div>
      </div>

      {/* "Job Done" Bottom Sheet */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#080c14] backdrop-blur-2xl border-t sm:border border-white/10 p-6 shadow-2xl">
            {/* Mobile sheet drag handle indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Job Done</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Log finished work to Money In</p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Job Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car detailing"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 transition font-medium"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-[#00FF66] hover:bg-[#00e65c] py-3.5 text-sm font-bold text-black active:scale-[0.98] transition shadow-[0_0_24px_rgba(0,255,102,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  disabled={isSaving}
                  className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* "+ Expense" Bottom Sheet */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#080c14] backdrop-blur-2xl border-t sm:border border-white/10 p-6 shadow-2xl">
            {/* Mobile sheet drag handle indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Add Expense</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Quick single-field expense entry</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-300 focus:ring-0.2 transition font-medium"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-white/[0.1] hover:bg-white/[0.15] border border-white/10 py-3.5 text-sm font-bold text-white active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSaving}
                  className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
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
