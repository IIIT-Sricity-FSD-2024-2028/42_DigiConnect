// src/pages/department-head/OfficersManagementPage.jsx
// Officer Onboarding & Jurisdiction Node Scoping
// Reference: front-end/department-head/officers.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Events (onClick, onSubmit, onChange),
// Lists (map), Context (useAuth), API calls (apiGetDeptOfficers, apiOnboardOfficer, apiUpdateOfficerStatus, apiGetDesignations)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetDeptOfficers,
  apiOnboardOfficer,
  apiUpdateOfficerStatus,
  apiGetDesignations,
  apiGetStateJurisdictionNodes,
} from '../../api/departmentHeadApi';
import Modal from '../../components/common/Modal';

export default function OfficersManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';
  const stateId = user?.stateId || '';

  const [officers, setOfficers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [jurisdictionNodes, setJurisdictionNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Onboard Modal State
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    email: '',
    phone: '',
    designationId: '',
    assignedNodeId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOfficers = async () => {
    setLoading(true);
    setError('');
    try {
      const [offRes, desigRes, nodesRes] = await Promise.all([
        apiGetDeptOfficers(departmentId).catch(() => ({ data: [] })),
        apiGetDesignations(departmentId).catch(() => ({ data: [] })),
        apiGetStateJurisdictionNodes(stateId).catch(() => ({ data: [] })),
      ]);

      setOfficers(offRes?.data || []);
      const desigs = desigRes?.data || [];
      setDesignations(desigs);
      const nodes = nodesRes?.data || [];
      setJurisdictionNodes(nodes);

      if (desigs.length > 0 && !newOfficer.designationId) {
        setNewOfficer((prev) => ({ ...prev, designationId: desigs[0].id }));
      }
      if (nodes.length > 0 && !newOfficer.assignedNodeId) {
        setNewOfficer((prev) => ({ ...prev, assignedNodeId: nodes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching officers:', err);
      setError('Failed to load field officers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [departmentId, stateId]);

  const handleOpenOnboardModal = () => {
    setNewOfficer({
      name: '',
      email: '',
      phone: '',
      designationId: designations[0]?.id || '',
      assignedNodeId: jurisdictionNodes[0]?.id || '',
    });
    setOnboardModalOpen(true);
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.email || !newOfficer.designationId || !newOfficer.assignedNodeId) {
      alert('Please fill all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...newOfficer,
        departmentId,
      };
      await apiOnboardOfficer(payload);
      alert(`Officer "${newOfficer.name}" onboarded successfully!`);
      setOnboardModalOpen(false);
      // Refetch upon successful mutation
      fetchOfficers();
    } catch (err) {
      alert(`Error onboarding officer: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Optimistic UI Update: Flip status immediately in state, revert if API fails
  const handleToggleStatus = async (officer) => {
    const isAct = officer.status === 'Active' || officer.status === 'ACTIVE';
    const nextStatus = isAct ? 'Suspended' : 'Active';
    const previousStatus = officer.status;

    // 1. Optimistic update (Immediate UI feedback)
    setOfficers((prev) =>
      prev.map((o) => (o.id === officer.id ? { ...o, status: nextStatus } : o))
    );

    // 2. Perform backend mutation
    try {
      await apiUpdateOfficerStatus(officer.id, nextStatus);
    } catch (err) {
      // 3. Rollback on failure
      setOfficers((prev) =>
        prev.map((o) => (o.id === officer.id ? { ...o, status: previousStatus } : o))
      );
      alert(`Failed to update status for ${officer.name}: ${err.message}`);
    }
  };

  // Helper function to derive coverage scope label dynamically from node tier
  const getScopeNote = (nodeId) => {
    if (!nodeId) return 'Assigned Scope';
    const matchedNode = jurisdictionNodes.find((n) => n.id === nodeId);
    if (matchedNode) {
      const tier = matchedNode.tierLevel || '';
      if (tier === 'VILLAGE' || tier === 'WARD') return `${matchedNode.name} (${tier} Leaf)`;
      if (tier === 'MANDAL' || tier === 'TALUK') return `Covers ${matchedNode.name} & child villages`;
      if (tier === 'SUB_DIVISION') return `Covers ${matchedNode.name} Sub-Division`;
      if (tier === 'DISTRICT') return `Covers entire ${matchedNode.name}`;
      if (tier === 'STATE') return `State-wide Authority`;
      return `${matchedNode.name} (${tier})`;
    }
    if (nodeId.includes('vil')) return 'Village Leaf Node';
    if (nodeId.includes('man') || nodeId.includes('mdl')) return 'Mandal Scope';
    if (nodeId.includes('sub') || nodeId.includes('rsd')) return 'Sub-Division Scope';
    if (nodeId.includes('dist') || nodeId.includes('tpt') || nodeId.includes('mys') || nodeId.includes('tvm') || nodeId.includes('mdu')) return 'District Scope';
    if (nodeId.includes('ward') || nodeId.includes('w14') || nodeId.includes('w50')) return 'Ward Leaf Node';
    return 'Assigned Node Scope';
  };

  return (
    <div className="dept-officers-page">
      {/* ── Breadcrumbs ── */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: 'var(--space-sm)' }}>
        <button
          type="button"
          onClick={() => navigate('/department-head/dashboard')}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--navy-600)', cursor: 'pointer', fontWeight: 600 }}
        >
          Department Head
        </button>
        {' '}/ <span style={{ color: 'var(--slate-400)' }}>Field Officer Onboarding</span>
      </div>

      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div>
          <h1 className="page-title">Officer Onboarding &amp; Jurisdiction Scoping</h1>
          <p className="page-subtitle" id="deptSubtitle">
            {departmentName} · Bind Officers to Exact Jurisdiction Nodes (Village, Mandal, District)
          </p>
        </div>
        <button
          type="button"
          id="openOnboardModalBtn"
          className="btn btn-primary btn-sm"
          onClick={handleOpenOnboardModal}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          + Onboard Field Officer
        </button>
      </div>

      {/* Architecture Rule Note */}
      <div
        style={{
          background: '#eff6ff',
          borderLeft: '4px solid #2563eb',
          padding: '12px 16px',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
          Hierarchical Officer Scoping Rule:
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', marginTop: '2px' }}>
          Every officer is assigned to an exact <code>assignedNodeId</code> in the tree. An officer assigned to a Mandal automatically covers all child villages; a District officer covers all descendant nodes. Applications are routed using <code>isNodeWithinScope(leafNodeId, assignedNodeId)</code>.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Officers Table Card ── */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="card-title">Onboarded Department Field Officers</span>
          <span className="badge badge-info" id="officersCountBadge">
            {loading ? 'Loading...' : `${officers.length} Officers`}
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Officer ID</th>
                  <th>Officer Name</th>
                  <th>Designation</th>
                  <th>Assigned Jurisdiction Node</th>
                  <th>Hierarchy Coverage Scope</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="officersTableBody">
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      Loading field officers...
                    </td>
                  </tr>
                ) : officers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      No officers mapped to this department yet. Click "+ Onboard Field Officer" to add one.
                    </td>
                  </tr>
                ) : (
                  officers.map((o) => {
                    const isAct = o.status === 'Active' || o.status === 'ACTIVE';
                    const scopeDesc = getScopeNote(o.assignedNodeId);

                    return (
                      <tr key={o.id}>
                        <td>
                          <code>{o.id}</code>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                          {o.name}
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 'normal' }}>
                            {o.email}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-purple">
                            {o.designationTitle || o.designationId}
                          </span>
                        </td>
                        <td>
                          <strong>{o.assignedNodeId}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                            {scopeDesc}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isAct ? 'badge-success' : 'badge-danger'}`}>
                            {isAct ? '● Active' : '● Suspended'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleStatus(o)}
                          >
                            {isAct ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Onboard Officer Modal ── */}
      <Modal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        title="👮 Onboard New Field Officer"
        footer={null}
      >
        <form onSubmit={handleOnboardSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="offName">Officer Full Name *</label>
            <input
              type="text"
              id="offName"
              className="form-input"
              placeholder="e.g. GOKUL RAO"
              value={newOfficer.name}
              onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="offEmail">Official Email Address *</label>
            <input
              type="email"
              id="offEmail"
              className="form-input"
              placeholder="e.g. gokul.vro@digiconnect.gov.in"
              value={newOfficer.email}
              onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="offPhone">Contact Phone Number</label>
            <input
              type="tel"
              id="offPhone"
              className="form-input"
              placeholder="e.g. 9876543210"
              pattern="[0-9]{10}"
              value={newOfficer.phone}
              onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="offDesig">Assigned Role Designation *</label>
            <select
              id="offDesig"
              className="form-input"
              value={newOfficer.designationId}
              onChange={(e) => setNewOfficer({ ...newOfficer, designationId: e.target.value })}
              required
            >
              {designations.length > 0 ? (
                designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.code})
                  </option>
                ))
              ) : (
                <>
                  <option value="desig_vro">Village Revenue Officer (VRO)</option>
                  <option value="desig_mro">Mandal Revenue Officer (MRO)</option>
                  <option value="desig_tahsildar">Tahsildar</option>
                </>
              )}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="offNode">
              Assigned Jurisdiction Node (Coverage Anchor) *
            </label>
            <select
              id="offNode"
              className="form-input"
              value={newOfficer.assignedNodeId}
              onChange={(e) => setNewOfficer({ ...newOfficer, assignedNodeId: e.target.value })}
              required
            >
              {jurisdictionNodes.length > 0 ? (
                jurisdictionNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.tierLevel === 'VILLAGE' ? '🌾' : n.tierLevel === 'WARD' ? '🏙️' : n.tierLevel === 'MANDAL' ? '🏛️' : n.tierLevel === 'DISTRICT' ? '🏢' : '📍'}{' '}
                    {n.name} ({n.id} - {n.tierLevel})
                  </option>
                ))
              ) : (
                <option value="">No jurisdiction nodes available</option>
              )}
            </select>
            <small style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              The officer will have verification authority over this node and all its child nodes.
            </small>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--slate-100)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setOnboardModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="saveOfficerBtn"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Onboarding...' : 'Onboard Officer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
