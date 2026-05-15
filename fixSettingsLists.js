import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/SettingsTab.tsx', 'utf8');

// Add import
if(!content.includes('DynamicPricingList')) {
  content = content.replace(/import \{ ImageUpload \} from '.\/ImageUpload';/, "import { ImageUpload } from './ImageUpload';\nimport { DynamicPricingList } from './DynamicPricingList';");
}

// Replace the Pricing grid (lines 356-401 basically) with the new components.
// I will replace `div className="grid grid-cols-1 md:grid-cols-3 gap-8"` up to `</div>` 
// but wait, I can just match ` <div className="grid grid-cols-1 md:grid-cols-3 gap-8">[\s\S]*?</div>\s*</div>\s*\)}`
const pricingBlockRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-8">[\s\S]*?<\/div>\s*<\/div>\s*\)}/;

const newPricingBlock = `
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DynamicPricingList 
                  title="Custos Fixos (Mensal)" 
                  subtitle="Água, luz, assinaturas, aluguel..."
                  items={settings.fixed_costs_list || []}
                  onChange={(items) => {
                    const total = items.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    setSettings(prev => ({ ...prev, fixed_costs_list: items, global_fixed_costs: total }));
                  }}
                />
                
                <DynamicPricingList 
                  title="Mão de Obra" 
                  subtitle="Dia / Hora = Valor Cobrado"
                  items={settings.labor_list || []}
                  onChange={(items) => {
                    const total = items.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    setSettings(prev => ({ ...prev, labor_list: items, global_labor_cost_per_hour: total }));
                  }}
                />

                <DynamicPricingList 
                  title="Taxas e Impostos" 
                  subtitle="Taxas de cartão, emissão de NF, etc"
                  isPercentage
                  items={settings.taxes_list || []}
                  onChange={(items) => {
                    const total = items.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    setSettings(prev => ({ ...prev, taxes_list: items, global_tax_rate: total }));
                  }}
                />
             </div>
          </div>
        )}
`;

content = content.replace(pricingBlockRegex, newPricingBlock);

// Replace "store_name" inside brand subtab as user requested:
// "GESTÃO DE MARCAS - SIMPLIFICAR A ÁREA. DEIXAR APENAS: UPLOAD DE LOGO; SLOGAN; CORES DA PALETA. CARDS LADO A LADO."
// Inside the map 
// ` <div className="space-y-4">\n                             <ImageUpload [\s\S]*?<\/div>` is the logo.
// Then there is info section with store_name and store_slogan.
// Let's remove `store_name` input block.
const nameBlock = /<div className="space-y-2">\s*<label className="text-\[10px\] uppercase font-black text-gray-400 ml-2">Nome Comercial<\/label>[\s\S]*?<\/div>\s*<div className="space-y-2">/g;
content = content.replace(nameBlock, '<div className="space-y-2">');

fs.writeFileSync('src/components/Admin/SettingsTab.tsx', content);
console.log('done settings');
