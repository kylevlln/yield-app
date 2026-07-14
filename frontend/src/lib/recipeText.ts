import type { RecipeData } from '@/types/recipe'

/** Format a recipe as plain text for clipboard / native share. */
export function formatRecipeText(recipe: RecipeData): string {
  const lines: string[] = []
  lines.push(recipe.title)
  if (recipe.description) lines.push(recipe.description)
  lines.push('')

  const total = recipe.prep_time_minutes + recipe.cook_time_minutes
  lines.push(`Servings: ${recipe.servings}  ·  Total time: ${total} min  ·  Difficulty: ${recipe.difficulty}`)
  if (recipe.cuisine) lines.push(`Cuisine: ${recipe.cuisine}`)
  if (recipe.dietary_tags?.length) lines.push(`Dietary: ${recipe.dietary_tags.join(', ')}`)
  lines.push('')

  lines.push('INGREDIENTS')
  recipe.ingredients.forEach((ing) => {
    const qty = ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit} ` : ''
    lines.push(`• ${qty}${ing.name}`)
  })
  lines.push('')

  lines.push('STEPS')
  recipe.steps.forEach((step) => {
    const timer = step.timer_enabled && step.duration_minutes ? ` (${step.duration_minutes} min)` : ''
    lines.push(`${step.step_number}. ${step.instruction}${timer}`)
  })

  if (recipe.food_safety?.warning_text) {
    lines.push('')
    lines.push(`⚠️ ${recipe.food_safety.warning_text}`)
  }

  lines.push('')
  lines.push('Generated with Yield')
  return lines.join('\n')
}
