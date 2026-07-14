'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'

const steps = [
  {
    platform: 'iOS',
    icon: (
      <svg width="26" height="26" viewBox="0 0 384 512" fill="#fff" aria-hidden>
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
      </svg>
    ),
    store: 'App Store',
    url: '#',
  },
  {
    platform: 'Android',
    icon: (
      <svg width="26" height="26" viewBox="0 0 512 512" aria-hidden>
        <path fill="#00E0FF" d="M48.9 30.1c-9.7 6.1-16.9 15.5-19.6 26.4L4 209.7c-4.2 17.1 5.9 34.6 22.4 38l227 50.3 50.3-227c3.4-16.5-6.7-34-23.2-40.2L48.9 30.1z"/>
        <path fill="#00E779" d="M474.6 84.5 290.9 268.2 243 41.4c-3.4-16.5 6.7-34 23.2-40.2l187.7-47.4c13-3.3 26.6 3.7 30.7 16.6 1.4 4.9 1 10.1-.4 14.9z"/>
        <path fill="#FFD600" d="M348.6 286.2 121.4 231.5 178.3 458.7c3.4 16.5 22.3 26.3 39.1 21.5L490 252.2c13-3.3 20.9-16.8 17.3-29.9-1.4-4.9-4.4-9.2-8.5-12.1z"/>
        <path fill="#FF3B30" d="M39 297.6c-14.8 3.6-24.1 18.4-21.1 33.4L108 505.5c4.2 17.1 22.9 26.7 39.7 21.7L263.4 441 39 297.6z"/>
      </svg>
    ),
    store: 'Google Play',
    url: '#',
  },
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 p-3">
        <div className="flex items-center justify-between max-w-[1180px] mx-auto px-4 sm:px-6 py-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 no-underline">
            <Logo size="xs" />
            <span className="text-base sm:text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-hand), cursive' }}>yield</span>
          </Link>
          <Link href="/demo" className="no-underline px-4 py-2 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-all btn-press active:scale-95">
            Try Web Demo
          </Link>
        </div>
      </nav>

      <main className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <Reveal>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 sm:w-10 sm:h-10">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Download Yield
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-sm sm:text-base text-slate-500 mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto">
              Get the full Yield experience on your phone. Scan ingredients with your camera, cook with step-by-step guidance, and never waste food again.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {steps.map((step) => (
                <a
                  key={step.platform}
                  href={step.url}
                  className="flex items-center gap-3 sm:gap-3.5 px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all btn-lift active:scale-95 no-underline min-w-[220px] sm:min-w-[230px]"
                >
                  <span className="shrink-0">{step.icon}</span>
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] text-slate-400 mb-0.5">
                      {step.platform === 'iOS' ? 'Download on the' : 'GET IT ON'}
                    </span>
                    <span className="block text-base font-semibold">{step.store}</span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-400 mb-4">Want to try it first?</p>
              <Link href="/demo" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all btn-press active:scale-95 no-underline">
                Try the Web Demo →
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-[1040px] mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'var(--font-hand), cursive' }}>yield</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/terms" className="link-underline hover:text-slate-700 transition-colors no-underline">Terms</Link>
            <Link href="/privacy" className="link-underline hover:text-slate-700 transition-colors no-underline">Privacy</Link>
            <Link href="/faq" className="link-underline hover:text-slate-700 transition-colors no-underline">FAQ</Link>
            <a href="mailto:chocwebster@gmail.com" className="link-underline hover:text-slate-700 transition-colors no-underline">Contact</a>
          </div>
          <span className="text-xs text-slate-400">© 2026 Yield. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
