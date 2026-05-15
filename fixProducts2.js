import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/ProductsTab.tsx', 'utf8');

// The input
content = content.replace(/text-white placeholder:text-slate-400/g, 'text-slate-900 placeholder:text-slate-400');

// The maximize icon
content = content.replace(/className="text-white shadow-lg"/g, 'className="text-slate-900"');

// The product name
content = content.replace(/text-white tracking-tight/g, 'text-slate-900 tracking-tight');

// The price
content = content.replace(/text-sm font-sans font-black text-white glow-text/g, 'text-sm font-sans font-black text-slate-900');

fs.writeFileSync('src/components/Admin/ProductsTab.tsx', content);
console.log('done');
