import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

if (!content.includes('@keyframes sparkle')) {
  const css = `
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
  50% { opacity: 1; transform: scale(1.5) translateY(-20px); }
}
.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}
`;
  content += css;
  fs.writeFileSync('src/index.css', content);
}
console.log('done css');
