'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Flame,
  ChefHat,
  Search,
  Trash2,
  Eye,
  Calendar,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/Logo'
import { RecipeViewer } from '@/components/RecipeViewer'
import { useAuthContext } from '@/components/AuthProvider'
import { useRecipes, useDeleteRecipe } from '@/hooks/useRecipes'
import { loadHistory, removeFromHistory } from '@/lib/recipeCache'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SavedRecipe {
  id: string
  title: string
  description?: string
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  meal_type: string[]
  dietary_tags: string[]
  cuisine?: string
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    category: string
    is_staple: boolean
    preparation?: string
  }>
  steps: Array<{
    step_number: number
    instruction: string
    duration_minutes: number
    duration_seconds: number
    timer_enabled: boolean
    timer_label?: string
    temperature_c?: number
    temperature_f?: number
    technique?: string
    equipment: string[]
    tips: string[]
    visual_cue?: string
  }>
  equipment: string[]
  protein_type: string
  food_safety?: {
    protein_type: string
    min_internal_temp_c: number
    min_internal_temp_f: number
    rest_time_minutes: number
    danger_zone_min_c: number
    danger_zone_max_c: number
    danger_zone_min_f: number
    danger_zone_max_f: number
    max_time_in_danger_zone_minutes: number
    special_instructions: string
    warning_text: string
    is_mandatory: boolean
  }
  saved_at: string
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const then = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

export default function HistoryPage() {
  const { user } = useAuthContext()
  const { data: recipes = [], isLoading, error } = useRecipes()
  const deleteMutation = useDeleteRecipe()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingRecipe, setViewingRecipe] = useState<any | null>(null)
  const [localRecipes, setLocalRecipes] = useState<any[]>([])

  // Demo-mode: show recipes generated in the (backend-free) demo, alongside
  // any server-backed history.
  useEffect(() => {
    setLocalRecipes(loadHistory())
  }, [])

  const combined = [...(recipes as any[]), ...localRecipes]

  const filteredRecipes = combined.filter(
    (r: any) =>
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dietary_tags?.some((t: string) => t.includes(searchQuery.toLowerCase()))
  )

  const handleDelete = (id: string) => {
    if (id.startsWith('demo-')) {
      removeFromHistory(id)
      setLocalRecipes((prev) => prev.filter((r) => r.id !== id))
      toast.success('Removed from history')
    } else {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-ghost btn-sm p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LogoMark className="w-8 h-8 text-teal-400" />
            <span className="font-semibold text-xl text-gray-900 dark:text-white">History</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Recipe List */}
        {isLoading && combined.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 mx-auto text-teal-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {combined.length === 0 ? 'No saved recipes yet' : 'No recipes match your search'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {combined.length === 0
                ? 'Generate a recipe and save it to see it here.'
                : 'Try a different search term.'}
            </p>
            <Link href="/generate" className="btn btn-primary">
              Generate a Recipe
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRecipes.map((recipe: any) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('px-2 py-0.5 text-xs rounded-full font-medium', difficultyColors[recipe.difficulty] || difficultyColors.easy)}>
                          {recipe.difficulty}
                        </span>
                        {recipe.cuisine && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {recipe.cuisine}
                          </span>
                        )}
                        {recipe.dietary_tags?.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {recipe.title}
                      </h3>
                      {recipe.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {recipe.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{recipe.ingredients.length} ingredients</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{timeAgo(recipe.saved_at || recipe.created_at || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setViewingRecipe(recipe)}
                        className="btn btn-primary btn-sm"
                        aria-label="View recipe"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Delete recipe"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Recipe Viewer Modal */}
      {viewingRecipe && (
        <RecipeViewer
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onSave={() => toast.success('Recipe saved to your collection!')}
        />
      )}
    </div>
  )
}
