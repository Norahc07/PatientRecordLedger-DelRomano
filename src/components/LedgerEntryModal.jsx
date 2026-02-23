import { useState } from 'react'
import { supabase } from '../lib/supabase'

const initialTreatment = {
  date: new Date().toISOString().slice(0, 10),
  toothNumber: '',
  description: '',
  amount: '',
}

const initialPayment = {
  date: new Date().toISOString().slice(0, 10),
  details: '',
  amount: '',
}

export default function LedgerEntryModal({ open, onClose, onSaved, patientId, currentBalance }) {
  const [mode, setMode] = useState('treatment') // 'treatment' | 'payment'
  const [treatment, setTreatment] = useState(initialTreatment)
  const [payment, setPayment] = useState(initialPayment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const handleClose = () => {
    if (saving) return
    setError(null)
    onClose?.()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientId) return

    setSaving(true)
    setError(null)
    try {
      if (mode === 'treatment') {
        const amount = parseFloat(treatment.amount)
        if (isNaN(amount) || amount <= 0) {
          setError('Please enter a valid charge amount.')
          setSaving(false)
          return
        }

        const debit = amount
        const credit = 0
        const runningBalance = Number(currentBalance || 0) + debit - credit

        const descriptionBase = treatment.description.trim() || 'Treatment / Service'
        const description =
          treatment.toothNumber.trim().length > 0
            ? `${treatment.toothNumber.trim()} — ${descriptionBase}`
            : descriptionBase

        const { error: err } = await supabase.from('ledger_entries').insert({
          patient_id: patientId,
          date: treatment.date,
          description,
          debit,
          credit,
          payment_method: null,
          running_balance: runningBalance,
        })
        if (err) throw err
      } else {
        const amount = parseFloat(payment.amount)
        if (isNaN(amount) || amount <= 0) {
          setError('Please enter a valid payment amount.')
          setSaving(false)
          return
        }

        const debit = 0
        const credit = amount
        const runningBalance = Number(currentBalance || 0) + debit - credit

        const description = payment.details.trim() || 'Payment Received'

        const { error: err } = await supabase.from('ledger_entries').insert({
          patient_id: patientId,
          date: payment.date,
          description,
          debit,
          credit,
          payment_method: null,
          running_balance: runningBalance,
        })
        if (err) throw err
      }

      onSaved?.()
      handleClose()
      // reset forms for next open
      setTreatment(initialTreatment)
      setPayment(initialPayment)
    } catch (err) {
      setError(err.message || 'Failed to save ledger entry.')
      setSaving(false)
    }
  }

  const commonDateLabel = mode === 'treatment' ? 'Treatment Date' : 'Payment Date'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-surface rounded-card border border-surface-border shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <div>
            <h2 id="ledger-modal-title" className="page-title text-lg">
              Add New Ledger Entry
            </h2>
            <p className="muted mt-1">
              Choose whether this is a treatment charge or a payment received.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-6 pb-4">
          <div className="flex rounded-input border border-surface-border bg-surface-muted overflow-hidden text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode('treatment')}
              className={`flex-1 py-2.5 text-center ${
                mode === 'treatment'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              Treatment/Service
            </button>
            <button
              type="button"
              onClick={() => setMode('payment')}
              className={`flex-1 py-2.5 text-center ${
                mode === 'payment'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              Payment Received
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="label block mb-1">{commonDateLabel}</label>
            <input
              type="date"
              className="input-base"
              value={mode === 'treatment' ? treatment.date : payment.date}
              onChange={(e) =>
                mode === 'treatment'
                  ? setTreatment((f) => ({ ...f, date: e.target.value }))
                  : setPayment((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>

          {mode === 'treatment' ? (
            <>
              <div>
                <label className="label block mb-1">Tooth Number</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g., #16, #24-25"
                  value={treatment.toothNumber}
                  onChange={(e) =>
                    setTreatment((f) => ({ ...f, toothNumber: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label block mb-1">Treatment Description</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g., Root Canal Treatment - First Visit"
                  value={treatment.description}
                  onChange={(e) =>
                    setTreatment((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label block mb-1">Charge Amount (₱)</label>
                <input
                  type="number"
                  className="input-base"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={treatment.amount}
                  onChange={(e) =>
                    setTreatment((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label block mb-1">Payment Details</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g., Payment Received - Check #2847"
                  value={payment.details}
                  onChange={(e) =>
                    setPayment((f) => ({ ...f, details: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label block mb-1">Payment Amount (₱)</label>
                <input
                  type="number"
                  className="input-base"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={payment.amount}
                  onChange={(e) =>
                    setPayment((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={mode === 'treatment' ? 'btn-primary' : 'btn-success'}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

