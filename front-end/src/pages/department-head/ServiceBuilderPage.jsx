// src/pages/department-head/ServiceBuilderPage.jsx
// Dynamic Service Builder Page
// Reference: front-end/department-head/service-builder.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Context (useAuth),
// Router (useSearchParams, useNavigate), API calls (apiGetDesignations, apiGetDeptServiceById, apiCreateService, apiUpdateService)

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDesignations,
  fetchDeptServiceById,
  createService,
  updateService,
  clearSelectedService,
  selectDeptHeadDesignations,
  selectSelectedService,
  selectDeptHeadLoading,
  selectDeptHeadError,
} from '../../store/slices/deptHeadSlice';
import ServiceBuilderForm from '../../components/department-head/ServiceBuilderForm';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

export default function ServiceBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const departmentId = user?.departmentId || '';
  const stateId = user?.stateId || '';

  // ── Redux Store State (Strict 1:1 binding, no local data bypassing) ──
  const availableDesignations = useAppSelector(selectDeptHeadDesignations);
  const initialData = useAppSelector(selectSelectedService);
  const loading = useAppSelector(selectDeptHeadLoading);
  const error = useAppSelector(selectDeptHeadError);

  const { toast, showToast, hideToast } = useToast();

  // ── Hook: Fetch Designations & Service Details (if editing) ──
  useEffect(() => {
    dispatch(fetchDesignations(departmentId));
    if (editId) {
      dispatch(fetchDeptServiceById(editId));
    } else {
      dispatch(clearSelectedService());
    }
  }, [dispatch, editId, departmentId]);

  // ── CRUD: Create or Update Dynamic Service (Create/Update -> DB success -> Redux Store) ──
  const handleSubmit = async (formData) => {
    const payload = {
      ...formData,
      departmentId,
      stateId,
    };

    try {
      let resultAction;
      if (editId) {
        resultAction = await dispatch(updateService({ id: editId, serviceData: payload }));
      } else {
        resultAction = await dispatch(createService(payload));
      }

      if (createService.fulfilled.match(resultAction) || updateService.fulfilled.match(resultAction)) {
        showToast(
          `Service "${payload.name}" ${editId ? 'updated' : 'created and published'} successfully!`,
          'success'
        );
        setTimeout(() => {
          navigate('/department-head/services');
        }, 1200);
      } else {
        const msg = resultAction.payload || 'Failed to publish dynamic service. Please check your inputs.';
        showToast(msg, 'error');
      }
    } catch (err) {
      console.error('Error saving dynamic service:', err);
      const msg = err.message || 'Failed to publish dynamic service. Please check your inputs.';
      showToast(msg, 'error');
    }
  };

  const handleCancel = () => {
    navigate('/department-head/services');
  };

  return (
    <div className="dept-service-builder-page">
      {/* ── Breadcrumbs ── */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: 'var(--space-sm)' }}>
        <button
          type="button"
          onClick={() => navigate('/department-head/dashboard')}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--navy-600)', cursor: 'pointer', fontWeight: 600 }}
        >
          Department Head
        </button>
        {' '}/ <button
          type="button"
          onClick={() => navigate('/department-head/services')}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--navy-600)', cursor: 'pointer', fontWeight: 600 }}
        >
          Services
        </button>
        {' '}/ <span style={{ color: 'var(--slate-400)' }}>{editId ? 'Edit Configuration' : 'Service Builder'}</span>
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
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <h1 className="page-title">
            ⚙️ {editId ? 'Edit Dynamic Service Configuration' : 'Dynamic Service & Workflow Builder'}
          </h1>
          <p className="page-subtitle">
            Configure Dynamic Citizen Form Schemas, Proofs, Fees &amp; Multi-Tier Officer Routing
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {loading && !initialData && editId ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--slate-500)' }}>
          Loading service builder configuration...
        </div>
      ) : (
        <ServiceBuilderForm
          initialData={initialData}
          availableDesignations={availableDesignations}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* Global Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
