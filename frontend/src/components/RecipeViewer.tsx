'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatRecipeText } from '@/lib/recipeText'
import { useTimer } from '@/components/recipe/useTimer'
import toast from 'react-hot-toast'
import { StepCard } from '@/components/recipe/StepCard'
import { FoodSafetyBanner } from '@/components/recipe/FoodSafetyBanner'
import { IngredientList } from '@/components/recipe/IngredientList'
import { SubstitutionList } from '@/components/recipe/SubstitutionList'
import type { RecipeData } from '@/types/recipe'

interface RecipeViewerProps {
  recipe: RecipeData
  onClose?: () => void
  onDelete?: () => void
  onSave?: () => void
  isSaved?: boolean
  footer?: React.ReactNode
}

export function RecipeViewer({ recipe, onClose, onDelete, onSave, isSaved = false, footer }: RecipeViewerProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients' | 'substitutions'>('steps')
  const containerRef = useRef<HTMLDivElement>(null)

  // Modal behavior: lock background scroll, close on Escape, move focus in.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    containerRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const { timers, startTimer, toggleTimer, resetTimer, getTimerProgress, formatTime } = useTimer()

  const handleShare = async () => {
    const text = formatRecipeText(recipe)
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: recipe.title, text })
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        toast.success('Recipe copied to clipboard!')
        return
      }
      toast('Sharing is not supported on this device')
    } catch {
      // User cancelled the share sheet — ignore.
    }
  }

  const handleStepComplete = useCallback((index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
    if (index === currentStep && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, recipe.steps.length])

  const handleToggleIngredient = useCallback((index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const completionPercentage = Math.round((completedSteps.size / recipe.steps.length) * 100)

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes

  const ingredientList = recipe.ingredients.map(ing => ({
    name: ing.name,
    amount: ing.quantity,
    unit: ing.unit,
    category: ing.category,
    is_staple: ing.is_staple,
  }))

  const substitutionList = (recipe.substitutions || []).map(sub => ({
    original: sub.original_ingredient,
    substitute: sub.substitute,
    ratio: sub.ratio,
    notes: sub.notes || '',
    dietary_compliance: sub.works_in || [],
  }))

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={recipe.title}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 outline-none"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Close recipe">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5L5 15M5 5l10 10"/>
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 text-lg leading-tight truncate max-w-[200px] sm:max-w-none">{recipe.title}</h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span>{recipe.servings} servings</span>
                <span>·</span>
                <span>{totalTime} min total</span>
                <span>·</span>
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className={cn(
                  "p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors",
                  isSaved ? "text-amber-500 hover:text-amber-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.5L5 17V3z"/>
                </svg>
              </button>
            )}
            <button
              onClick={handleShare}
              aria-label="Share recipe"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </button>
            {onDelete && (
              <button onClick={onDelete} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg transition-colors" aria-label="Delete recipe">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l8 8M14 6l-8 8"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Food Safety Banner */}
      {recipe.food_safety && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <FoodSafetyBanner banner={recipe.food_safety} />
        </div>
      )}

      {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1" role="tablist" aria-label="Recipe sections">
          {(['steps', 'ingredients', 'substitutions'] as const).map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}

              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center justify-center",
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab === 'steps' && `Steps (${recipe.steps.length})`}
              {tab === 'ingredients' && `Ingredients (${recipe.ingredients.length})`}
              {tab === 'substitutions' && `Subs (${recipe.substitutions?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'steps' && (
            <motion.div
              key="steps"
              id="panel-steps"
              role="tabpanel"
              aria-label="Cooking steps"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {recipe.steps.map((step, i) => (
                <StepCard
                  key={i}
                  step={step}
                  index={i}
                  isCurrentStep={i === currentStep}
                  onComplete={() => handleStepComplete(i)}
                  timer={timers[i]}
                  timerProgress={getTimerProgress(i)}
                  onStartTimer={() => startTimer(i, step.duration_minutes, step.duration_seconds, step.timer_label || '')}
                  onToggleTimer={() => toggleTimer(i)}
                  onResetTimer={() => resetTimer(i)}
                  formatTime={formatTime}
                />
              ))}

              {completedSteps.size === recipe.steps.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Recipe Complete!</h3>
                  <p className="text-slate-500 text-sm">Great job. Your meal is ready to serve.</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'ingredients' && (
            <motion.div
              key="ingredients"
              id="panel-ingredients"
              role="tabpanel"
              aria-label="Ingredient checklist"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <IngredientList
                ingredients={ingredientList}
                checkedIngredients={checkedIngredients}
                onToggle={handleToggleIngredient}
                servings={recipe.servings}
              />
            </motion.div>
          )}

          {activeTab === 'substitutions' && (
            <motion.div
              key="substitutions"
              id="panel-substitutions"
              role="tabpanel"
              aria-label="Substitution suggestions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SubstitutionList substitutions={substitutionList} />
              {substitutionList.length === 0 && (
                <div className="text-center py-12">
                  <span className="mb-3 block text-slate-300">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 9a8 8 0 1 1-1.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="text-slate-500 text-sm">No substitutions needed for this recipe</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Equipment */}
      {recipe.equipment && recipe.equipment.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-24">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Equipment Needed</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.equipment.map((eq, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom footer (e.g., Redo/Finish buttons) */}
      {footer && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-200">
          <div className="max-w-2xl mx-auto py-3">
            {footer}
          </div>
        </div>
      )}
    </div>
  )
}
