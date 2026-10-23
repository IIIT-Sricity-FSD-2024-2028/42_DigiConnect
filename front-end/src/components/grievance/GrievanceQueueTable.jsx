import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';

/**
 * Formats date string to concise readable format: "15 Apr 2026".
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

/**
 * Returns badge class and friendly label for grievance status.
 * @param {string} status - Raw status string
 * @returns {Object} { badgeClass, label }
 */
function getGrievanceStatusMeta(status = '') {
  const s = status.toLowerCase().replace(/_/g, '-');
  if (s === 'resolved' || s === 'completed' || s === 'escalated-resolved') {
    return { badgeClass: 'badge-success', label: 'Resolved' };
  }
  if (s === 'escalated') {
    return { badgeClass: 'badge-purple', label: 'Escalated' };
  }
  if (s === 'rejected' || s === 'dismissed') {
    return { badgeClass: 'badge-danger', label: 'Rejected' };
  }
  if (s === 'investigating' || s === 'under-review' || s === 'in-progress' || s === 'under-investigation') {
    return { badgeClass: 'badge-info', label: 'Investigating' };
  }
  return { badgeClass: 'badge-warning', label: 'Open' };
}

/**
 * Returns CSS category tag styling based on category name.
 * @param {string} category - Category string
 * @returns {string} CSS class
 */
function getCategoryTagClass(category = '') {
  const c = category.toLowerCase().replace(/_/g, '-');
  if (c.includes('delay')) return 'cat-delay';
  if (c.includes('reject')) return 'cat-rejection';
  if (c.includes('pay') || c.includes('fee')) return 'cat-payment';
  if (c.includes('misconduct') || c.includes('officer') || c.includes('harass')) return 'cat-misconduct';
  if (c.includes('clarif')) return 'cat-clarification';
  if (c.includes('tech') || c.includes('system') || c.includes('portal')) return 'cat-technical';
  return 'cat-other';
}

function getCategoryLabel(category = '') {
  const c = category.toLowerCase().replace(/_/g, '-');
  if (c.includes('delay')) return 'Service Delay';
  if (c.includes('reject')) return 'Rejection Appeal';
  if (c.includes('pay') || c.includes('fee')) return 'Fee / Payment';
  if (c.includes('misconduct')) return 'Staff Misconduct';
  if (c.includes('clarif')) return 'Clarification Required';
  if (c.includes('tech')) return 'Portal Glitch';
  return category || 'General Grievance';
}

/**
 * GrievanceQueueTable Component
 * Props:
 *   grievances         {Array}    - List of grievance records
 *   onSelectGrievance  {Function} - Optional custom select callback
 */
export default function GrievanceQueueTable({ grievances = [], onSelectGrievance }) {
  const navigate = useNavigate();

  // [State] Filter & search controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // [Callback] Navigate to grievance detail page
  const handleViewDetail = (grievance) => {
    if (onSelectGrievance) {
      onSelectGrievance(grievance);
    } else {
      navigate(`/grievance/detail/${grievance.id}`);
    }
  };

  // Filter grievances based on search query (ID, citizen name, subject) and status
  const filteredGrievances = grievances.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    const idMatch = (g.id || '').toLowerCase().includes(q);
    const citizenMatch = (g.citizenName || '').toLowerCase().includes(q);
    const subjectMatch = (g.subject || '').toLowerCase().includes(q);
    const matchesSearch = !q || idMatch || citizenMatch || subjectMatch;

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    const s = (g.status || '').toLowerCase().replace(/_/g, '-');
    if (statusFilter === 'open') {
      return s === 'open' || s === 'submitted' || s === 'investigating' || s === 'under-review';
    }
    if (statusFilter === 'escalated') {
      return s === 'escalated';
    }
    if (statusFilter === 'resolved') {
      return s === 'resolved' || s === 'escalated-resolved' || s === 'completed';
    }
    return true;
  });

  return (
    <div className="card">
      {/* ── Card Header with Filters ── */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
        }}
      >
        <div>
          <span className="card-title">Grievance Redressal Queue</span>
          <span className="badge badge-info" style={{ marginLeft: '8px' }}>
            {filteredGrievances.length} {filteredGrievances.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Cases' },
            { key: 'open', label: 'Open / In-Progress' },
            { key: 'escalated', label: 'Escalated' },
            { key: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(tab.key)}
              style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          padding: 'var(--space-md) var(--space-xl)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--slate-50)',
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <SearchBar
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          placeholder="Search by Grievance ID, Citizen Name, or Subject..."
        />
      </div>

      {/* ── Table Content ── */}
      <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
        {filteredGrievances.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-2xl) var(--space-md)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
              No grievances found
            </div>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter selection.'
                : 'There are currently no grievances assigned to this queue.'}
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Citizen Details</th>
                <th>Subject &amp; Category</th>
                <th>Priority</th>
                <th>SLA Status</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances.map((g) => {
                const statusMeta = getGrievanceStatusMeta(g.status);
                const priority = (g.priority || 'medium').toLowerCase();
                const sla = (g.slaStatus || 'safe').toLowerCase();

                return (
                  <tr
                    key={g.id}
                    onClick={() => handleViewDetail(g)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Grievance ID */}
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          color: 'var(--navy-600)',
                        }}
                      >
                        {g.id}
                      </span>
                      {g.relatedAppId && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          App: {g.relatedAppId}
                        </div>
                      )}
                    </td>

                    {/* Citizen Details */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                        {g.citizenName || 'Citizen'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {g.citizenId || g.jurisdiction || '—'}
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td style={{ maxWidth: '280px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--navy-900)',
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px',
                        }}
                        title={g.subject}
                      >
                        {g.subject || 'Complaint Subject'}
                      </div>
                      {g.category && (
                        <span className={`category-tag ${getCategoryTagClass(g.category)}`}>
                          {getCategoryLabel(g.category)}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={`priority-dot ${
                            priority === 'high'
                              ? 'priority-high'
                              : priority === 'low'
                              ? 'priority-low'
                              : 'priority-medium'
                          }`}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            display: 'inline-block',
                            background:
                              priority === 'high'
                                ? 'var(--red-500)'
                                : priority === 'low'
                                ? 'var(--green-500)'
                                : 'var(--amber-400)',
                          }}
                        ></span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            color:
                              priority === 'high'
                                ? 'var(--red-600)'
                                : priority === 'low'
                                ? 'var(--green-700)'
                                : 'var(--amber-700)',
                          }}
                        >
                          {priority}
                        </span>
                      </div>
                    </td>

                    {/* SLA Status */}
                    <td>
                      <span
                        className={`sla-text ${sla}`}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color:
                            sla === 'breach'
                              ? 'var(--red-500)'
                              : sla === 'warn'
                              ? 'var(--amber-600)'
                              : 'var(--green-600)',
                        }}
                      >
                        {sla === 'breach' ? '⚠ Breach' : sla === 'warn' ? '⏳ At Risk' : '✓ Safe'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Filed Date */}
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(g.filedDate || g.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(g);
                        }}
                      >
                        Inspect →
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
