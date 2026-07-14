'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'

const faqs = [
  {
    q: 'What is Yield?',
    a: 'Yield is a kitchen utility that generates real recipes from ingredients you already have. Type what\'s in your fridge, and Yield builds a step-by-step recipe with timers, food safety warnings, and smart substitutions.',
  },
  {
    q: 'Is Yield free?',
    a: 'Yes. Yield is free to use with no credit card required. We don\'t run ads or sell your data.',
  },
  {
    q: 'How does recipe generation work?',
    a: 'Yield sends your ingredient list to an AI model that generates a recipe tailored to exactly what you have. It also factors in your saved pantry staples (oil, salt, spices) so you don\'t have to list those every time.',
  },
  {
    q: 'What are pantry staples?',
    a: 'Pantry staples are ingredients you always have on hand — olive oil, salt, pepper, garlic powder, etc. Save them once and Yield will automatically include them in every recipe without you re-entering them.',
  },
  {
    q: 'Does Yield handle food allergies?',
    a: 'Yes. Yield includes smart substitutions — if you\'re dairy-free, nut-free, or have other dietary restrictions, it will adapt recipes and suggest alternatives for ingredients you can\'t use.',
  },
  {
    q: 'How accurate are the recipes?',
    a: 'AI-generated recipes are suggestions, not guarantees. Quantities, cooking times, and techniques may need adjustment based on your specific ingredients, equipment, and altitude. Always taste as you go and use your own judgment.',
  },
  {
    q: 'Is the food safety information reliable?',
    a: 'Yield references USDA food safety guidelines and displays temperature warnings on every recipe that involves protein. However, it\'s your responsibility to ensure food is handled, stored, and cooked safely.',
  },
  {
    q: 'Do I need an account?',
    a: 'You can try the demo without an account. To save recipes, pantry staples, and build a recipe history, you\'ll need a free account.',
  },
  {
    q: 'Can I delete my data?',
    a: 'Yes. You can delete your account and all associated data at any time from the settings page. Data is permanently removed within 30 days.',
  },
  {
    q: 'Who built Yield?',
    a: 'Yield was developed by a single developer — Spencer Calimlim. It\'s a solo project built with love for home cooks everywhere.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-32 pb-20">
        <Reveal>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-miku transition-colors mb-8 no-underline">
            ← Back to Yield
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="fridge-list notepad-rip-bottom">
            <div className="fridge-list-texture" />
            <div className="fridge-list-shadow" />
            <div className="notepad-holes">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={i === 4 ? 'notepad-hole-ripped' : 'notepad-hole'} />
              ))}
            </div>

              <div className="px-6 sm:px-10 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                  Frequently Asked Questions
                </h1>
                <p className="text-slate-500 mb-6 sm:mb-8 text-[13px]">
                  Got a question?{' '}
                  <a href="mailto:chocwebster@gmail.com" className="text-miku hover:text-miku-hover font-bold text-base sm:text-lg" style={{ fontFamily: 'var(--font-hand), cursive', transform: 'rotate(-4deg)', display: 'inline-block' }}>
                    Email us
                  </a>
                </p>

              <div className="w-full h-px bg-slate-200/60 mb-4" />

              <div className="space-y-0">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-slate-200/40 last:border-b-0">
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full text-left py-4 flex items-center justify-between gap-4 group"
                    >
                      <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-miku transition-colors">
                        {faq.q}
                      </span>
                      <span
                        className={`text-slate-400 text-lg font-bold shrink-0 transition-transform duration-200 ${
                          open === i ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: open === i ? '200px' : '0px',
                      }}
                    >
                      <p className="text-[13px] text-slate-600 leading-relaxed pb-4">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <footer className="py-8 px-5 border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="text-sm font-semibold text-slate-700">Yield</span>
          </div>
          <span className="text-xs text-slate-400">© 2026 Yield. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
