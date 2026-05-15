import fs from 'fs';

let content = fs.readFileSync('src/components/CatalogView.tsx', 'utf8');

content = content.replace(/<img /g, '<img loading="lazy" ');

fs.writeFileSync('src/components/CatalogView.tsx', content);

// Also ProductDetailModal might use images
if (fs.existsSync('src/components/ProductDetailModal.tsx')) {
  let content2 = fs.readFileSync('src/components/ProductDetailModal.tsx', 'utf8');
  content2 = content2.replace(/<img /g, '<img loading="lazy" ');
  fs.writeFileSync('src/components/ProductDetailModal.tsx', content2);
}

console.log('done lazy');
