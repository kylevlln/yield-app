'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Smartphone, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'

function useIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export default function GeneratePage() {
  const isMobile = useIsMobile()

  // Desktop: redirect to /demo
  useEffect(() => {
    if (!isMobile) {
      window.location.href = '/demo'
    }
  }, [isMobile])

  // Mobile: show download + auth prompt
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <Logo size={28} />
              <span className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-hand), cursive' }}>yield</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
              Yield works best on desktop
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              The full recipe generation experience is available on your computer. Download the app for the complete mobile experience.
            </p>
            <div className="space-y-3">
              <Link href="/download" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-teal-600 text-white font-semibold text-base hover:bg-teal-700 transition-all btn-press active:scale-95 no-underline">
                Download the App
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth" className="block w-full py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-base hover:bg-slate-200 transition-all btn-press active:scale-95 no-underline text-center">
                Sign Up Free
              </Link>
              <Link href="/" className="block w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-base hover:bg-slate-50 transition-all btn-press active:scale-95 no-underline text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Desktop: show loading while redirecting
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Redirecting to demo...</p>
      </div>
    </div>
  )
}
