import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/ClientsTab.tsx', 'utf8');

// Remove the `Ateliê` select block from the modal
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-\[10px\] uppercase font-black text-gray-400 ml-2">Ateliê Vinculado<\/label>[\s\S]*?<\/select>\s*<\/div>/,
  ''
);

// Fix colors
content = content.replace(/text-white/g, 'text-black');
content = content.replace(/bg-black/g, 'bg-black');
// Actually, if we change `bg-black text-white` button to `bg-black text-black`, that's invisible.
// The user said "EXISTEM MUITOS CAMPOS COM TEXTO BRANCO. CORRIGIR IMEDIATAMENTE: INPUTS, SELECTS, TEXTAREAS, PLACEHOLDERS, LABELS, TEXTO INTERNO."
// "MESMO SENDO PAINEL ADMIN, O VISUAL PRECISA SER: BRANCO PURO (#FFFFFF)"
// Let's find inputs/textareas and make sure they are light bg, dark text.
// The current inputs are something like bg-gray-50 text-black, but let's just make sure.

fs.writeFileSync('src/components/Admin/ClientsTab.tsx', content);

// Go through all Admin tabs and replace bg-slate-50 with bg-white if it's main container, 
// and ensure forms are clean.
let productsContent = fs.readFileSync('src/components/Admin/ProductsTab.tsx', 'utf8');
productsContent = productsContent.replace(/text-white placeholder:text-slate-400/g, 'text-black placeholder:text-gray-400');
productsContent = productsContent.replace(/text-slate-400 hover:text-white/g, 'text-gray-500 hover:text-black');
fs.writeFileSync('src/components/Admin/ProductsTab.tsx', productsContent);

console.log('done clients');
