import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(user) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('va_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('reminder_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setTasks(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Keep both users in sync without refreshing.
    const channel = supabase
      .channel('va_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'va_tasks' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  async function addTask(fields) {
    const { error } = await supabase.from('va_tasks').insert({ ...fields, created_by: user.id })
    if (error) setError(error.message)
    else load()
  }

  async function updateTask(id, fields) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...fields } : t)))
    const { error } = await supabase.from('va_tasks').update(fields).eq('id', id)
    if (error) { setError(error.message); load() }
  }

  async function deleteTask(id) {
    setTasks((ts) => ts.filter((t) => t.id !== id))
    const { error } = await supabase.from('va_tasks').delete().eq('id', id)
    if (error) { setError(error.message); load() }
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask, clearError: () => setError(null) }
}
