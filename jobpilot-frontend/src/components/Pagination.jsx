import React from 'react'

// ── Icons ────────────────────────────────────────────────────
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

/**
 * buildPageRange — builds the array of page numbers / ellipsis
 * markers to render. Keeps the current page centred and never
 * shows more than `windowSize` consecutive numbers.
 *
 * e.g. pages=10, page=5, windowSize=5 → [1, '…', 3, 4, 5, 6, 7, '…', 10]
 */
function buildPageRange(page, pages, windowSize = 5) {
  if (pages <= windowSize + 2) {
    return Array.from({ length: pages }, (_, i) => i + 1)
  }

  const half = Math.floor(windowSize / 2)
  let start = Math.max(2, page - half)
  let end = Math.min(pages - 1, page + half)

  // Slide the window so it always shows `windowSize` numbers
  if (end - start + 1 < windowSize) {
    if (start === 2) {
      end = Math.min(pages - 1, start + windowSize - 1)
    } else {
      start = Math.max(2, end - windowSize + 1)
    }
  }

  const range = []

  range.push(1)
  if (start > 2) range.push('…left')

  for (let i = start; i <= end; i++) range.push(i)

  if (end < pages - 1) range.push('…right')
  range.push(pages)

  return range
}

/**
 * Pagination
 *
 * Props (matching the call-sites in Applications, Companies,
 * Interviews, and Reminders pages):
 *
 * @param {number}   page         - current 1-based page number
 * @param {number}   pages        - total number of pages
 * @param {number}   total        - total record count (used for "Showing X – Y of Z")
 * @param {Function} onPageChange - called with the new page number
 * @param {number}   [limit=10]   - records per page (for the label calculation)
 */
function Pagination({ page, pages, total, onPageChange, limit = 10 }) {
  if (!pages || pages <= 1) return null

  const pageRange = buildPageRange(page, pages)

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const handlePrev = () => { if (page > 1) onPageChange(page - 1) }
  const handleNext = () => { if (page < pages) onPageChange(page + 1) }

  // ── Shared button styles ──────────────────────────────────
  const baseBtn =
    'inline-flex items-center justify-center h-8 min-w-[2rem] px-1.5 rounded-lg text-sm font-medium transition-all duration-150 select-none'

  const numberBtn = (isActive) =>
    isActive
      ? `${baseBtn} bg-violet-600 text-white shadow-glow-violet cursor-default`
      : `${baseBtn} text-slate-400 hover:text-slate-100 hover:bg-slate-800`

  const arrowBtn = (disabled) =>
    disabled
      ? `${baseBtn} text-slate-700 cursor-not-allowed`
      : `${baseBtn} text-slate-400 hover:text-slate-100 hover:bg-slate-800`

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/60">
      {/* Record range label */}
      <p className="text-xs text-slate-500 shrink-0">
        Showing <span className="font-semibold text-slate-300">{from}</span>–
        <span className="font-semibold text-slate-300">{to}</span> of{' '}
        <span className="font-semibold text-slate-300">{total}</span>
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={arrowBtn(page === 1)}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {/* Page numbers */}
        {pageRange.map((item, idx) => {
          if (item === '…left' || item === '…right') {
            return (
              <span
                key={item}
                className="inline-flex items-center justify-center h-8 w-7 text-slate-600 text-sm select-none"
              >
                …
              </span>
            )
          }

          const isActive = item === page

          return (
            <button
              key={`page-${item}`}
              onClick={() => !isActive && onPageChange(item)}
              className={numberBtn(isActive)}
              aria-label={`Page ${item}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          )
        })}

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={page === pages}
          className={arrowBtn(page === pages)}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

export default Pagination