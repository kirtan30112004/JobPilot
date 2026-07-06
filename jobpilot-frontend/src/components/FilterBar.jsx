import React from 'react'

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/**
 * FilterBar — renders a row of <select> filters based on a config array.
 *
 * @param {Array<{name: string, label: string, options: string[]}>} filters
 *   `name` is the key used in `values` / `onChange`.
 *   `label` is the plural noun shown in the default "All X" option.
 *   `options` is the list of selectable values.
 * @param {Object} values - { [filterName]: currentValue } — use 'all' for "no filter"
 * @param {Function} onChange - (name, value) => void
 * @param {Function} onClear - clears all active filters
 */
function FilterBar({ filters, values, onChange, onClear }) {
  const activeCount = Object.values(values || {}).filter((v) => v && v !== 'all').length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs font-medium pr-1 shrink-0">
        <FilterIcon />
        Filters
      </span>

      {filters.map((filter) => (
        <select
          key={filter.name}
          value={values[filter.name] || 'all'}
          onChange={(e) => onChange(filter.name, e.target.value)}
          className="field py-2 px-3 text-xs font-medium w-auto cursor-pointer"
          style={{ minWidth: '120px' }}
          aria-label={`Filter by ${filter.label}`}
        >
          <option value="all">All {filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-400 transition-colors px-2 py-2 shrink-0"
        >
          <XIcon />
          Clear ({activeCount})
        </button>
      )}
    </div>
  )
}

export default FilterBar