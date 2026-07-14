const fs = require('fs');
let content = fs.readFileSync('src/app/generate/page.tsx', 'utf8');
content = content.replace('useState<IngredientInput[]>([{ name: "", quantity: "", unit: "g" })', 'useState<IngredientInput[]>([{ name: "", quantity: "", unit: "g" }])');
content = content.replace('setIngredients([...ingredients, { name: "", quantity: "", unit: "g" })', 'setIngredients([...ingredients, { name: "", quantity: "", unit: "g" }])');
content = content.replace(/}\]/g, '}');
fs.writeFileSync('src/app/generate/page.tsx', content);
console.log('Fixed generate/page.tsx');