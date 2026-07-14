'use client'

import { ReactNode } from 'react'

export interface CookingFloatProps {
  icon: React.FC<{ size?: number; className?: string }>
  size?: number
  className?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  opacity?: number
}

export function CookingFloat({ children, top, left, right, bottom, opacity = 0.06, animClass = '' }: {
  children: ReactNode
  top?: string
  left?: string
  right?: string
  bottom?: string
  opacity?: number
  animClass?: string
}) {
  return (
    <div
      className={`absolute pointer-events-none ${animClass}`}
      style={{ top, left, right, bottom, opacity }}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

export function CookingFloats({ floats }: { floats: CookingFloatProps[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {floats.map((f, i) => {
        const Icon = f.icon
        return (
          <div
            key={i}
            className={`absolute ${f.className || ''}`}
            style={{
              top: f.top,
              left: f.left,
              right: f.right,
              bottom: f.bottom,
              opacity: f.opacity ?? 0.06,
            }}
          >
            <Icon size={f.size || 24} className="text-teal-600" />
          </div>
        )
      })}
    </div>
  )
}

export function ForkIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 2v6c0 1.1.9 2 2 2h1v10a1 1 0 002 0V10h1c1.1 0 2-.9 2-2V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function KnifeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 21l18-18M3 21h6v-6M15 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function SpoonIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="8" rx="5" ry="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 14v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function WhiskIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2v8M8 10c0 4 2 8 4 10 2-2 4-6 4-10M6 8c1 4 3 7 6 9M18 8c-1 4-3 7-6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function HerbIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 22V8M12 8c-3-4-8-5-9-2 4-1 7 0 9 2M12 8c3-4 8-5 9-2-4-1-7 0-9 2M12 14c-2-3-6-4-7-2 3-1 5 0 7 2M12 14c2-3 6-4 7-2-3-1-5 0-7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function RollingPinIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="8" width="16" height="4" rx="2" transform="rotate(-45 12 10)" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 19l2-2M19 5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function PanIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="10" cy="13" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M17 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 9V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function PotIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 6v4M16 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
