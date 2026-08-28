import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { INITIAL_MOCK_APPLICATIONS } from '../../services/api';
import '../../styles/applications.css';

// Receives: placeholder, onSearch callback
function SearchBox({ placeholder = 'Enter Application ID (e.g. APP-2024-0001)', onSearch }) {
    const [inputVal, setInputVal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            onSearch(inputVal.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input
                type="text"
                className="search-box-input"
                placeholder={placeholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
                Track Status
            </button>
        </form>
    );
}

// ── 2. CHILD COMPONENT: APPLICATION SUMMARY ──
// Receives: application object as prop
function ApplicationSummary({ application }) {
    if (!application) return null;

    return (
        <div className="app-card" style={{ marginBottom: '24px' }}>
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
                    <span className="app-card-label">Submitted On:</span>
                    <span className="app-card-value">{new Date(application.submittedDate).toLocaleDateString()}</span>
                </div>
                <div className="app-card-row">
                    <span className="app-card-label">Assigned Officer:</span>
                    <span className="app-card-value">{application.officerName || 'Under Assignment'}</span>
                </div>
            </div>
        </div>
    );
}

// ── 3. NESTED CHILD COMPONENT: TIMELINE STAGE ITEM ──
// Receives: stage object, isActive (boolean), isComplete (boolean)
function TimelineStageItem({ stage, isActive, isComplete }) {
    // Determine styling based on props
    const circleBg = isComplete ? '#22c55e' : isActive ? '#2557a0' : '#e2e8f0';
    const circleColor = isComplete || isActive ? '#ffffff' : '#64748b';
    const textColor = isActive ? '#0f2044' : isComplete ? '#166534' : '#64748b';

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: circleBg,
                    color: circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    marginBottom: '8px',
                }}
            >
                {isComplete ? '✓' : stage.stepNumber}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>{stage.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{stage.date || 'Pending'}</div>
        </div>
    );
}

// ── 4. CHILD COMPONENT: TIMELINE TRACKER ──
// Receives: stages array and currentStageIndex as props
function TimelineTracker({ stages = [], currentStageIndex = 0 }) {
    if (!stages || stages.length === 0) return null;

    return (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: '#0f2044' }}>
                Progress Tracker
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {stages.map((stage, idx) => (
                    <TimelineStageItem
                        key={idx}
                        stage={stage}
                        isActive={idx === currentStageIndex}
                        isComplete={idx < currentStageIndex}
                    />
                ))}
            </div>
        </div>
    );
}

// ── 5. CHILD COMPONENT: ACTION DETAILS & REMARKS ──
// Receives: remarks string as prop
function ActionDetails({ remarks }) {
    return (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                Officer Remarks & Next Steps
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                {remarks || 'No additional remarks from the verification officer at this stage.'}
            </p>
        </div>
    );
}

// ── 6. PARENT CONTAINER COMPONENT ──
// Holds Lifted State: searchId and foundApp (activeApplicationData)
export default function TrackApplicationPage() {
    const currentUser = { id: 'CIT-1001', name: 'Ravi Kumar', role: 'Citizen' };

    // Sample stage template helper
    const buildStages = (status, date) => [
        { stepNumber: 1, title: 'Submitted', date: new Date(date).toLocaleDateString() },
        { stepNumber: 2, title: 'Verification', date: status !== 'submitted' ? 'Completed' : 'In Progress' },
        { stepNumber: 3, title: 'Officer Review', date: status === 'approved' || status === 'query' ? 'Completed' : 'Pending' },
        { stepNumber: 4, title: 'Decision', date: status === 'approved' ? 'Approved' : 'Pending' },
    ];

    const getStageIndex = (status) => {
        if (status === 'approved' || status === 'rejected') return 4;
        if (status === 'query') return 2;
        if (status === 'under-review') return 2;
        return 1;
    };

    // Prepare initial application data with stages
    const initialApp = INITIAL_MOCK_APPLICATIONS[0];
    const formattedInitialApp = {
        ...initialApp,
        officerRemarks: initialApp.remarks,
        stages: buildStages(initialApp.status, initialApp.submittedDate),
        currentStage: getStageIndex(initialApp.status),
    };

    // Lifted State
    const [searchId, setSearchId] = useState(initialApp.id);
    const [foundApp, setFoundApp] = useState(formattedInitialApp);
    const [notFound, setNotFound] = useState(false);

    // Child-to-Parent Callback Handler
    const handleSearchApplication = (enteredId) => {
        setSearchId(enteredId);
        const match = INITIAL_MOCK_APPLICATIONS.find(
            (a) => a.id.toLowerCase() === enteredId.toLowerCase()
        );

        if (match) {
            setFoundApp({
                ...match,
                officerRemarks: match.remarks,
                stages: buildStages(match.status, match.submittedDate),
                currentStage: getStageIndex(match.status),
            });
            setNotFound(false);
        } else {
            setFoundApp(null);
            setNotFound(true);
        }
    };

    return (
        <div>
            {/* 1. Common Navbar */}
            <Navbar user={currentUser} />

            <main className="app-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Track Application Status</h1>
                        <p className="page-subtitle">Enter your application tracking ID to view live progress.</p>
                    </div>
                </div>

                {/* 2. SearchBox with Child-to-Parent Callback (onSearch) */}
                <SearchBox
                    placeholder="Enter Application ID (e.g. APP-2024-0001, APP-2024-0002)"
                    onSearch={handleSearchApplication}
                />

                {/* Not Found Message */}
                {notFound && (
                    <div className="alert-banner danger">
                        <div>
                            <div className="alert-banner-title">Application Not Found</div>
                            <div className="alert-banner-text">
                                No application found with ID "{searchId}". Please verify the ID and try again.
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Application Summary (Receives application prop) */}
                {foundApp && <ApplicationSummary application={foundApp} />}

                {/* 4. Timeline Tracker (Receives stages & currentStageIndex props) */}
                {foundApp && (
                    <TimelineTracker
                        stages={foundApp.stages}
                        currentStageIndex={foundApp.currentStage}
                    />
                )}

                {/* 5. Action Details (Receives remarks prop) */}
                {foundApp && <ActionDetails remarks={foundApp.officerRemarks} />}
            </main>
        </div>
    );
}
