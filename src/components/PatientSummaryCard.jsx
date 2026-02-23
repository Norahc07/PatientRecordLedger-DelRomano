export default function PatientSummaryCard({
  nextAppointment,
  nextAppointmentTime,
  nextAppointmentStatus,
  lastVisit,
  patientSince,
  needsTreatmentCount,
  completedCount,
}) {
  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatMonthYear = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formattedNextDate = nextAppointment ? formatDate(nextAppointment) : '—'
  const formattedNextTime = nextAppointmentTime || ''

  const rows = [
    {
      label: 'Next Appointment',
      value: formattedNextDate,
      highlight: false,
      key: 'nextAppointment',
    },
    { label: 'Last Visit', value: formatDate(lastVisit), highlight: false, key: 'lastVisit' },
    { label: 'Patient Since', value: patientSince ? formatMonthYear(patientSince) : '—', highlight: false, key: 'patientSince' },
    { label: 'Teeth Requiring Treatment', value: `${needsTreatmentCount} ${needsTreatmentCount === 1 ? 'tooth' : 'teeth'}`, highlight: 'orange', key: 'needs' },
    { label: 'Completed Treatments', value: `${completedCount} ${completedCount === 1 ? 'tooth' : 'teeth'}`, highlight: 'blue', key: 'completed' },
  ]

  return (
    <div className="card p-5 h-full flex flex-col justify-between">
      <h3 className="section-title mb-4">Patient Summary</h3>
      <div className="space-y-0.5">
        {rows.map(({ label, value, highlight, key }) =>
          key === 'nextAppointment' ? (
            <div
              key={key}
              className="flex justify-between items-center py-2.5 px-3 -mx-3 rounded-input hover:bg-slate-50/50"
            >
              <div className="flex flex-col">
                <span className="muted">{label}</span>
                <span className="text-xs text-slate-500 mt-0.5">Date &amp; Time</span>
              </div>
              <div className="text-right leading-tight">
                <div className="text-sm font-medium tabular-nums text-slate-900">
                  {formattedNextDate}
                </div>
                {formattedNextTime && (
                  <div className="text-xs tabular-nums text-slate-500 mt-0.5">
                    {formattedNextTime}
                  </div>
                )}
                {nextAppointmentStatus && (
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mt-0.5">
                    {nextAppointmentStatus.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              key={key}
              className={`flex justify-between items-center py-2.5 px-3 -mx-3 rounded-input ${
                highlight === 'orange'
                  ? 'bg-amber-50'
                  : highlight === 'blue'
                  ? 'bg-primary-50'
                  : 'hover:bg-slate-50/50'
              }`}
            >
              <span className="muted">{label}</span>
              <div
                className={`text-sm font-medium tabular-nums text-right ${
                  highlight === 'orange'
                    ? 'text-amber-700'
                    : highlight === 'blue'
                    ? 'text-primary-700'
                    : 'text-slate-900'
                }`}
              >
                {value}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
