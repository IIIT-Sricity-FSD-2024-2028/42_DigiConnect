// src/utils/applicationMapper.js
// Universal Application Model Normalizer for DigiConnect
// Ensures consistent property access (citizenName vs citizen, serviceName vs service, etc.)

/**
 * Normalizes an application record to guarantee all canonical fields and backwards-compatible aliases.
 * @param {Object} app - Raw application object from backend store or API
 * @returns {Object} Normalized application record
 */
export function normalizeApplication(app) {
  if (!app) return null;

  const id = app.id || app.applicationNumber || app.appId || app.arn || '—';
  const citizenName = app.citizenName || app.citizen || 'Citizen';

  const applicantFirstName =
    app.applicantFirstName ||
    app.firstName ||
    app.formData?.firstName ||
    '';
  const applicantLastName =
    app.applicantLastName ||
    app.lastName ||
    app.formData?.lastName ||
    '';
  const combinedApplicantName = `${applicantFirstName} ${applicantLastName}`.trim();

  const applicantName =
    app.applicantName ||
    (combinedApplicantName ? combinedApplicantName : null) ||
    app.formData?.applicant_name ||
    citizenName;

  const serviceName = app.serviceName || app.service || 'Government Service';
  const officerName = app.officerName || app.officer || app.assignedOfficerName || 'Unassigned';
  const submittedDate = app.submittedDate || app.appliedDate || app.createdAt || app.date || null;
  const dept = app.dept || app.departmentName || app.departmentId || '—';

  const slaRemaining =
    app.slaRemaining != null
      ? app.slaRemaining
      : app.slaDaysRemaining != null
      ? app.slaDaysRemaining
      : app.slaTotal || 15;

  const status = (app.status || 'SUBMITTED').toString();

  return {
    ...app,
    id,
    applicationNumber: id,
    arn: id,
    citizenName,
    citizen: citizenName,
    applicantName,
    applicantFirstName: applicantFirstName || undefined,
    applicantLastName: applicantLastName || undefined,
    serviceName,
    service: serviceName,
    officerName,
    officer: officerName,
    submittedDate,
    appliedDate: submittedDate,
    dept,
    departmentName: dept,
    slaRemaining,
    slaDaysRemaining: slaRemaining,
    status,
  };
}

/**
 * Normalizes an array of application records.
 * @param {Array} apps - Array of raw application objects
 * @returns {Array} Array of normalized application objects
 */
export function normalizeApplications(apps) {
  if (!Array.isArray(apps)) return [];
  return apps.map(normalizeApplication);
}
