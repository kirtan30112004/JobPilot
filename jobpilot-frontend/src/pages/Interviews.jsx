import React, { useState, useEffect, useCallback } from 'react'
import interviewService from '../services/interviewService'
import applicationService from '../services/applicationService'
import InterviewsTable from '../components/InterviewsTable'
import InterviewFormModal from '../components/InterviewFormModal'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon, AlertCircleIcon, CalendarIcon } from '../components/icons'
import { INTERVIEW_TYPES, INTERVIEW_STATUSES } from '../utils/constants'
import { showSuccess, showError, showDeleteSuccess } from '../utils/toast'

const LIMIT = 10

/**
 * Interviews — full CRUD page for interview scheduling and tracking.
 *
 * Composes InterviewsTable, InterviewFormModal, FilterBar,
 * Pagination, and ConfirmDialog around interviewService
 * (wrapping /api/interviews).
 */
function Interviews() {
  // ── List state ────────────────────────────────────────────
  const [interviews, setInterviews] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── Filters ──────────────────────────────────────────────
  const [filters, setFilters] = useState({ status: 'all', type: 'all', upcoming: 'all' })

  // ── Jobs (for the form's "application" dropdown) ───────────
  const [jobs, setJobs] = useState([])

  // ── Form modal state ──────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)

  // ── Delete confirm state ───────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Status update error (surfaced via list error banner) ────
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  const hasActiveFilters =
    filters.status !== 'all' || filters.type !== 'all' || filters.upcoming !== 'all'

  // ── Fetch interviews ──────────────────────────────────────────
  const fetchInterviews = useCallback(async () => {
    setIsLoading(true)
    setListError('')

    try {
      const params = { page, limit: LIMIT }
      if (filters.status !== 'all') params.status = filters.status
      if (filters.type !== 'all') params.type = filters.type
      if (filters.upcoming === 'Upcoming') params.upcoming = true

      const res = await interviewService.getAll(params)
      setInterviews(res.data.data.interviews)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setListError(err.message || 'Failed to load interviews')
    } finally {
      setIsLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  // Fetch jobs once for the form's application dropdown
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
    setFilters({ status: 'all', type: 'all', upcoming: 'all' })
    setPage(1)
  }

  // ── Form open/close ──────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingInterview(null)
    setIsFormOpen(true)
  }

  const openEditForm = (interview) => {
    setEditingInterview(interview)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingInterview(null)
  }

  // ── Create / Update submit ───────────────────────────────────────
  const handleFormSubmit = async (id, payload) => {
    if (id) {
      await interviewService.update(id, payload)
      showSuccess('Interview updated successfully')
    } else {
      await interviewService.create(payload)
      showSuccess('Interview scheduled successfully')
    }
    setIsFormOpen(false)
    setEditingInterview(null)
    fetchInterviews()
  }

  // ── Quick status change from table dropdown ──────────────────────
  const handleStatusChange = async (interview, newStatus) => {
    if (newStatus === interview.status) return

    setStatusUpdatingId(interview._id)
    setListError('')

    // Optimistic update
    setInterviews((prev) =>
      prev.map((i) => (i._id === interview._id ? { ...i, status: newStatus } : i))
    )

    try {
      await interviewService.updateStatus(interview._id, newStatus)
      showSuccess(`Status updated to "${newStatus}"`)
    } catch (err) {
      const message = err.message || 'Failed to update interview status'
      setListError(message)
      showError(message)
      // Revert on failure
      setInterviews((prev) =>
        prev.map((i) => (i._id === interview._id ? { ...i, status: interview.status } : i))
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      await interviewService.delete(deleteTarget._id)
      showDeleteSuccess(`"${deleteTarget.title}" deleted successfully`)
      setDeleteTarget(null)

      if (interviews.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchInterviews()
      }
    } catch (err) {
      const message = err.message || 'Failed to delete interview'
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Interviews</h1>
          <p className="text-slate-400 text-sm">
            {total} interview{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary shrink-0" disabled={jobs.length === 0 && !isLoading}>
          <PlusIcon />
          Schedule interview
        </button>
      </div>

      {/* ── No-jobs hint ────────────────────────────────────── */}
      {!isLoading && jobs.length === 0 && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-amber-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
          <p className="text-sm text-amber-200">
            You need at least one job application before you can schedule an interview. Add one from the Applications page first.
          </p>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="mb-5">
        <FilterBar
          filters={[
            { name: 'status', label: 'statuses', options: INTERVIEW_STATUSES },
            { name: 'type', label: 'types', options: INTERVIEW_TYPES },
            { name: 'upcoming', label: 'dates', options: ['Upcoming'] },
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
      <InterviewsTable
        data={interviews}
        isLoading={isLoading}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onStatusChange={handleStatusChange}
        emptyAction={{ hasActiveFilters, onCreate: jobs.length > 0 ? openCreateForm : null }}
      />

      {!isLoading && interviews.length > 0 && (
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
      )}

      {/* ── Schedule / Edit Modal ─────────────────────────────────── */}
      <InterviewFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        interview={editingInterview}
        jobs={jobs}
      />

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete interview?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}"${deleteTarget.job ? ` for ${deleteTarget.job.jobTitle} at ${deleteTarget.job.companyName}` : ''}.`
            : ''
        }
        confirmLabel="Delete interview"
      />
    </div>
  )
}

export default Interviews