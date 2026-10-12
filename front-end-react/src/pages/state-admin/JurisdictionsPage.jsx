// src/pages/state-admin/JurisdictionsPage.jsx
// Dynamic Jurisdiction Tree Management Page
// Converted from state-admin/jurisdictions.html (~70KB)
// React concepts used:
// 1. Components (JurisdictionsPage)
// 2. Props (passing node, level, onAddChild, onEdit, filterArea to JurisdictionTreeNode)
// 3. State (useState for treeData, stats, loading, error, filterArea, modal states, form data)
// 4. Events (onClick, onChange, onSubmit)
// 5. Lists (.map with unique keys for rendering tree roots and options)
// 6. Hooks (useState, useEffect for data lifecycle, useContext via useAuth)
// 7. Context (consuming AuthContext to identify current state administrator)
// 8. Controlled inputs (form state bound to input value and onChange)
// 9. Prop drilling (passing callbacks onAddChild and onEdit down through props)
// 10. Callbacks (child-to-parent callbacks invoked from JurisdictionTreeNode)
// 11. API calls (apiGetJurisdictionsTree, apiAddJurisdictionNode, apiUpdateJurisdictionNode, apiGetJurisdictionStats)

import React, { useState, useEffect } from 'react';
// Context: consuming existing AuthContext
import { useAuth } from '../../context/AuthContext';
// API calls: State Admin API helpers
import {
  apiGetJurisdictionsTree,
  apiAddJurisdictionNode,
  apiUpdateJurisdictionNode,
  apiGetJurisdictionStats,
} from '../../api/stateAdminApi';
// Base recursive component
import JurisdictionTreeNode from '../../components/state-admin/JurisdictionTreeNode';
// Component reuse: Modal dialog from common components
import Modal from '../../components/common/Modal';

// Number formatting helper
function formatNum(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN');
}

// Allowed hierarchy transitions for context-aware child tiers
function getAllowedChildTiers(parentTier, parentGovType) {
  if (!parentTier || parentTier === 'STATE') {
    return [{ tier: 'DISTRICT', label: 'District (Standard Administrative Unit)', defaultGov: 'COMMON' }];
  }
  if (parentTier === 'DISTRICT') {
    return [
      { tier: 'SUB_DIVISION', label: 'Revenue Sub-Division (Rural / Common)', defaultGov: 'RURAL' },
      { tier: 'SUB_DIVISION', label: 'Urban Sub-Division (Urban)', defaultGov: 'URBAN' },
    ];
  }
  if (parentTier === 'SUB_DIVISION') {
    if (parentGovType === 'URBAN') {
      return [{ tier: 'MUNICIPALITY', label: 'Municipality / ULB', defaultGov: 'URBAN' }];
    }
    return [
      { tier: 'MANDAL', label: 'Mandal / Taluk (Rural)', defaultGov: 'RURAL' },
      { tier: 'MUNICIPALITY', label: 'Municipality / ULB (Urban)', defaultGov: 'URBAN' },
    ];
  }
  if (parentTier === 'MANDAL') {
    return [
      { tier: 'VILLAGE', label: 'Village', defaultGov: 'RURAL' },
      { tier: 'GRAM_PANCHAYAT', label: 'Gram Panchayat', defaultGov: 'RURAL' },
    ];
  }
  if (parentTier === 'MUNICIPALITY') {
    return [
      { tier: 'WARD', label: 'Municipal Ward', defaultGov: 'URBAN' },
      { tier: 'ZONE', label: 'Municipal Zone', defaultGov: 'URBAN' },
    ];
  }
  return [];
}

export default function JurisdictionsPage() {
  // Context: AuthContext provides current administrator's assigned state
  const { user } = useAuth();
  const stateId = user?.stateId || 'state_ap';

  // State: tree hierarchy data & statistics
  const [treeData, setTreeData] = useState([]);
  const [stats, setStats] = useState({
    districtsCount: 0,
    subDivisionsCount: 0,
    mandalsCount: 0,
    villagesCount: 0,
    municipalitiesCount: 0,
    wardsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State: Rural vs Urban toggle ('ALL', 'RURAL', 'URBAN')
  const [filterArea, setFilterArea] = useState('ALL');

  // State: Add Child Modal visibility and form state (controlled inputs)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    tierLevel: 'DISTRICT',
    governanceType: 'RURAL',
  });
  const [addingNode, setAddingNode] = useState(false);
  const [addError, setAddError] = useState(null);

  // State: Edit Node Modal visibility and form state (controlled inputs)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
  });
  const [updatingNode, setUpdatingNode] = useState(false);
  const [editError, setEditError] = useState(null);

  // Hooks / useEffect: fetch jurisdiction tree & stats on component mount
  const fetchTreeAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // API Call: fetch full tree structure
      const treeRes = await apiGetJurisdictionsTree(stateId);
      const list = Array.isArray(treeRes) ? treeRes : treeRes?.data || [];
      setTreeData(list);

      // API Call: fetch aggregated stats
      try {
        const statsRes = await apiGetJurisdictionStats(stateId);
        if (statsRes) {
          setStats(statsRes);
        }
      } catch (_err) {
        // Fallback silently if stats endpoint is not available
      }
    } catch (err) {
      // State: capture error message
      setError(err.message || 'Failed to load jurisdiction hierarchy');
    } finally {
      // State: stop loading spinner
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeAndStats();
  }, [stateId]);

  // ── Callbacks: child-to-parent notification when "+ Child" is clicked ──
  // Callback: opens modal with parent node information
  const handleOpenAddChild = (parentNode) => {
    setSelectedParent(parentNode);
    const parentTier = parentNode.tierLevel || parentNode.type || 'STATE';
    const parentGov = parentNode.governanceType || parentNode.areaType || 'COMMON';
    const allowed = getAllowedChildTiers(parentTier, parentGov);

    // Controlled inputs: initialize add form state
    setAddForm({
      name: '',
      code: '',
      tierLevel: allowed.length > 0 ? allowed[0].tier : 'VILLAGE',
      governanceType: allowed.length > 0 ? allowed[0].defaultGov : 'RURAL',
    });
    setAddError(null);
    setIsAddModalOpen(true);
  };

  // ── Callbacks: child-to-parent notification when "Edit" is clicked ──
  // Callback: opens edit modal with selected node details
  const handleOpenEdit = (node) => {
    setNodeToEdit(node);
    // Controlled inputs: initialize edit form state
    setEditForm({
      name: node.name || '',
      code: node.code || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // ── Forms / Events: handle Add Child form submit ──
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError('Jurisdiction name is required.');
      return;
    }

    try {
      setAddingNode(true);
      setAddError(null);

      const payload = {
        stateId: stateId,
        parentId: selectedParent ? selectedParent.id : null,
        name: addForm.name.trim(),
        code: addForm.code.trim().toUpperCase() || undefined,
        tierLevel: addForm.tierLevel,
        governanceType: addForm.governanceType,
        status: 'Active',
      };

      // API Call: add new node to database
      await apiAddJurisdictionNode(payload);

      // Refresh tree data to show newly added jurisdiction node
      setIsAddModalOpen(false);
      await fetchTreeAndStats();
    } catch (err) {
      setAddError(err.message || 'Failed to add jurisdiction node.');
    } finally {
      setAddingNode(false);
    }
  };

  // ── Forms / Events: handle Edit boundary form submit ──
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setEditError('Jurisdiction boundary name cannot be empty.');
      return;
    }

    try {
      setUpdatingNode(true);
      setEditError(null);

      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase() || undefined,
      };

      // API Call: update boundary properties
      await apiUpdateJurisdictionNode(nodeToEdit.id, payload);

      // Refresh tree data to show updated boundary name
      setIsEditModalOpen(false);
      await fetchTreeAndStats();
    } catch (err) {
      setEditError(err.message || 'Failed to update jurisdiction boundary.');
    } finally {
      setUpdatingNode(false);
    }
  };

  // ── 1. LOADING STATE ──
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Loading Dynamic Jurisdiction Tree...
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
          Traversing state districts, revenue divisions, mandals, municipalities, and villages.
        </p>
      </div>
    );
  }

  // ── 2. ERROR STATE ──
  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#991b1b',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unable to Load Jurisdiction Tree</div>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', color: '#b91c1c' }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={fetchTreeAndStats}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const allowedChildTiers = selectedParent
    ? getAllowedChildTiers(selectedParent.tierLevel || selectedParent.type, selectedParent.governanceType)
    : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Dynamic Jurisdiction Hierarchy
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            State-level multi-tier administrative boundary tree for field officer routing
          </p>
        </div>

        {/* Top Action: Add District under State Root */}
        {treeData.length > 0 && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenAddChild(treeData[0])}
          >
            + Add New District
          </button>
        )}
      </div>

      {/* ── Summary Stat Counters ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.districtsCount || 0}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Districts</div>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.subDivisionsCount || 0}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sub-Divisions</div>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.mandalsCount || 0}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mandals</div>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatNum(stats.villagesCount || 0)}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Villages</div>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.municipalitiesCount || 0}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Municipalities</div>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatNum(stats.wardsCount || 0)}</div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Wards</div>
        </div>
      </div>

      {/* ── Rural vs Urban Toggle & Hierarchy Toolbar ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
            Filter Governance Branch:
          </span>
          {/* State / Events: Rural vs Urban toggle buttons */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setFilterArea('ALL')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterArea === 'ALL' ? '#ffffff' : 'transparent',
                color: filterArea === 'ALL' ? '#0f172a' : '#64748b',
                boxShadow: filterArea === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              All Jurisdictions
            </button>
            <button
              type="button"
              onClick={() => setFilterArea('RURAL')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterArea === 'RURAL' ? '#ffffff' : 'transparent',
                color: filterArea === 'RURAL' ? '#15803d' : '#64748b',
                boxShadow: filterArea === 'RURAL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🌾 Rural (Mandals & Villages)
            </button>
            <button
              type="button"
              onClick={() => setFilterArea('URBAN')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterArea === 'URBAN' ? '#ffffff' : 'transparent',
                color: filterArea === 'URBAN' ? '#0369a1' : '#64748b',
                boxShadow: filterArea === 'URBAN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🏙️ Urban (Municipalities & Wards)
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Active Filter: <strong style={{ color: '#0f172a' }}>{filterArea}</strong>
        </div>
      </div>

      {/* ── Jurisdiction Tree Rendering ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        {/* ── 3. EMPTY STATE ── */}
        {treeData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏛️</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
              No Jurisdiction Hierarchy Configured
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Get started by adding the first administrative district to this state.
            </p>
          </div>
        ) : (
          /* Lists: mapping over root nodes (e.g. State Root) */
          treeData.map((rootNode) => (
            // Prop drilling: passing onAddChild, onEdit, filterArea down to root JurisdictionTreeNode
            <JurisdictionTreeNode
              key={rootNode.id || rootNode.name}
              node={rootNode}
              level={0}
              onAddChild={handleOpenAddChild}
              onEdit={handleOpenEdit}
              filterArea={filterArea}
            />
          ))
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: ADD CHILD JURISDICTION NODE (Controlled Form)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={selectedParent ? `+ Add Child under "${selectedParent.name}"` : '+ Add Jurisdiction Unit'}
      >
        <form onSubmit={handleAddSubmit}>
          {addError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {addError}
            </div>
          )}

          {/* Parent Node Reference */}
          {selectedParent && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                color: '#475569',
              }}
            >
              Parent Jurisdiction: <strong>{selectedParent.name}</strong> ({selectedParent.tierLevel || selectedParent.type})
            </div>
          )}

          {/* Controlled input: Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Unit Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Chandragiri Mandal, Tirupati Municipal Corporation"
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Controlled input: Code */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Unit Code (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={addForm.code}
              onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
              placeholder="e.g. CG_MAN, TMC_WARD_14"
              style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }}
            />
          </div>

          {/* Controlled input: Tier Level Select */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Administrative Tier Level <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-input"
              value={addForm.tierLevel}
              onChange={(e) => {
                const selectedTier = e.target.value;
                const match = allowedChildTiers.find((t) => t.tier === selectedTier);
                setAddForm({
                  ...addForm,
                  tierLevel: selectedTier,
                  governanceType: match ? match.defaultGov : addForm.governanceType,
                });
              }}
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              {/* Lists: map allowed child tiers */}
              {allowedChildTiers.map((t) => (
                <option key={t.tier} value={t.tier}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Controlled input: Governance Branch Radio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Governance Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="govType"
                  value="RURAL"
                  checked={addForm.governanceType === 'RURAL'}
                  onChange={(e) => setAddForm({ ...addForm, governanceType: e.target.value })}
                />
                🌾 Rural
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="govType"
                  value="URBAN"
                  checked={addForm.governanceType === 'URBAN'}
                  onChange={(e) => setAddForm({ ...addForm, governanceType: e.target.value })}
                />
                🏙️ Urban
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingNode}
            >
              {addingNode ? 'Creating...' : 'Create Jurisdiction Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: EDIT JURISDICTION BOUNDARY NAME (Controlled Form)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={nodeToEdit ? `✏️ Edit Boundary: ${nodeToEdit.name}` : 'Edit Boundary'}
      >
        <form onSubmit={handleEditSubmit}>
          {editError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {editError}
            </div>
          )}

          {/* Controlled input: Boundary Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Jurisdiction Boundary Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Controlled input: Boundary Code */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Jurisdiction Code
            </label>
            <input
              type="text"
              className="form-input"
              value={editForm.code}
              onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
              style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }}
            />
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updatingNode}
            >
              {updatingNode ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
