import fs from 'fs';
let c = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
c = c.replace(/DollarSign, BarChart3, Sparkles, Gift/g, 'DollarSign, BarChart3, Sparkles, Gift, ChevronRight');
fs.writeFileSync('src/components/AdminDashboard.tsx', c);
console.log('lucide import fixed');
