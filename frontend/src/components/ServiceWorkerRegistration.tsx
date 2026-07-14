'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available — prompt via a styled toast (not a native confirm())
                toast.custom((t) => (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-lg"
                    style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif' }}
                  >
                    <span className="text-sm font-medium text-slate-700">A new version of Yield is available.</span>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id)
                        window.location.reload()
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Reload
                    </button>
                  </div>
                ), { duration: 10000 })
              }
            })
          })
        })
        .catch(() => {
          // Registration failure is non-fatal; the app still works without the SW.
        })
    }
  }, [])

  return null
}