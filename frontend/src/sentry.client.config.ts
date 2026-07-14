import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'NetworkError',
    'AbortError',
    'CancelledError',
  ],

  beforeSend(event) {
    if (event.request?.url?.includes('/api/auth')) {
      return null
    }
    return event
  },
})
