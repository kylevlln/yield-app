'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'

const sections = [
  {
    title: 'Using Yield',
    content: 'Yield is a kitchen utility that generates recipes based on ingredients you provide. It\'s not a substitute for professional nutritional or medical advice. Always use your own judgment when cooking, especially regarding allergies and food safety.',
  },
  {
    title: 'Food Safety Responsibility',
    content: 'Yield provides USDA-referenced food safety information, but it is your responsibility to ensure food is handled, stored, and cooked safely. Yield is not liable for any foodborne illness resulting from recipes generated through the app.',
  },
  {
    title: 'Your Account',
    content: 'You\'re responsible for keeping your account secure. If you create an account, don\'t share your password. You can delete your account at any time.',
  },
  {
    title: 'Recipe Accuracy',
    content: 'AI-generated recipes are suggestions, not guarantees. Ingredient quantities, cooking times, and techniques may need adjustment based on your specific ingredients, equipment, and altitude. Taste as you go.',
  },
  {
    title: 'Intellectual Property',
    content: 'Yield, its design, code, and branding are the intellectual property of the developer. You may not复制, modify, or redistribute any part of the application without explicit written permission.',
  },
  {
    title: 'Limitation of Liability',
    content: 'Yield is provided "as is" without warranties of any kind. We are not responsible for any damages, losses, or issues that may arise from using the app or following its generated recipes. Use at your own risk.',
  },
  {
    title: 'Modifications',
    content: 'We reserve the right to modify or discontinue Yield at any time, with or without notice. We may also update these terms from time to time. Continued use of the app constitutes acceptance of any changes.',
  },
  {
    title: 'Termination',
    content: 'We reserve the right to terminate or suspend your account at our discretion, without prior notice, for conduct that we believe violates these terms or is harmful to other users or the application.',
  },
  {
    title: 'Governing Law',
    content: 'These terms are governed by and construed in accordance with applicable local laws. Any disputes arising from these terms shall be resolved in the appropriate courts.',
  },
  {
    title: 'Contact',
    content: 'Questions? Reach out at chocwebster@gmail.com.',
  },
]

export default function TermsPage() {
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
                <div key={i} className={i === 3 ? 'notepad-hole-ripped' : 'notepad-hole'} />
              ))}
            </div>

            <div className="px-7 sm:px-10 py-8">
                {/* Header area */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                      Terms of Service
                    </h1>
                    <p className="text-[13px] text-slate-400 font-semibold">
                      Updated on July 2026
                    </p>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-miku sm:mt-2 whitespace-nowrap sm:text-right" style={{ fontFamily: 'var(--font-hand), cursive', transform: 'rotate(-5deg)' }}>
                    our ground rules
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
