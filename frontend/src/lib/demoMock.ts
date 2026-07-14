import type {
  RecipeData,
  RecipeIngredient,
  RecipeStep,
  FoodSafetyBanner,
  SubstitutionSuggestion,
} from '@/types/recipe'

const PROTEINS: Record<string, { label: string; tempF: number }> = {
  chicken: { label: 'poultry', tempF: 165 },
  turkey: { label: 'poultry', tempF: 165 },
  beef: { label: 'beef', tempF: 145 },
  pork: { label: 'pork', tempF: 145 },
  lamb: { label: 'lamb', tempF: 145 },
  salmon: { label: 'fish', tempF: 145 },
  fish: { label: 'fish', tempF: 145 },
  shrimp: { label: 'shellfish', tempF: 145 },
  prawn: { label: 'shellfish', tempF: 145 },
  cod: { label: 'fish', tempF: 145 },
  egg: { label: 'eggs', tempF: 160 },
  tofu: { label: 'plant protein', tempF: 0 },
}

const STAPLES: RecipeIngredient[] = [
  { name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'oil', is_staple: true },
  { name: 'Salt', quantity: 1, unit: 'tsp', category: 'seasoning', is_staple: true },
  { name: 'Black pepper', quantity: 1, unit: 'tsp', category: 'seasoning', is_staple: true },
  { name: 'Garlic', quantity: 3, unit: 'clove', category: 'aromatics', is_staple: true },
]

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface MockRecipeOptions {
  servings: number
  mealType?: string
  cuisine?: string
  dietary: string[]
  avoid?: string[]
  equipment?: string[]
  maxPrepMinutes?: number
  maxCookMinutes?: number
  pantryStaples?: string[]
}

export function detectProtein(names: string[]): { type: string; tempF: number } | null {
  const lower = names.map((n) => n.toLowerCase())
  for (const [key, val] of Object.entries(PROTEINS)) {
    if (lower.some((n) => n.includes(key))) return { type: val.label, tempF: val.tempF }
  }
  return null
}

export function buildMockRecipe(
  rawNames: string[],
  opts: MockRecipeOptions
): RecipeData {
  const names = rawNames.map((n) => n.trim()).filter(Boolean)
  const primary = names[0] || 'Garden'
  const secondary = names[1]
  const protein = detectProtein(names)

  const mealLabel =
    opts.mealType && opts.mealType !== ''
      ? opts.mealType.charAt(0).toUpperCase() + opts.mealType.slice(1)
      : 'Skillet'

  const cuisinePrefix = opts.cuisine ? capitalize(opts.cuisine) + ' ' : ''
  const title = `${cuisinePrefix}${capitalize(primary)} ${
    secondary ? '& ' + capitalize(secondary) + ' ' : ''
  }${mealLabel}`

  let description = `A quick ${protein ? protein.type : 'vegetable'}-forward ${mealLabel.toLowerCase()} built from what you already had. No store run required.`
  if (opts.avoid && opts.avoid.length) {
    description += ` Skipping ${opts.avoid.join(', ')} as requested.`
  }
  const timeParts: string[] = []
  if (opts.maxPrepMinutes) timeParts.push(`prep under ${opts.maxPrepMinutes} min`)
  if (opts.maxCookMinutes) timeParts.push(`cook under ${opts.maxCookMinutes} min`)
  if (timeParts.length) description += ` Built to stay ${timeParts.join(' and ')}.`

  const userIngredients: RecipeIngredient[] = names.map((n) => ({
    name: capitalize(n),
    quantity: 1,
    unit: 'whole',
    category: protein && n.toLowerCase().includes(Object.keys(PROTEINS).find((k) => n.toLowerCase().includes(k)) || '') ? 'protein' : 'produce',
    is_staple: false,
  }))

  const ingredients: RecipeIngredient[] = (() => {
    const base = [...userIngredients, ...STAPLES]
    const existing = new Set(base.map((i) => i.name.toLowerCase()))
    const pantryIngredients: RecipeIngredient[] = (opts.pantryStaples ?? [])
      .filter((n) => n && !existing.has(n.toLowerCase()))
      .map((n) => ({
        name: capitalize(n),
        quantity: 1,
        unit: 'whole',
        category: 'pantry',
        is_staple: true,
      }))
    return [...pantryIngredients, ...base]
  })()

  const ingredientLine = names.map(capitalize).join(', ')

  const steps: RecipeStep[] = []

  steps.push({
    step_number: 1,
    instruction: `Prep your ingredients: rinse ${ingredientLine.toLowerCase()}, then chop everything into bite-sized pieces so it cooks evenly.`,
    duration_minutes: 5,
    duration_seconds: 300,
    timer_enabled: true,
    timer_label: 'Prep',
    technique: 'mise en place',
    equipment: ['cutting board', 'knife'],
    tips: ['Uniform pieces = even cooking', 'Keep aromatics separate for layering flavor'],
    visual_cue: 'Ingredients neatly chopped',
  })

  if (protein && protein.tempF > 0) {
    steps.push({
      step_number: 2,
      instruction: `Heat olive oil in a skillet over medium-high heat. Add the ${protein.type} and sear until golden, then cook through.`,
      duration_minutes: 8,
      duration_seconds: 480,
      timer_enabled: true,
      timer_label: 'Cook protein',
      temperature_f: protein.tempF,
      temperature_c: Math.round(((protein.tempF - 32) * 5) / 9),
      technique: 'sear',
      equipment: ['skillet', 'spatula'],
      tips: [`Cook to an internal temperature of ${protein.tempF}°F (${Math.round(((protein.tempF - 32) * 5) / 9)}°C)`, 'Let it rest before slicing to keep juices in'],
      visual_cue: 'Protein browned and cooked through',
    })
  } else {
    steps.push({
      step_number: 2,
      instruction: `Warm olive oil in a skillet over medium heat. Add garlic and the heartier vegetables first, sautéing until they start to soften.`,
      duration_minutes: 6,
      duration_seconds: 360,
      timer_enabled: true,
      timer_label: 'Sauté base',
      technique: 'sauté',
      equipment: ['skillet', 'spatula'],
      tips: ['Don’t rush the aromatics — they build the base flavor', 'Stir often so nothing browns too fast'],
      visual_cue: 'Vegetables softening and fragrant',
    })
  }

  steps.push({
    step_number: 3,
    instruction: `Add the remaining ingredients and a splash of water. Cover and simmer so the flavors meld together.`,
    duration_minutes: 10,
    duration_seconds: 600,
    timer_enabled: true,
    timer_label: 'Simmer',
    technique: 'simmer',
    equipment: ['lid', 'skillet'],
    tips: ['Taste and adjust salt near the end', 'A lid traps steam for tender results'],
    visual_cue: 'Gentle bubbles under the lid',
  })

  steps.push({
    step_number: 4,
    instruction: `Season with salt and pepper, plate it up, and serve while hot. Enjoy your zero-waste meal.`,
    duration_minutes: 2,
    duration_seconds: 120,
    timer_enabled: false,
    technique: 'plate',
    equipment: ['plates'],
    tips: ['A finishing squeeze of lemon brightens everything', 'Rest 1 minute before serving'],
    visual_cue: 'Plated and ready to eat',
  })

  const foodSafety: FoodSafetyBanner | undefined = protein && protein.tempF > 0
    ? {
        protein_type: protein.type,
        min_internal_temp_f: protein.tempF,
        min_internal_temp_c: Math.round(((protein.tempF - 32) * 5) / 9),
        rest_time_minutes: 3,
        danger_zone_min_c: 4,
        danger_zone_max_c: 60,
        danger_zone_min_f: 40,
        danger_zone_max_f: 140,
        max_time_in_danger_zone_minutes: 120,
        special_instructions: `Cook ${protein.type} to an internal temperature of ${protein.tempF}°F (${Math.round(((protein.tempF - 32) * 5) / 9)}°C) and rest for 3 minutes before serving.`,
        warning_text: `USDA: ${capitalize(protein.type)} must reach ${protein.tempF}°F internal temperature to be safe to eat.`,
        is_mandatory: true,
      }
    : undefined

  const substitutions: SubstitutionSuggestion[] = []
  if (opts.dietary.includes('dairy-free')) {
    substitutions.push({ original_ingredient: 'Butter', substitute: 'Olive oil', ratio: '1:1', category: 'fat', confidence: 0.9, works_in: ['dairy-free', 'vegan'], notes: 'Keeps the richness without dairy.' })
  }
  if (opts.dietary.includes('gluten-free')) {
    substitutions.push({ original_ingredient: 'Pasta', substitute: 'Rice or gluten-free noodles', ratio: '1:1', category: 'grain', confidence: 0.85, works_in: ['gluten-free'], notes: 'Swap to keep it gluten-free.' })
  }
  if (opts.dietary.includes('nut-free')) {
    substitutions.push({ original_ingredient: 'Peanut', substitute: 'Sunflower seed butter', ratio: '1:1', category: 'spread', confidence: 0.8, works_in: ['nut-free'], notes: 'Same creaminess, no nuts.' })
  }
  if (substitutions.length === 0) {
    substitutions.push({ original_ingredient: 'Salt', substitute: 'Soy sauce (less)', ratio: '1:0.75', category: 'seasoning', confidence: 0.7, works_in: ['low-sodium'], notes: 'Adds saltiness plus umami.' })
  }

  const prep = steps[0].duration_minutes
  const cook = steps.slice(1).reduce((a, s) => a + s.duration_minutes, 0)

  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description,
    servings: opts.servings,
    prep_time_minutes: prep,
    cook_time_minutes: cook,
    difficulty: 'easy',
    meal_type: opts.mealType ? [opts.mealType] : ['dinner'],
    dietary_tags: opts.dietary,
    cuisine: opts.cuisine || undefined,
    ingredients,
    steps,
    equipment: Array.from(
      new Set([
        'skillet',
        'cutting board',
        'knife',
        'spatula',
        'lid',
        ...(opts.equipment ?? []),
      ]),
    ),
    protein_type: protein ? protein.type : 'none',
    food_safety: foodSafety,
    substitutions,
    generation_metadata: {
      generation_id: `demo-gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      model_used: 'yield-demo-engine',
      generation_time_ms: 1200,
      taste_filter_passed: true,
      taste_filter_warnings: [],
    },
  }
}

const SAMPLE_PANTRIES = [
  ['Chicken breast', 'Bell pepper', 'Onion', 'Tomato'],
  ['Salmon', 'Lemon', 'Asparagus', 'Butter'],
  ['Eggs', 'Spinach', 'Tomato', 'Feta'],
  ['Chickpeas', 'Cumin', 'Onion', 'Cilantro'],
  ['Beef', 'Carrot', 'Potato', 'Rosemary'],
]

export function mockDetectIngredients(_file?: File): Promise<{ ingredients: { name: string }[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pick = SAMPLE_PANTRIES[Math.floor(Math.random() * SAMPLE_PANTRIES.length)]
      resolve({ ingredients: pick.map((name) => ({ name })) })
    }, 1400)
  })
}
