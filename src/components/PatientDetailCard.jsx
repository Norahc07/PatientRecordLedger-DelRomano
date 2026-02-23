import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ManageAlertsModal from './ManageAlertsModal'

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const PhoneIcon = () => (
  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)
const DocumentIcon = () => (
  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const AlertTriangleIcon = () => (
  <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

export default function PatientDetailCard({
  patient,
  alerts = [],
  onAlertsChange,
  onPatientRefresh,
}) {
  const [alertsModalOpen, setAlertsModalOpen] = useState(false)
  const [nextDate, setNextDate] = useState('')
  const [nextTime, setNextTime] = useState('')
  const [nextStatus, setNextStatus] = useState('scheduled')
  const [nextSaving, setNextSaving] = useState(false)
  const [nextError, setNextError] = useState(null)

  useEffect(() => {
    if (!patient) return
    setNextError(null)
    const currentDate = patient.next_appointment || ''
    const currentTime = patient.next_appointment_time || ''
    const currentStatus = patient.next_appointment_status || 'scheduled'
    setNextDate(currentDate ? currentDate : '')
    setNextTime(currentTime ? currentTime : '')
    setNextStatus(currentStatus)
  }, [patient])

  const handleSaveNextAppointment = async (e) => {
    e.preventDefault()
    if (!patient?.id) return
    setNextSaving(true)
    setNextError(null)
    try {
      const updates = {
        next_appointment: nextDate || null,
        next_appointment_time: nextTime || null,
        next_appointment_status: nextStatus || null,
      }

      if (nextStatus === 'completed' && nextDate) {
        updates.last_visit = nextDate
        updates.next_appointment = null
        updates.next_appointment_time = null
      }

      if ((nextStatus === 'cancelled' || nextStatus === 'no_show') && !updates.last_visit) {
        updates.next_appointment = null
        updates.next_appointment_time = null
      }

      const { error: err } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patient.id)
      if (err) throw err

      onPatientRefresh?.()
    } catch (err) {
      setNextError(err.message || 'Failed to update next appointment.')
    } finally {
      setNextSaving(false)
    }
  }

  if (!patient) return null

  const initials = getInitials(patient.full_name)

  return (
    <div className="card overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Avatar + Name & demographics */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="page-title text-xl sm:text-2xl truncate">{patient.full_name}</h1>
              <div className="flex items-center gap-2 mt-1.5 muted">
                <span>Age: {patient.age != null ? patient.age : '—'}</span>
                <span className="text-slate-300">·</span>
                <span>Occupation: {patient.occupation || '—'}</span>
              </div>
            </div>
          </div>

          {/* Right: Medical Alerts box + Manage Alerts */}
          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            <div className="rounded-input bg-amber-50 border border-amber-200/80 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangleIcon />
                <span className="section-title text-amber-800">Medical Alerts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {alerts.length === 0 ? (
                  <span className="muted text-amber-700">None</span>
                ) : (
                  alerts.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-medium"
                    >
                      {a.label}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAlertsModalOpen(true)}
                className="btn-secondary border-primary-200 text-primary-600 hover:bg-primary-50 py-2 text-sm gap-1.5"
              >
                <PlusIcon />
                Manage Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Contact: Address, Telephone, Complain */}
        <div className="mt-8 pt-6 border-t border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-input bg-primary-50 flex items-center justify-center">
              <MapPinIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</p>
              <p className="text-slate-900 mt-0.5">{patient.address || '—'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-input bg-primary-50 flex items-center justify-center">
              <PhoneIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telephone</p>
              <p className="text-slate-900 mt-0.5">{patient.telephone || '—'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-input bg-primary-50 flex items-center justify-center">
              <DocumentIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Complain</p>
              <p className="text-slate-900 mt-0.5">{patient.complain || '—'}</p>
            </div>
          </div>
        </div>

        {/* Inline Next Appointment editor */}
        <div className="mt-8 pt-6 border-t border-surface-border">
          <div className="rounded-input bg-surface-muted px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="section-title">Next Appointment</h3>
                <p className="muted text-sm">
                  Set the date and time for {patient.full_name}&apos;s next appointment.
                </p>
              </div>
            </div>

            {nextError && (
              <div className="mb-3 p-3 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">
                {nextError}
              </div>
            )}

            <form onSubmit={handleSaveNextAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="label block mb-1">Date</label>
                  <input
                    type="date"
                    className="input-base w-full"
                    value={nextDate || ''}
                    onChange={(e) => setNextDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label block mb-1">Time</label>
                  <input
                    type="time"
                    className="input-base w-full"
                    value={nextTime || ''}
                    onChange={(e) => setNextTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label block mb-1">Status</label>
                  <select
                    className="input-base w-full"
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed / Visited</option>
                    <option value="moved">Moved</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">Patient Not Arrived</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-slate-500">
                  If marked as <span className="font-medium">Completed</span>, the visit date will become
                  the patient&apos;s Last Visit.
                </p>
                <button
                  type="submit"
                  className="btn-primary sm:px-6"
                  disabled={nextSaving}
                >
                  {nextSaving ? 'Saving...' : 'Save Next Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ManageAlertsModal
        open={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        patient={patient}
        alerts={alerts}
        onChanged={onAlertsChange}
      />
    </div>
  )
}
