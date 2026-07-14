'use client'

import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/AuthModal'

export default function AuthPage() {
  const router = useRouter()

  return (
    <div id="main-content" className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <AuthModal
        isOpen={true}
        initialMode="login"
        onClose={() => router.push('/')}
        onSuccess={() => router.push('/download')}
      />
      {/* Fallback visible content behind the modal */}
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Opening sign in...</p>
      </div>
    </div>
  )
}
