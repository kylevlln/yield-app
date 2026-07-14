export default function AuthCodeError() {
  return (
    <div id="main-content" className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-4 flex justify-center">
          <svg className="w-12 h-12 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h1>
        <p className="text-sm text-gray-500 mb-6">
          Something went wrong with the sign-in process. The link may have expired or been used already.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-colors"
        >
          Back to Yield
        </a>
      </div>
    </div>
  )
}
