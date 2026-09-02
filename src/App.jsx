import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useTasks } from './hooks/useTasks'
import { isOverdue } from './lib/dates'
import Auth from './components/Auth'
import DaysView from './components/DaysView'
import MonthsView from './components/MonthsView'
import UnscheduledView from './components/UnscheduledView'
import DoneView from './components/DoneView'
import InstallPrompt from './components/InstallPrompt'

const TABS = [
  { id: 'days', label: 'Days' },
  { id: 'months', label: 'Months' },
  { id: 'unscheduled', label: 'Later' },
  { id: 'done', label: 'Done' },
]

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <InstallPrompt />
  return (
    <>
      <InstallPrompt />
      {session ? <Shell user={session.user} /> : <Auth />}
    </>
  )
}

function Shell({ user }) {
  const [tab, setTab] = useState('days')
  const store = useTasks(user)
  const overdue = store.tasks.filter(isOverdue).length

  return (
    <div className="min-h-full max-w-2xl mx-auto px-5 pb-28 sm:pb-10">
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-violet grid place-items-center text-white font-display font-extrabold text-sm">T</span>
          <span className="font-display font-extrabold tracking-tight text-lg">Tasks</span>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-sm font-semibold text-ink-2 hover:text-ink">
          Sign out
        </button>
      </header>

      {/* Pill segmented tabs — fixed bottom on mobile, inline on desktop */}
      <nav className="fixed bottom-4 inset-x-4 z-10 sm:static sm:mb-8">
        <div className="max-w-2xl mx-auto flex gap-1 bg-card/95 backdrop-blur border border-line rounded-full p-1 shadow-lg sm:shadow-none">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-colors
                  ${active ? 'bg-violet text-white' : 'text-ink-2 hover:text-ink'}`}>
                {t.label}
                {t.id === 'months' && overdue > 0 && (
                  <span className={`text-[11px] font-bold rounded-full px-1.5 ${active ? 'bg-white/25 text-white' : 'bg-coral-soft text-coral-ink'}`}>{overdue}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {store.error && (
        <div className="flex justify-between items-center text-sm bg-coral-soft text-coral-ink font-semibold rounded-xl px-3 py-2 mb-4">
          <span>Couldn't save: {store.error}</span>
          <button onClick={store.clearError} className="font-bold ml-3">Dismiss</button>
        </div>
      )}

      {store.loading ? <p className="text-ink-3 font-medium text-sm py-10 text-center">Loading…</p> : (
        <>
          {tab === 'days' && <DaysView {...store} />}
          {tab === 'months' && <MonthsView {...store} />}
          {tab === 'unscheduled' && <UnscheduledView {...store} />}
          {tab === 'done' && <DoneView {...store} />}
        </>
      )}
    </div>
  )
}
