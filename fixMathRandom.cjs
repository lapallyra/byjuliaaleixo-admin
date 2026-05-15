const fs = require('fs');

function replace(file, search, rep) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, rep);
    fs.writeFileSync(file, content);
}

// OrdersTab.tsx
replace('src/components/Admin/OrdersTab.tsx', 
    /const code = Math\.floor\(10000 \+ Math\.random\(\) \* 90000\)\.toString\(\);/g, 
    "const code = crypto.randomUUID().slice(0, 8).toUpperCase();"
);

// DynamicPricingList.tsx
replace('src/components/Admin/DynamicPricingList.tsx',
    /id: Math\.random\(\)\.toString\(36\)\.substring\(7\)/g,
    "id: crypto.randomUUID()"
);

// InventoryTab.tsx
replace('src/components/Admin/InventoryTab.tsx',
    /code: editingInsumo\?\.code \|\| `INS\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}`/g,
    "code: editingInsumo?.code || `INS-${crypto.randomUUID().slice(0, 6).toUpperCase()}`"
);

// ProductsTab.tsx
const productsTabReplacement = `const generateProductCode = (prefix: string) => {
    const companyProducts = products.filter(p => p.company === selectedAtelier);
    let max = 0;
    for (const p of companyProducts) {
      if (p.code && p.code.startsWith(prefix)) {
        const num = parseInt(p.code.replace(prefix + '-', ''), 10);
        if (!isNaN(num) && num > max) max = num;
      } else if (p.id && p.id.startsWith(prefix)) {
        const num = parseInt(p.id.replace(prefix + '-', ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    }
    return \`\${prefix}-\${String(max + 1).padStart(4, '0')}\`;
  };`;

replace('src/components/Admin/ProductsTab.tsx',
    /const generateProductCode = [^}]+};\n/m,
    productsTabReplacement + '\n'
);

replace('src/components/Admin/ProductsTab.tsx',
    /const finalCode = editingProduct\?\.code \|\| 'PRD-' \+ Math\.floor\(1000 \+ Math\.random\(\) \* 9000\);/g,
    "const finalCode = editingProduct?.code || generateProductCode(atelieres.find(a => a.id === selectedAtelier)?.prefix || 'PRD');"
);

// SalesNotificationPortal.tsx
replace('src/components/SalesNotificationPortal.tsx',
    /if \(!notif\.id\) notif\.id = Math\.random\(\)\.toString\(36\)\.substr\(2, 9\);/g,
    "if (!notif.id) notif.id = crypto.randomUUID();"
);

// GiftListSidebar.tsx
replace('src/components/GiftListSidebar.tsx',
    /const random = Math\.floor\(10000 \+ Math\.random\(\) \* 90000\);/g,
    "const random = crypto.randomUUID().slice(0, 5).toUpperCase();"
);

// CheckoutModal.tsx
replace('src/components/CheckoutModal.tsx',
    /docId || Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)/g,
    "docId || crypto.randomUUID()"
);

// saleNotificationService.ts
replace('src/services/saleNotificationService.ts',
    /id: Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)/g,
    "id: crypto.randomUUID()"
);

// firebaseService.ts
replace('src/services/firebaseService.ts',
    /const random = Math\.floor\(1000 \+ Math\.random\(\) \* 9000\);/g,
    "const random = crypto.randomUUID().slice(0, 4).toUpperCase();"
);
replace('src/services/firebaseService.ts',
    /const customerCode = Math\.floor\(10000 \+ Math\.random\(\) \* 90000\)\.toString\(\);/g,
    "const customerCode = crypto.randomUUID().slice(0, 8).toUpperCase();"
);

console.log("Fixed Math.random IDs");
