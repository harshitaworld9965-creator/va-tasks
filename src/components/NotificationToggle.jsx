import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY

// The push service wants the public key as raw bytes, not text.
function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

export default function NotificationToggle({ user }) {
  // loading | unsupported | ios-install | denied | off | on | busy
  const [status, setStatus] = useState('loading')

  // Save (or refresh) this phone's notification address in Supabase.
  async function save(sub) {
    const { endpoint, keys } = sub.toJSON()
    const { error } = await supabase
      .from('va_push_subscriptions')
      .upsert({ user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint' })
    if (error) throw error
  }

  // On load: figure out whether reminders are already on for this phone.
  useEffect(() => {
    (async () => {
      if (!VAPID) return setStatus('unsupported')
      if (isIOS() && !isInstalled()) return setStatus('ios-install')
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return setStatus('unsupported')
      }
      if (Notification.permission === 'denied') return setStatus('denied')

      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return setStatus('unsupported') // e.g. local `npm run dev`, where the service worker is off

      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await save(sub)
        setStatus('on')
      } else {
        setStatus('off')
      }
    })().catch(() => setStatus('unsupported'))
  }, [])

  async function enable() {
    setStatus('busy')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return setStatus(permission === 'denied' ? 'denied' : 'off')

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      })
      await save(sub)
      setStatus('on')
    } catch (e) {
      console.error(e)
      setStatus('off')
      alert(`Couldn't turn on reminders: ${e.message}`)
    }
  }

  async function disable() {
    if (!confirm('Turn off reminders on this device?')) return
    setStatus('busy')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('va_push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setStatus('off')
    } catch (e) {
      console.error(e)
      setStatus('on')
    }
  }

  if (status === 'loading' || status === 'unsupported') return null

  const base = 'text-xs font-semibold rounded-full px-3 py-1.5 transition-colors whitespace-nowrap'

  if (status === 'ios-install') return (
    <button className={`${base} text-ink-2 bg-line/60 hover:bg-line`}
      onClick={() => alert('To get reminders on iPhone: tap the Share button, choose "Add to Home Screen", then open Tasks from your home screen and tap this again.')}>
      🔔 Reminders
    </button>
  )

  if (status === 'denied') return (
    <button className={`${base} text-coral-ink bg-coral-soft`}
      onClick={() => alert('Notifications are blocked for this site. Allow them in your browser or phone settings for this site, then reload.')}>
      🔕 Blocked
    </button>
  )

  if (status === 'on') return (
    <button onClick={disable} className={`${base} text-white bg-mint hover:opacity-90`}>
      🔔 Reminders on
    </button>
  )

  return (
    <button onClick={enable} disabled={status === 'busy'}
      className={`${base} text-white bg-violet hover:bg-violet-2 disabled:opacity-60`}>
      {status === 'busy' ? '…' : '🔔 Turn on reminders'}
    </button>
  )
}