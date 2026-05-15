const fs = require('fs');

const files = [
  'src/components/Admin/ReportsTab.tsx',
  'src/components/Admin/OrderReceiptModal.tsx',
  'src/components/Admin/ProductsTab.tsx',
  'src/components/Admin/SettingsTab.tsx',
  'src/components/Admin/ImageUpload.tsx',
  'src/components/Admin/GiftListsTab.tsx',
  'src/components/Catalog/CatalogHeader.tsx',
  'src/components/Catalog/FeaturedProductsCarousel.tsx',
  'src/components/EntryView.tsx',
  'src/components/CatalogView.tsx',
  'src/components/CheckoutModal.tsx',
  'src/components/DocumentSearch.tsx',
  'src/components/GiftListSidebar.tsx',
  'src/components/CartSidebar.tsx',
  'src/components/SearchedGiftListModal.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/ProductDetailModal.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(/<img[\s\n]/)) {
    let importPath = '';
    if (file.startsWith('src/components/Admin/')) importPath = '../ImageWithFallback';
    else if (file.startsWith('src/components/Catalog/')) importPath = '../ImageWithFallback';
    else importPath = './ImageWithFallback';

    if (!content.includes('ImageWithFallback')) {
      const importStmt = `import { ImageWithFallback } from '${importPath}';`;
      const lines = content.split('\n');
      let lastImportInd = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('import ')) {
          lastImportInd = i;
          break;
        }
      }
      if(lastImportInd !== -1) {
          lines.splice(lastImportInd + 1, 0, importStmt);
      } else {
          lines.unshift(importStmt);
      }
      content = lines.join('\n');
    }

    content = content.replace(/<img([\s\n])/g, '<ImageWithFallback$1');
    content = content.replace(/<\/img>/g, '</ImageWithFallback>');

    fs.writeFileSync(file, content);
    console.log('Processed', file);
  }
});
