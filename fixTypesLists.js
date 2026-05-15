import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

// Add new array fields to AppConfig or CustomConfig (which is it?)
// The snippet says it's inside `store_logo` block. Let's see what the interface name is.
// I will just add properties globally.
content = content.replace(
  /global_tax_rate\?: number;/g,
  'global_tax_rate?: number;\n  fixed_costs_list?: { id: string; name: string; value: number }[];\n  taxes_list?: { id: string; name: string; value: number; type?: string }[];\n  labor_list?: { id: string; name: string; value: number }[];'
);

fs.writeFileSync('src/types.ts', content);
console.log('done types');
