import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /isEmergency: boolean;/g,
  "isEmergency: boolean;\n  paymentStatus?: 'pending' | 'paid' | 'cancelled' | 'partial' | 'refunded';"
);

fs.writeFileSync('src/types.ts', content);
console.log('done orders types');
