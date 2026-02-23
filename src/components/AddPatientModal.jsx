import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const initial = {
  full_name: '',
  age: '',
  occupation: '',
  address: '',
  telephone: '',
  complain: '',
}

export default function AddPatientModal({ open, onClose, onSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(initial)
      setError(null)
    }
  }, [open])

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = (form.full_name || '').trim()
    if (!name) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('patients')
        .insert({
          full_name: name,
          age: form.age ? parseInt(form.age, 10) : null,
          occupation: (form.occupation || '').trim() || null,
          address: (form.address || '').trim() || null,
          telephone: (form.telephone || '').trim() || null,
          complain: (form.complain || '').trim() || null,
        })
        .select('id')
        .single()

      if (err) throw err
      onSuccess?.(data?.id)
      onClose?.()
      if (data?.id) navigate(`/patient/${data.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-patient-title"
    >
      <div
        className="bg-surface rounded-card border border-surface-border shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="add-patient-title" className="page-title">
            Add New Patient
          </h2>
          <p className="muted mt-1 mb-5">
            Enter the patient's information to create a new record
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <div>
              <label className="label block mb-1">Full Name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                className="input-base"
                placeholder="e.g., Juan Dela Cruz"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  className="input-base"
                  placeholder="e.g., 34"
                />
              </div>
              <div>
                <label className="label block mb-1">Occupation</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => update('occupation', e.target.value)}
                  className="input-base"
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="label block mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="input-base"
                placeholder="e.g., 123 Main Street, Manila"
              />
            </div>

            <div>
              <label className="label block mb-1">Telephone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => update('telephone', e.target.value)}
                className="input-base"
                placeholder="e.g., 555-1234"
              />
            </div>

            <div>
              <label className="label block mb-1">Complain</label>
              <textarea
                value={form.complain}
                onChange={(e) => update('complain', e.target.value)}
                rows={3}
                className="input-base resize-y min-h-[80px]"
                placeholder="e.g., Toothache on upper left molar"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
