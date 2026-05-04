const fs = require('fs');
const file = 'e:/Project/stock-option/frontend/src/app/interviewStudy/mbd-project/mbd-project.component.html';
let content = fs.readFileSync(file, 'utf8');

// Replace { with {{ '{' }} and } with {{ '}' }}
content = content.replace(/\{/g, "{{ '{' }}");
content = content.replace(/\}/g, "{{ '}' }}");

fs.writeFileSync(file, content);
console.log('Replaced all braces successfully!');
