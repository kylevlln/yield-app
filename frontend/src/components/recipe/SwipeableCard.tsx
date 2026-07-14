'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handlePointerDown = (e: PointerEvent) => {
      startX.current = e.clientX
      setIsDragging(true)
      card.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const diff = e.clientX - startX.current
      setDragOffset(diff)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      if (Math.abs(dragOffset) > 100) {
        if (dragOffset < 0 && onSwipeLeft) onSwipeLeft()
        if (dragOffset > 0 && onSwipeRight) onSwipeRight()
      }
      setDragOffset(0)
    }

    card.addEventListener('pointerdown', handlePointerDown)
    card.addEventListener('pointermove', handlePointerMove)
    card.addEventListener('pointerup', handlePointerUp)
    card.addEventListener('pointercancel', handlePointerUp)

    return () => {
      card.removeEventListener('pointerdown', handlePointerDown)
      card.removeEventListener('pointermove', handlePointerMove)
      card.removeEventListener('pointerup', handlePointerUp)
      card.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging, dragOffset, onSwipeLeft, onSwipeRight])

  return (
    <div
      ref={cardRef}
      className={`${className} touch-pan-y`}
      style={{
        transform: `translateX(${dragOffset * 0.5}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  )
}
