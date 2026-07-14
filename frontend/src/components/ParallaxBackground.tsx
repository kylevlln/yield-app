'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function ParallaxBackground() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -80])
  const y2 = useTransform(scrollY, [0, 500], [0, -40])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute top-1/3 -left-48 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-100/20 rounded-full blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(13,148,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
