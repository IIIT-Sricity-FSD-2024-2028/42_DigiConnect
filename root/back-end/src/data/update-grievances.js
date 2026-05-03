const fs = require('fs');
const file = 'c:/Users/Gnana Teja Varma/root/back-end/src/data/store.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/'id': 'GRV-061',[\s\S]*?'status': 'escalated',/g, match => match.replace("'status': 'escalated'", "'status': 'open'"));
content = content.replace(/'id': 'GRV-062',[\s\S]*?'status': 'escalated',/g, match => match.replace("'status': 'escalated'", "'status': 'investigating'"));

fs.writeFileSync(file, content, 'utf8');
console.log('Updated statuses for GRV-061 and GRV-062');
