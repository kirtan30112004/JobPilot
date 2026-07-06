import React from 'react'

function DefaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
    </svg>
  )
}

/**
 * EmptyState — shown when a list/table has no data.
 *
 * @param {ReactNode} icon
 * @param {string} title
 * @param {string} description
 * @param {ReactNode} action - e.g. a button
 */
function EmptyState({ icon, title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="font-display text-base font-bold text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}

export default EmptyState