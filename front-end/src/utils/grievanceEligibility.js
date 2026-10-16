// Centralized Grievance Category Eligibility Engine for DigiConnect Citizen Portal
// Strictly reflects backend rules and application state.

export const GRIEVANCE_CATEGORY_LABELS = {
  'delay': 'Delay in Service',
  'rejection': 'Wrongful Rejection',
  'misconduct': 'Officer Misconduct',
  'technical': 'Technical Issue',
  'wrong-info': 'Wrong Information Issued',
  'other': 'Other Issue',
};

export function normalizeCategoryId(cat) {
  if (!cat) return '';
  const c = cat.toLowerCase().trim().replace(/_/g, '-');
  if (c === 'delay' || c.includes('delay')) return 'delay';
  if (c === 'rejection' || c === 'rejection-appeal' || c.includes('reject')) return 'rejection';
  if (c === 'misconduct' || c.includes('misconduct')) return 'misconduct';
  if (c === 'technical' || c === 'payment' || c.includes('tech')) return 'technical';
  if (c === 'wrong-info' || c === 'wrong-information' || c.includes('wrong')) return 'wrong-info';
  if (c === 'other' || c.includes('other')) return 'other';
  return c;
}

/**
 * A. Delay in Service:
 * - Unlock when at least 75% of configured SLA has elapsed AND no meaningful workflow progress has occurred for at least 3 consecutive days.
 * - Also unlock immediately if the SLA deadline has passed and the application remains unresolved.
 * - Calculate using the actual service SLA, not a fixed 15-day duration.
 * - Genuine workflow progress: verification, inspection, a stage transition, or a decision.
 */
export function checkDelayEligibility(app, now = Date.now()) {
  if (!app) {
    return { isEligible: false, reason: 'Select an application above to check SLA progress.' };
  }

  const normStatus = String(app.status || '').toLowerCase().replace(/_/g, '-');
  const isResolved = [
    'approved',
    'completed',
    'certificate-generated',
    'certificate_generated',
    'rejected',
    'withdrawn',
  ].includes(normStatus);

  if (isResolved) {
    return { isEligible: false, reason: 'Application is already finalized/resolved.' };
  }

  const configuredSlaDays = Number(app.slaTotal || app.slaDays || 15);
  const totalSlaMs = configuredSlaDays * 24 * 60 * 60 * 1000;

  const submittedDateStr = app.submittedDate || app.appliedDate || app.createdAt;
  const submittedTime = submittedDateStr ? new Date(submittedDateStr).getTime() : now;
  const deadlineTime = app.slaDate ? new Date(app.slaDate).getTime() : (submittedTime + totalSlaMs);

  // If SLA deadline passed and unresolved -> unlock immediately
  if (now > deadlineTime) {
    return { isEligible: true, reason: 'Eligible: Application SLA deadline has passed without resolution.' };
  }

  const elapsedMs = Math.max(0, now - submittedTime);
  const is75PercentElapsed = elapsedMs >= 0.75 * totalSlaMs;

  const timeline = Array.isArray(app.timeline) ? app.timeline : [];
  const progressKeywords = [
    'verif', 'inspect', 'survey', 'review', 'transition', 'stage',
    'advance', 'query', 'sign', 'decision', 'approv', 'reject',
    'reopen', 'transfer', 'escalat'
  ];

  const genuineProgressEvents = timeline.filter((entry) => {
    const text = `${entry.action || ''} ${entry.stepName || ''} ${entry.note || ''} ${entry.remarks || ''}`.toLowerCase();
    if (text.startsWith('application submitted') || text.startsWith('payment confirmed') || text.startsWith('payment received')) {
      return false;
    }
    return progressKeywords.some((kw) => text.includes(kw));
  });

  let latestProgressTime = submittedTime;
  if (genuineProgressEvents.length > 0) {
    const timestamps = genuineProgressEvents
      .map((e) => new Date(e.completedDate || e.date).getTime())
      .filter((t) => !isNaN(t));
    if (timestamps.length > 0) {
      latestProgressTime = Math.max(...timestamps);
    }
  }

  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  const timeSinceLastProgress = Math.max(0, now - latestProgressTime);
  const hasNoProgressFor3Days = timeSinceLastProgress >= threeDaysMs;

  if (is75PercentElapsed && hasNoProgressFor3Days) {
    return {
      isEligible: true,
      reason: 'Eligible: Over 75% SLA elapsed with no workflow progress for 3+ consecutive days.',
    };
  }

  if (!is75PercentElapsed) {
    const daysUntil75 = Math.ceil((0.75 * totalSlaMs - elapsedMs) / (24 * 60 * 60 * 1000));
    return {
      isEligible: false,
      reason: `Available after 75% SLA threshold is reached (${Math.max(1, daysUntil75)} days remaining) with no progress, or after SLA breach.`,
    };
  }

  return {
    isEligible: false,
    reason: 'Available when no meaningful workflow progress has occurred for at least 3 consecutive days.',
  };
}

/**
 * B. Wrongful Rejection:
 * - Unlock only when the application has an actual recorded rejection decision.
 * - Do not impose an additional waiting period.
 */
export function checkRejectionEligibility(app) {
  if (!app) {
    return { isEligible: false, reason: 'Select an application above to check rejection status.' };
  }

  const normStatus = String(app.status || '').toLowerCase().replace(/_/g, '-');
  const timeline = Array.isArray(app.timeline) ? app.timeline : [];

  const isRejected =
    normStatus === 'rejected' ||
    timeline.some(
      (t) =>
        t.status === 'REJECTED' ||
        (t.action && String(t.action).toLowerCase().includes('reject'))
    );

  if (isRejected) {
    return { isEligible: true, reason: 'Eligible: Application has a recorded rejection decision.' };
  }

  return {
    isEligible: false,
    reason: 'Available only after an application rejection decision is recorded.',
  };
}

/**
 * C. Officer Misconduct:
 * - Unlock once an officer is assigned to the application.
 * - Do not add an arbitrary waiting period.
 */
export function checkMisconductEligibility(app) {
  if (!app) {
    return { isEligible: false, reason: 'Select an application above to check officer assignment.' };
  }

  const timeline = Array.isArray(app.timeline) ? app.timeline : [];

  const hasOfficerAssigned = Boolean(
    (app.officerId && String(app.officerId).toUpperCase() !== 'UNASSIGNED') ||
    (app.assignedOfficerId && String(app.assignedOfficerId).toUpperCase() !== 'UNASSIGNED') ||
    (app.officerName && !String(app.officerName).toLowerCase().includes('unassigned') && !String(app.officerName).toLowerCase().includes('citizen')) ||
    (app.assignedOfficerName && !String(app.assignedOfficerName).toLowerCase().includes('unassigned')) ||
    timeline.some((t) => t.officerId || (t.actor && t.actor !== 'Citizen' && t.actor !== 'System' && t.actor !== app.citizenName && t.actor !== app.applicantName))
  );

  if (hasOfficerAssigned) {
    return { isEligible: true, reason: 'Eligible: An officer has been assigned to this application.' };
  }

  return {
    isEligible: false,
    reason: 'Available once an officer is assigned to the application.',
  };
}

/**
 * D. Technical Issue:
 * - Unlock immediately after successful application submission.
 * - Covers portal errors, payment issues, and document upload failures.
 */
export function checkTechnicalEligibility(app) {
  if (!app || !app.id) {
    return { isEligible: false, reason: 'Select a submitted application to report technical issues.' };
  }

  return {
    isEligible: true,
    reason: 'Eligible: Unlocked immediately after successful application submission.',
  };
}

/**
 * E. Wrong Information Issued:
 * - Unlock only after the relevant certificate or document has actually been issued.
 * - Do not unlock merely because an application was submitted or is under review.
 */
export function checkWrongInfoEligibility(app) {
  if (!app) {
    return { isEligible: false, reason: 'Select an application above to verify certificate issuance.' };
  }

  const normStatus = String(app.status || '').toLowerCase().replace(/_/g, '-');
  const documents = Array.isArray(app.documents) ? app.documents : [];
  const timeline = Array.isArray(app.timeline) ? app.timeline : [];

  const hasCertificateIssued = Boolean(
    normStatus === 'certificate-generated' ||
    normStatus === 'completed' ||
    app.certificateId ||
    documents.some((d) => d.type === 'certificate' || d.type === 'Certificate' || String(d.name || '').toLowerCase().includes('certificate')) ||
    timeline.some((t) => {
      const act = String(t.action || '').toLowerCase();
      return act.includes('certificate generated') || act.includes('certificate issued') || act.includes('dsc') || act.includes('digital signature');
    })
  );

  if (hasCertificateIssued) {
    return { isEligible: true, reason: 'Eligible: Certificate or official document has been issued.' };
  }

  return {
    isEligible: false,
    reason: 'Available only after the relevant certificate or document has actually been issued.',
  };
}

/**
 * F. Other Issue:
 * - Unlock after successful application submission and a waiting period of 1 day.
 */
export function checkOtherEligibility(app, now = Date.now()) {
  if (!app) {
    return { isEligible: false, reason: 'Select an application above to check submission time.' };
  }

  const submittedDateStr = app.submittedDate || app.appliedDate || app.createdAt;
  const submittedTime = submittedDateStr ? new Date(submittedDateStr).getTime() : now;
  const elapsedMs = Math.max(0, now - submittedTime);
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (elapsedMs >= oneDayMs) {
    return { isEligible: true, reason: 'Eligible: 1-day waiting period from submission has elapsed.' };
  }

  const hoursRemaining = Math.ceil((oneDayMs - elapsedMs) / (60 * 60 * 1000));
  return {
    isEligible: false,
    reason: `Available after 1 day from application submission (${Math.max(1, hoursRemaining)}h remaining).`,
  };
}

/**
 * Evaluates eligibility for a single category for an application.
 */
export function evaluateCategoryEligibility(rawCategory, app, now = Date.now()) {
  const categoryId = normalizeCategoryId(rawCategory);
  const categoryLabel = GRIEVANCE_CATEGORY_LABELS[categoryId] || rawCategory;

  switch (categoryId) {
    case 'delay': {
      const res = checkDelayEligibility(app, now);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    case 'rejection': {
      const res = checkRejectionEligibility(app);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    case 'misconduct': {
      const res = checkMisconductEligibility(app);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    case 'technical': {
      const res = checkTechnicalEligibility(app);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    case 'wrong-info': {
      const res = checkWrongInfoEligibility(app);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    case 'other': {
      const res = checkOtherEligibility(app, now);
      return { categoryId, categoryLabel, isEligible: res.isEligible, reason: res.reason };
    }
    default: {
      return {
        categoryId,
        categoryLabel,
        isEligible: true,
        reason: 'Eligible: General category',
      };
    }
  }
}

/**
 * Evaluates all 6 categories for an application.
 */
export function evaluateAllGrievanceEligibility(app, now = Date.now()) {
  const results = {};
  const categories = ['delay', 'rejection', 'misconduct', 'technical', 'wrong-info', 'other'];

  for (const cat of categories) {
    results[cat] = evaluateCategoryEligibility(cat, app, now);
  }

  return results;
}
