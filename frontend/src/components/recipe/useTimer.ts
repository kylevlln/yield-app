'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TimerState {
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  label: string
}

export function useTimer() {
  const [timers, setTimers] = useState<Record<number, TimerState>>({})

  const anyRunning = Object.values(timers).some(
    (t) => t.isRunning && t.remainingSeconds > 0,
  )

  // Only run the 1s interval while at least one timer is actively counting down.
  // The interval is torn down automatically once nothing is running, so we
  // don't tick (and re-render) forever for the whole app lifetime.
  useEffect(() => {
    if (!anyRunning) return
    const id = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev }
        let changed = false
        for (const key of Object.keys(next)) {
          const idx = Number(key)
          if (next[idx].isRunning && next[idx].remainingSeconds > 0) {
            next[idx] = { ...next[idx], remainingSeconds: next[idx].remainingSeconds - 1 }
            changed = true
          } else if (next[idx].isRunning && next[idx].remainingSeconds === 0) {
            next[idx] = { ...next[idx], isRunning: false }
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(id)
  }, [anyRunning])

  const startTimer = useCallback((stepIndex: number, durationMinutes: number, durationSeconds: number, label: string) => {
    const total = (durationMinutes * 60) + durationSeconds
    setTimers(prev => ({
      ...prev,
      [stepIndex]: { totalSeconds: total, remainingSeconds: total, isRunning: true, label }
    }))
  }, [])

  const toggleTimer = useCallback((stepIndex: number) => {
    setTimers(prev => {
      if (!prev[stepIndex]) return prev
      return { ...prev, [stepIndex]: { ...prev[stepIndex], isRunning: !prev[stepIndex].isRunning } }
    })
  }, [])

  const resetTimer = useCallback((stepIndex: number) => {
    setTimers(prev => {
      if (!prev[stepIndex]) return prev
      return { ...prev, [stepIndex]: { ...prev[stepIndex], remainingSeconds: prev[stepIndex].totalSeconds, isRunning: false } }
    })
  }, [])

  const getTimerProgress = useCallback((stepIndex: number): number => {
    const t = timers[stepIndex]
    if (!t || t.totalSeconds === 0) return 0
    return ((t.totalSeconds - t.remainingSeconds) / t.totalSeconds) * 100
  }, [timers])

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  return { timers, startTimer, toggleTimer, resetTimer, getTimerProgress, formatTime }
}
