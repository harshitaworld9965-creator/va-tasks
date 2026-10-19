import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useTasks } from './hooks/useTasks'
import { isOverdue, today } from './lib/dates'
import Auth from './components/Auth'
import DaysView from './components/DaysView'
import MonthsView from './components/MonthsView'
import UnscheduledView from './components/UnscheduledView'
import DoneView from './components/DoneView'
import InstallPrompt from './components/InstallPrompt'
import NotificationToggle from './components/NotificationToggle'
import TaskSheet from './components/TaskSheet'

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

  // The add/edit sheet. null = closed; { task } = editing; { defaultDate } = adding.
  const [sheet, setSheet] = useState(null)
  const openSheet = useCallback((opts) => setSheet(opts), [])
  const closeSheet = useCallback(() => setSheet(null), [])

  function saveFromSheet(fields) {
    if (sheet.task) store.updateTask(sheet.task.id, fields)
    else store.addTask(fields)
    setSheet(null)
  }
  function deleteFromSheet(task) {
    if (!confirm(`Delete "${task.title}"?`)) return
    store.deleteTask(task.id)
    setSheet(null)
  }
  // The + button adds for today, except on Later, where tasks have no date.
  const addHere = () => openSheet({ defaultDate: tab === 'unscheduled' ? null : today() })

  const views = { ...store, openSheet }

  return (
    <div className="min-h-full max-w-2xl mx-auto px-5 pb-32 sm:pb-10">
      <header className="flex items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-violet grid place-items-center text-white font-display font-extrabold text-sm">T</span>
          <span className="font-display font-extrabold tracking-tight text-lg">Tasks</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationToggle user={user} />
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-ink-3 hover:text-ink">Sign out</button>
        </div>
      </header>

      {/* Tabs: a quiet bar fixed to the bottom on phones, underlined tabs on desktop */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]
                      sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 sm:pb-0 sm:mb-7">
        <div className="max-w-2xl mx-auto flex sm:items-center sm:gap-6 sm:border-b sm:border-line">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-3.5 sm:py-3 text-sm transition-colors
                  ${active ? 'text-violet font-semibold' : 'text-ink-3 hover:text-ink-2'}`}>
                {t.label}
                {t.id === 'months' && overdue > 0 && (
                  <span className="text-[10px] font-semibold text-coral-ink bg-coral-soft rounded-full px-1.5 leading-4">{overdue}</span>
                )}
                {active && <span className="absolute top-0 sm:top-auto sm:-bottom-px left-1/4 right-1/4 sm:left-0 sm:right-0 h-0.5 bg-violet rounded-full" />}
              </button>
            )
          })}
          <div className="hidden sm:block flex-1" />
          <button onClick={addHere}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-violet hover:bg-violet-2 rounded-lg px-3.5 py-1.5 mb-1.5 transition-colors">
            <span className="text-base leading-none">+</span> New task
          </button>
        </div>
      </nav>

      {/* Floating add button (phones) */}
      <button onClick={addHere} aria-label="New task"
        className="sm:hidden fixed right-5 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 w-14 h-14 rounded-full bg-violet text-white text-3xl leading-none shadow-lg shadow-violet/30 active:scale-95 transition-transform">
        +
      </button>

      {store.error && (
        <div className="flex justify-between items-center text-sm bg-coral-soft text-coral-ink font-medium rounded-xl px-3 py-2 mb-4">
          <span>Couldn't save: {store.error}</span>
          <button onClick={store.clearError} className="font-semibold ml-3">Dismiss</button>
        </div>
      )}

      {store.loading ? <p className="text-ink-3 text-sm py-10 text-center">Loading…</p> : (
        <>
          {tab === 'days' && <DaysView {...views} />}
          {tab === 'months' && <MonthsView {...views} />}
          {tab === 'unscheduled' && <UnscheduledView {...views} />}
          {tab === 'done' && <DoneView {...views} />}
        </>
      )}

      {sheet && (
        <TaskSheet task={sheet.task} defaultDate={sheet.defaultDate}
          onSave={saveFromSheet} onDelete={deleteFromSheet} onClose={closeSheet} />
      )}
    </div>
  )
}