import { Link } from 'react-router-dom'

function formatBalance(balance) {
  const n = Number(balance)
  if (isNaN(n)) return '₱0.00'
  return `₱${n.toFixed(2)}`
}

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

export default function PatientCard({ patient, alerts = [], balance = 0, toothCounts = { completed: 0, needsTreatment: 0 } }) {
  const lastVisit = patient.last_visit
    ? new Date(patient.last_visit).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—'
  const initials = getInitials(patient.full_name)
  const alertsText = (alerts || []).map((a) => a.label).join(', ') || 'None'
  const hasBalance = Number(balance) > 0

  return (
    <Link
      to={`/patient/${patient.id}`}
      className="block card card-hover p-card"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-base leading-tight">{patient.full_name}</h3>
          <p className="muted mt-0.5">
            {patient.age != null ? `${patient.age} years` : '—'}
            {patient.occupation ? ` • ${patient.occupation}` : ''}
          </p>
        </div>
      </div>

      <div className="rounded-input bg-amber-50/80 border border-amber-200/60 px-3 py-2 mb-3">
        <span className="section-title text-amber-800">Alerts:</span>
        <span className="text-amber-800 text-sm ml-1">{alertsText}</span>
      </div>

      <div className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between items-baseline">
          <span className="muted">Last Visit:</span>
          <span className="font-medium text-slate-800">{lastVisit}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="muted">Completed:</span>
          <span className="font-medium text-primary-600">
            {toothCounts.completed} {toothCounts.completed === 1 ? 'tooth' : 'teeth'}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="muted">Needs Treatment:</span>
          <span className="font-medium text-amber-600">
            {toothCounts.needsTreatment} {toothCounts.needsTreatment === 1 ? 'tooth' : 'teeth'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-surface-border flex justify-between items-baseline">
        <span className="label text-slate-600">Account Balance:</span>
        <span className={`font-semibold text-sm tabular-nums ${hasBalance ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatBalance(balance)}
        </span>
      </div>
    </Link>
  )
}
