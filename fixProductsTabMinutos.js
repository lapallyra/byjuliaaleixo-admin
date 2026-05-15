import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/ProductsTab.tsx', 'utf8');

// Horas -> Minutos
content = content.replace(
  /<label className="text-\[10px\] uppercase font-black text-gray-400 ml-2">Horas dedicadas a este produto<\/label>/g,
  '<label className="text-[10px] uppercase font-black text-gray-400 ml-2">Minutos dedicados ao produto</label>'
);

content = content.replace(
  /type="number"\s+step="0\.5"\s+min="0"\s+value=\{laborHours \|\| ''\}\s+onChange=\{e => setLaborHours\(Number\(e\.target\.value\)\)\}/gm,
  'type="number"\n                             step="1"\n                             min="0"\n                             placeholder="Ex: 30, 45, 120"\n                             value={laborHours || \'\'}\n                             onChange={e => setLaborHours(Number(e.target.value))}'
);

content = content.replace(
  /const laborCost = laborHours \* \(\(customSettings\[selectedAtelier\]\?\.labor_monthly \|\| 0\) \/ 160\);/g,
  'const laborCost = (laborHours / 60) * ((customSettings[selectedAtelier]?.labor_monthly || 0) / 160);'
);

// "USAR SUGERIDO" desorganizado
content = content.replace(
  /className="p-3 bg-black text-white rounded-xl text-\[8px\] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md mt-2"/g,
  'className="w-full mt-4 py-3 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md"'
);

// Add missing validation & alert
const saveFnRegex = /onSave\(\{([\s\S]*?)\}\);/m;
const match = content.match(saveFnRegex);
if(match) {
  const newSaveBlock = `
                    const finalCode = editingProduct?.code || 'PRD-' + Math.floor(1000 + Math.random() * 9000);
                  
                  try {
                    await onSave({
                      id: editingProduct?.id,
                      code: finalCode,
                      product_name: name,
                      description: desc,
                      category: showNewCatInput ? newCat : category,
                      subcategory: subcategory,
                      wholesale_price: wholesalePrice || 0,
                      wholesale_min_qty: wMin || 1,
                      wholesale_max_qty: wMax,
                      retail_price: retailPrice || 0,
                      original_price: retailPrice || 0,
                      current_price: retailPrice || 0,
                      estimatedCost: costPrice || 0,
                      insumos: addedInsumos || [],
                      image: images[0] || 'https://via.placeholder.com/300?text=Sem+Foto',
                      images: images || [],
                      isFeatured: isFeatured || false,
                      activeInCatalog: activeInCatalog,
                      isVisible: activeInCatalog,
                      company: selectedAtelier
                    });
                    onClose();
                  } catch (err: any) {
                    alert("Erro ao salvar produto: " + err.message);
                  }
`;
  content = content.replace(saveFnRegex, newSaveBlock);
  
  content = content.replace(
    /onClick=\{\(\) => \{/g,
    'onClick={async () => {'
  );
  
  content = content.replace(
    /if \(!name\) \{\s+alert\("Escreva o nome do produto\."\);\s+return;\s+\}/g,
    `if (!name) {
                     alert("Campo Obrigatório: Escreva o nome do produto.");
                     const el = document.getElementById('product-name');
                     if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     return;
                  }`
  );
}

fs.writeFileSync('src/components/Admin/ProductsTab.tsx', content);
console.log('done products changes');
