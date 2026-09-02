import { useEffect, useState } from 'react'

const DISMISS_KEY = 'tasks_install_dismissed'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    // Android / desktop: capture the browser's install event and show our own UI.
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iPhone/iPad Safari never fires that event, so show the manual steps instead.
    if (isIOS()) { setIos(true); setShow(true) }

    const onInstalled = () => { setShow(false); localStorage.setItem(DISMISS_KEY, '1') }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed top-3 inset-x-3 z-50 sm:max-w-md sm:mx-auto">
      <div className="bg-violet text-white rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <span className="shrink-0 w-11 h-11 rounded-xl bg-white/15 grid place-items-center font-display font-extrabold text-xl">T</span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-extrabold text-lg leading-tight">Install Tasks</p>
          {ios ? (
            <p className="text-sm text-white/85 mt-0.5">
              Tap the Share icon <span aria-hidden>􀈂</span> below, then choose <b>Add to Home Screen</b>.
            </p>
          ) : (
            <p className="text-sm text-white/85 mt-0.5">Add it to your home screen for one-tap access.</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {!ios && (
              <button onClick={install} className="text-sm font-bold bg-white text-violet rounded-lg px-4 py-1.5 hover:bg-white/90 transition-colors">Install</button>
            )}
            <button onClick={dismiss} className="text-sm font-bold text-white/80 hover:text-white px-2 py-1.5">
              {ios ? 'Got it' : 'Not now'}
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-white/70 hover:text-white text-xl leading-none -mt-1 -mr-1 px-1">×</button>
      </div>
    </div>
  )
}
