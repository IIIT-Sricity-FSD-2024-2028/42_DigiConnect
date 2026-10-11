// src/pages/department-head/ServiceBuilderPage.jsx
// Dynamic Service Builder Page
// Reference: front-end/department-head/service-builder.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Context (useAuth),
// Router (useSearchParams, useNavigate), API calls (apiGetDesignations, apiGetDeptServiceById, apiCreateService, apiUpdateService)

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetDesignations,
  apiGetDeptServiceById,
  apiCreateService,
  apiUpdateService,
} from '../../api/departmentHeadApi';
import ServiceBuilderForm from '../../components/department-head/ServiceBuilderForm';

export default function ServiceBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const departmentId = user?.departmentId || 'dept_rev_ap';
  const stateId = user?.stateId || 'state_ap';

  const [availableDesignations, setAvailableDesignations] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setPageLoading(true);
      setError('');
      try {
        // Fetch designations for dropdown
        const desigRes = await apiGetDesignations(departmentId).catch(() => ({ data: [] }));
        if (isMounted) {
          setAvailableDesignations(desigRes?.data || []);
        }

        // If edit mode, fetch existing service details
        if (editId) {
          const srvRes = await apiGetDeptServiceById(editId);
          if (isMounted && srvRes?.data) {
            setInitialData(srvRes.data);
          }
        }
      } catch (err) {
        console.error('Error initializing ServiceBuilderPage:', err);
        if (isMounted) setError('Could not load service details or designations.');
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [editId, departmentId]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      departmentId,
      stateId,
    };

    try {
      if (editId) {
        await apiUpdateService(editId, payload);
        alert(`Service "${payload.name}" updated successfully!`);
      } else {
        await apiCreateService(payload);
        alert(`Service "${payload.name}" created and published successfully!`);
      }
      navigate('/department-head/services');
    } catch (err) {
      console.error('Error saving dynamic service:', err);
      setError(err.message || 'Failed to publish dynamic service. Please check your inputs.');
    } finally {
      setLoading(false);
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

      {pageLoading ? (
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
    </div>
  );
}
