'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'

const sections = [
  {
    title: 'What Yield Collects',
    content: 'Yield is designed to work with minimal data. When you use the app, we store your pantry staples, saved recipes, and dietary preferences. That\'s it. We don\'t track your location, browsing habits, or anything unrelated to cooking.',
  },
  {
    title: 'What Stays on Your Device',
    content: 'Your ingredient lists, recipe history, and voice inputs are processed on your device whenever possible. We don\'t upload your grocery list to sell to advertisers.',
  },
  {
    title: 'What Yield Doesn\'t Do',
    content: 'Yield doesn\'t run analytics or tracking, and doesn\'t collect or share your data with anyone, including third parties. Yield contains no advertising and no third-party SDKs that collect data from this app.',
  },
  {
    title: 'Recipe Generation',
    content: 'When you generate a recipe, your ingredient list is sent to our AI provider to create the recipe. This data is used solely for generating your recipe and is not stored or used for training.',
  },
  {
    title: 'Data Storage & Security',
    content: 'All data is stored securely using industry-standard encryption. We use Supabase for authentication and database services, which is SOC 2 compliant. Your data is encrypted at rest and in transit.',
  },
  {
    title: 'Account Deletion',
    content: 'You can delete your account and all associated data at any time from the settings page. Once deleted, your data is permanently removed from our servers within 30 days.',
  },
  {
    title: 'Cookies & Local Storage',
    content: 'Yield uses essential cookies and local storage only for authentication and app functionality. We do not use any tracking cookies or third-party analytics services.',
  },
  {
    title: 'Children\'s Privacy',
    content: 'Yield is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated date.',
  },
  {
    title: 'Contact',
    content: 'Questions about this policy? Reach out at chocwebster@gmail.com.',
  },
]

export default function PrivacyPage() {
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
                <div key={i} className={i === 2 ? 'notepad-hole-ripped' : 'notepad-hole'} />
              ))}
            </div>

            <div className="px-7 sm:px-10 py-8">
                {/* Header area */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                      Privacy Policy
                    </h1>
                    <p className="text-[13px] text-slate-400 font-semibold">
                      Updated on July 2026
                    </p>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-miku sm:mt-2 whitespace-nowrap sm:text-right" style={{ fontFamily: 'var(--font-hand), cursive', transform: 'rotate(-5deg)' }}>
                    how we handle your privacy
                  </span>
                </div>

              <div className="w-full h-px bg-slate-200/60 mb-6" />

              <div className="space-y-6">
                {sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="text-base font-bold text-slate-900 mb-1.5">{section.title}</h2>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{section.content}</p>
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
