'use client'

interface Ingredient {
  name: string
  amount: number
  unit: string
  category: string
  in_pantry?: boolean
  is_staple?: boolean
  note?: string
}

interface IngredientListProps {
  ingredients: Ingredient[]
  checkedIngredients: Set<number>
  onToggle: (index: number) => void
  servings: number
}

export function IngredientList({ ingredients, checkedIngredients, onToggle, servings }: IngredientListProps) {
  const categories = Array.from(new Set(ingredients.map(i => i.category)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Ingredients</h3>
        <span className="text-sm text-slate-500">Serves {servings}</span>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {category}
          </h4>
          <div className="space-y-1">
            {ingredients
              .filter(i => i.category === category)
              .map((ingredient, i) => {
                const globalIndex = ingredients.indexOf(ingredient)
                const isChecked = checkedIngredients.has(globalIndex)
                return (
                  <button
                    key={globalIndex}
                    onClick={() => onToggle(globalIndex)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                      isChecked ? 'bg-green-50 opacity-60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'
                    }`}>
                      {isChecked && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {ingredient.amount > 0 && (
                          <span className="font-medium">
                            {ingredient.amount} {ingredient.unit}{' '}
                          </span>
                        )}
                        {ingredient.name}
                      </span>
                      {ingredient.is_staple && (
                        <span className="ml-2 text-xs text-teal-600"> pantry</span>
                      )}
                      {ingredient.note && (
                        <span className="ml-2 text-xs text-slate-400 italic">{ingredient.note}</span>
                      )}
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
