const fs = require('fs');
let content = fs.readFileSync('src/app/generate/page.tsx', 'utf8');
content = content.replace('useState<IngredientInput[]>([{ name: "", quantity: "", unit: "g" })', 'useState<IngredientInput[]>([{ name: "", quantity: "", unit: "g" }])');
fs.writeFileSync('src/app/generate/page.tsx', content);
console.log('Fixed generate/page.tsx');