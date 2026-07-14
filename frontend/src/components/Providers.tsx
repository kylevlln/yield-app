'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from './ErrorBoundary'

const Toaster = dynamic(
  () => import('react-hot-toast').then(mod => {
    const { Toaster } = mod
    return { default: Toaster }
  }),
  { ssr: false }
)

const ServiceWorkerRegistration = dynamic(
  () => import('./ServiceWorkerRegistration').then(mod => ({ default: mod.ServiceWorkerRegistration })),
  { ssr: false }
)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <ServiceWorkerRegistration />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#18181b',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            fontFamily: 'var(--font-hanken), system-ui, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#0d9488',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}
