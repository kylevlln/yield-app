'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

const steps = [
  { num: '01', title: 'Drop your ingredients', desc: 'Chicken, garlic, pasta — whatever\'s in your fridge right now. Type it, snap a photo, or just say it out loud.' },
  { num: '02', title: 'We build a recipe', desc: 'Not a link to someone\'s blog. An actual recipe, written for exactly what you have.' },
  { num: '03', title: 'Cook with confidence', desc: 'Step-by-step. Tap timers. Food safety warnings when it matters.' },
]

/* ── Feature icons (custom, cooking-themed line art) ── */
function IconSubstitutions({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 17H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 14l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconPantry({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 8h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5 8h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 5h4v3h-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8v11" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
    </svg>
  )
}
function IconSafety({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconTimer({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 13V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconHistory({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconVoice({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const features = [
  { label: 'Smart substitutions', desc: 'Dairy-free? Nut-free? Yield adapts on the fly.', Icon: IconSubstitutions },
  { label: 'Pantry staples', desc: 'Save once. Never re-enter salt, oil, or pepper again.', Icon: IconPantry },
  { label: 'USDA safety banners', desc: 'Temperature warnings on every protein, every time.', Icon: IconSafety },
  { label: 'One-tap timers', desc: 'Built into each step. Nothing to set up.', Icon: IconTimer },
  { label: 'Recipe history', desc: 'Every meal you\'ve cooked — searchable, revisitable.', Icon: IconHistory },
  { label: 'Voice input', desc: 'Say what you have. Yield listens.', Icon: IconVoice },
]

/* ── Cooking-themed hand-drawn doodles ── */
function DoodleFork({ className }: { className?: string }) {
  return (
    <svg className={className} width="30" height="30" viewBox="0 0 32 32" fill="none">
      <path d="M8 4v7a3 3 0 0 0 6 0V4M11 4v24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4c-2 0-3 2-3 5s1 4 3 4v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function DoodlePot({ className }: { className?: string }) {
  return (
    <svg className={className} width="34" height="28" viewBox="0 0 36 30" fill="none">
      <path d="M6 11h24v9a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 11h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 8c0-2 1.5-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 13h2M32 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function DoodleWhisk({ className }: { className?: string }) {
  return (
    <svg className={className} width="26" height="30" viewBox="0 0 26 30" fill="none">
      <path d="M13 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12c0 6 1 10 4 14M17 12c0 6-1 10-4 14M13 12v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function DoodleSteam({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="30" viewBox="0 0 22 30" fill="none">
      <path d="M7 4c3 4 0 7 3 11M15 4c3 4 0 7 3 11M11 8c3 4 0 7 3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}
function DoodleFlame({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="30" viewBox="0 0 24 30" fill="none">
      <path d="M12 3c2 5-4 6-4 11a4 4 0 0 0 8 0c0-2-1-3-1-3 2 1 3 3 3 5a7 7 0 1 1-14 0C4 9 9 7 12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
function DoodleChefHat({ className }: { className?: string }) {
  return (
    <svg className={className} width="30" height="28" viewBox="0 0 30 28" fill="none">
      <path d="M9 13a4 4 0 0 1-1-7.5A4.5 4.5 0 0 1 17 4a4 4 0 0 1 5 4 3.5 3.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 14h16v3a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
function DoodleLeaf({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 20 C4 20, 6 12, 12 8 C18 4, 22 4, 22 4 C22 4, 22 8, 18 14 C14 20, 4 20, 4 20 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M4 20 C8 16, 12 12, 22 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  )
}

/* ── iOS Phone Mockup ── */
function PhoneMockup({ screen, rotation, className }: { screen: 'input' | 'recipe'; rotation: string; className?: string }) {
  return (
    <div className={`relative select-none ${className || ''}`} style={{ transform: rotation, WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div className="w-[260px] bg-black rounded-[3rem] p-[10px] shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
        <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden relative">

          {/* ── Status Bar + Dynamic Island ── */}
          <div className="relative px-5 pt-3 pb-1" style={{ minHeight: '44px' }}>
            {/* Time — far left */}
            <span
              className="absolute left-5 top-3 text-black"
              style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif', fontWeight: 600, fontSize: '12px', letterSpacing: '0.01em' }}
            >
              9:41
            </span>

            {/* Dynamic Island — centered pill */}
            <div className="mx-auto mt-[1px]" style={{ width: '84px', height: '22px', background: 'black', borderRadius: '20px' }} />

            {/* Signal + Battery — far right (no WiFi, no %) */}
            <div className="absolute right-5 top-3 flex items-center gap-[5px]">
              {/* Cellular bars */}
              <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
                <rect x="0" y="6" width="3" height="5" rx="0.7" fill="black"/>
                <rect x="4" y="4" width="3" height="7" rx="0.7" fill="black"/>
                <rect x="8" y="2" width="3" height="9" rx="0.7" fill="black"/>
                <rect x="12" y="0" width="3" height="11" rx="0.7" fill="black"/>
              </svg>
              {/* Battery icon only — no percentage */}
              <svg width="22" height="11" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="black" strokeOpacity="0.35"/>
                <rect x="2" y="2" width="17" height="8" rx="1.5" fill="black"/>
                <path d="M23 4v4a2 2 0 0 0 0-4z" fill="black" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* ── App Content ── */}
          {screen === 'input' ? (
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2.5 mb-1">
                <Logo size={28} />
                <span className="text-[15px] font-bold text-black">New Recipe</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">What&apos;s in your fridge?</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 flex items-center gap-2.5 mb-3">
                <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <span className="text-[12px] text-slate-300">Type an ingredient...</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[10px] font-semibold text-teal-700 flex items-center gap-1">🍗 Chicken <span className="text-teal-400">×</span></span>
                <span className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[10px] font-semibold text-teal-700 flex items-center gap-1">🧄 Garlic <span className="text-teal-400">×</span></span>
                <span className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[10px] font-semibold text-teal-700 flex items-center gap-1">🫒 Olive oil <span className="text-teal-400">×</span></span>
                <span className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[10px] font-semibold text-teal-700 flex items-center gap-1">🍝 Pasta <span className="text-teal-400">×</span></span>
              </div>
              <div className="bg-teal-500 text-white text-center text-[12px] font-bold py-3 rounded-xl shadow-sm">
                Generate Recipe →
              </div>
            </div>
          ) : (
            <>
              <div className="bg-teal-500 text-white px-4 pt-2 pb-5">
                <div className="flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  <span className="text-[10px] font-semibold opacity-80">Back</span>
                </div>
                <p className="text-[11px] font-semibold opacity-80 mb-0.5">Garlic Butter</p>
                <p className="text-xl font-extrabold leading-tight">Shrimp Pasta</p>
                <div className="flex gap-2 mt-2.5">
                  <span className="text-[9px] font-bold bg-white/20 px-2.5 py-1 rounded-full">⏱ 14 min</span>
                  <span className="text-[9px] font-bold bg-white/20 px-2.5 py-1 rounded-full">📝 3 steps</span>
                  <span className="text-[9px] font-bold bg-white/20 px-2.5 py-1 rounded-full">🔥 420 cal</span>
                </div>
              </div>
              <div className="px-4 pt-3 pb-14 space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <div className="flex-1">
                    <p className="text-[10.5px] font-bold text-black leading-snug">Cook pasta in salted boiling water until al dente.</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Reserve 1 cup pasta water before draining.</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[8px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">⏱ 8 min</span>
                      <span className="text-[8px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold">🔪 boil</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <div className="flex-1">
                    <p className="text-[10.5px] font-bold text-black leading-snug">Melt butter in a skillet. Cook shrimp 2 min per side.</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[8px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">⏱ 4 min</span>
                      <span className="text-[8px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold">🔪 sauté</span>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🌡</span>
                    <div>
                      <p className="text-[9.5px] font-bold text-orange-800">USDA Safety</p>
                      <p className="text-[8.5px] text-orange-600">Cook shrimp to internal temp of 145°F</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-black rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-white overflow-x-hidden" id="main-content">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 w-full z-50 p-3">
        <div className="flex items-center justify-between max-w-[1180px] mx-auto px-6 py-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>
          {/* Left decoration */}
          <div className="hidden sm:flex items-center gap-2 text-miku/30">
            <DoodleChefHat className="float-doodle-1 w-5 h-5" />
            <DoodleLeaf className="float-doodle-2 opacity-60 w-4 h-4" />
          </div>

          {/* Center buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth" className="nav-link text-sm font-semibold text-slate-600 hover:text-miku transition-colors no-underline px-3 py-2 rounded-xl hover:bg-slate-50">
              Sign In
            </Link>
            <Link href="/generate" className="no-underline px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all btn-press active:scale-95 shadow-sm">
              {user ? 'Open Yield' : 'Get Started'}
            </Link>
          </div>

          {/* Right decoration */}
          <div className="hidden sm:flex items-center gap-2 text-miku/30">
            <DoodleFlame className="float-doodle-3 opacity-60 w-4 h-4" />
            <DoodlePot className="float-doodle-4 w-5 h-5" />
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[1040px] mx-auto text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1] mb-6 max-w-[13.5em] mx-auto" style={{ textWrap: 'balance' }}>
              Cook what you{' '}
              <span className="text-miku">already have</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-base sm:text-xl text-slate-500 max-w-[30em] mx-auto leading-relaxed mt-6">
              Open your fridge, type what you see, and Yield turns it into a real recipe. Step by step, timer included, with food safety warnings when it matters.
            </p>
          </Reveal>
        </div>

        {/* ── Phones with Animated Doodles ── */}
        <Reveal delay={0.3}>
          <div className="relative max-w-[1040px] mx-auto mt-10 sm:mt-14">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              {['Works without internet', 'AI-powered recipes', 'Nothing leaves your phone'].map((text) => (
                <span key={text} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm font-semibold text-slate-700">
                  <span className="w-2 h-2 bg-miku rounded-full" />
                  {text}
                </span>
              ))}
            </div>

            {/* Phone area with scattered floating doodles */}
            <div className="relative flex items-center justify-center">
              {/* ── Scattered cooking doodles: desktop (lg+) ── */}
              <div className="hidden lg:block absolute inset-0 pointer-events-none" aria-hidden>
                <div className="float-doodle-1 absolute text-miku/60" style={{ top: '2%', left: '3%' }}><DoodleChefHat /></div>
                <div className="float-doodle-2 absolute text-miku/50 -rotate-8" style={{ top: '26%', left: '0%' }}><DoodleFork /></div>
                <div className="float-doodle-3 absolute text-miku/65 rotate-[20deg]" style={{ top: '55%', left: '4%' }}><DoodleFlame /></div>
                <div className="float-doodle-4 absolute text-miku/55 -rotate-12" style={{ top: '80%', left: '11%' }}><DoodleLeaf /></div>
                <div className="float-doodle-5 absolute text-miku/50 rotate-12" style={{ top: '12%', left: '16%' }}><DoodleWhisk /></div>
                <div className="float-doodle-3 absolute text-miku/60 -rotate-6" style={{ top: '4%', right: '6%' }}><DoodleSteam /></div>
                <div className="float-doodle-1 absolute text-miku/60" style={{ top: '34%', right: '1%' }}><DoodlePot /></div>
                <div className="float-doodle-4 absolute text-miku/50 rotate-12" style={{ top: '62%', right: '5%' }}><DoodleFork /></div>
                <div className="float-doodle-2 absolute text-miku/55 -rotate-12" style={{ top: '85%', right: '13%' }}><DoodleChefHat /></div>
                <div className="float-doodle-5 absolute text-miku/60 rotate-[200deg]" style={{ top: '48%', right: '2%' }}><DoodleFlame /></div>
                <div className="float-doodle-3 absolute text-miku/50 -rotate-12" style={{ top: '18%', right: '16%' }}><DoodleWhisk /></div>
                <div className="float-doodle-1 absolute text-miku/55 rotate-[18deg]" style={{ top: '74%', right: '1%' }}><DoodleLeaf /></div>
              </div>

              {/* ── Scattered cooking doodles: tablet (sm–lg) ── */}
              <div className="hidden sm:block lg:hidden absolute inset-0 pointer-events-none" aria-hidden>
                <div className="float-doodle-1 absolute text-miku/45 -rotate-10" style={{ top: '7%', left: '1%' }}><DoodleChefHat /></div>
                <div className="float-doodle-3 absolute text-miku/50 rotate-[22deg]" style={{ top: '66%', left: '2%' }}><DoodleFlame /></div>
                <div className="float-doodle-2 absolute text-miku/45 rotate-10" style={{ top: '9%', right: '3%' }}><DoodleSteam /></div>
                <div className="float-doodle-4 absolute text-miku/50 -rotate-8" style={{ top: '70%', right: '1%' }}><DoodleLeaf /></div>
                <div className="float-doodle-5 absolute text-miku/40" style={{ top: '38%', right: '6%' }}><DoodlePot /></div>
              </div>

              {/* ── Phones ── */}
              <div className="flex items-center justify-center gap-4 sm:gap-10">
                <div className="hidden sm:block">
                  <PhoneMockup screen="input" rotation="rotate(-3deg)" />
                </div>

                {/* Mobile single phone */}
                <div className="block sm:hidden select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
                  <div className="w-[240px] bg-black rounded-[2.5rem] p-[8px] shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
                    <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                      <div className="relative px-5 pt-3 pb-1" style={{ minHeight: '38px' }}>
                        <span className="absolute left-5 top-2.5 text-black" style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif', fontWeight: 600, fontSize: '11px' }}>9:41</span>
                        <div className="mx-auto mt-[1px]" style={{ width: '72px', height: '19px', background: 'black', borderRadius: '14px' }} />
                        <div className="absolute right-5 top-2.5 flex items-center gap-[3px]">
                          <svg width="14" height="9" viewBox="0 0 17 11" fill="none"><rect x="0" y="6" width="3" height="5" rx="0.7" fill="black"/><rect x="4" y="4" width="3" height="7" rx="0.7" fill="black"/><rect x="8" y="2" width="3" height="9" rx="0.7" fill="black"/></svg>
                          <svg width="18" height="9" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="black" strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill="black"/></svg>
                        </div>
                      </div>
                      <div className="px-3 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Logo size={24} />
                          <span className="text-sm font-bold text-black">New Recipe</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-3">What&apos;s in your fridge?</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-2.5">
                          <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                          <span className="text-[10px] text-slate-300">Type an ingredient...</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded-full text-[8px] font-semibold text-teal-700">🍗 Chicken</span>
                          <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded-full text-[8px] font-semibold text-teal-700">🧄 Garlic</span>
                          <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded-full text-[8px] font-semibold text-teal-700">🫒 Oil</span>
                        </div>
                        <div className="bg-teal-500 text-white text-center text-[10px] font-bold py-2.5 rounded-xl">Generate Recipe →</div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <PhoneMockup screen="recipe" rotation="rotate(3deg)" className="mt-[30px]" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-[1040px] mx-auto">
          <Reveal>
            <div className="text-center mb-14 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
                How it works
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="group h-full p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col btn-lift">
                  <div className="w-11 h-11 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-sm font-bold text-teal-600 mb-5 shrink-0 group-hover:bg-miku group-hover:text-white group-hover:border-miku transition-all duration-300" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-[1040px] mx-auto">
          <Reveal>
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
                Everything you need.{' '}
                <span className="text-miku" style={{ fontFamily: 'var(--font-hand), cursive' }}>Nothing you don&apos;t.</span>
              </h2>
              <p className="text-base text-slate-500 max-w-lg mx-auto">
                Yield strips away the bloat and gives you exactly what you need to cook a great meal.
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group h-full p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-miku/10 flex items-center justify-center mb-4 text-miku-hover group-hover:bg-miku group-hover:text-white transition-colors duration-300">
                    <f.Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5 text-lg">{f.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-[1040px] mx-auto">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-miku/10 border border-miku/20 rounded-full text-sm font-semibold text-miku-hover mb-6">
                <span className="w-2 h-2 bg-miku rounded-full animate-pulse" />
                Built by a home cook, for home cooks
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto mb-6">
                Stop staring at the fridge.{' '}
                <span className="text-miku" style={{ fontFamily: 'var(--font-hand), cursive' }}>Start cooking.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
                Yield was built because every recipe app assumes you&apos;ll go to the store. We don&apos;t. We start with what you already have.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/generate">
                  <Button size="lg" className="bg-miku hover:bg-miku-hover text-white text-lg px-10 py-4 rounded-2xl shadow-lg shadow-miku/20 btn-lift active:scale-95 transition-all">
                    Try Yield Free →
                  </Button>
                </Link>
                <Link href="/faq" className="text-sm font-semibold text-slate-500 hover:text-miku transition-colors no-underline link-underline">
                  Read the FAQ →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6">
        <div className="max-w-[960px] mx-auto">
          <Reveal>
            <div className="rounded-[32px] sm:rounded-[40px] px-8 sm:px-20 py-20 sm:py-28 text-center" style={{ background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6 sm:mb-8 max-w-2xl mx-auto" style={{ textWrap: 'balance' }}>
                Your fridge has the answer.{' '}
                <span className="text-miku" style={{ fontFamily: 'var(--font-hand), cursive' }}>Yield shows you how.</span>
              </h2>
              <Link href="/generate">
                <Button size="lg" className="bg-miku hover:bg-miku-hover text-white text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 rounded-2xl shadow-lg shadow-miku/20 btn-lift active:scale-95 transition-all">
                  {user ? 'Start Cooking →' : 'Try Yield Free →'}
                </Button>
              </Link>
              <p className="text-sm sm:text-base text-slate-400 mt-6 sm:mt-8">No credit card required · Cook up to 3 recipes free</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-[1040px] mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/terms" className="link-underline hover:text-slate-700 transition-colors no-underline">Terms</Link>
            <Link href="/privacy" className="link-underline hover:text-slate-700 transition-colors no-underline">Privacy</Link>
            <Link href="/faq" className="link-underline hover:text-slate-700 transition-colors no-underline">FAQ</Link>
            <a href="mailto:chocwebster@gmail.com" className="link-underline hover:text-slate-700 transition-colors no-underline">Contact</a>
          </div>
          <span className="text-xs text-slate-400">© 2026 Yield. All rights reserved.</span>
        </div>
      </footer>
    </main>
  )
}
