import React from 'react';
import StatusBadge from '../common/StatusBadge';

// Citizen Application Card Component
export default function ApplicationCard({ application, onSelectApplication, onDownload }) {
  const formattedDate = application.submittedDate
    ? new Date(application.submittedDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className="app-card">
      <div className="app-card-header">
        <div className="app-card-meta">
          <div className="app-card-id">{application.id}</div>
          <div className="app-card-title">{application.serviceName}</div>
          <div className="app-card-dept">{application.dept}</div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="app-card-body">
        <div className="app-card-row">
          <span className="app-card-label">Submitted:</span>
          <span className="app-card-value">{formattedDate}</span>
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
          onClick={() => onSelectApplication && onSelectApplication(application)}
        >
          View Details
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onDownload && onDownload(application)}
        >
          Download Slip
        </button>
      </div>
    </div>
  );
}
