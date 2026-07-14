'use client'

import { FoodSafetyBanner as FoodSafetyBannerType } from '@/types/recipe'

interface FoodSafetyBannerProps {
  banner: FoodSafetyBannerType
}

export function FoodSafetyBanner({ banner }: FoodSafetyBannerProps) {
  const severity = banner.min_internal_temp_f >= 165 ? 'danger' : banner.min_internal_temp_f >= 145 ? 'warning' : 'caution'

  const colorMap = {
    caution: 'bg-amber-50 border-amber-300 text-amber-800',
    warning: 'bg-orange-50 border-orange-300 text-orange-800',
    danger: 'bg-red-50 border-red-300 text-red-800',
  }

  const iconMap = {
    caution: '⚠️',
    warning: '🔥',
    danger: '🚫',
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${colorMap[severity]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{iconMap[severity]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm uppercase tracking-wide">
              {severity === 'danger' ? 'Danger' : severity === 'warning' ? 'Warning' : 'Caution'}
            </span>
            {banner.protein_type && (
              <span className="px-2 py-0.5 bg-white/50 text-xs rounded-full font-medium">
                {banner.protein_type}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed">{banner.warning_text}</p>
          {banner.min_internal_temp_f > 0 && (
            <p className="mt-1 text-sm font-bold">
              Internal temp: {banner.min_internal_temp_f}°F / {banner.min_internal_temp_c}°C
            </p>
          )}
          {banner.special_instructions && (
            <p className="mt-1 text-xs opacity-75">{banner.special_instructions}</p>
          )}
        </div>
      </div>
    </div>
  )
}
