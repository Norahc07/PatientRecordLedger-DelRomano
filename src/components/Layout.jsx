import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function formatDateTime() {
  const d = new Date()
  const month = d.toLocaleString('en-US', { month: 'long' })
  const day = d.getDate()
  const year = d.getFullYear()
  const time = d.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `Today: ${month}, ${day}, ${year} | ${time}`
}

export default function Layout({ children }) {
  const [dateTime, setDateTime] = useState(() => formatDateTime())

  useEffect(() => {
    const id = setInterval(() => setDateTime(formatDateTime()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="bg-surface border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 21c-.6-1.3-.9-2.7-1.1-3.9-.2-1.1-.4-2.1-.7-2.8C6 13 5 12 4.4 10.8 3.7 9.3 3.5 7.7 3.9 6.3 4.5 4.2 6.3 3 8.2 3c1.2 0 2.3.5 2.9 1.3.6-.8 1.7-1.3 2.9-1.3 1.9 0 3.7 1.2 4.3 3.3.4 1.4.2 3-.5 4.5C17.3 12 16.3 13 15.9 14.3c-.3.7-.4 1.7-.7 2.8-.2 1.2-.5 2.6-1.1 3.9" />
              </svg>
            </span>
            <span>Del Romano Clinic</span>
          </Link>
          <time className="text-sm text-slate-500 tabular-nums" dateTime={new Date().toISOString()}>
            {dateTime}
          </time>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
