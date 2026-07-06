import React, { useState, useEffect, useCallback } from 'react'
import applicationService from '../services/applicationService'
import { companyService } from '../services/api'
import ApplicationsTable from '../components/ApplicationsTable'
import ApplicationFormModal from '../components/ApplicationFormModal'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon, AlertCircleIcon } from '../components/icons'
import { JOB_STATUSES, JOB_TYPES, PRIORITIES } from '../utils/constants'
import { showSuccess, showError, showDeleteSuccess } from '../utils/toast'

const LIMIT = 10

/**
 * Applications — full CRUD page for job applications.
 *
 * Composes ApplicationsTable, ApplicationFormModal, SearchBar,
 * FilterBar, Pagination, and ConfirmDialog around the
 * applicationService (wrapping /api/jobs).
 */
function Applications() {
  // ── List state ────────────────────────────────────────────
  const [jobs, setJobs]   = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── Search / filters ──────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'all', jobType: 'all', priority: 'all' })

  // ── Companies (for the form's "linked company" dropdown) ───
  const [companies, setCompanies] = useState([])

  // ── Modal state ──────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  // ── Delete confirm state ──────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasActiveFilters =
    Boolean(search) ||
    filters.status !== 'all' ||
    filters.jobType !== 'all' ||
    filters.priority !== 'all'

  // ── Fetch applications ─────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setListError('')

    try {
      const params = { page, limit: LIMIT, sortBy: 'createdAt', sortOrder: 'desc' }
      if (search) params.search = search
      if (filters.status !== 'all') params.status = filters.status
      if (filters.jobType !== 'all') params.jobType = filters.jobType
      if (filters.priority !== 'all') params.priority = filters.priority

      const res = await applicationService.getAll(params)
      setJobs(res.data.data.jobs)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setListError(err.message || 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, filters])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Fetch companies once for the form's linked-company dropdown
  useEffect(() => {
    companyService.getAll({ limit: 100 })
      .then((res) => setCompanies(res.data.data.companies))
      .catch(() => setCompanies([]))
  }, [])

  // ── Search / filter handlers ────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters({ status: 'all', jobType: 'all', priority: 'all' })
    setPage(1)
  }

  // ── Modal open/close ─────────────────────────────────────────
  const openCreateForm = () => {
    setEditingJob(null)
    setIsFormOpen(true)
  }

  const openEditForm = (job) => {
    setEditingJob(job)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingJob(null)
  }

  // ── Create / Update submit ───────────────────────────────────
  const handleFormSubmit = async (id, payload) => {
    if (id) {
      await applicationService.update(id, payload)
      showSuccess('Application updated successfully')
    } else {
      await applicationService.create(payload)
      showSuccess('Application added successfully')
    }
    setIsFormOpen(false)
    setEditingJob(null)
    fetchJobs()
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      await applicationService.delete(deleteTarget._id)
      showDeleteSuccess(`"${deleteTarget.jobTitle}" deleted successfully`)
      setDeleteTarget(null)

      // Step back a page if we just deleted the last item on this page
      if (jobs.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchJobs()
      }
    } catch (err) {
      const message = err.message || 'Failed to delete application'
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Applications</h1>
          <p className="text-slate-400 text-sm">
            {total} application{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary shrink-0">
          <PlusIcon />
          Add application
        </button>
      </div>

      {/* ── Search + Filters ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search by title, company, or tag..."
        />
        <FilterBar
          filters={[
            { name: 'status', label: 'statuses', options: JOB_STATUSES },
            { name: 'jobType', label: 'types', options: JOB_TYPES },
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
      <ApplicationsTable
        data={jobs}
        isLoading={isLoading}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        emptyAction={{ hasActiveFilters, onCreate: openCreateForm }}
      />

      {!isLoading && jobs.length > 0 && (
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      <ApplicationFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        job={editingJob}
        companies={companies}
      />

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete application?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.jobTitle}" at ${deleteTarget.companyName}, along with any linked interviews and reminders.`
            : ''
        }
        confirmLabel="Delete application"
      />
    </div>
  )
}

export default Applications