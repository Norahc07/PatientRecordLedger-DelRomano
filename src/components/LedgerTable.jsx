import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LedgerEntryModal from './LedgerEntryModal'

function formatMoney(n) {
  return `₱${Number(n).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function LedgerTable({ patientId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = async () => {
    if (!patientId) return
    setLoading(true)
    const { data } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [patientId])

  const totalCharges = entries.reduce((s, r) => s + Number(r.debit || 0), 0)
  const totalPayments = entries.reduce((s, r) => s + Number(r.credit || 0), 0)
  const balance = entries.length ? Number(entries[entries.length - 1].running_balance) : 0

  return (
    <div className="card overflow-hidden">
      {/* Header: title, subtitle, Total Outstanding, + Add Entry */}
      <div className="p-5 border-b border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h3 className="section-title text-base">Treatment & Financial Ledger</h3>
            <p className="muted mt-0.5">Track all treatments and payments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="muted">Total Outstanding: </span>
              <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMoney(balance)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary gap-1.5"
            >
              <span className="text-lg leading-none">+</span> Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">No.</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">No entries yet.</td></tr>
            ) : (
              entries.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                >
                  <td className="py-2.5 px-4 text-slate-700">{formatDate(row.date)}</td>
                  <td className="py-2.5 px-4 text-slate-600">{i + 1}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-800">{row.description}</span>
                    {row.payment_method && (
                      <span className="text-slate-500 ml-1">({row.payment_method})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {row.debit ? <span className="font-medium text-red-600">{formatMoney(row.debit)}</span> : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {row.credit ? <span className="font-medium text-green-600">{formatMoney(row.credit)}</span> : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-red-600 tabular-nums">
                    {formatMoney(row.running_balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Total Charges, Total Payments */}
      <div className="px-5 py-4 bg-surface-muted border-t border-surface-border flex flex-wrap justify-end gap-6 text-sm">
        <span>
          Total Charges: <strong className="text-red-600">{formatMoney(totalCharges)}</strong>
        </span>
        <span>
          Total Payments: <strong className="text-green-600">{formatMoney(totalPayments)}</strong>
        </span>
      </div>

      <LedgerEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        patientId={patientId}
        currentBalance={balance}
      />
    </div>
  )
}
