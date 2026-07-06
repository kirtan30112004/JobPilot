import React, { useState, useEffect, useRef } from 'react'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/**
 * SearchBar — debounced search input.
 *
 * @param {string} value - controlled value (from parent state)
 * @param {Function} onChange - called with the new debounced value
 * @param {string} placeholder
 * @param {number} debounceMs
 */
function SearchBar({ value, onChange, placeholder = 'Search...', debounceMs = 400 }) {
  const [localValue, setLocalValue] = useState(value || '')
  const debounceRef = useRef(null)

  // Keep local state in sync if parent resets value externally (e.g. "Clear filters")
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleChange = (e) => {
    const next = e.target.value
    setLocalValue(next)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(next)
    }, debounceMs)
  }

  const handleClear = () => {
    setLocalValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onChange('')
  }

  // Cleanup pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="field pl-10 pr-10"
        aria-label="Search"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
          aria-label="Clear search"
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}

export default SearchBar