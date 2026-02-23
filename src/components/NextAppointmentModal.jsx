import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function NextAppointmentModal({ open, onClose, patient, onSaved }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Sync fields and lock body scroll when modal is open
  useEffect(() => {
    if (open && patient) {
      setError(null)
      const currentDate = patient.next_appointment || ''
      const currentTime = patient.next_appointment_time || ''
      const currentStatus = patient.next_appointment_status || 'scheduled'
      setDate(currentDate ? currentDate : '')
      setTime(currentTime ? currentTime : '')
      setStatus(currentStatus)

      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open, patient])

  if (!open || !patient) return null

  const handleSave = async (e) => {
    e.preventDefault()
    if (!patient.id) return
    setSaving(true)
    setError(null)
    try {
      const updates = {
        next_appointment: date || null,
        next_appointment_time: time || null,
        next_appointment_status: status || null,
      }

      // Completed → move date to Last Visit, clear next appointment
      if (status === 'completed' && date) {
        updates.last_visit = date
        updates.next_appointment = null
        updates.next_appointment_time = null
      }

      // Cancelled / no-show → clear next appointment only
      if ((status === 'cancelled' || status === 'no_show') && !updates.last_visit) {
        updates.next_appointment = null
        updates.next_appointment_time = null
      }

      const { error: err } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patient.id)
      if (err) throw err

      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(err.message || 'Failed to update next appointment.')
    } finally {
      setSaving(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="next-appointment-title"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-surface rounded-card border border-surface-border shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-surface-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="next-appointment-title" className="page-title text-lg">
                  Next Appointment
                </h2>
                <p className="muted mt-1">
                  Set the date and time for {patient.full_name}&apos;s next appointment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !saving && onClose?.()}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-4">
              {error && (
                <div className="p-3 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="label block mb-1">Date</label>
                <input
                  type="date"
                  className="input-base"
                  value={date || ''}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="label block mb-1">Time</label>
                <input
                  type="time"
                  className="input-base"
                  value={time || ''}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div>
                <label className="label block mb-1">Status</label>
                <select
                  className="input-base"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed / Visited</option>
                  <option value="moved">Moved</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">Patient Not Arrived</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  If marked as <span className="font-medium">Completed</span>, the visit date will
                  become the patient&apos;s Last Visit.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !saving && onClose?.()}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  )
}