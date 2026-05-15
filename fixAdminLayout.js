import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
  }
}

// 1. AdminDashboard.tsx sidebar collapse & background
let adminContent = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add state for sidebar
adminContent = adminContent.replace(
  /const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);/,
  "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);"
);

// Sidebar wrapper
// <aside className="w-72 bg-slate-50 border-r border-slate-100 flex flex-col hidden lg:flex flex-shrink-0 relative z-[60] shadow-xl shadow-slate-200/50">
adminContent = adminContent.replace(
  /<aside className="w-72 bg-slate-50 border-r border-slate-100 flex flex-col hidden lg:flex flex-shrink-0 relative z-\[60\] shadow-xl shadow-slate-200\/50">/g,
  '<aside className={`bg-white border-r border-gray-100 flex flex-col hidden lg:flex flex-shrink-0 relative z-[60] shadow-xl shadow-gray-200/50 transition-all duration-300 ${isSidebarCollapsed ? "w-24 items-center" : "w-72"}`}>'
);

// We need to hide the labels when collapsed
// And add a toggle button
const collapseButton = `
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-10 bg-white border border-gray-200 p-1.5 rounded-full shadow-md z-50 text-gray-500 hover:text-black transition-all"
          >
            <ChevronRight size={14} className={\`transition-transform duration-300 \${!isSidebarCollapsed ? "rotate-180" : ""}\`} />
          </button>
`;

adminContent = adminContent.replace(
  /<div className="p-8">/,
  `${collapseButton}\n        <div className={\`p-8 \${isSidebarCollapsed ? "px-4" : ""}\`}>`
);

adminContent = adminContent.replace(
  /<h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">/,
  '<h1 className={`text-xl font-black text-slate-800 tracking-tight uppercase ${isSidebarCollapsed ? "hidden" : "block"}`}>'
);

adminContent = adminContent.replace(
  /<span className="text-\[10px\] font-black tracking-widest text-slate-400">ADMINISTRAÇÃO<\/span>/,
  '<span className={`text-[10px] font-black tracking-widest text-slate-400 ${isSidebarCollapsed ? "hidden" : "block"}`}>ADMINISTRAÇÃO</span>'
);

adminContent = adminContent.replace(
  /<span className="text-\[10px\] font-black uppercase tracking-widest leading-relaxed">/,
  '<span className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${isSidebarCollapsed ? "hidden" : "block"}`}>'
);

adminContent = adminContent.replace(
  /\{id === 'orders' && unreadCount > 0 && \(/g,
  '{!isSidebarCollapsed && id === \'orders\' && unreadCount > 0 && ('
);
adminContent = adminContent.replace(
  /\{id === 'suggestions' && unreadSuggestions > 0 && \(/g,
  '{!isSidebarCollapsed && id === \'suggestions\' && unreadSuggestions > 0 && ('
);

// Fix background
adminContent = adminContent.replace(/bg-slate-50/g, 'bg-white');
adminContent = adminContent.replace(/bg-\[#FAF9F6\]/g, 'bg-white');

fs.writeFileSync('src/components/AdminDashboard.tsx', adminContent);

// Fix other tabs
const tabs = ['OrdersTab.tsx', 'ProductsTab.tsx', 'ClientsTab.tsx', 'FinanceTab.tsx', 'ReportsTab.tsx', 'SettingsTab.tsx', 'GiftListsTab.tsx', 'DashboardTab.tsx'];

tabs.forEach(tab => {
  const p = path.join('src/components/Admin/', tab);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/bg-\[#FAF9F6\]/g, 'bg-white');
    content = content.replace(/bg-slate-50\/50/g, 'bg-white');
    content = content.replace(/bg-slate-50/g, 'bg-white');
    content = content.replace(/bg-gray-50/g, 'bg-white'); // Maybe not all gray-50 should be white (like inputs), let's keep inputs if they have border.
    
    // Change large backgrounds: 
    // className="space-y-6 bg-[#FAF9F6] p-4 md:p-8 rounded-[2.5rem]"
    content = content.replace(/className="space-y-6 bg-white p-4 md:p-8 rounded-\[2\.5rem\]"/g, 'className="space-y-6 bg-white p-4 md:p-8 rounded-[2.5rem]"');
    
    fs.writeFileSync(p, content);
  }
});

console.log('done layout admin');
