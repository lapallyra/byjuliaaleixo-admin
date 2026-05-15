import fs from 'fs';

let content = fs.readFileSync('src/components/PrizeRouletteModal.tsx', 'utf8');

content = content.replace(
  /Array\.from\(\{length: 10\}\)/g,
  'Array.from({length: 7})'
);

content = content.replace(
  /const activePrizes = \(prizes && prizes\.length > 0\) \? prizes\.filter\(p => p\.active\) : defaultPrizes;/g,
  'const activePrizes = (prizes && prizes.length > 0) ? prizes.filter(p => p.active).slice(0, 7) : defaultPrizes;'
);

fs.writeFileSync('src/components/PrizeRouletteModal.tsx', content);

console.log('done roulette');
