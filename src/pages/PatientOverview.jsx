import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PatientDetailCard from '../components/PatientDetailCard'
import Odontogram from '../components/Odontogram'
import PatientSummaryCard from '../components/PatientSummaryCard'
import LedgerTable from '../components/LedgerTable'

export default function PatientOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [toothStatus, setToothStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPatient = async () => {
    if (!id) return
    const { data: p, error: pe } = await supabase.from('patients').select('*').eq('id', id).single()
    if (pe) throw pe
    setPatient(p)
  }

  const loadAlerts = async () => {
    if (!id) return
    const { data: a } = await supabase.from('medical_alerts').select('*').eq('patient_id', id)
    setAlerts(a || [])
  }

  const loadToothStatus = async () => {
    if (!id) return
    const { data: t } = await supabase.from('tooth_status').select('*').eq('patient_id', id)
    setToothStatus(t || [])
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([loadPatient(), loadAlerts(), loadToothStatus()])
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="card p-10 text-center">
        <p className="muted">Loading patient record...</p>
      </div>
    )
  }
  if (error || !patient) {
    return (
      <div className="card p-8">
        <p className="text-red-600 font-medium">{error || 'Patient not found.'}</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">
          ← Back to dashboard
        </button>
      </div>
    )
  }

  const completed = toothStatus.filter((t) => t.status === 'completed').length
  const needsTreatment = toothStatus.filter((t) => t.status === 'needs_treatment').length

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="muted hover:text-slate-900 text-sm font-medium transition-colors"
        >
          ← Dashboard
        </button>
      </nav>

      {/* Patient identity, demographics, medical alerts, contact */}
      <PatientDetailCard
        patient={patient}
        alerts={alerts}
        onAlertsChange={loadAlerts}
        onPatientRefresh={loadPatient}
      />

      {/* Two columns: Dental Chart (wider) + Patient Summary (narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-stretch">
        <div className="card p-5 min-w-0 h-full">
          <Odontogram
            patientId={id}
            toothStatus={toothStatus}
            onUpdate={loadToothStatus}
          />
        </div>
        <PatientSummaryCard
          nextAppointment={patient.next_appointment}
          nextAppointmentTime={patient.next_appointment_time}
          nextAppointmentStatus={patient.next_appointment_status}
          lastVisit={patient.last_visit}
          patientSince={patient.created_at}
          needsTreatmentCount={needsTreatment}
          completedCount={completed}
        />
      </div>

      {/* Treatment & Financial Ledger */}
      <LedgerTable patientId={id} />

    </div>
  )
}
