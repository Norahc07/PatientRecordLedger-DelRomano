export default function MedicalAlertBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
      {label}
    </span>
  )
}
