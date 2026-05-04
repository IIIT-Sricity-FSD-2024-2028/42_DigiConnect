const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, 'root', 'back-end', 'src', 'data', 'store.ts');
let storeContent = fs.readFileSync(storePath, 'utf8');

// Replacements map
const replacements = {
  // Navigation
  '"link": "supervisor/pending-approvals.html"': '"link": "supervisor/supervisor-dashboard.html"',
  "'link': 'supervisor/pending-approvals.html'": "'link': 'supervisor/supervisor-dashboard.html'",

  // Users
  'CIT-001': 'CIT-1001',
  'CIT-002': 'CIT-1002',
  'CIT-003': 'CIT-1003',
  'EMP-001': 'EMP-1001',
  'EMP-002': 'EMP-1002',
  'EMP-003': 'EMP-1003',
  'EMP-004': 'EMP-1004',
  'EMP-005': 'EMP-1005',
  'EMP-006': 'EMP-1006',
  'EMP-007': 'EMP-1007',
  'EMP-008': 'EMP-1008',
  'EMP-009': 'EMP-1009',
  'SUP-001': 'SUP-1001',
  'SUP-002': 'SUP-1002',
  'SUP-003': 'SUP-1003',
  'ADM-001': 'ADM-1001',
  'GO-001': 'GO-1001',
  
  // Grievances
  'GRV-001': 'GRV-1001',
  'GRV-002': 'GRV-1002',
  'GRV-003': 'GRV-1003',
  'GRV-004': 'GRV-1004',
  'GRV-005': 'GRV-1005',
  
  // Applications
  'APP-REV-001': 'APP-1001',
  'APP-WEL-001': 'APP-1002',
  'APP-MUN-001': 'APP-1003',
  'APP-REV-002': 'APP-1004',
  'APP-WEL-002': 'APP-1005',
  'APP-MUN-002': 'APP-1006',
  'APP-REV-003': 'APP-1007',
  'APP-WEL-003': 'APP-1008',
  'APP-MUN-003': 'APP-1009'
};

// Also replace specific instances that might be missing from the map above
// Just to be exhaustive, I'll iterate through the map
for (const [oldVal, newVal] of Object.entries(replacements)) {
  // Use regex to replace globally
  const regex = new RegExp(oldVal, 'g');
  storeContent = storeContent.replace(regex, newVal);
}

fs.writeFileSync(storePath, storeContent, 'utf8');
console.log('Replacements completed successfully.');
