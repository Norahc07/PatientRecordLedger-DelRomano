import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import PatientCard from '../components/PatientCard'
import AddPatientModal from '../components/AddPatientModal'

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [alertsByPatient, setAlertsByPatient] = useState({})
  const [balanceByPatient, setBalanceByPatient] = useState({})
  const [toothCountsByPatient, setToothCountsByPatient] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const load = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('full_name')

        if (patientsError) throw patientsError
        setPatients(patientsData || [])

        if ((patientsData?.length ?? 0) === 0) {
          setLoading(false)
          return
        }

        const ids = (patientsData || []).map((p) => p.id)

        const { data: alertsData } = await supabase
          .from('medical_alerts')
          .select('id, patient_id, label')
          .in('patient_id', ids)
        const byPatient = {}
        ;(alertsData || []).forEach((a) => {
          if (!byPatient[a.patient_id]) byPatient[a.patient_id] = []
          byPatient[a.patient_id].push(a)
        })
        setAlertsByPatient(byPatient)

        const { data: ledgerData } = await supabase
          .from('ledger_entries')
          .select('patient_id, date, created_at, running_balance')
          .in('patient_id', ids)
          .order('date', { ascending: true })
          .order('created_at', { ascending: true })
        const balances = {}
        ids.forEach((id) => { balances[id] = 0 })
        ;(ledgerData || []).forEach((row) => {
          balances[row.patient_id] = row.running_balance
        })
        setBalanceByPatient(balances)

        const { data: toothData } = await supabase
          .from('tooth_status')
          .select('patient_id, status')
          .in('patient_id', ids)
        const counts = {}
        ids.forEach((id) => {
          counts[id] = { completed: 0, needsTreatment: 0 }
        })
        ;(toothData || []).forEach((t) => {
          if (t.status === 'completed') counts[t.patient_id].completed++
          if (t.status === 'needs_treatment') counts[t.patient_id].needsTreatment++
        })
        setToothCountsByPatient(counts)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const q = search.trim().toLowerCase()
  const filtered =
    q === ''
      ? patients
      : patients.filter(
          (p) =>
            (p.full_name || '').toLowerCase().includes(q) ||
            (p.telephone || '').toLowerCase().includes(q) ||
            (p.address || '').toLowerCase().includes(q)
        )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="page-title">Patient Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="search"
            placeholder="Search by name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base w-full sm:w-64"
          />
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="btn-primary whitespace-nowrap"
          >
            Add New Patient
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-input bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}. Check your .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) and Supabase tables.
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center muted">Loading patients...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center muted">
          {patients.length === 0
            ? 'No patients yet. Click "Add New Patient" to add one.'
            : 'No patients match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              alerts={alertsByPatient[patient.id] || []}
              balance={balanceByPatient[patient.id] ?? 0}
              toothCounts={toothCountsByPatient[patient.id] || { completed: 0, needsTreatment: 0 }}
            />
          ))}
        </div>
      )}

      <AddPatientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => load()}
      />
    </div>
  )
}
