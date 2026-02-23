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
            className="text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
          >
            Del Romano Clinic
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
