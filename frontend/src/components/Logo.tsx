'use client'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  dark?: boolean
}

const sizeMap = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

function LeafIcon({ size, dark }: { size: number; dark?: boolean }) {
  const bg = dark ? '#ffffff' : '#0d9488'
  const leafFill = dark ? '#0d9488' : '#ffffff'
  const veinColor = dark ? '#ffffff' : '#0d9488'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded square background */}
      <rect width="48" height="48" rx="11" fill={bg} />

      {/* Leaf — organic shape with natural curve */}
      <path
        d="M24 6
           C21 9, 14 15, 11.5 22
           C9 29, 12 37, 17 40
           C20 41.5, 23 42, 24 42
           C25 42, 28 41.5, 31 40
           C36 37, 39 29, 36.5 22
           C34 15, 27 9, 24 6Z"
        fill={leafFill}
      />

      {/* Midrib — main vein from tip to base */}
      <path
        d="M24 8 C24 14, 24 28, 24 40"
        stroke={veinColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Left veins */}
      <path d="M24 16 C21 18, 17 19, 14 18.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 22 C21 24, 17 25, 13.5 24.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 28 C21.5 30, 18 31, 15 30.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

      {/* Right veins */}
      <path d="M24 16 C27 18, 31 19, 34 18.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 22 C27 24, 31 25, 34.5 24.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 28 C26.5 30, 30 31, 33 30.5" stroke={veinColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

      {/* Y letterform — integrated as leaf veins */}
      <path d="M17 15 L24 25" stroke={veinColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.9" />
      <path d="M31 15 L24 25" stroke={veinColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.9" />
      <path d="M24 25 L24 36" stroke={veinColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

function YMarkIcon({ size, dark }: { size: number; dark?: boolean }) {
  const bg = dark ? '#ffffff' : '#0d9488'
  const fg = dark ? '#0d9488' : '#ffffff'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="11" fill={bg} />
      {/* Leaf shape behind Y */}
      <path
        d="M24 8 C21 11, 14 17, 12 23 C10 29, 13 36, 18 39 C20.5 40.5, 23 41, 24 41 C25 41, 27.5 40.5, 30 39 C35 36, 38 29, 36 23 C34 17, 27 11, 24 8Z"
        fill={fg}
        opacity="0.15"
      />
      {/* Bold Y letterform */}
      <path
        d="M15 14 L24 26 L33 14"
        stroke={fg}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 26 L24 36"
        stroke={fg}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function Logo({ size = 'md', className = '', dark = false }: LogoProps) {
  const px = typeof size === 'number' ? size : undefined
  const cls = typeof size === 'string' ? sizeMap[size] : ''

  return (
    <span className={`${cls} ${className} inline-flex items-center justify-center`} style={px ? { width: px, height: px } : undefined}>
      <LeafIcon size={px || 40} dark={dark} />
    </span>
  )
}

export function LogoMark({ className = '', dark = false, size }: { className?: string; dark?: boolean; size?: number }) {
  const px = size || 20
  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={!size ? { width: px, height: px } : undefined}>
      <YMarkIcon size={px} dark={dark} />
    </span>
  )
}

export function LogoWithText({ className = '', dark = false, size = 'md' }: { className?: string; dark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LeafIcon size={iconSize} dark={dark} />
      <span
        className={`${textSize} font-semibold tracking-tight text-yield-950 dark:text-white`}
        style={{ fontFamily: 'var(--font-hand), cursive' }}
      >
        Yield
      </span>
    </div>
  )
}

export { LeafIcon, YMarkIcon }
