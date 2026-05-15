import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/ProductsTab.tsx', 'utf8');

content = content.replace(
  /const labor = globalCosts\.labor \* laborHours;/g,
  'const labor = globalCosts.labor * (laborHours / 60);'
);

content = content.replace(
  /<span className="font-mono text-white\/80">/g,
  '<span className="font-mono text-slate-800">' // Just another small fix for white text inside a gray card
);
content = content.replace(
  /text-white'\}\`/g,
  "text-gray-400'}`" // The zero percentage margin if cost is 0
);

fs.writeFileSync('src/components/Admin/ProductsTab.tsx', content);
console.log('done calc fix');
