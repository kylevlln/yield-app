'use client'

interface Substitution {
  original: string
  substitute: string
  ratio: string
  notes: string
  dietary_compliance: string[]
}

interface SubstitutionListProps {
  substitutions: Substitution[]
}

export function SubstitutionList({ substitutions }: SubstitutionListProps) {
  if (substitutions.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-900">Substitutions</h3>
      <div className="space-y-2">
        {substitutions.map((sub, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-700">{sub.original}</span>
              <span className="text-slate-400">→</span>
              <span className="text-sm font-medium text-teal-700">{sub.substitute}</span>
              {sub.ratio && (
                <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {sub.ratio}
                </span>
              )}
            </div>
            {sub.notes && (
              <p className="text-xs text-slate-500 mt-1">{sub.notes}</p>
            )}
            {sub.dietary_compliance.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {sub.dietary_compliance.map((tag, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
