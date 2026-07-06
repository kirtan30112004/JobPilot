import React from 'react'

/**
 * Badge — coloured status/label pill used throughout JobPilot for
 * job statuses, interview statuses, reminder types, priorities,
 * company sizes, and inline notification labels.
 *
 * ── Prop API (three compatible call patterns) ─────────────────
 *
 * Pattern 1 — object colors (most common, matches constants.js shape):
 *   <Badge label="Offer" colors={{ text: 'text-emerald-300', bg: 'bg-emerald-500/15', dot: 'bg-emerald-400' }} />
 *   <Badge label="Overdue" colors={{ text: 'text-rose-300', bg: 'bg-rose-500/15' }} dot />
 *
 * Pattern 2 — flat className string (used by RecentActivity's inline Badge):
 *   <Badge label={job.status} className="bg-violet-500/15 text-violet-300" />
 *
 * Pattern 3 — compound (colors object + extra className for overrides):
 *   <Badge label="High" colors={PRIORITY_COLORS.High} className="ml-2" />
 *
 * ── Props ─────────────────────────────────────────────────────
 *
 * @param {string}  label         - text content of the pill
 * @param {{ text?: string, bg?: string, dot?: string }} [colors]
 *                                - tailwind class strings from constants.js;
 *                                  `dot` is the dot indicator colour class
 * @param {boolean} [dot=false]   - when true, renders a coloured dot before
 *                                  the label (uses colors.dot if provided,
 *                                  otherwise derives from colors.text)
 * @param {string}  [className]   - extra or override classes; also accepts a
 *                                  flat "bg-x text-y" string as the sole
 *                                  styling source (RecentActivity pattern)
 * @param {'sm'|'md'} [size='md'] - pill size; 'sm' reduces padding/font-size
 * @param {ReactNode} [icon]      - optional leading icon element
 */
function Badge({
  label,
  colors,
  dot = false,
  className = '',
  size = 'md',
  icon,
}) {
  // ── Resolve colour classes ──────────────────────────────────
  // If `colors` is provided, pull structured classes from it.
  // If only `className` is given (RecentActivity pattern), use it
  // directly as the background + text source — no extra bg/text needed.
  const hasSplitColors = colors && (colors.bg || colors.text)

  const bgClass   = hasSplitColors ? (colors.bg   || 'bg-slate-500/15') : ''
  const textClass = hasSplitColors ? (colors.text  || 'text-slate-300')  : ''
  const dotClass  = hasSplitColors && colors.dot
    ? colors.dot
    : deriveDotClass(textClass)

  // ── Size ────────────────────────────────────────────────────
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-px text-[10px]'
    : 'px-2.5 py-0.5 text-[11px]'

  // ── Compose final className ──────────────────────────────────
  const resolved = [
    'inline-flex items-center gap-1.5',
    'rounded-full font-semibold uppercase tracking-wide whitespace-nowrap',
    sizeClass,
    bgClass,
    textClass,
    className,       // flat or supplemental; wins over defaults if it contains bg-/text-
  ].filter(Boolean).join(' ')

  return (
    <span className={resolved}>
      {/* Optional leading icon */}
      {icon && (
        <span className="shrink-0 -ml-0.5">
          {icon}
        </span>
      )}

      {/* Dot indicator */}
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
        />
      )}

      {label}
    </span>
  )
}

/**
 * Derives a reasonable dot colour class from the text colour class
 * so callers don't have to provide `colors.dot` explicitly for the
 * simple dot-only use-cases in RemindersTable.
 *
 * e.g. 'text-rose-300' → 'bg-rose-400'
 *      'text-amber-300' → 'bg-amber-400'
 *      anything else → 'bg-slate-400'
 */
function deriveDotClass(textClass = '') {
  const match = textClass.match(/text-(\w+)-\d+/)
  if (!match) return 'bg-slate-400'
  const colour = match[1]
  const knownColours = ['cyan','violet','amber','emerald','rose','slate','blue','purple','green','yellow','red']
  if (knownColours.includes(colour)) return `bg-${colour}-400`
  return 'bg-slate-400'
}

export default Badge