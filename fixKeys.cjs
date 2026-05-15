const fs = require('fs');

function replaceFileContents(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

// Admin/ReportsTab.tsx
replaceFileContents('src/components/Admin/ReportsTab.tsx', [
    [/key=\{`customer-\$\{c\.id\}-\$\{idx\}`\}/g, 'key={`customer-${c.id}`}'],
    [/key=\{`prod-rank-\$\{p\.id\}-\$\{idx\}`\}/g, 'key={`prod-rank-${p.id}`}'],
]);

// Admin/OrdersTab.tsx
replaceFileContents('src/components/Admin/OrdersTab.tsx', [
    [/key=\{`\$\{order\.id\}-\$\{idx\}`\}/g, 'key={order.id}'],
    [/key=\{`cart-item-\$\{item\.id\}-\$\{idx\}`\}/g, 'key={`cart-item-${item.id}`}'],
    [/key=\{idx\}/g, 'key={order.id || idx}'],
]);

// Admin/DashboardTab.tsx
replaceFileContents('src/components/Admin/DashboardTab.tsx', [
    // We already have keys using order.id, but let's check idx
    [/key=\{idx\}/g, "key={order?.id ? `dash-order-${order.id}` : idx}"],
]);

// Admin/FinanceTab.tsx
replaceFileContents('src/components/Admin/FinanceTab.tsx', [
    [/key=\{idx\} className=\{`p-8/g, 'key={card.title} className={`p-8'],
    [/key=\{`order-\$\{o\.id\}-\$\{idx\}`\}/g, 'key={`order-${o.id}`}'],
]);

// Admin/InventoryTab.tsx
replaceFileContents('src/components/Admin/InventoryTab.tsx', [
    [/key=\{item\.id \? `crit-\$\{item\.id\}` : `crit-idx-\$\{idx\}`\}/g, 'key={`crit-${item.id}` || crypto.randomUUID()}'],
    [/key=\{insumo\.id \? `ins-\$\{insumo\.id\}` : `ins-idx-\$\{idx\}`\}/g, 'key={`ins-${insumo.id}` || crypto.randomUUID()}'],
]);

// Admin/GiftListsTab.tsx
replaceFileContents('src/components/Admin/GiftListsTab.tsx', [
    [/key=\{idx\} className="flex/g, "key={item.id || item.product_name || idx} className=\"flex"],
]);

// Admin/ClientsTab.tsx
replaceFileContents('src/components/Admin/ClientsTab.tsx', [
    [/key=\{`\$\{c\.id\}-\$\{idx\}`\}/g, 'key={c.id}'],
]);

// Admin/ProductsTab.tsx
replaceFileContents('src/components/Admin/ProductsTab.tsx', [
    [/key=\{`\$\{p\.id\}-\$\{idx\}`\}/g, 'key={p.id}'],
    [/key=\{idx\} className="relative group"/g, 'key={`img-${idx}`}'], // using img url later
]);

// CatalogView.tsx
replaceFileContents('src/components/CatalogView.tsx', [
    [/key=\{`hl-top-\$\{product\.id\}-\$\{idx\}`\}/g, 'key={`hl-top-${product.id}`}'],
    [/key=\{`\$\{product\.id\}-\$\{idx\}`\}/g, 'key={product.id}'],
]);

// DocumentSearch.tsx
replaceFileContents('src/components/DocumentSearch.tsx', [
    [/key=\{idx\} className="flex gap-4/g, 'key={item.id} className="flex gap-4'],
]);

// Catalog/FeaturedProductsCarousel.tsx
replaceFileContents('src/components/Catalog/FeaturedProductsCarousel.tsx', [
    [/key=\{`\$\{product\.id\}-\$\{idx\}`\}/g, 'key={product.id}'],
]);

// AdminDashboard.tsx
replaceFileContents('src/components/AdminDashboard.tsx', [
    [/key=\{`\$\{item\.id\}-\$\{idx\}`\}/g, 'key={item.id}'],
    [/key=\{`\$\{item\.id\}-mob-\$\{idx\}`\}/g, 'key={`mob-${item.id}`}'],
]);

// SearchedGiftListModal.tsx
replaceFileContents('src/components/SearchedGiftListModal.tsx', [
    [/key=\{`\$\{item\.id\}-\$\{idx\}`\}/g, 'key={item.id}'],
]);

console.log('Fixed keys in files');
