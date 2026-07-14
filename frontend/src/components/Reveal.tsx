'use client'

import { useState, useEffect, useRef, CSSProperties, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  duration?: number
  ease?: string
  className?: string
  style?: CSSProperties
}

export function Reveal({
  children,
  delay = 0,
  y = 32,
  duration = 0.5,
  ease = 'cubic-bezier(0.22, 1, 0.36, 1)',
  className = '',
  style = {},
}: RevealProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.05 },
    )

    io.observe(el)

    // Fail-safe: if the observer never fires (e.g. ancestor is display:none,
    // or it's pre-rendered above the fold in a hidden subtree), reveal anyway
    // so content can never get stuck at opacity:0.
    const fallback = setTimeout(() => setVisible(true), 1500)

    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${y}px)`,
        transition: `opacity ${duration}s ${ease} ${delay}s, transform ${duration}s ${ease} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
