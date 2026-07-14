'use client'

export function CookingAnimation({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="relative inline-flex items-center">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="animate-bounce" style={{ animationDuration: '1.5s' }}>
          <ellipse cx="18" cy="12" rx="10" ry="8" fill="#0d9488" opacity="0.15" />
          <ellipse cx="18" cy="11" rx="9" ry="7" fill="#0d9488" opacity="0.25" />
          <rect x="12" y="16" width="12" height="4" rx="1" fill="#0d9488" opacity="0.3" />
          <rect x="14" y="20" width="8" height="10" rx="1" fill="#0d9488" opacity="0.2" />
        </svg>
        {step >= 1 && (
          <>
            <span className="absolute -top-1 left-1 w-1 h-3 bg-teal-300 rounded-full opacity-40 steam" style={{ animationDelay: '0s' }} />
            <span className="absolute -top-1 left-3 w-1 h-2 bg-teal-300 rounded-full opacity-30 steam" style={{ animationDelay: '0.4s' }} />
            <span className="absolute -top-1 right-1 w-1 h-2.5 bg-teal-300 rounded-full opacity-35 steam" style={{ animationDelay: '0.8s' }} />
          </>
        )}
      </span>

      {step >= 2 && (
        <svg width="28" height="28" viewBox="0 0 28 28" className="timer-pulse">
          <circle cx="14" cy="14" r="12" fill="none" stroke="#0d9488" strokeWidth="2" opacity="0.2" />
          <circle cx="14" cy="14" r="12" fill="none" stroke="#0d9488" strokeWidth="2"
            strokeDasharray="75.4" strokeDashoffset="75.4"
            style={{ animation: 'timerDraw 2s ease-in-out infinite' }} />
          <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#0d9488">
            {step >= 3 ? '✓' : '...'}
          </text>
        </svg>
      )}

      {step >= 1 && (
        <div className="flex gap-1">
          <span className="text-sm pot-bubble" style={{ animationDelay: '0s' }}>🧄</span>
          <span className="text-sm pot-bubble" style={{ animationDelay: '0.3s' }}>🍳</span>
          <span className="text-sm pot-bubble" style={{ animationDelay: '0.6s' }}>✨</span>
        </div>
      )}
    </div>
  )
}
