import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ManageAlertsModal({
  open,
  onClose,
  patient,
  alerts = [],
  onChanged,
}) {
  const [newAlert, setNewAlert] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (!open || !patient) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose?.()
  }

  const handleAdd = async () => {
    const label = (newAlert || '').trim()
    if (!label || !patient?.id) return
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('medical_alerts')
        .insert({ patient_id: patient.id, label })
      if (err) throw err
      setNewAlert('')
      onChanged?.()
    } catch (e) {
      setError(e.message || 'Failed to add alert.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (alertId) => {
    if (!alertId) return
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('medical_alerts')
        .delete()
        .eq('id', alertId)
      if (err) throw err
      onChanged?.()
    } catch (e) {
      setError(e.message || 'Failed to remove alert.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-alerts-title"
    >
      <div
        className="bg-surface rounded-card border border-surface-border shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h2 id="manage-alerts-title" className="page-title text-lg">
              Manage Medical Alerts
            </h2>
            <p className="muted mt-1">
              Add or remove medical alerts for {patient.full_name}.
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

        <div className="px-6 pb-2">
          {error && (
            <div className="mb-3 p-3 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2 mb-4">
            <h3 className="label mb-1">Current Alerts</h3>
            {alerts.length === 0 ? (
              <p className="muted text-sm">No alerts yet. Add one below.</p>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 rounded-input bg-amber-50 border border-amber-200"
                >
                  <span className="text-slate-800 text-sm">{a.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(a.id)}
                    disabled={saving}
                    className="text-red-500 hover:text-red-700 text-lg leading-none px-1"
                    aria-label={`Remove ${a.label}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 mb-4">
            <h3 className="label mb-1">Add New Alert</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-base"
                placeholder="e.g., Penicillin Allergy"
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="rounded-input w-11 h-11 flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2 pb-5">
            <button
              type="button"
              onClick={() => !saving && onClose?.()}
              className="btn-primary px-6"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

