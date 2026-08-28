import React, { useState, useEffect } from 'react';
import { getApplications, INITIAL_MOCK_APPLICATIONS } from '../../services/api';
import '../../styles/applications.css';

// ============================================================================
// Lab 2 React: Member 1 - My Applications Page
// 
// Component Tree:
// <ApplicationsPage> (Parent / Container - Holds Lifted State)
//   ├── <Navbar user={currentUser} />
//   ├── <ApplicationStats stats={statsData} />
//   ├── <FilterBar searchTerm={searchTerm} selectedStatus={selectedStatus} 
//   │              onSearchChange={handleSearch} onStatusChange={handleStatusFilter} />
//   └── <ApplicationList applications={filteredApplications} 
//                        onSelectApplication={handleSelect} onDownload={handleDownload} >
//         └── <ApplicationCard application={app} ... />
//
// Concepts Used:
// 1. Props: Passing data (user, stats, applications list, single application) down to children.
// 2. Callbacks: Child components trigger parent state updates (onSearchChange, onStatusChange, onDownload).
// 3. Lifted State: 'searchTerm', 'selectedStatus', and 'applications' are stored in <ApplicationsPage>.
// ============================================================================

// ── 1. NAVBAR COMPONENT ──
// Receives: user prop from parent
export function Navbar({ user }) {
  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <div className="brand-logo-badge">🏛️</div>
        <div className="brand-text">
          <h1>DigiConnect</h1>
          <span>Citizen Portal</span>
        </div>
      </div>
      <div className="navbar-right">
        <div className="user-profile-tag">
          <span className="user-avatar">{user.name.charAt(0)}</span>
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
}

// ── 2. APPLICATION STATS COMPONENT ──
// Receives: stats prop (computed summary numbers)
export function ApplicationStats({ stats }) {
  return (
    <div className="summary-strip">
      <div className="summary-chip chip-all">
        <div className="summary-chip-val">{stats.total}</div>
        <div className="summary-chip-label">Total</div>
      </div>
      <div className="summary-chip chip-pending">
        <div className="summary-chip-val">{stats.underReview}</div>
        <div className="summary-chip-label">Under Review</div>
      </div>
      <div className="summary-chip chip-query">
        <div className="summary-chip-val">{stats.query}</div>
        <div className="summary-chip-label">Query Raised</div>
      </div>
      <div className="summary-chip chip-approved">
        <div className="summary-chip-val">{stats.approved}</div>
        <div className="summary-chip-label">Approved</div>
      </div>
      <div className="summary-chip chip-rejected">
        <div className="summary-chip-val">{stats.rejected}</div>
        <div className="summary-chip-label">Rejected</div>
      </div>
    </div>
  );
}

// ── 3. FILTER BAR COMPONENT ──
// Receives: searchTerm, selectedStatus, and child-to-parent callback props
export function FilterBar({ searchTerm, selectedStatus, onSearchChange, onStatusChange }) {
  const statuses = ['all', 'submitted', 'under-review', 'query', 'approved', 'rejected'];

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Filter Pills */}
      <div className="filter-bar">
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-btn ${selectedStatus === st ? 'active' : ''}`}
            onClick={() => onStatusChange(st)}
          >
            {st === 'all' ? 'All' : st.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="search-box">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-box-input"
          placeholder="Search by ID, service name, or department..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── 4. APPLICATION CARD COMPONENT ──
// Receives: application object, onDownload, and onSelectApplication callbacks
export function ApplicationCard({ application, onDownload, onSelectApplication }) {
  return (
    <div className="app-card">
      <div className="app-card-header">
        <div className="app-card-meta">
          <div className="app-card-id">{application.id}</div>
          <div className="app-card-title">{application.serviceName}</div>
          <div className="app-card-dept">{application.dept}</div>
        </div>
        <span className={`status-badge status-${application.status}`}>
          {application.status.toUpperCase()}
        </span>
      </div>

      <div className="app-card-body">
        <div className="app-card-row">
          <span className="app-card-label">Submitted:</span>
          <span className="app-card-value">
            {new Date(application.submittedDate).toLocaleDateString()}
          </span>
        </div>
        <div className="app-card-row">
          <span className="app-card-label">Officer:</span>
          <span className="app-card-value">{application.officerName || 'Under Review'}</span>
        </div>
      </div>

      <div className="app-card-footer">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onSelectApplication(application)}
        >
          View Details
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onDownload(application)}
        >
          Download Slip
        </button>
      </div>
    </div>
  );
}

// ── 5. APPLICATION LIST COMPONENT ──
// Receives: applications array (filtered data from parent)
export function ApplicationList({ applications, onDownload, onSelectApplication }) {
  if (applications.length === 0) {
    return <div className="empty-state">No matching applications found.</div>;
  }

  return (
    <div className="apps-grid">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          onDownload={onDownload}
          onSelectApplication={onSelectApplication}
        />
      ))}
    </div>
  );
}

// ── 6. MAIN PARENT COMPONENT (<ApplicationsPage>) ──
// Holds Lifted State and coordinates all child components
export default function ApplicationsPage() {
  // Current user state
  const currentUser = { id: 'CIT-1001', name: 'Ravi Kumar', role: 'Citizen' };

  // Lifted State
  const [applications, setApplications] = useState(INITIAL_MOCK_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  // Fetch from NestJS API on load (with safe fallback)
  // ponytail: Simple fetch on mount; ceiling is no real-time socket updates; upgrade path is React Query / SWR.
  useEffect(() => {
    getApplications().then((data) => {
      if (data && data.length > 0) {
        setApplications(data);
      }
    });
  }, []);

  // Child-to-Parent Callback Handlers
  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleSelect = (app) => {
    setSelectedApp(app);
  };

  const handleDownload = (app) => {
    alert(`Downloaded Acknowledgment Slip for ${app.id} - ${app.serviceName}`);
  };

  // Filter applications based on lifted state
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || app.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics from current applications
  const statsData = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === 'under-review').length,
    query: applications.filter((a) => a.status === 'query').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div>
      {/* Navbar Component */}
      <Navbar user={currentUser} />

      <main className="app-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track and manage all your civic service requests.</p>
          </div>
        </div>

        {/* 1. ApplicationStats (Passes computed stats via props) */}
        <ApplicationStats stats={statsData} />

        {/* 2. FilterBar (Passes lifted state and callback functions via props) */}
        <FilterBar
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusFilter}
        />

        <div className="table-meta">
          <div className="table-count">
            Showing <strong>{filteredApplications.length}</strong> of{' '}
            <strong>{applications.length}</strong> applications
          </div>
        </div>

        {/* 3. ApplicationList (Passes filtered data and action callbacks via props) */}
        <ApplicationList
          applications={filteredApplications}
          onDownload={handleDownload}
          onSelectApplication={handleSelect}
        />

        {/* Simple Details Popup */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{selectedApp.serviceName} ({selectedApp.id})</h3>
                <button className="modal-close" onClick={() => setSelectedApp(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p><strong>Department:</strong> {selectedApp.dept}</p>
                <p><strong>Status:</strong> {selectedApp.status.toUpperCase()}</p>
                <p><strong>Submitted Date:</strong> {new Date(selectedApp.submittedDate).toLocaleDateString()}</p>
                <p><strong>Remarks:</strong> {selectedApp.remarks || 'Under processing.'}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedApp(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
