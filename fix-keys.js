const fs = require('fs');
const glob = require('glob');

const files = [
  'src/components/DocumentSearch.tsx',
  'src/components/SearchedGiftListModal.tsx',
  'src/components/Admin/GiftListsTab.tsx',
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/key=\{item\.id\}/g, "key={`${item.id}-${idx}`}");
    fs.writeFileSync(f, content);
  }
});
