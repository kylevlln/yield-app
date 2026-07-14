'use client'

import { useCountUp } from './useCountUp'
import { Reveal } from '@/components/Reveal'

export function StatCard({ value, suffix, label, delay }: { value: number; suffix?: string; label: string; delay?: number }) {
  const { count, ref } = useCountUp(value, 2200)
  return (
    <Reveal delay={delay ?? 0}>
      <div ref={ref} className="text-center">
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {count.toLocaleString()}{suffix || ''}
        </div>
        <div className="text-sm text-teal-100 mt-1 font-medium">{label}</div>
      </div>
    </Reveal>
  )
}
