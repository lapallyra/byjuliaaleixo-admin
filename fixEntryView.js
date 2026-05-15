import fs from 'fs';

let content = fs.readFileSync('src/components/EntryView.tsx', 'utf8');

// The logo currently has: group-hover:scale-105
// Change to: group-hover:[transform:rotateY(360deg)]
content = content.replace(
  /className="w-full h-full object-contain p-2 transition-transform duration-700"/g,
  'className="w-full h-full object-contain p-2 transition-transform duration-[1.5s] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transform:rotateY(360deg)]"'
);

// Add Sparkles component before EntryView
const sparklesComp = `
const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem] z-0">
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            top: \`\${Math.random() * 100}%\`,
            left: \`\${Math.random() * 100}%\`,
            animationDelay: \`\${Math.random() * 1}s\`,
            animationDuration: \`\${1 + Math.random()}s\`
          }}
        />
      ))}
    </div>
  );
};
`;

if(!content.includes('const Sparkles')) {
  content = content.replace(/export default function EntryView/g, sparklesComp + '\nexport default function EntryView');
}

// Add sparkles inside the group
content = content.replace(
  /className=\{\`group theme-\$\{company.id === 'mimada' \? 'mimadasim' : company.id === 'pallyra' \? 'lapallyra' : 'guennita'\} (.*?)\`\}>/g,
  'className={`group theme-${company.id === \'mimada\' ? \'mimadasim\' : company.id === \'pallyra\' ? \'lapallyra\' : \'guennita\'} $1`}>\n            <Sparkles />'
);

// Slogan/Description: Ensure it's hidden normally and revealed smoothly on hover.
content = content.replace(
  /className="text-\[11px\] md:text-xs font-sans leading-relaxed tracking-wide text-gray-500(.*?) max-w-\[260px\]"/g,
  'className="text-[11px] md:text-xs font-sans leading-relaxed tracking-wide text-gray-400 opacity-0 translate-y-4 max-h-0 mb-0 group-hover:max-h-40 group-hover:mb-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:!text-[var(--theme-text,white)] max-w-[260px] relative z-10"'
);

// Make the logo container higher z-index
content = content.replace(
  /className="h-24 flex items-center justify-center text-7xl mb-6 transition-transform duration-500 ease-out group-hover:scale-105"/g,
  'className="h-24 flex items-center justify-center text-7xl mb-6 transition-transform duration-500 ease-out group-hover:scale-105 relative z-10"'
);
content = content.replace(
  /className=\{\`font-fancy \$\{theme\.specialText\} (.*?)\`\}/g,
  'className={`font-fancy ${theme.specialText} $1 relative z-10`}'
);
content = content.replace(
  /text-\[10px\] font-black tracking-widest uppercase transition-all duration-500 hover:scale-110 shadow-lg/g,
  'text-[10px] font-black tracking-widest uppercase transition-all duration-500 hover:scale-110 shadow-lg relative z-10'
);

fs.writeFileSync('src/components/EntryView.tsx', content);
console.log('done EntryView');
