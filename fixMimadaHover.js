import fs from 'fs';

let content = fs.readFileSync('src/components/EntryView.tsx', 'utf8');

// Change Mimada's unhovered background color to '#FF007F'
// Wait, currently mimada's color is '#ffffff' in the config array, which means on hover it becomes white.
// Let's change the color property of mimada to '#db2777' or '#FF007F'.
content = content.replace(
  /id: 'mimada' as CompanyId,([\s\S]*?)color: '#ffffff',/m,
  "id: 'mimada' as CompanyId,$1color: '#FF007F',"
);

// Remove the inline style from h2
content = content.replace(
  /<h2 className=\{`font-fancy \$\{theme\.specialText\} mb-2 tracking-wide transition-all duration-400 group-hover:text-\[var\(--theme-text,white\)\] whitespace-nowrap \$\{company\.id === 'guennita' \? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'\}`\} style=\{\{ color: company\.id === 'mimada' \? '#FF007F' : undefined \}\}>/g,
  "<h2 className={`font-fancy ${theme.specialText} mb-2 tracking-wide transition-all duration-400 group-hover:!text-[var(--theme-text,white)] whitespace-nowrap ${company.id === 'guennita' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>"
);

// Modify the button
content = content.replace(
  /<button className=\{`bg-white border-transparent text-black py-4 px-12 rounded-full text-\[10px\] font-black tracking-widest uppercase transition-all duration-500 hover:scale-110 shadow-lg group-hover:bg-white\/20 group-hover:text-\[var\(--theme-text,white\)\] group-hover:border-\[var\(--theme-text,white\)\]\/40 border`\} style=\{\{ color: company\.id === 'mimada' \? '#FF007F' : undefined, borderColor: company\.id === 'mimada' \? '#FF007F' : undefined \}\}>/g,
  "<button className={`bg-white py-4 px-12 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 hover:scale-110 shadow-lg group-hover:bg-white/20 group-hover:!text-[var(--theme-text,white)] group-hover:!border-[var(--theme-text,white)]/40 border ${company.id === 'mimada' ? 'text-[#FF007F] border-[#FF007F]' : 'text-black border-transparent'}`}>"
);

// Also need to fix the slogan text on hover to make sure it's white.
// It already has group-hover:text-[var(--theme-text,white)]. Let's make it !text-[...] to ensure overriding.
content = content.replace(
  /group-hover:text-\[var\(--theme-text,white\)\] group-hover:opacity-100/g,
  "group-hover:!text-[var(--theme-text,white)] group-hover:opacity-100"
);

fs.writeFileSync('src/components/EntryView.tsx', content);
console.log('done');
