'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Upload,
  Camera,
  Mic,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecipeViewer } from '@/components/RecipeViewer'
import { Logo } from '@/components/Logo'
import { AuthModal } from '@/components/AuthModal'
import { buildMockRecipe, mockDetectIngredients } from '@/lib/demoMock'
import { loadLastRecipe, saveLastRecipe, saveRecipeToHistory, loadPantry, savePantry } from '@/lib/recipeCache'
import type { RecipeData } from '@/types/recipe'
import { validateIngredientName, sanitizeIngredientName, PANTRY_ITEMS } from '@/components/generate/ingredientValidation'
import toast from 'react-hot-toast'

const units = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'pcs', 'pinch', 'dash', 'clove', 'slice', 'bunch', 'can', 'jar', 'package']

const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'high-protein', 'low-fat', 'nut-free', 'shellfish-free']
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'drink']

const distractionMessages = [
  'Consulting the flavor spirits...',
  'Balancing sweet, salty, sour, bitter, umami...',
  "Checking your pantry's secret stash...",
  'Negotiating with the garlic gods...',
  'Calculating optimal onion-to-garlic ratio...',
  'Preheating the imagination oven...',
  'Summoning the spirit of Julia Child...',
  "Measuring with grandmother's precision...",
  'Whisking creativity into the batter...',
  'Simmering ideas to perfection...',
  'Letting the flavors marry...',
  'Seasoning with a pinch of magic...',
]

interface IngredientInput {
  name: string
  quantity: string
  unit: string
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function DemoPage() {
  const isMobile = useIsMobile()
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', quantity: '', unit: 'g' },
  ])
  const [servings, setServings] = useState(2)
  const [dietaryTags, setDietaryTags] = useState<string[]>([])
  const [mealType, setMealType] = useState('')
  const [maxPrepTime, setMaxPrepTime] = useState('')
  const [maxCookTime, setMaxCookTime] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [avoidIngredients, setAvoidIngredients] = useState('')
  const [equipment, setEquipment] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeData | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [distractionIndex, setDistractionIndex] = useState(0)
  const distractionRef = useRef<NodeJS.Timeout | null>(null)
  const [ingredientErrors, setIngredientErrors] = useState<Map<number, string>>(new Map())
  const [lastRecipe, setLastRecipe] = useState<RecipeData | null>(null)
  const [pantry, setPantry] = useState<string[]>([])

  // Restore the last generated recipe (desktop only) so returning users can
  // pick up where they left off without re-entering ingredients.
  useEffect(() => {
    if (isMobile) return
    const cached = loadLastRecipe()
    if (cached) setLastRecipe(cached)
    setPantry(loadPantry())
  }, [isMobile])

  const togglePantry = (name: string) => {
    setPantry((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      savePantry(next)
      return next
    })
  }

  const addIngredient = () => {
    if (ingredients.length >= 20) return
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof IngredientInput, value: string) => {
    setIngredients(ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)))
    if (field === 'name') {
      const error = validateIngredientName(value)
      setIngredientErrors(prev => {
        const next = new Map(prev)
        if (error) next.set(index, error)
        else next.delete(index)
        return next
      })
    }
  }

  const toggleDietary = (tag: string) => {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addSuggested = (name: string) => {
    if (ingredients.length >= 20) return
    setIngredients((prev) => [...prev, { name, quantity: '', unit: 'g' }])
  }

  const surpriseMe = () => {
    const combos = [
      ['Chicken breast', 'Garlic', 'Spinach', 'Cream', 'Pasta'],
      ['Eggs', 'Tomato', 'Basil', 'Mozzarella', 'Bread'],
      ['Salmon', 'Lemon', 'Asparagus', 'Butter', 'Rice'],
      ['Chickpeas', 'Cumin', 'Onion', 'Tomato', 'Cilantro'],
      ['Beef', 'Bell pepper', 'Soy sauce', 'Ginger', 'Rice'],
    ]
    const pick = combos[Math.floor(Math.random() * combos.length)]
    setIngredients(pick.map((name) => ({ name, quantity: '', unit: 'g' })))
  }

  const startDistractionMessages = () => {
    setDistractionIndex(0)
    distractionRef.current = setInterval(() => {
      setDistractionIndex((prev) => (prev + 1) % distractionMessages.length)
    }, 3000)
  }

  const stopDistractionMessages = () => {
    if (distractionRef.current) {
      clearInterval(distractionRef.current)
      distractionRef.current = null
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setStreamError(null)
    setGeneratedRecipe(null)

    const sanitized = ingredients.map((ing) => ({
      ...ing,
      name: sanitizeIngredientName(ing.name),
    }))
    const validIngredients = sanitized.filter((ing) => ing.name.trim())

    const errors = new Map<number, string>()
    let hasErrors = false
    // Key errors by the ORIGINAL ingredient index so they display on the
    // correct row (validIngredients is the filtered array, which would shift indices).
    sanitized.forEach((ing, i) => {
      if (!ing.name.trim()) return
      const error = validateIngredientName(ing.name)
      if (error) {
        errors.set(i, error)
        hasErrors = true
      }
    })
    if (hasErrors) {
      setIngredientErrors(errors)
      setStreamError('Please fix the invalid ingredients below.')
      return
    }

    setGenerating(true)
    startDistractionMessages()

    try {
      // Self-contained demo engine — no backend required
      const recipe = await new Promise<RecipeData>((resolve) => {
        setTimeout(() => {
          resolve(
            buildMockRecipe(validIngredients.map((i) => i.name), {
              servings,
              mealType,
              cuisine,
              dietary: dietaryTags,
              avoid: avoidIngredients
                ? avoidIngredients.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
              equipment: equipment
                ? equipment.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
              maxPrepMinutes: maxPrepTime ? parseInt(maxPrepTime, 10) : undefined,
              maxCookMinutes: maxCookTime ? parseInt(maxCookTime, 10) : undefined,
              pantryStaples: pantry,
            })
          )
        }, 2200)
      })

      setGeneratedRecipe(recipe)
      saveLastRecipe(recipe)
      saveRecipeToHistory(recipe)
      setLastRecipe(recipe)
      stopDistractionMessages()
      setGenerating(false)
      setShowViewer(true)
    } catch (err: any) {
      stopDistractionMessages()
      setGenerating(false)
      const msg = err?.message || 'Failed to generate recipe'
      setStreamError(msg)
      toast.error(msg, { duration: 4000 })
    }
  }

  const handleImageUpload = async (file: File) => {
    setGenerating(true)
    setStreamError(null)
    startDistractionMessages()

    try {
      // Self-contained demo detector — no backend/vision required
      const data = await mockDetectIngredients(file)

      if (data.ingredients && data.ingredients.length > 0) {
        setIngredients((prev) => [
          ...prev,
          ...data.ingredients.map((ing) => ({
            name: ing.name,
            quantity: '',
            unit: 'g',
          })),
        ])
        toast.success(`Detected ${data.ingredients.length} ingredients from your photo`)
      } else {
        toast('No ingredients detected — try another photo')
      }

      stopDistractionMessages()
      setGenerating(false)
    } catch (err: any) {
      stopDistractionMessages()
      const msg = err?.message || 'Failed to read image'
      setStreamError(msg)
      toast.error(msg, { duration: 5000 })
      setGenerating(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      await new Promise((resolve) => (video.onloadeddata = resolve))

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)

      stream.getTracks().forEach((track) => track.stop())

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'ingredient-photo.jpg', { type: 'image/jpeg' })
            handleImageUpload(file)
          }
        },
        'image/jpeg',
        0.9
      )
    } catch {
      // Camera blocked/unavailable — fall back to a simulated scan so the demo still works
      toast('Camera unavailable — simulating a scan instead')
      handleImageUpload(new File([], 'simulated.jpg'))
    }
  }

  const handleRedo = () => {
    setGeneratedRecipe(null)
    setShowViewer(false)
    setIngredients([{ name: '', quantity: '', unit: 'g' }])
    setStreamError(null)
  }

  const handleFinish = () => {
    setShowViewer(false)
    setShowAuth(true)
  }

  const hasValidIngredients = ingredients.some((ing) => ing.name.trim())

  // Mobile: show download prompt (demo is desktop-only)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <Logo size={28} />
              <span className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-hand), cursive' }}>yield</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
              Yield works best on desktop
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              The full recipe generation experience is available on your computer. Download the app for the complete mobile experience.
            </p>
            <div className="space-y-3">
              <Link href="/download" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-teal-600 text-white font-semibold text-base hover:bg-teal-700 transition-all btn-press active:scale-95 no-underline">
                Download the App
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth" className="block w-full py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-base hover:bg-slate-200 transition-all btn-press active:scale-95 no-underline text-center">
                Sign Up Free
              </Link>
              <Link href="/" className="block w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-base hover:bg-slate-50 transition-all btn-press active:scale-95 no-underline text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <Logo size={28} />
            <span className="text-lg font-bold text-slate-900 group-hover:text-miku transition-colors" style={{ fontFamily: 'var(--font-hand), cursive' }}>yield</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-miku/10 text-miku-hover text-[11px] font-bold uppercase tracking-wide">Demo</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm font-semibold text-slate-600 hover:text-miku transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Sign In
            </button>
            <Link href="/download" className="no-underline px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all btn-press active:scale-95">
              Get the App
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20" id="main-content">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Generate a Recipe</h1>
          <p className="text-sm text-slate-500">Type what you have, and we&apos;ll build something delicious.</p>
        </div>

        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-light text-slate-900 mb-2">Generating your recipe...</h2>
                <p className="text-slate-500">{distractionMessages[distractionIndex]}</p>
              </div>

              {/* Skeleton preview so the layout doesn't jump when the recipe arrives */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                <div className="h-7 w-2/3 rounded-lg shimmer-bg bg-slate-100" />
                <div className="h-4 w-1/3 rounded bg-slate-100 shimmer-bg" />
                <div className="space-y-3 pt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 shimmer-bg shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-slate-100 shimmer-bg" />
                        <div className="h-3 w-1/2 rounded bg-slate-100 shimmer-bg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
               initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {lastRecipe && (
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedRecipe(lastRecipe)
                    setShowViewer(true)
                  }}
                  className="mb-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-miku/10 border border-miku/20 text-sm font-semibold text-miku-hover hover:bg-miku/20 transition-colors btn-press active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  View your last recipe
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <form onSubmit={handleGenerate} className="space-y-5 sm:space-y-6">
                {/* Ingredients Input */}
                <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-lg sm:text-xl font-medium text-slate-900">Your Ingredients</h2>
                      <span className="text-xs font-medium text-slate-400">{ingredients.length}/20</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={surpriseMe} className="btn btn-ghost btn-sm btn-press text-teal-600">
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        Surprise me
                      </button>
                      <button type="button" onClick={addIngredient} className="btn btn-primary btn-sm btn-press">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Suggested ingredient chips */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400">Quick add:</span>
                    {['Chicken', 'Garlic', 'Pasta', 'Tomatoes', 'Cheese', 'Onion', 'Eggs'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSuggested(s)}
                        className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors btn-press active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3" id="ingredients-list">
                    {ingredients.map((ingredient, index) => (
                      <motion.div
                        key={`ing-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                          <input
                            type="text"
                            placeholder="Ingredient name"
                            aria-label={`Ingredient ${index + 1} name`}
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            className={`flex-1 min-w-0 px-3 sm:px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                              ingredientErrors.has(index)
                                ? 'border-red-400 ring-1 ring-red-200'
                                : 'border-slate-200'
                            }`}
                            autoComplete="off"
                          />
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Qty"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                              className="w-16 sm:w-20 px-2 sm:px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-center"
                            />
                            <select
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                              className="w-20 sm:w-28 px-2 sm:px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                            >
                              {units.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            disabled={ingredients.length <= 1}
                            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                            aria-label="Remove ingredient"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                        {ingredientErrors.has(index) && (
                          <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {ingredientErrors.get(index)}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Pantry staples */}
                <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg sm:text-xl font-medium text-slate-900">Pantry staples</h2>
                    <span className="text-xs font-medium text-slate-400">{pantry.length} saved</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">We&apos;ll auto-add these to every recipe so you never re-enter them.</p>
                  <div className="flex flex-wrap gap-2">
                    {PANTRY_ITEMS.map((item) => {
                      const selected = pantry.includes(item.name)
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => togglePantry(item.name)}
                          aria-pressed={selected}
                          className={cn(
                            'px-3 py-2 rounded-full text-xs font-medium transition-all min-h-[44px] flex items-center justify-center btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                            selected
                              ? 'bg-teal-500 text-white active:scale-95'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          )}
                        >
                          {item.name}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Options Grid */}
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Servings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Servings</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setServings(Math.max(1, servings - 1))} aria-label="Decrease servings" className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all btn-press active:scale-90">
                        <span className="text-xl font-medium">&minus;</span>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={servings}
                        onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center text-xl font-semibold bg-transparent border-0 focus:outline-none text-slate-900"
                      />
                      <button type="button" onClick={() => setServings(servings + 1)} aria-label="Increase servings" className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all btn-press active:scale-90">
                        <span className="text-xl font-medium">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Dietary Needs</label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleDietary(tag)}
                          className={cn(
                            'px-3 py-2 rounded-full text-xs font-medium transition-all min-h-[44px] flex items-center justify-center btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                            dietaryTags.includes(tag)
                              ? 'bg-teal-500 text-white active:scale-95'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          )}
                        >
                          {tag.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meal Type */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">Any meal</option>
                      {mealTypes.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Options */}
                <details className="group bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-medium text-slate-900">Advanced Options</span>
                    <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Cuisine Preference</label>
                      <input
                        type="text"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        placeholder="e.g., Italian, Mexican, Thai"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Prep Time (min)</label>
                      <input
                        type="number"
                        min="0"
                        value={maxPrepTime}
                        onChange={(e) => setMaxPrepTime(e.target.value)}
                        placeholder="e.g., 15"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Cook Time (min)</label>
                      <input
                        type="number"
                        min="0"
                        value={maxCookTime}
                        onChange={(e) => setMaxCookTime(e.target.value)}
                        placeholder="e.g., 30"
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Equipment</label>
                      <input
                        type="text"
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        placeholder="e.g., oven, stand mixer, food processor, grill"
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Avoid Ingredients</label>
                      <input
                        type="text"
                        value={avoidIngredients}
                        onChange={(e) => setAvoidIngredients(e.target.value)}
                        placeholder="e.g., nuts, shellfish, cilantro"
                        className="input"
                      />
                    </div>
                  </div>
                </details>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={!hasValidIngredients || generating}
                  className="w-full py-4 rounded-2xl bg-teal-500 text-white font-medium text-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 btn-press active:scale-[0.98]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Recipe
                    </>
                  )}
                </button>

                {streamError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Generation failed</p>
                      <p className="text-sm mt-1">{streamError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Quick Input Methods */}
                <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200">
                  <div className="text-center mb-5 sm:mb-6">
                    <h3 className="text-lg font-medium text-slate-900">Or add ingredients another way</h3>
                    <p className="text-sm text-slate-500 mt-1">Scan, upload, or speak your list</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      disabled={generating}
                      className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all btn-press active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:scale-110 transition-all">
                        <Camera className="w-6 h-6 text-teal-600" />
                      </span>
                      <span className="font-semibold text-sm text-slate-900">Scan Photo</span>
                      <span className="text-xs text-slate-500 mt-0.5">OCR ingredients</span>
                    </button>
                    <label className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all cursor-pointer btn-press active:scale-[0.98]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={generating}
                      />
                      <span className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:scale-110 transition-all">
                        <Upload className="w-6 h-6 text-teal-600" />
                      </span>
                      <span className="font-semibold text-sm text-slate-900">Upload Image</span>
                      <span className="text-xs text-slate-500 mt-0.5">From gallery</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                        if (SR) {
                          const recognition = new SR()
                          recognition.continuous = false
                          recognition.interimResults = false
                          recognition.lang = 'en-US'
                          toast('Listening… say your ingredients')
                          recognition.onresult = (event: any) => {
                            const transcript = Array.from(event.results)
                              .map((result: any) => result[0].transcript)
                              .join(', ')
                            const parts = transcript
                              .split(/,|and|then/)
                              .map((s: string) => s.trim())
                              .filter(Boolean)
                            if (parts.length > 0) {
                              setIngredients((prev) => [
                                ...prev,
                                ...parts.map((name: string) => ({ name, quantity: '', unit: 'g' })),
                              ])
                              toast.success(`Added ${parts.length} ingredient${parts.length > 1 ? 's' : ''}`)
                            }
                          }
                          recognition.onerror = () => {
                            toast('Couldn’t hear you — adding a sample instead')
                            addSuggested('Chicken')
                          }
                          recognition.start()
                        } else {
                          // No speech support — add a sample so the demo still works
                          toast('Voice not supported here — adding a sample ingredient')
                          addSuggested('Chicken')
                        }
                      }}
                      disabled={generating}
                      className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all btn-press active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:scale-110 transition-all">
                        <Mic className="w-6 h-6 text-teal-600" />
                      </span>
                      <span className="font-semibold text-sm text-slate-900">Speak List</span>
                      <span className="text-xs text-slate-500 mt-0.5">Voice input</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Recipe Viewer Modal ── */}
      {showViewer && generatedRecipe && (
        <RecipeViewer
          recipe={generatedRecipe}
          onClose={() => setShowViewer(false)}
          onSave={() => toast.success('Recipe saved to this device!')}
          footer={
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={handleRedo}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all btn-press active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Redo
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-all btn-press active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish
              </button>
            </div>
          }
        />
      )}

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => window.location.href = '/download'}
      />

      {/* ── Footer ── */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/" className="link-underline hover:text-slate-700 transition-colors no-underline">Home</Link>
            <Link href="/terms" className="link-underline hover:text-slate-700 transition-colors no-underline">Terms</Link>
            <Link href="/privacy" className="link-underline hover:text-slate-700 transition-colors no-underline">Privacy</Link>
            <Link href="/faq" className="link-underline hover:text-slate-700 transition-colors no-underline">FAQ</Link>
            <a href="mailto:chocwebster@gmail.com" className="link-underline hover:text-slate-700 transition-colors no-underline">Contact</a>
          </div>
          <span className="text-xs text-slate-400">© 2026 Yield. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
