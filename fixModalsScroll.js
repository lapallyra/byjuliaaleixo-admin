import fs from 'fs';
import path from 'path';

const files = [
  'src/components/Admin/ClientsTab.tsx',
  'src/components/Admin/GiftListsTab.tsx',
  'src/components/Admin/OrderReceiptModal.tsx',
  'src/components/Admin/ProductsTab.tsx',
  'src/components/Admin/SettingsTab.tsx',
  'src/components/Admin/OrdersTab.tsx',
  'src/components/Admin/InventoryTab.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Most Modals look like:
    // <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative">
    // or max-w-3xl or max-w-2xl
    // We can add overflow-y-auto max-h-[90vh] to `max-w-` divs inside `fixed inset-0`
    
    content = content.replace(/className="bg-white(.*?)max-w-([\w]+)(.*?)relative"/g, 'className="bg-white $1 max-w-$2 $3 relative max-h-[90vh] overflow-y-auto"');
    content = content.replace(/className="bg-white(.*?)max-w-([\w]+)(.*?)relative (.*?)"/g, 'className="bg-white $1 max-w-$2 $3 relative max-h-[90vh] overflow-y-auto $4"');
    
    // Also, handle forms so they have proper scrolling behavior if they have children
    content = content.replace(/bg-white rounded-\[3rem\] w-full max-w-2xl overflow-hidden shadow-2xl border border-white\/10 flex flex-col/g, 'bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]');
    content = content.replace(/flex-1 overflow-y-auto p-8/g, 'flex-1 overflow-y-auto p-4 md:p-8');

    fs.writeFileSync(file, content);
  }
});
console.log('done scroll popup');
