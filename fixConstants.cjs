const fs = require('fs');

let content = fs.readFileSync('src/constants.ts', 'utf8');

let pCount = 1;
content = content.replace(/id:\s*['"]p\d+['"]\s*,\s*\n\s*company:\s*'pallyra'/g, () => `id: "LP-${String(pCount++).padStart(4, '0')}",\n    company: 'pallyra'`);

content = content.replace(/id:\s*['"]p\d+['"]/g, () => `id: "LP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}"`);

let gCount = 1;
content = content.replace(/id:\s*['"]g\d+['"]/g, () => `id: "CG-${String(gCount++).padStart(4, '0')}"`);

let mCount = 1;
content = content.replace(/id:\s*['"]m\d+['"]/g, () => `id: "MS-${String(mCount++).padStart(4, '0')}"`);

fs.writeFileSync('src/constants.ts', content);
