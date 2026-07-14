'use client'

import { TimerState } from './useTimer'

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 13V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8 5l11 7-11 7V5z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9a8 8 0 1 1-1.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1a6 6 0 0 0-3-11z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface Step {
  step_number: number
  instruction: string
  duration_minutes: number
  duration_seconds: number
  timer_enabled: boolean
  timer_label?: string
  equipment: string[]
  tips: string[]
  technique?: string
}

interface StepCardProps {
  step: Step
  index: number
  isCurrentStep: boolean
  onComplete: () => void
  timer?: TimerState
  timerProgress: number
  onStartTimer: () => void
  onToggleTimer: () => void
  onResetTimer: () => void
  formatTime: (seconds: number) => string
}

export function StepCard({
  step, index, isCurrentStep, onComplete,
  timer, timerProgress, onStartTimer, onToggleTimer, onResetTimer, formatTime,
}: StepCardProps) {
  const durationSeconds = (step.duration_minutes * 60) + step.duration_seconds

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${
      isCurrentStep ? 'border-teal-500 bg-teal-50/50 shadow-md' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isCurrentStep ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 leading-relaxed">{step.instruction}</p>

          {step.technique && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
              {step.technique}
            </span>
          )}

          {(step.equipment ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(step.equipment ?? []).map((eq, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {eq}
                </span>
              ))}
            </div>
          )}

          {step.timer_enabled && durationSeconds > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {!timer || (timer.remainingSeconds === timer.totalSeconds && !timer.isRunning) ? (
                <button
                  onClick={onStartTimer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <TimerIcon className="w-4 h-4" />
                  <span>{formatTime(durationSeconds)}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleTimer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                      timer.isRunning
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : timer.remainingSeconds === 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {timer.isRunning ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : timer.remainingSeconds === 0 ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                    <span className="font-mono font-bold">{formatTime(timer.remainingSeconds)}</span>
                  </button>
                  <button
                    onClick={onResetTimer}
                    aria-label="Reset timer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 text-sm rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    <ResetIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {timer && timer.totalSeconds > 0 && (
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      timer.remainingSeconds === 0 ? 'bg-green-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {(step.tips ?? []).length > 0 && (
            <div className="mt-2 space-y-1">
              {(step.tips ?? []).map((tip, i) => (
                <p key={i} className="text-xs text-slate-500 italic flex items-start gap-1">
                  <LightbulbIcon className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onComplete}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isCurrentStep
              ? 'border-teal-500 bg-teal-500 text-white'
              : 'border-slate-300 text-transparent hover:border-slate-400'
          }`}
        >
          ✓
        </button>
      </div>
    </div>
  )
}
