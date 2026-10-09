// src/components/officer/OfficerQueueTable.jsx
// Renders the searchable, filterable, and paginated queue of pending applications.
// Matches the structure from front-end/officer/officer-dashboard.html and dashboard.js.
//
// React Concepts Demonstrated:
//  [Component]     — OfficerQueueTable is a modular, reusable UI container
//  [Props]         — Receives `applications`, `loading`, `error`, `onSelect` from parent
//  [State]         — useState manages serviceFilter, sortBy, currentPage, pageSize
//  [Events]        — onChange (selects), onClick (pagination buttons)
//  [Lists]         — Maps filtered/paginated applications to <OfficerQueueRow /> with unique keys
//  [Hooks]         — useState for UI state, useMemo for performant filtering/sorting, useEffect for reset
//  [Forms]         — Controlled filter dropdown select controls
//  [Context]       — useAuth for officer preferences
//  [Router]        — useNavigate for direct routing
//  [Prop Drilling] — Passes onSelect callback down to child OfficerQueueRow components
//  [Callbacks]     — Triggered when user selects a row or modifies filters

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OfficerQueueRow from './OfficerQueueRow';

// Service options for filter dropdown
const SERVICE_OPTIONS = [
  'All Services',
  'Income Certificate',
  'Caste Certificate',
  'Residence Certificate',
  'Record Correction',
];

// Sort options for order dropdown
const SORT_OPTIONS = [
  { value: 'sla', label: 'Sort: SLA Urgency' },
  { value: 'date', label: 'Sort: Submission Date' },
  { value: 'service', label: 'Sort: Service Type' },
];

export default function OfficerQueueTable({
  applications = [],
  loading = false,
  error = null,
  onSelect,
}) {
  // [Context] Officer info from AuthContext
  const { user } = useAuth();

  // [Router] React Router hook for programmatic navigation
  const navigate = useNavigate();

  // ── [State] Filter, Sort, and Pagination States ──
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('sla');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ── [Hooks] useEffect: Reset to page 1 whenever filters change ──
  useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, sortBy, pageSize]);

  // Helper: SLA urgency calculation (mirrors urgency() in dashboard.js)
  const getUrgency = (a) => {
    if (a.slaLeft < 0) return a.slaLeft; // breaches first (most negative)
    return a.slaLeft;
  };

  // ── [Hooks + Lists] useMemo: Filter and Sort Applications ──
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // 1. Service Category Filter
    if (serviceFilter && serviceFilter !== 'All Services') {
      result = result.filter(
        (app) => (app.service || app.serviceName || '') === serviceFilter
      );
    }

    // 2. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.submittedDate || a.submitted || 0);
        const dateB = new Date(b.submittedDate || b.submitted || 0);
        return dateB - dateA; // newest first
      }
      if (sortBy === 'service') {
        return (a.service || a.serviceName || '').localeCompare(b.service || b.serviceName || '');
      }
      // Default: 'sla' urgency
      return getUrgency(a) - getUrgency(b);
    });

    return result;
  }, [applications, serviceFilter, sortBy]);

  // ── [Lists] Pagination Calculations ──
  const totalCount = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + pageSize
  );

  // ── [Events + Callbacks] Form Handlers ──
  const handleServiceChange = (e) => {
    setServiceFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      const next = prev + direction;
      return Math.max(1, Math.min(next, totalPages));
    });
  };

  return (
    <div className="card">
      {/* ── Card Header: Title & Dropdown Filters directly beside the name ── */}
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span className="card-title" style={{ whiteSpace: 'nowrap' }}>
          Applications Pending Review
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Service Dropdown Filter */}
          <select
            className="form-input"
            value={serviceFilter}
            onChange={handleServiceChange}
            style={{
              width: 'auto',
              fontSize: '0.8rem',
              padding: '6px 28px 6px 10px',
            }}
          >
            {/* [Lists] Render service options */}
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service === 'All Services' ? '' : service}>
                {service}
              </option>
            ))}
          </select>

          {/* Sort Dropdown Filter */}
          <select
            className="form-input"
            value={sortBy}
            onChange={handleSortChange}
            style={{
              width: 'auto',
              fontSize: '0.8rem',
              padding: '6px 28px 6px 10px',
            }}
          >
            {/* [Lists] Render sort options */}
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Queue List Area ── */}
      <div id="queueList">
        {loading ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading applications...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--red-500)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Failed to load queue: {error}</p>
          </div>
        ) : paginatedApplications.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No applications found
          </div>
        ) : (
          /* [Lists + Prop Drilling] Render rows via mapped array */
          paginatedApplications.map((app) => (
            <OfficerQueueRow
              key={app.id}
              application={app}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      {/* ── [Component + Events] Card Footer: Pagination ── */}
      <div
        className="card-footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}
      >
        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Per page:
          </label>
          <select
            className="form-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ width: '70px', padding: '5px 28px 5px 10px', fontSize: '0.8rem' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>

        {/* Count summary */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Showing{' '}
          <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>
            {totalCount === 0
              ? '0'
              : `${startIndex + 1}-${Math.min(startIndex + pageSize, totalCount)}`}
          </span>{' '}
          of{' '}
          <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>
            {totalCount}
          </span>
        </div>

        {/* Current page indicator */}
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Page <span style={{ fontWeight: 700 }}>{safeCurrentPage}</span> of{' '}
          <span style={{ fontWeight: 700 }}>{totalPages}</span>
        </span>

        {/* Prev / Next Pagination Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageChange(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Prev
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handlePageChange(1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Next
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
