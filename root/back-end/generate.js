const fs = require('fs');

const dateSub = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const apps = [];
const grievances = [];

const C1 = 'CIT-001';
const C2 = 'CIT-002';
const C3 = 'CIT-003';

const DEPTS = {
  'Revenue': { sId: 'SVC-001', sName: 'Income Certificate', dName: 'Revenue Department', off: ['EMP-001', 'EMP-002', 'EMP-003'], sup: 'Deepak Verma', supId: 'SUP-001' },
  'Welfare': { sId: 'SVC-004', sName: 'Welfare / Subsidy Scheme', dName: 'Welfare Department', off: ['EMP-004', 'EMP-005', 'EMP-006'], sup: 'Kavitha Reddy', supId: 'SUP-002' },
  'Municipal': { sId: 'SVC-007', sName: 'Vendor License', dName: 'Municipal Corporation', off: ['EMP-007', 'EMP-008', 'EMP-009'], sup: 'Lakshmi Narayana', supId: 'SUP-003' }
};

const flowMap = [
  { citizen: C1, dept: 'Revenue', flows: [1, 2], officers: [0, 1] },
  { citizen: C1, dept: 'Welfare', flows: [3, 4], officers: [0, 1] },
  { citizen: C1, dept: 'Municipal', flows: [5, 6], officers: [0, 1] },
  { citizen: C2, dept: 'Revenue', flows: [3, 4], officers: [2, 0] },
  { citizen: C2, dept: 'Welfare', flows: [5, 6], officers: [2, 0] },
  { citizen: C2, dept: 'Municipal', flows: [1, 2], officers: [2, 0] },
  { citizen: C3, dept: 'Revenue', flows: [5, 6], officers: [1, 2] },
  { citizen: C3, dept: 'Welfare', flows: [1, 2], officers: [1, 2] },
  { citizen: C3, dept: 'Municipal', flows: [3, 4], officers: [1, 2] }
];

let appIdCounter = 3100;
let grvIdCounter = 60;

const cNames = { 'CIT-001': 'Ravi Kumar', 'CIT-002': 'Sunita Verma', 'CIT-003': 'Kaveri Devi' };
const oNames = {
  'EMP-001': 'Suresh Reddy', 'EMP-002': 'Anita Sharma', 'EMP-003': 'Ravi Teja',
  'EMP-004': 'Priya Nair', 'EMP-005': 'Kiran Babu', 'EMP-006': 'Aruna Kumari',
  'EMP-007': 'Mohan Das', 'EMP-008': 'Praveen Kumar', 'EMP-009': 'Rekha Singh'
};

flowMap.forEach(m => {
  const dept = DEPTS[m.dept];
  m.flows.forEach((flowId, i) => {
    const appId = 'APP-' + (appIdCounter++);
    const citizenName = cNames[m.citizen];
    const officerId = dept.off[m.officers[i]];
    const officerName = oNames[officerId];

    let app = {
      id: appId,
      serviceId: dept.sId,
      serviceName: dept.sName,
      serviceType: 'certificate',
      citizenId: m.citizen,
      citizenName: citizenName,
      jurisdiction: 'Secunderabad',
      officerId: officerId,
      officerName: officerName,
      dept: dept.dName,
      status: '',
      remarks: '',
      fee: 50,
      paymentStatus: 'paid',
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: dateSub(0), status: 'verified' }],
      timeline: []
    };

    if (flowId === 1) {
      app.status = 'completed';
      app.submittedDate = dateSub(5);
      app.slaDate = dateSub(-2);
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(5), actor: citizenName, note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(4), actor: 'System', note: '' },
        { action: 'Status updated to approved', date: dateSub(3), actor: officerName, note: 'Documents verified. Approved.' },
        { action: 'Supervisor Final Approval', date: dateSub(2), actor: dept.sup, note: 'Approved for certificate generation' },
        { action: 'Certificate Generated', date: dateSub(1), actor: 'System', note: '' }
      ];
    } else if (flowId === 2) {
      app.status = 'escalated';
      app.submittedDate = dateSub(10);
      app.slaDate = dateSub(3);
      app.remarks = 'SLA Exceeded';
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(10), actor: citizenName, note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(9), actor: 'System', note: '' },
        { action: 'SLA Breached', date: dateSub(3), actor: 'System', note: 'Officer failed to act within SLA' },
        { action: 'Supervisor Warning Sent', date: dateSub(2), actor: dept.sup, note: 'Please process immediately' },
        { action: 'Escalated to Supervisor', date: dateSub(1), actor: 'System', note: '' }
      ];
      grievances.push({
        id: 'GRV-0' + (grvIdCounter++),
        category: 'delay',
        citizenId: m.citizen,
        citizenName: citizenName,
        relatedAppId: appId,
        description: 'Application delayed past SLA.',
        filedDate: dateSub(2),
        status: 'escalated',
        priority: 'high',
        officerId: 'GRV-001',
        officerName: 'Nalini Rao',
        history: [
          { action: 'Grievance Filed', date: dateSub(2), note: 'Delay complaint' },
          { action: 'Investigating', date: dateSub(1), note: 'Checking SLA' },
          { action: 'Warning Issued to Officer', date: dateSub(1), note: 'Warning issued for SLA breach' },
          { action: 'Escalated to Supervisor', date: dateSub(0), note: 'Grievance escalated' }
        ]
      });
    } else if (flowId === 3) {
      app.status = 'under-review';
      app.submittedDate = dateSub(15);
      app.slaDate = dateSub(-5);
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(15), actor: citizenName, note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(14), actor: 'System', note: '' },
        { action: 'Status updated to query', date: dateSub(12), actor: officerName, note: 'Please provide missing affidavit' },
        { action: 'SLA Breached (Citizen)', date: dateSub(5), actor: 'System', note: 'Citizen did not respond' },
        { action: 'Query Responded', date: dateSub(1), actor: citizenName, note: 'Affidavit uploaded' },
        { action: 'SLA Reset', date: dateSub(1), actor: 'System', note: 'SLA restarted after response' }
      ];
    } else if (flowId === 4) {
      app.status = 'rejected';
      app.submittedDate = dateSub(8);
      app.slaDate = dateSub(-1);
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(8), actor: citizenName, note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(7), actor: 'System', note: '' },
        { action: 'Status updated to rejected', date: dateSub(6), actor: officerName, note: 'Invalid documents' }
      ];
      grievances.push({
        id: 'GRV-0' + (grvIdCounter++),
        category: 'rejection',
        citizenId: m.citizen,
        citizenName: citizenName,
        relatedAppId: appId,
        description: 'Officer rejected application wrongly.',
        filedDate: dateSub(5),
        status: 'escalated',
        priority: 'medium',
        officerId: 'GRV-001',
        officerName: 'Nalini Rao',
        history: [
          { action: 'Grievance Filed', date: dateSub(5), note: 'Rejection dispute' },
          { action: 'Investigating', date: dateSub(4), note: 'Reviewing documents' },
          { action: 'Escalated to Supervisor', date: dateSub(2), note: 'Escalated to Appellate Authority for review' }
        ]
      });
    } else if (flowId === 5) {
      app.status = 'escalated';
      app.submittedDate = dateSub(6);
      app.slaDate = dateSub(1);
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(6), actor: citizenName, note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(5), actor: 'System', note: '' }
      ];
      grievances.push({
        id: 'GRV-0' + (grvIdCounter++),
        category: 'misconduct',
        citizenId: m.citizen,
        citizenName: citizenName,
        relatedAppId: appId,
        description: 'Officer demanded a bribe to process my file.',
        filedDate: dateSub(4),
        status: 'escalated',
        priority: 'high',
        officerId: 'GRV-001',
        officerName: 'Nalini Rao',
        history: [
          { action: 'Grievance Filed', date: dateSub(4), note: 'Misconduct complaint' },
          { action: 'Investigating', date: dateSub(3), note: 'Checking internal logs' },
          { action: 'Escalated to Supervisor', date: dateSub(2), note: 'Serious allegation, sent to MRO' },
          { action: 'Supervisor Notified SuperUser', date: dateSub(1), note: 'Suspension pending review' }
        ]
      });
    } else if (flowId === 6) {
      app.status = 'under-review';
      app.submittedDate = dateSub(4);
      app.slaDate = dateSub(-3);
      app.timeline = [
        { action: 'Application Submitted', date: dateSub(4), actor: citizenName, note: '' },
        { action: 'Payment Failed / Double Deducted', date: dateSub(4), actor: 'System', note: '' },
        { action: 'Assigned to ' + officerName, date: dateSub(3), actor: 'System', note: '' }
      ];
      grievances.push({
        id: 'GRV-0' + (grvIdCounter++),
        category: 'payment',
        citizenId: m.citizen,
        citizenName: citizenName,
        relatedAppId: appId,
        description: 'Amount deducted from bank but gateway shows failed.',
        filedDate: dateSub(3),
        status: 'resolved',
        priority: 'low',
        officerId: 'GRV-001',
        officerName: 'Nalini Rao',
        history: [
          { action: 'Grievance Filed', date: dateSub(3), note: 'Payment dispute' },
          { action: 'Investigating', date: dateSub(2), note: 'Checking payment gateway logs' },
          { action: 'Resolved', date: dateSub(1), note: 'Payment synced manually.' }
        ]
      });
    }
    apps.push(app);
  });
});

let storePath = './src/data/store.ts';
let content = fs.readFileSync(storePath, 'utf8');

const appsStr = 'const MOCK_APPLICATIONS = ' + JSON.stringify(apps, null, 2).replace(/"/g, "'") + ';';
const grvStr = 'const MOCK_GRIEVANCES = ' + JSON.stringify(grievances, null, 2).replace(/"/g, "'") + ';';

content = content.replace(/const MOCK_APPLICATIONS = \[\s*[\s\S]*?\s*\];/, appsStr);
content = content.replace(/const MOCK_GRIEVANCES = \[\s*[\s\S]*?\s*\];/, grvStr);

fs.writeFileSync(storePath, content);
console.log('Successfully updated store.ts with ' + apps.length + ' apps and ' + grievances.length + ' grievances.');
