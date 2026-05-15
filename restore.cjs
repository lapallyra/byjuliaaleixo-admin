const fs = require('fs');
let s = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');
s = s.split('docId || crypto.randomUUID()').join('');
fs.writeFileSync('src/components/CheckoutModal.tsx', s);
