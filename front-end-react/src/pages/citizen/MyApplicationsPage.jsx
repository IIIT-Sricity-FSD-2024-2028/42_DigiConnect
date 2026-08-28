import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/admin/StatCard';
import ApplicationCard from '../../components/citizen/ApplicationCard';
import Modal from '../../components/common/Modal';
import { getApplications, INITIAL_MOCK_APPLICATIONS } from '../../services/api';
import '../../styles/applications.css';

function FilterBar({ searchTerm, selectedStatus, onSearchChange, onStatusChange }) {
  const statuses = ['all', 'submitted', 'under-review', 'query', 'approved', 'rejected'];

  return (
    <div style={{ marginBottom: '20px' }}>
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

// ── Child Component: Application List ──
function ApplicationList({ applications, onSelectApplication, onDownload }) {
  if (applications.length === 0) {
    return <div className="empty-state">No matching applications found.</div>;
  }

  return (
    <div className="apps-grid">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          onSelectApplication={onSelectApplication}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

// ── Parent Container Component ──
export default function MyApplicationsPage({ onNavigate, showNavbar = false }) {
  const currentUser = { id: 'CIT-1001', name: 'Ravi Kumar', role: 'Citizen' };

  // Lifted State
  const [applications, setApplications] = useState(INITIAL_MOCK_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  // Fetch applications from NestJS backend API on mount
  useEffect(() => {
    getApplications().then((data) => {
      if (data && data.length > 0) {
        setApplications(data);
      }
    });
  }, []);

  // Filter applications using lifted search & status states
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || app.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Callbacks for child actions
  const handleDownload = (app) => {
    alert(`Downloading Acknowledgment Slip for: ${app.id} (${app.serviceName})`);
  };

  return (
    <div>
      {/* Optional Standalone Navbar */}
      {showNavbar && <Navbar user={currentUser} />}

      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track and manage all your civic service requests in one place.</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('track-application')}
            >
              🔍 Track Status
            </button>
          )}
        </div>

        {/* 1. Stat Cards Summary Strip */}
        <div className="summary-strip">
          <StatCard label="Total" value={applications.length} type="all" active={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')} />
          <StatCard label="Under Review" value={applications.filter((a) => a.status === 'under-review').length} type="under-review" active={selectedStatus === 'under-review'} onClick={() => setSelectedStatus('under-review')} />
          <StatCard label="Query Raised" value={applications.filter((a) => a.status === 'query').length} type="query" active={selectedStatus === 'query'} onClick={() => setSelectedStatus('query')} />
          <StatCard label="Approved" value={applications.filter((a) => a.status === 'approved').length} type="approved" active={selectedStatus === 'approved'} onClick={() => setSelectedStatus('approved')} />
          <StatCard label="Rejected" value={applications.filter((a) => a.status === 'rejected').length} type="rejected" active={selectedStatus === 'rejected'} onClick={() => setSelectedStatus('rejected')} />
        </div>

        {/* 2. FilterBar with Child-to-Parent Callbacks */}
        <FilterBar
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchTerm}
          onStatusChange={setSelectedStatus}
        />

        <div className="table-meta">
          <div className="table-count">
            Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> applications
          </div>
        </div>

        {/* 3. Application List using Props & Callbacks */}
        <ApplicationList
          applications={filteredApplications}
          onSelectApplication={setSelectedApp}
          onDownload={handleDownload}
        />

        {/* 4. Modal Component for Details */}
        <Modal
          isOpen={Boolean(selectedApp)}
          title={selectedApp ? `${selectedApp.serviceName} (${selectedApp.id})` : ''}
          onClose={() => setSelectedApp(null)}
          footer={
            <button type="button" className="btn btn-outline" onClick={() => setSelectedApp(null)}>
              Close
            </button>
          }
        >
          {selectedApp && (
            <div>
              <p><strong>Department:</strong> {selectedApp.dept}</p>
              <p><strong>Status:</strong> {selectedApp.status.toUpperCase()}</p>
              <p><strong>Submitted Date:</strong> {new Date(selectedApp.submittedDate).toLocaleDateString()}</p>
              <p><strong>Remarks:</strong> {selectedApp.remarks || 'Application is under active processing.'}</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
