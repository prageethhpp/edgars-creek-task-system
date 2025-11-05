import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
          Edgars Creek Task System
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          IT Support & Facility Management
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Staff Login
          </Link>
          <Link
            href="/agent/login"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Agent Login
          </Link>
        </div>
      </div>
    </main>
  )
}
