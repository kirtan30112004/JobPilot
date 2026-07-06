import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import companyService from '../services/companyService'
import CompaniesTable from '../components/CompaniesTable'
import CompanyFormModal from '../components/CompanyFormModal'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { SectionLoader } from '../components/Loader'
import {
  PlusIcon, AlertCircleIcon, EditIcon, ExternalLinkIcon, MapPinIcon,
  BriefcaseIcon, Users2Icon, UserIcon,
} from '../components/Icons'
import { showSuccess, showError, showDeleteSuccess } from '../utils/toast'

const LIMIT = 10

/**
 * CompanyDetailModal — read-only "View" modal for a single company.
 * Fetches full company details (including jobsCount) on open.
 */
function CompanyDetailModal({ companyId, onClose, onEdit }) {
  const [company, setCompany] = useState(null)
  const [jobsCount, setJobsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!companyId) return

    let active = true
    setIsLoading(true)
    setError('')

    companyService.getById(companyId)
      .then((res) => {
        if (!active) return
        setCompany(res.data.data.company)
        setJobsCount(res.data.data.jobsCount ?? 0)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load company')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [companyId])

  return (
    <Modal
      isOpen={!!companyId}
      onClose={onClose}
      title={company?.name || 'Company details'}
      subtitle={company?.industry || undefined}
      size="lg"
      footer={
        company && (
          <>
            <button onClick={onClose} className="btn-ghost py-2 px-4 text-sm">Close</button>
            <button onClick={() => onEdit(company)} className="btn-primary py-2 px-4 text-sm">
              <EditIcon width={15} height={15} />
              Edit company
            </button>
          </>
        )
      }
    >
      {isLoading && <SectionLoader message="Loading company..." />}

      {error && !isLoading && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon width={14} height={14} /></span>
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {company && !isLoading && (
        <div className="space-y-5">
          {/* Header card */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white shrink-0">
              {company.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold text-white truncate">{company.name}</h3>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                  <ExternalLinkIcon width={13} height={13} />
                </a>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-center">
              <p className="font-display text-xl font-bold text-violet-400">{jobsCount}</p>
              <p className="text-2xs text-slate-500 uppercase tracking-wider mt-0.5">Applications</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-center">
              <p className="font-display text-xl font-bold text-cyan-400">{company.recruiters?.length || 0}</p>
              <p className="text-2xs text-slate-500 uppercase tracking-wider mt-0.5">Recruiters</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-center flex flex-col items-center justify-center">
              {company.size ? (
                <span className="badge bg-slate-700 text-slate-300">{company.size}</span>
              ) : (
                <span className="text-slate-600 text-xs">—</span>
              )}
              <p className="text-2xs text-slate-500 uppercase tracking-wider mt-1.5">Size</p>
            </div>
          </div>

          {/* Location / Industry */}
          {(company.location || company.industry) && (
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              {company.location && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon width={15} height={15} className="text-slate-500" />
                  {company.location}
                </span>
              )}
              {company.industry && (
                <span className="flex items-center gap-1.5">
                  <BriefcaseIcon width={15} height={15} className="text-slate-500" />
                  {company.industry}
                </span>
              )}
            </div>
          )}

          {/* Recruiters */}
          {company.recruiters && company.recruiters.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                <Users2Icon width={14} height={14} />
                Recruiter contacts
              </h4>
              <div className="space-y-2.5">
                {company.recruiters.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <UserIcon width={15} height={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100">{r.name || 'Unnamed contact'}</p>
                      {r.designation && <p className="text-xs text-slate-500">{r.designation}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        {r.email && <span className="text-xs text-cyan-400">{r.email}</span>}
                        {r.phone && <span className="text-xs text-slate-400">{r.phone}</span>}
                        {r.linkedIn && (
                          <a href={r.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {company.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{company.notes}</p>
            </div>
          )}

          {/* Link to filtered applications */}
          {jobsCount > 0 && (
            <Link
              to="/jobs"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors py-2 border-t border-slate-800 pt-4"
            >
              <BriefcaseIcon width={15} height={15} />
              View {jobsCount} linked application{jobsCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}
    </Modal>
  )
}

/**
 * Companies — full CRUD page for company records.
 *
 * Composes CompaniesTable, CompanyFormModal, CompanyDetailModal,
 * SearchBar, Pagination, and ConfirmDialog around companyService
 * (wrapping /api/companies).
 */
function Companies() {
  // ── List state ────────────────────────────────────────────
  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── Search ─────────────────────────────────────────────────
  const [search, setSearch] = useState('')

  // ── Form modal state ──────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  // ── View modal state ──────────────────────────────────────
  const [viewCompanyId, setViewCompanyId] = useState(null)

  // ── Delete confirm state ───────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasActiveFilters = Boolean(search)

  // ── Fetch companies ─────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true)
    setListError('')

    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search

      const res = await companyService.getAll(params)
      setCompanies(res.data.data.companies)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setListError(err.message || 'Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // ── Search handler ───────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setPage(1)
  }

  // ── Form open/close ──────────────────────────────────────────
  const openCreateForm = () => {
    setEditingCompany(null)
    setIsFormOpen(true)
  }

  const openEditForm = (company) => {
    setEditingCompany(company)
    setIsFormOpen(true)
    setViewCompanyId(null) // close view modal if open
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCompany(null)
  }

  // ── Create / Update submit ───────────────────────────────────
  const handleFormSubmit = async (id, payload) => {
    if (id) {
      await companyService.update(id, payload)
      showSuccess('Company updated successfully')
    } else {
      await companyService.create(payload)
      showSuccess('Company added successfully')
    }
    setIsFormOpen(false)
    setEditingCompany(null)
    fetchCompanies()
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      await companyService.delete(deleteTarget._id)
      showDeleteSuccess(`"${deleteTarget.name}" deleted successfully`)
      setDeleteTarget(null)

      if (companies.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchCompanies()
      }
    } catch (err) {
      const message = err.message || 'Failed to delete company'
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Companies</h1>
          <p className="text-slate-400 text-sm">
            {total} compan{total !== 1 ? 'ies' : 'y'} on your radar
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary shrink-0">
          <PlusIcon />
          Add company
        </button>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="mb-5">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search companies by name..."
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
      <CompaniesTable
        data={companies}
        isLoading={isLoading}
        onView={(c) => setViewCompanyId(c._id)}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        emptyAction={{ hasActiveFilters, onCreate: openCreateForm }}
      />

      {!isLoading && companies.length > 0 && (
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      <CompanyFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        company={editingCompany}
      />

      {/* ── View Modal ───────────────────────────────────────────── */}
      {viewCompanyId && (
        <CompanyDetailModal
          companyId={viewCompanyId}
          onClose={() => setViewCompanyId(null)}
          onEdit={openEditForm}
        />
      )}

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete company?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.name}". Any linked applications will be unlinked but not deleted.`
            : ''
        }
        confirmLabel="Delete company"
      />
    </div>
  )
}

export default Companies