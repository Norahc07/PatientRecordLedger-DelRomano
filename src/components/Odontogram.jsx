import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// FDI numbering: Upper 18-11, 21-28; Lower 48-41, 31-38
const UPPER_ARCH = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28']
const LOWER_ARCH = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']
const ALL_FDI = [...UPPER_ARCH, ...LOWER_ARCH]

const statusStyles = {
  normal: 'bg-slate-200 border-2 border-slate-300',
  needs_treatment: 'bg-red-500 border-2 border-red-600',
  completed: 'bg-primary-700 border-2 border-primary-800',
  missing: 'bg-slate-500 border-2 border-slate-600',
}

const STATUS_OPTIONS = [
  { id: 'normal', label: 'Normal', icon: 'bg-slate-200 border-2 border-slate-300' },
  { id: 'needs_treatment', label: 'Treatment Needed', icon: 'bg-red-500 border-2 border-red-600' },
  { id: 'completed', label: 'Completed', icon: 'bg-primary-700 border-2 border-primary-800' },
  { id: 'missing', label: 'Missing', icon: 'bg-slate-500 border-2 border-slate-600' },
]

const CheckIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function Odontogram({ patientId, toothStatus, onUpdate }) {
  const [statusMap, setStatusMap] = useState({})
  const [updating, setUpdating] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [modalToothId, setModalToothId] = useState(null)

  useEffect(() => {
    const map = {}
    ALL_FDI.forEach((tid) => { map[tid] = 'normal' })
    ;(toothStatus || []).forEach((t) => {
      if (t.tooth_id && statusStyles[t.status]) map[t.tooth_id] = t.status
    })
    setStatusMap(map)
  }, [toothStatus])

  const setStatus = async (toothId, nextStatus) => {
    if (!patientId) return
    setUpdating(toothId)
    try {
      const { error } = await supabase.from('tooth_status').upsert(
        { patient_id: patientId, tooth_id: toothId, status: nextStatus },
        { onConflict: 'patient_id,tooth_id' }
      )
      if (!error) {
        setStatusMap((prev) => ({ ...prev, [toothId]: nextStatus }))
        onUpdate?.()
      }
    } finally {
      setUpdating(null)
    }
  }

  const handleSelectStatus = async (toothId, status) => {
    await setStatus(toothId, status)
    setModalToothId(null)
  }

  const Tooth = ({ toothId }) => {
    const status = statusMap[toothId] || 'normal'
    const isClickable = editMode && updating !== toothId
    return (
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => isClickable && setModalToothId(toothId)}
          disabled={!isClickable}
          title={editMode ? `Tooth ${toothId} – click to set status` : ''}
          className={`
            w-5 h-8 rounded-full border-2
            ${statusStyles[status]}
            transition-all
            ${isClickable ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1' : 'cursor-default'}
            ${isClickable ? 'hover:border-slate-400' : ''}
            disabled:opacity-100
          `}
          aria-label={`Tooth ${toothId}, ${status}`}
        />
        <span className="text-[9px] text-slate-500 font-mono select-none">{toothId}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title text-base">Dental Chart (Odontogram)</h3>
        <button
          type="button"
          onClick={() => setEditMode((e) => !e)}
          className={editMode ? 'btn-primary py-2 text-sm' : 'btn-secondary py-2 text-sm'}
        >
          {editMode ? (
            <>
              <CheckIcon />
              Done Editing
            </>
          ) : (
            <>
              <span className="text-primary-600">+</span> Edit Chart
            </>
          )}
        </button>
      </div>

      {editMode && (
        <div className="rounded-input bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-800">
          Edit Mode: Click on any tooth to set its status (Normal, Treatment Needed, Completed, or Missing).
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-slate-500 text-center">Upper Arch</p>
        <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 items-center justify-items-center">
          {UPPER_ARCH.map((tid) => (
            <Tooth key={tid} toothId={tid} />
          ))}
        </div>
        <div className="border-t border-dashed border-slate-300 my-2" />
        <p className="text-xs font-medium text-slate-500 text-center">Lower Arch</p>
        <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 items-center justify-items-center">
          {LOWER_ARCH.map((tid) => (
            <Tooth key={tid} toothId={tid} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-200 border-2 border-slate-300" /> Normal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 border-2 border-red-600" /> Treatment Needed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-700 border-2 border-primary-800" /> Completed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-500 border-2 border-slate-600" /> Missing
        </span>
      </div>

      {/* Modal: Update Tooth #XX */}
      {modalToothId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setModalToothId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tooth-modal-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 id="tooth-modal-title" className="text-lg font-bold text-blue-900">
                    Update Tooth #{modalToothId}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">Select the status for this tooth</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalToothId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                {STATUS_OPTIONS.map((opt) => {
                  const current = statusMap[modalToothId] || 'normal'
                  const isSelected = current === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectStatus(modalToothId, opt.id)}
                      disabled={updating === modalToothId}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-slate-100 border-blue-400 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-sm border-2 ${opt.icon} block`} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
