import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/DashboardTab.tsx', 'utf8');

// Replace `glow-text`
content = content.replace(/glow-text/g, '');
content = content.replace(/glow-border/g, '');

const goalCard = `
         <div className="glass-premium p-8 flex flex-col justify-center min-w-[340px] relative overflow-hidden group border border-lilac/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all"></div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Meta de Vendas Mensal</span>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-sans font-black text-black">{formatCurrency(currentMonthRevenue)}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ {formatCurrency(monthlyGoal)}</span>
            </div>
            
            <div className="w-full h-2 bg-gray-50 rounded-full mt-2 border border-gray-100 overflow-hidden">
               <motion.div 
                 className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                 initial={{ width: 0 }}
                 animate={{ width: \`\${Math.min(goalProgress, 100)}%\` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </div>
            
            <div className="flex justify-between items-center mt-3">
               <span className="text-[10px] font-black uppercase text-blue-500">Progressão: {goalProgress.toFixed(1)}%</span>
               <span className="text-[10px] font-black uppercase text-emerald-500">
                 Previsão: {formatCurrency((currentMonthRevenue / (new Date().getDate() || 1)) * daysInMonth)}
               </span>
            </div>
         </div>
`;

// Insert after the existing glass-premium card in the header
const headerRegex = /(<div className="glass-premium p-8 flex items-center gap-8 min-w-\[340px\] relative overflow-hidden group">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;

content = content.replace(headerRegex, `$1\n${goalCard}`);

// And while I'm at it, fix the first glass-premium card too (removing bg-slate-900 etc). Wait, the text color was slate-900, which is dark. So it's fine. 
// Just ensure `glass-premium` has standard white background instead of a glossy gray if it was grey.
// Let's modify `glass-premium` if it is in css.
fs.writeFileSync('src/components/Admin/DashboardTab.tsx', content);

// Also remove `glow-text` from index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/\.glow-text \{[\s\S]*?\}/, '');
fs.writeFileSync('src/index.css', css);

console.log('done dashboard');
