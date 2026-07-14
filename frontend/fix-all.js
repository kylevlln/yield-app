const fs = require('fs');

// Fix pantry/page.tsx
let pantryContent = fs.readFileSync('src/app/pantry/page.tsx', 'utf8');
pantryContent = pantryContent.replace(
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true })',
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true }])'
);
pantryContent = pantryContent.replace(
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })',
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])'
);
pantryContent = pantryContent.replace(/\}\]/g, '}');
fs.writeFileSync('src/app/pantry/page.tsx', pantryContent);
console.log('Fixed pantry/page.tsx');

// Fix history/page.tsx
let historyContent = fs.readFileSync('src/app/history/page.tsx', 'utf8');
historyContent = historyContent.replace(
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true })',
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true }])'
);
historyContent = historyContent.replace(
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })',
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])'
);
historyContent = historyContent.replace(/\}\]/g, '}');
fs.writeFileSync('src/app/history/page.tsx', historyContent);
console.log('Fixed history/page.tsx');

// Fix generate/page.tsx
let genContent = fs.readFileSync('src/app/generate/page.tsx', 'utf8');
genContent = genContent.replace(
  'useState<IngredientInput[]>([{ name: \'\', quantity: \'\', unit: \'g\' })',
  'useState<IngredientInput[]>([{ name: \'\', quantity: \'\', unit: \'g\' }])'
);
genContent = genContent.replace(
  'setIngredients([...ingredients, { name: \'\', quantity: \'\', unit: \'g\' })',
  'setIngredients([...ingredients, { name: \'\', quantity: \'\', unit: \'g\' }])'
);
genContent = genContent.replace(
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true })',
  'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true }])'
);
genContent = genContent.replace(
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })',
  'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])'
);
genContent = genContent.replace(/\}\]/g, '}');
fs.writeFileSync('src/app/generate/page.tsx', genContent);
console.log('Fixed generate/page.tsx');

// Fix page.tsx
let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
pageContent = pageContent.replace(/\}\]/g, '}');
fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Fixed page.tsx');

console.log('All fixes applied');