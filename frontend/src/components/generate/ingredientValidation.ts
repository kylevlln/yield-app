'use client'

const BLOCKED_TERMS = new Set([
  'nigga', 'nigger', 'niggas', 'niggers', 'faggot', 'fags', 'fag',
  'retard', 'retarded', 'chink', 'spic', 'spick', 'wetback', 'beaner',
  'kike', 'kraut', 'honky', 'cracker', 'redneck', 'hillbilly', 'tranny',
  'shemale', 'dyke', 'fembot', 'homo', 'homo', 'queer', 'sissy', 'cuck',
  'pussy', 'cunt', 'twat', 'bollocks', 'tosser', 'wanker', 'git',
  'dick', 'cock', 'penis', 'vagina', 'tits', 'boobs', 'asshole',
  'jackass', 'dumbass', 'badass', 'hardass', 'piss', 'pissed',
  'fuck', 'fucked', 'fucker', 'motherfucker', 'fucking', 'fucks',
  'damn', 'dammit', 'goddamn', 'goddammit', 'hell', 'shit', 'shitty',
  'bitch', 'bitchy', 'bastard', 'crap', 'bloody',
  'nazi', 'hitler', 'jew', 'aryan', 'ss', 'swastika',
  'terrorist', 'bomb', 'kill', 'murder', 'rape', 'abuse',
  'meth', 'heroin', 'cocaine', 'weed', 'marijuana', 'drugs',
  'porn', 'sex', 'nude', 'naked', 'xxx', 'nsfw',
  'slut', 'whore', 'hooker', 'prostitute', 'gigolo',
  'racist', 'sexist', 'bigot', 'homophobe', 'transphobe',
  'jerk', 'moron', 'idiot', 'stupid', 'dumb', 'loser',
  'trash', 'garbage', 'waste', 'scum', 'scumbag',
  'suck', 'sucks', 'blow', 'blows', 'lick', 'licks',
  'satan', 'devil', 'demon', 'evil', 'wicked',
])

const FOOD_KEYWORDS = new Set([
  // Proteins
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'tofu', 'eggs', 'egg',
  'turkey', 'duck', 'lamb', 'veal', 'bacon', 'ham', 'sausage', 'anchovy',
  'tuna', 'cod', 'tilapia', 'crab', 'lobster', 'scallop', 'mussel', 'clam',
  'oyster', 'squid', 'octopus', 'sardine', 'mackerel', 'herring', 'trout',
  'brisket', 'chuck', 'ribs', 'steak', 'ground', 'mince', 'hamburger',
  'prosciutto', 'salami', 'pepperoni', 'chorizo', 'pancetta', 'guanciale',
  'wagyu', 'sirloin', 'tenderloin', 'flank', 'skirt', 'nylon', 'capicola',
  'bologna', 'mortadella', 'pastrami', 'corned', 'jerky', 'biltong',
  'tempeh', 'seitan', 'edamame', 'soy', 'lentil', 'chickpea', 'bean',
  'blackbean', 'kidney', 'pinto', 'navy', 'lima', 'cannellini',
  'peanut', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut',
  // Dairy
  'milk', 'cream', 'butter', 'cheese', 'yogurt', 'parmesan', 'cheddar',
  'mozzarella', 'gouda', 'brie', 'feta', 'ricotta', 'mascarpone', 'pecorino',
  'gruyere', 'emmental', 'swiss', 'provolone', 'gorgonzola', 'blue',
  'sour', 'cream', 'whipping', 'half', 'half', 'buttermilk', 'whey',
  'casein', 'lactose', 'dairy',
  // Grains & Carbs
  'rice', 'pasta', 'bread', 'noodle', 'spaghetti', 'penne', 'rigatoni',
  'fusilli', 'linguine', 'fettuccine', 'macaroni', 'orzo', 'farfalle',
  'tortilla', 'wrap', 'flatbread', 'pita', 'naan', 'baguette', 'sourdough',
  'rye', 'wheat', 'oat', 'quinoa', 'couscous', 'bulgur', 'farro', 'barley',
  'millet', 'buckwheat', 'cornmeal', 'polenta', 'semolina', 'flour',
  'panko', 'breadcrumbs', 'cracker', 'crouton', 'stuffing', 'dumpling',
  // Vegetables
  'tomato', 'potato', 'onion', 'garlic', 'carrot', 'celery', 'pepper',
  'broccoli', 'cauliflower', 'spinach', 'kale', 'lettuce', 'cabbage',
  'mushroom', 'zucchini', 'squash', 'pumpkin', 'eggplant', 'aubergine',
  'corn', 'pea', 'greenbean', 'asparagus', 'artichoke', 'leek', 'shallot',
  'radish', 'turnip', 'beet', 'parsnip', 'sweetpotato', 'yam',
  'cucumber', 'avocado', 'olive', 'capers', 'pickle', 'jalapeno',
  'chile', 'scallion', 'greenonion', 'chive', 'parsley', 'cilantro',
  'basil', 'oregano', 'thyme', 'rosemary', 'sage', 'mint', 'dill',
  'tarragon', 'marjoram', 'bay', 'lemongrass', 'galangal', 'ginger',
  'horseradish', 'wasabi', 'arugula', 'rocket', 'endive', 'radicchio',
  'watercress', 'sorrel', 'fennel', 'cardoon', 'okra', 'bamboo',
  'seaweed', 'kombu', 'nori', 'wakame', 'dulse',
  // Fruits
  'lemon', 'lime', 'orange', 'grapefruit', 'apple', 'banana', 'berry',
  'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry',
  'cherry', 'peach', 'pear', 'plum', 'apricot', 'fig', 'date',
  'grape', 'watermelon', 'cantaloupe', 'honeydew', 'pineapple', 'mango',
  'papaya', 'kiwi', 'pomegranate', 'passion', 'guava', 'lychee',
  'durian', 'jackfruit', 'dragonfruit', 'starfruit', 'coconut',
  'raisin', 'currant', 'prune', 'dried',
  // Condiments & Sauces
  'soy', 'sauce', 'ketchup', 'mustard', 'mayo', 'mayonnaise', 'vinegar',
  'oil', 'olive', 'sesame', 'vegetable', 'canola', 'sunflower', 'peanut',
  'worcestershire', 'hot', 'sriracha', 'tabasco', 'salsa', 'ketchup',
  'bbq', 'barbecue', 'teriyaki', 'hoisin', 'fish', 'oyster', 'tahini',
  'hummus', 'pesto', 'chimichurri', 'sambal', 'gochujang', 'miso',
  'maple', 'honey', 'sugar', 'brown', 'molasses', 'agave', 'stevia',
  'salt', 'pepper', 'cumin', 'paprika', 'turmeric', 'coriander',
  'cinnamon', 'nutmeg', 'cloves', 'allspice', 'cardamom', 'saffron',
  'chili', 'cayenne', 'curry', 'garam', 'masala', 'zaatar',
  'sumac', 'fenugreek', 'fennel', 'anise', 'star', 'caraway',
  'mustard', 'poppy', 'sesame', 'flax', 'chia', 'hemp',
  // Prepared / Packaged
  'stock', 'broth', 'bouillon', 'soup', 'stew', 'chili',
  'marinara', 'ragu', 'bolognese', 'alfredo', 'carbonara',
  'curry', 'pad', 'thai', 'chinese', 'mexican', 'indian',
  'pizza', 'taco', 'burrito', 'nachos', 'quesadilla',
  'sandwich', 'burger', 'wrap', 'salad', 'slaw',
  'smoothie', 'juice', 'shake', 'coffee', 'tea', 'espresso',
  'beer', 'wine', 'champagne', 'vodka', 'rum', 'whiskey', 'tequila',
  'gin', 'bourbon', 'brandy', 'cognac', 'port', 'sherry', 'sake',
  'kombucha', 'kefir', 'kimchi', 'sauerkraut', 'miso', 'tempeh',
  // Cooking Methods
  'grilled', 'fried', 'baked', 'roasted', 'steamed', 'boiled',
  'sauteed', 'braised', 'poached', 'smoked', 'cured', 'dried',
  'frozen', 'canned', 'fresh', 'raw', 'cooked', 'leftover',
  // Kitchen Items (common)
  'salt', 'sugar', 'flour', 'water', 'ice', 'baking', 'soda',
  'powder', 'yeast', 'gelatin', 'cornstarch', 'arrowroot',
  'cornstarch', 'tapioca', 'xanthan', 'guar',
  // Measurement Words
  'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
  'ounce', 'ounces', 'pound', 'pounds', 'gram', 'grams', 'kilogram',
  'liter', 'liters', 'milliliter', 'milliliters', 'quart', 'quarts',
  'gallon', 'gallons', 'pinch', 'dash', 'slice', 'slices',
  'piece', 'pieces', 'can', 'cans', 'bottle', 'bottles',
  'bag', 'bags', 'box', 'boxes', 'jar', 'jars', 'container',
  // Common Recipes
  'chicken', 'tikka', 'masala', 'butter', 'chicken', 'parmesan',
  'carbonara', 'bolognese', 'risotto', 'paella', 'gumbo',
  'jambalaya', 'chili', 'stir', 'fry', 'curry', 'soup',
  'salad', 'sandwich', 'wrap', 'taco', 'burrito', 'bowl',
  'pasta', 'noodles', 'rice', 'quinoa', 'couscous',
])

export function validateIngredientName(input: string): string | null {
  const cleaned = sanitizeIngredientName(input.toLowerCase())

  if (cleaned.length < 2) return null

  if (BLOCKED_TERMS.has(cleaned)) {
    return 'This ingredient name is not allowed'
  }

  const blockedArray = Array.from(BLOCKED_TERMS)
  for (const term of blockedArray) {
    if (cleaned.includes(term)) {
      return 'This ingredient name is not allowed'
    }
  }

  if (cleaned.length >= 3 && !FOOD_KEYWORDS.has(cleaned)) {
    let isPartialMatch = false
    const foodArray = Array.from(FOOD_KEYWORDS)
    for (const keyword of foodArray) {
      if (keyword.includes(cleaned) || cleaned.includes(keyword)) {
        isPartialMatch = true
        break
      }
    }
    if (!isPartialMatch) {
      return `Doesn't look like food — try being more specific`
    }
  }

  return null
}

export function sanitizeIngredientName(input: string): string {
  return (input ?? '')
    .replace(/[^a-zA-Z0-9\s\-'.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

export const PANTRY_ITEMS = [
  { name: 'Salt & Pepper', category: 'Seasonings' },
  { name: 'Olive Oil', category: 'Oils & Fats' },
  { name: 'Garlic', category: 'Produce' },
  { name: 'Onion', category: 'Produce' },
  { name: 'Butter', category: 'Dairy & Eggs' },
  { name: 'Eggs', category: 'Dairy & Eggs' },
  { name: 'Rice', category: 'Grains & Pasta' },
  { name: 'Pasta', category: 'Grains & Pasta' },
  { name: 'Flour', category: 'Baking' },
  { name: 'Sugar', category: 'Baking' },
  { name: 'Soy Sauce', category: 'Condiments' },
  { name: 'Vinegar', category: 'Condiments' },
]

export const TASTE_OPTIONS = [
  { id: 'spicy', label: 'Spicy', emoji: '🌶', description: 'Add some heat' },
  { id: 'savory', label: 'Savory', emoji: '🧂', description: 'Rich umami flavors' },
  { id: 'fresh', label: 'Fresh', emoji: '🌿', description: 'Light and bright' },
  { id: 'creamy', label: 'Creamy', emoji: '🥛', description: 'Smooth and rich' },
  { id: 'smoky', label: 'Smoky', emoji: '🔥', description: 'Deep smoky notes' },
  { id: 'sweet', label: 'Sweet', emoji: '🍯', description: 'Sweet and delightful' },
]

export const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '🥛' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'low-carb', label: 'Low-carb', emoji: '🥩' },
]

export const PROTEIN_OPTIONS = ['Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Eggs', 'Tofu', 'Beans']
