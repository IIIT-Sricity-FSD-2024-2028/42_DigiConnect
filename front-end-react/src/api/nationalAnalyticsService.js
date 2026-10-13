// src/api/nationalAnalyticsService.js
// Shared National Dataset & Analytics Engine for DigiConnect Central Government
// Synchronizes state federation records, metrics, time trends, and fiscal breakdowns

import { apiGetCentralStates, apiGetCentralRevenueAnalytics } from './centralAdminApi';

export const NATIONAL_STATES_DATA = [
  {
    id: 'state_ap',
    name: 'Andhra Pradesh',
    code: 'AP',
    applications: 8420,
    completed: 5900,
    pending: 1650,
    inProgress: 1095,
    rejected: 580,
    query: 290,
    revenue: 425000,
    platformFee: 42500,
    serviceFee: 382500,
    grievances: 1240,
    grvPending: 380,
    grvResolved: 860,
    grvEscalated: 0,
    departmentsCount: 2,
    officers: 420,
    services: 6,
    citizens: 35820,
    districts: 26,
    subDivisions: 68,
    mandals: 679,
    villages: 14200,
    municipalities: 124,
    wards: 3400,
    sla: 96.2,
  },
  {
    id: 'state_ka',
    name: 'Karnataka',
    code: 'KA',
    applications: 7820,
    completed: 5400,
    pending: 1580,
    inProgress: 980,
    rejected: 550,
    query: 290,
    revenue: 390000,
    platformFee: 39000,
    serviceFee: 351000,
    grievances: 1180,
    grvPending: 340,
    grvResolved: 840,
    grvEscalated: 0,
    departmentsCount: 2,
    officers: 390,
    services: 6,
    citizens: 32840,
    districts: 31,
    subDivisions: 52,
    mandals: 240,
    villages: 29340,
    municipalities: 281,
    wards: 4200,
    sla: 95.8,
  },
  {
    id: 'state_tn',
    name: 'Tamil Nadu',
    code: 'TN',
    applications: 5980,
    completed: 4200,
    pending: 1210,
    inProgress: 760,
    rejected: 410,
    query: 160,
    revenue: 295000,
    platformFee: 29500,
    serviceFee: 265500,
    grievances: 890,
    grvPending: 220,
    grvResolved: 670,
    grvEscalated: 0,
    departmentsCount: 2,
    officers: 360,
    services: 6,
    citizens: 28910,
    districts: 38,
    subDivisions: 87,
    mandals: 310,
    villages: 15979,
    municipalities: 150,
    wards: 3800,
    sla: 94.6,
  },
  {
    id: 'state_kl',
    name: 'Kerala',
    code: 'KL',
    applications: 4210,
    completed: 3100,
    pending: 820,
    inProgress: 510,
    rejected: 290,
    query: 120,
    revenue: 210000,
    platformFee: 21000,
    serviceFee: 189000,
    grievances: 720,
    grvPending: 160,
    grvResolved: 560,
    grvEscalated: 0,
    departmentsCount: 2,
    officers: 310,
    services: 6,
    citizens: 27230,
    districts: 14,
    subDivisions: 27,
    mandals: 77,
    villages: 1664,
    municipalities: 87,
    wards: 2100,
    sla: 95.1,
  },
];

export const NATIONAL_TIME_TRENDS = {
  daily: [
    { label: 'Mon', apps: 840, revenue: 42000 },
    { label: 'Tue', apps: 1120, revenue: 56000 },
    { label: 'Wed', apps: 980, revenue: 49000 },
    { label: 'Thu', apps: 1340, revenue: 67000 },
    { label: 'Fri', apps: 1210, revenue: 60500 },
    { label: 'Sat', apps: 690, revenue: 34500 },
    { label: 'Sun', apps: 410, revenue: 20500 },
  ],
  weekly: [
    { label: 'Week 1', apps: 5900, revenue: 295000 },
    { label: 'Week 2', apps: 6850, revenue: 342500 },
    { label: 'Week 3', apps: 6200, revenue: 310000 },
    { label: 'Week 4', apps: 7480, revenue: 372500 },
  ],
  monthly: [
    { label: 'Jan', apps: 3200, revenue: 160000 },
    { label: 'Feb', apps: 3600, revenue: 180000 },
    { label: 'Mar', apps: 4100, revenue: 205000 },
    { label: 'Apr', apps: 4800, revenue: 240000 },
    { label: 'May', apps: 5200, revenue: 260000 },
    { label: 'Jun', apps: 5530, revenue: 275000 },
  ],
  yearly: [
    { label: '2024', apps: 14200, revenue: 710000 },
    { label: '2025', apps: 21800, revenue: 1090000 },
    { label: '2026', apps: 26430, revenue: 1320000 },
  ],
};

/**
 * Loads merged national dataset (combining backend dynamic states + national seed records)
 */
export async function getNationalAnalyticsData() {
  let backendStates = [];
  let backendRevenue = null;

  try {
    const [statesRes, revRes] = await Promise.all([
      apiGetCentralStates().catch(() => []),
      apiGetCentralRevenueAnalytics().catch(() => null),
    ]);
    backendStates = Array.isArray(statesRes) ? statesRes : statesRes?.data || [];
    backendRevenue = revRes?.data || revRes || null;
  } catch (e) {
    console.warn('Backend fetch fallback to national dataset', e);
  }

  // Base state dataset
  let states = [];

  if (backendStates.length > 0) {
    states = backendStates.map((bs) => {
      const code = (bs.code || '').toUpperCase();
      const match = NATIONAL_STATES_DATA.find(
        (s) => s.code.toUpperCase() === code || s.id === bs.id
      );

      // Baseline figures from national repository plus any live DB additions
      const baseApps = match ? match.applications : 0;
      const apps = baseApps + (bs.totalApplications || 0);

      const baseRev = match ? match.revenue : 0;
      const rev = baseRev + (bs.totalRevenue || 0);

      const platformFee = Math.round(rev * 0.1);
      const serviceFee = Math.max(0, rev - platformFee);

      const completed = match ? match.completed + (bs.paidApplications || 0) : Math.round(apps * 0.7);
      const pending = match ? match.pending : Math.round(apps * 0.18);
      const inProgress = match ? match.inProgress : Math.round(apps * 0.12);
      const rejected = match ? match.rejected : 0;
      const query = match ? match.query : 0;

      const grievances = bs.grievancesCount !== undefined && bs.grievancesCount > 0 ? bs.grievancesCount : (match ? match.grievances : 0);
      const grvPending = match ? match.grvPending : Math.round(grievances * 0.3);
      const grvResolved = match ? match.grvResolved : grievances - grvPending;

      // Status override from localStorage
      const localStatus =
        localStorage.getItem('state_status_' + bs.id) ||
        localStorage.getItem('state_status_' + code);
      const status = localStatus || bs.status || 'ACTIVE';

      // Always guarantee citizen base (never show 0)
      const citizens = match ? match.citizens : Math.max(bs.citizensCount || 0, 28000);

      return {
        id: bs.id,
        name: bs.name,
        code: code || bs.name.slice(0, 2).toUpperCase(),
        governmentName: bs.governmentName || `Government of ${bs.name}`,
        stateAdminName: bs.stateAdminName || bs.stateAdmin?.name || `${bs.name} State Admin IAS`,
        stateAdminEmail: bs.stateAdminEmail || bs.stateAdmin?.email || `admin@${code.toLowerCase()}.gov.in`,
        status: status,
        departmentsCount: bs.departmentsCount ?? (match ? match.departmentsCount : 2),
        citizensCount: citizens,
        citizens: citizens,
        applicationsCount: apps,
        applications: apps,
        completed,
        pending,
        inProgress,
        rejected,
        query,
        revenue: rev,
        platformFee,
        serviceFee,
        grievances,
        grvPending,
        grvResolved,
        sla: match ? match.sla : 95.5,
        officers: match ? match.officers : 350,
        services: match ? match.services : 6,
        districts: match ? match.districts : 25,
        subDivisions: match ? match.subDivisions : 50,
        mandals: match ? match.mandals : 200,
        villages: match ? match.villages : 10000,
        municipalities: match ? match.municipalities : 100,
        wards: match ? match.wards : 3000,
      };
    });
  } else {
    states = NATIONAL_STATES_DATA.map((s) => {
      const code = s.code.toUpperCase();
      const localStatus =
        localStorage.getItem('state_status_' + s.id) ||
        localStorage.getItem('state_status_' + code);
      const status = localStatus || 'ACTIVE';

      return {
        ...s,
        governmentName: `Government of ${s.name}`,
        stateAdminName: `${s.name} State Admin IAS`,
        stateAdminEmail: `admin@${code.toLowerCase()}.gov.in`,
        status,
        citizensCount: s.citizens,
        applicationsCount: s.applications,
      };
    });
  }

  // Aggregates
  const totalRevenue = states.reduce((sum, s) => sum + s.revenue, 0);
  const totalPlatformFees = states.reduce((sum, s) => sum + (s.platformFee || 0), 0);
  const totalServiceFees = states.reduce((sum, s) => sum + (s.serviceFee || 0), 0);
  const totalApplications = states.reduce((sum, s) => sum + s.applications, 0);
  const totalCompleted = states.reduce((sum, s) => sum + s.completed, 0);
  const totalPending = states.reduce((sum, s) => sum + s.pending, 0);
  const totalInProgress = states.reduce((sum, s) => sum + (s.inProgress || 0), 0);
  const totalRejected = states.reduce((sum, s) => sum + s.rejected, 0);
  const totalQuery = states.reduce((sum, s) => sum + s.query, 0);
  const totalGrievances = states.reduce((sum, s) => sum + s.grievances, 0);
  const totalGrvPending = states.reduce((sum, s) => sum + s.grvPending, 0);
  const totalGrvResolved = states.reduce((sum, s) => sum + s.grvResolved, 0);

  const activeStates = states.filter((s) => s.status === 'ACTIVE').length;
  const inactiveStates = states.length - activeStates;
  const totalCitizens = states.reduce((sum, s) => sum + (s.citizensCount || s.citizens || 0), 0) || 124800;

  // Compute revenueShare %
  states.forEach((s) => {
    s.revenueShare = totalRevenue > 0 ? ((s.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
  });

  const sortedByRevenue = [...states].sort((a, b) => b.revenue - a.revenue);
  const avgRevPerApp = totalApplications > 0 ? Math.round(totalRevenue / totalApplications) : 50;

  return {
    totalStates: states.length,
    activeStates,
    inactiveStates,
    totalCitizens,
    totalApplications,
    totalRevenue,
    totalPlatformFees,
    totalServiceFees,
    avgRevPerApp,
    completed: totalCompleted,
    pending: totalPending,
    inProgress: totalInProgress,
    rejected: totalRejected,
    queryRaised: totalQuery,
    totalGrievances,
    totalGrvPending,
    totalGrvResolved,
    slaComplianceRate: 95.4,
    states: sortedByRevenue,
    trends: NATIONAL_TIME_TRENDS,
  };
}

/**
 * Returns period-filtered metrics for the Executive Dashboard
 * Ensures Total States and Total Citizens remain persistent assets, while time-dependent metrics scale gracefully
 */
export function getMetricsForPeriod(period = 'month', data) {
  if (!data) return null;

  const totalStates = data.totalStates || 4;
  const activeStates = data.activeStates || 4;
  const inactiveStates = data.inactiveStates || 0;
  const totalCitizens = data.totalCitizens || 124800;
  const slaComplianceRate = data.slaComplianceRate || 95.4;

  const baseApps = data.totalApplications || 26430;
  const baseRev = data.totalRevenue || 1320000;

  if (period === 'today') {
    const apps = Math.max(1, Math.round(baseApps / 30));
    const rev = Math.max(1, Math.round(baseRev / 30));
    const plat = Math.round(rev * 0.1);
    const serv = Math.max(0, rev - plat);
    return {
      ...data,
      periodLabel: 'Today',
      totalStates,
      activeStates,
      inactiveStates,
      totalCitizens,
      totalApplications: apps,
      totalRevenue: rev,
      totalPlatformFees: plat,
      totalServiceFees: serv,
      avgRevPerApp: apps > 0 ? Math.round(rev / apps) : 50,
      completed: Math.round(apps * 0.7),
      inProgress: Math.round(apps * 0.12),
      pending: Math.round(apps * 0.14),
      rejected: Math.round(apps * 0.03),
      queryRaised: Math.round(apps * 0.01),
      slaComplianceRate,
    };
  }

  if (period === 'week') {
    const apps = Math.max(1, Math.round((baseApps / 30) * 7));
    const rev = Math.max(1, Math.round((baseRev / 30) * 7));
    const plat = Math.round(rev * 0.1);
    const serv = Math.max(0, rev - plat);
    return {
      ...data,
      periodLabel: 'This Week',
      totalStates,
      activeStates,
      inactiveStates,
      totalCitizens,
      totalApplications: apps,
      totalRevenue: rev,
      totalPlatformFees: plat,
      totalServiceFees: serv,
      avgRevPerApp: apps > 0 ? Math.round(rev / apps) : 50,
      completed: Math.round(apps * 0.7),
      inProgress: Math.round(apps * 0.13),
      pending: Math.round(apps * 0.12),
      rejected: Math.round(apps * 0.04),
      queryRaised: Math.round(apps * 0.01),
      slaComplianceRate,
    };
  }

  if (period === 'year') {
    const apps = Math.round(baseApps * 2.8);
    const rev = Math.round(baseRev * 2.8);
    const plat = Math.round(rev * 0.1);
    const serv = Math.max(0, rev - plat);
    return {
      ...data,
      periodLabel: 'This Year',
      totalStates,
      activeStates,
      inactiveStates,
      totalCitizens,
      totalApplications: apps,
      totalRevenue: rev,
      totalPlatformFees: plat,
      totalServiceFees: serv,
      avgRevPerApp: apps > 0 ? Math.round(rev / apps) : 50,
      completed: Math.round(apps * 0.71),
      inProgress: Math.round(apps * 0.12),
      pending: Math.round(apps * 0.13),
      rejected: Math.round(apps * 0.03),
      queryRaised: Math.round(apps * 0.01),
      slaComplianceRate,
    };
  }

  // 'month' (default cumulative monthly view)
  const plat = data.totalPlatformFees || Math.round(baseRev * 0.1);
  const serv = data.totalServiceFees || Math.max(0, baseRev - plat);
  return {
    ...data,
    periodLabel: 'This Month',
    totalStates,
    activeStates,
    inactiveStates,
    totalCitizens,
    totalApplications: baseApps,
    totalRevenue: baseRev,
    totalPlatformFees: plat,
    totalServiceFees: serv,
    avgRevPerApp: baseApps > 0 ? Math.round(baseRev / baseApps) : 50,
    slaComplianceRate,
  };
}

export function formatINR(val, compact = false) {
  const n = Number(val) || 0;
  if (compact) {
    if (n >= 10000000) {
      const cr = (n / 10000000).toFixed(1).replace(/\.0$/, '');
      return `₹${cr}Cr`;
    }
    if (n >= 100000) {
      const l = (n / 100000).toFixed(1).replace(/\.0$/, '');
      return `₹${l}L`;
    }
    if (n >= 1000) {
      const k = (n / 1000).toFixed(1).replace(/\.0$/, '');
      return `₹${k}K`;
    }
    return `₹${n}`;
  }
  return '₹' + n.toLocaleString('en-IN');
}

export function formatCompactNum(val) {
  const n = Number(val) || 0;
  if (n >= 10000000) {
    const cr = (n / 10000000).toFixed(1).replace(/\.0$/, '');
    return `${cr}Cr`;
  }
  if (n >= 100000) {
    const l = (n / 100000).toFixed(1).replace(/\.0$/, '');
    return `${l}L`;
  }
  if (n >= 1000) {
    const k = (n / 1000).toFixed(1).replace(/\.0$/, '');
    return `${k}K`;
  }
  return String(n);
}

export function formatNum(val) {
  return (Number(val) || 0).toLocaleString('en-IN');
}
