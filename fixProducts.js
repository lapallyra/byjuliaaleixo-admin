import fs from 'fs';
const file = 'src/components/Admin/ProductsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard white variations inside the glass cards with slate variations
content = content.replace(/text-white\/40/g, 'text-slate-500');
content = content.replace(/text-white\/60/g, 'text-slate-600');
content = content.replace(/text-white\/30/g, 'text-slate-400');
content = content.replace(/text-white\/20/g, 'text-slate-400');
content = content.replace(/text-white\/10/g, 'text-slate-300');
content = content.replace(/bg-white\/5/g, 'bg-slate-50');
content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-50');
content = content.replace(/border-white\/5/g, 'border-slate-100');
content = content.replace(/border-white\/10/g, 'border-slate-200');

// There are a few direct text-white references that should be dark (except on bg-black/bg-rose etc)
// Let's do selective replace.
fs.writeFileSync(file, content);
console.log('done');
