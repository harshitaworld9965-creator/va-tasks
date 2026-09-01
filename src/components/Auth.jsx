import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error } = await fn.call(supabase.auth, { email, password })
    if (error) setMsg(error.message)
    else if (mode === 'signup') setMsg('Account created. If email confirmation is on, check your inbox, then sign in.')
    setBusy(false)
  }

  return (
    <div className="min-h-full grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-9 h-9 rounded-xl bg-violet grid place-items-center text-white font-display font-extrabold">T</span>
          <span className="font-display text-2xl font-extrabold tracking-tight">Tasks</span>
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight mb-2">
          {mode === 'signin' ? 'Welcome back.' : 'Let\u2019s get set up.'}
        </h1>
        <p className="text-ink-2 font-medium mb-8">One shared list for the two of you. Nothing gets missed.</p>

        <form onSubmit={submit} className="bg-card border border-line rounded-2xl p-5">
          <label className="block text-sm font-bold mb-1">Email</label>
          <input className="w-full bg-canvas border border-line rounded-xl px-3 py-2.5 mb-4" type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

          <label className="block text-sm font-bold mb-1">Password</label>
          <input className="w-full bg-canvas border border-line rounded-xl px-3 py-2.5 mb-5" type="password" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />

          {msg && <p className="text-sm mb-4 text-amber-ink bg-amber-soft rounded-xl px-3 py-2">{msg}</p>}

          <button disabled={busy} className="w-full bg-violet hover:bg-violet-2 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-colors">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null) }}
          className="w-full text-sm font-semibold text-violet hover:text-violet-2 mt-5">
          {mode === 'signin' ? 'First time? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
