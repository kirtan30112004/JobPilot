import React, { useState, useEffect, useCallback } from 'react'
import reminderService from '../services/reminderService'
import applicationService from '../services/applicationService'
import RemindersTable from '../components/RemindersTable'
import ReminderFormModal from '../components/ReminderFormModal'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon, AlertCircleIcon, BellIcon, ClockIcon } from '../components/Icons'
import { REMINDER_TYPES, PRIORITIES } from '../utils/constants'
import { showSuccess, showError, showDeleteSuccess } from '../utils/toast'

const LIMIT = 10

/**
 * NotificationBadge — clickable summary pill showing overdue / due-soon
 * reminder counts. Acts as a quick filter for the table below.
 *
 * @param {number} count
 * @param {boolean} isActive
 * @param {Function} onClick
 * @param {'overdue'|'upcoming'} variant
 */
function NotificationBadge({ count, isActive, onClick, variant }) {
  const isOverdueVariant = variant === 'overdue'

  const baseClasses = 'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-150'
  const activeClasses = isOverdueVariant
    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
  const inactiveClasses = 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {isOverdueVariant ? <AlertCircleIcon width={15} height={15} /> : <ClockIcon width={15} height={15} />}
      <span>{count}</span>
      <span className="hidden sm:inline font-normal">
        {isOverdueVariant ? 'overdue' : 'due soon'}
      </span>
      {count > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${isOverdueVariant ? 'bg-rose-400' : 'bg-amber-400'} animate-pulse-slow`} />
      )}
    </button>
  )
}

/**
 * Reminders — full CRUD page for follow-up & deadline reminders.
 *
 * Composes RemindersTable, ReminderFormModal, FilterBar, Pagination,
 * ConfirmDialog, and a notification-badge summary around
 * reminderService (wrapping /api/reminders).
 */
function Reminders() {
  // ── List state ────────────────────────────────────────────
  const [reminders, setReminders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── Notification badge counts ────────────────────────────
  const [notifCounts, setNotifCounts] = useState({ overdue: 0, dueSoon: 0 })
  const [isLoadingNotif, setIsLoadingNotif] = useState(true)

  // ── Filters ──────────────────────────────────────────────
  const [filters, setFilters] = useState({ status: 'all', type: 'all', priority: 'all' })
  const [quickFilter, setQuickFilter] = useState('none') // 'none' | 'overdue' | 'upcoming'

  // ── Jobs (for the form's "linked application" dropdown) ────
  const [jobs, setJobs] = useState([])

  // ── Form modal state ──────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)

  // ── Delete confirm state ───────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Toggle-complete loading state ───────────────────────────
  const [togglingId, setTogglingId] = useState(null)

  const hasActiveFilters =
    filters.status !== 'all' || filters.type !== 'all' || filters.priority !== 'all' || quickFilter !== 'none'

  // ── Fetch notification counts ────────────────────────────────
  const fetchNotifCounts = useCallback(async () => {
    setIsLoadingNotif(true)
    try {
      const counts = await reminderService.getNotificationCount(3)
      setNotifCounts({ overdue: counts.overdue, dueSoon: counts.dueSoon })
    } catch {
      // Notification counts are non-critical — fail silently
    } finally {
      setIsLoadingNotif(false)
    }
  }, [])

  // ── Fetch reminders ───────────────────────────────────────────
  const fetchReminders = useCallback(async () => {
    setIsLoading(true)
    setListError('')

    try {
      const params = { page, limit: LIMIT }

      if (filters.status === 'Active') params.isCompleted = false
      if (filters.status === 'Completed') params.isCompleted = true
      if (filters.type !== 'all') params.type = filters.type
      if (filters.priority !== 'all') params.priority = filters.priority

      if (quickFilter === 'overdue') {
        params.overdue = true
      } else if (quickFilter === 'upcoming') {
        params.upcoming = 3
      }

      const res = await reminderService.getAll(params)
      setReminders(res.data.data.reminders)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setListError(err.message || 'Failed to load reminders')
    } finally {
      setIsLoading(false)
    }
  }, [page, filters, quickFilter])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  useEffect(() => {
    fetchNotifCounts()
  }, [fetchNotifCounts])

  // Fetch jobs once for the form's linked-application dropdown
  useEffect(() => {
    applicationService.getAll({ limit: 100, isArchived: false, sortBy: 'jobTitle', sortOrder: 'asc' })
      .then((res) => setJobs(res.data.data.jobs))
      .catch(() => setJobs([]))
  }, [])

  // ── Filter handlers ────────────────────────────────────────────
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({ status: 'all', type: 'all', priority: 'all' })
    setQuickFilter('none')
    setPage(1)
  }

  const toggleQuickFilter = (variant) => {
    setQuickFilter((prev) => (prev === variant ? 'none' : variant))
    setPage(1)
  }

  // ── Form open/close ──────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingReminder(null)
    setIsFormOpen(true)
  }

  const openEditForm = (reminder) => {
    setEditingReminder(reminder)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingReminder(null)
  }

  // ── Create / Update submit ───────────────────────────────────────
  const handleFormSubmit = async (id, payload) => {
    if (id) {
      await reminderService.update(id, payload)
      showSuccess('Reminder updated successfully')
    } else {
      await reminderService.create(payload)
      showSuccess('Reminder added successfully')
    }
    setIsFormOpen(false)
    setEditingReminder(null)
    fetchReminders()
    fetchNotifCounts()
  }

  // ── Toggle complete ────────────────────────────────────────────────
  const handleToggleComplete = async (reminder) => {
    setTogglingId(reminder._id)
    setListError('')

    const willBeCompleted = !reminder.isCompleted

    // Optimistic update
    setReminders((prev) =>
      prev.map((r) => (r._id === reminder._id ? { ...r, isCompleted: willBeCompleted } : r))
    )

    try {
      await reminderService.toggleComplete(reminder._id)
      showSuccess(willBeCompleted ? 'Reminder marked as completed' : 'Reminder reopened')
      fetchNotifCounts()
    } catch (err) {
      const message = err.message || 'Failed to update reminder'
      setListError(message)
      showError(message)
      // Revert on failure
      setReminders((prev) =>
        prev.map((r) => (r._id === reminder._id ? { ...r, isCompleted: reminder.isCompleted } : r))
      )
    } finally {
      setTogglingId(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      await reminderService.delete(deleteTarget._id)
      showDeleteSuccess(`"${deleteTarget.title}" deleted successfully`)
      setDeleteTarget(null)

      if (reminders.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchReminders()
      }
      fetchNotifCounts()
    } catch (err) {
      const message = err.message || 'Failed to delete reminder'
      setListError(message)
      showError(message)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2.5">
            <BellIcon width={26} height={26} className="text-slate-500" />
            Reminders
          </h1>
          <p className="text-slate-400 text-sm">
            {total} reminder{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary shrink-0">
          <PlusIcon />
          Add reminder
        </button>
      </div>

      {/* ── Notification badges ────────────────────────────── */}
      {!isLoadingNotif && (notifCounts.overdue > 0 || notifCounts.dueSoon > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in">
          <NotificationBadge
            count={notifCounts.overdue}
            variant="overdue"
            isActive={quickFilter === 'overdue'}
            onClick={() => toggleQuickFilter('overdue')}
          />
          <NotificationBadge
            count={notifCounts.dueSoon}
            variant="upcoming"
            isActive={quickFilter === 'upcoming'}
            onClick={() => toggleQuickFilter('upcoming')}
          />
          <span className="text-xs text-slate-600 hidden sm:inline">— click to filter</span>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="mb-5">
        <FilterBar
          filters={[
            { name: 'status', label: 'reminders', options: ['Active', 'Completed'] },
            { name: 'type', label: 'types', options: REMINDER_TYPES },
            { name: 'priority', label: 'priorities', options: PRIORITIES },
          ]}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* ── Error banner ───────────────────────────────────────── */}
      {listError && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
          <p className="text-sm text-rose-300">{listError}</p>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────── */}
      <RemindersTable
        data={reminders}
        isLoading={isLoading}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onToggleComplete={handleToggleComplete}
        togglingId={togglingId}
        emptyAction={{ hasActiveFilters, onCreate: openCreateForm }}
      />

      {!isLoading && reminders.length > 0 && (
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      <ReminderFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        reminder={editingReminder}
        jobs={jobs}
      />

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete reminder?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}".`
            : ''
        }
        confirmLabel="Delete reminder"
      />
    </div>
  )
}

export default Reminders