import type { RecipeData } from '@/types/recipe'

const KEY = 'yield:lastRecipe'

interface CachedRecipe {
  savedAt: number
  recipe: RecipeData
}

export function saveLastRecipe(recipe: RecipeData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), recipe }))
  } catch {
    // Storage unavailable (private mode / quota) — non-fatal.
  }
}

export function loadLastRecipe(): RecipeData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedRecipe
    return parsed?.recipe ?? null
  } catch {
    return null
  }
}

export function clearLastRecipe(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // non-fatal
  }
}

// ── Recipe history (local, demo-mode) ──────────────────────────────────────

const HISTORY_KEY = 'yield:history'
const PANTRY_KEY = 'yield:pantry'

export interface HistoryEntry extends RecipeData {
  saved_at: string
}

export function saveRecipeToHistory(recipe: RecipeData): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : []
    const entry: HistoryEntry = { ...recipe, saved_at: new Date().toISOString() }
    // Newest first, de-dupe by id, cap at 20.
    const next = [entry, ...list.filter((r) => r.id !== recipe.id)].slice(0, 20)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable — non-fatal.
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export function removeFromHistory(id: string): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : []
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((r) => r.id !== id)))
  } catch {
    // non-fatal
  }
}

// ── Pantry staples (local, demo-mode) ─────────────────────────────────────

export function loadPantry(): string[] {
  try {
    const raw = localStorage.getItem(PANTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []
  } catch {
    return []
  }
}

export function savePantry(names: string[]): void {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(names))
  } catch {
    // non-fatal
  }
}
