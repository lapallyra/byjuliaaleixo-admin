import fs from 'fs';

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(/className="fixed left-0 top-0 bottom-0 w-80 glass-premium z-\[110\] lg:hidden border-r border-white\/10 flex flex-col"/g, 'className="fixed left-0 top-0 bottom-0 w-80 glass-premium z-[110] lg:hidden border-r border-slate-100 flex flex-col"');

content = content.replace(/<h1 className="font-sans font-black text-sm tracking-\[0.1em\] uppercase text-white">Admin<\/h1>/g, '<h1 className="font-sans font-black text-sm tracking-[0.1em] uppercase text-slate-900">Admin</h1>');

content = content.replace(/<p className="text-\[8px\] text-white\/40 uppercase tracking-widest font-black">Futuristic SaaS<\/p>/g, '<p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Futuristic SaaS</p>');

content = content.replace(/className="p-3 bg-white\/5 rounded-xl text-white\/40 active:scale-95 transition-transform"/g, 'className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 active:scale-95 transition-transform"');

content = content.replace(/className=\{`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all \$\{activeTab === item.id \? 'bg-lilac\/20 text-white' : 'text-white\/40 active:bg-white\/5'\}`\}/g, 'className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? \'bg-lilac/20 text-slate-900\' : \'text-slate-400 hover:text-slate-900 hover:bg-slate-50\'}`}');

content = content.replace(/<item.icon size=\{18\} className=\{activeTab === item.id \? 'text-lilac' : 'text-white\/30'\} \/>/g, '<item.icon size={18} className={activeTab === item.id ? \'text-lilac\' : \'text-slate-300 group-hover:text-slate-400\'} />');

// also fix border-white/10 to border-slate-100 below nav
content = content.replace(/border-t border-white\/10/g, 'border-t border-slate-100');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('done');
