const fs = require('fs');

let content = fs.readFileSync('src/app/generate/page.tsx', 'utf8');
content = content.replace('useState<IngredientInput[]>([{ name: \'\', quantity: \'\', unit: \'g\' })', 'useState<IngredientInput[]>([{ name: \'\', quantity: \'\', unit: \'g\' }])');
content = content.replace('setIngredients([...ingredients, { name: \'\', quantity: \'\', unit: \'g\' })', 'setIngredients([...ingredients, { name: \'\', quantity: \'\', unit: \'g\' }])');
content = content.replace('setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true })', 'setStaples(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_staple: true }])');
content = content.replace('setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })', 'setInventory(prev => [...prev, { ...formData, id: crypto.randomUUID(), is_open: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])');
content = content.replace(/}\]/g, '}');
fs.writeFileSync('src/app/generate/page.tsx', content);
console.log('Fixed generate/page.tsx');