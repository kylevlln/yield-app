'use client'

import type { RecipeGenerationRequest } from '@/types/recipe'
import { supabase } from './supabase'

/** Methods that are safe to auto-retry on a 429 (no side-effect risk). */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'])

/** Streaming generation hard timeout (ms). A hung backend must not hang forever. */
const STREAM_TIMEOUT_MS = 30_000

/**
 * Resolves the API base URL. In production a missing env var means every call
 * would silently hit localhost and fail — fail fast with a clear error instead.
 */
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(
        'API base URL is not configured (NEXT_PUBLIC_API_URL missing).',
        500,
      )
    }
    return 'http://localhost:8000/api/v1'
  }
  return url.replace(/\/$/, '')
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: HeadersInit = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

export class ApiError extends Error {
  status: number
  detail: unknown
  retryAfter: number | null

  constructor(message: string, status: number, detail?: unknown, retryAfter?: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.retryAfter = retryAfter ?? null
  }

  get isRateLimited() {
    return this.status === 429
  }
}

function parseRetryAfter(res: Response): number | null {
  const header = res.headers.get('Retry-After')
  if (!header) return null
  const seconds = parseInt(header, 10)
  return isNaN(seconds) ? null : seconds
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function exponentialBackoff(attempt: number, baseMs = 1000, maxMs = 16000): number {
  const exponential = Math.min(baseMs * Math.pow(2, attempt), maxMs)
  const jitter = exponential * (0.5 + Math.random() * 0.5)
  return Math.floor(jitter)
}

async function request<T>(path: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = { ...await getAuthHeaders(), ...options.headers as HeadersInit }
  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers })

  if (res.status === 429 && retries > 0 && IDEMPOTENT_METHODS.has(method)) {
    const retryAfter = parseRetryAfter(res)
    const delay = retryAfter ? retryAfter * 1000 : exponentialBackoff(2 - retries)
    await sleep(delay)
    return request<T>(path, options, retries - 1)
  }

  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { /* ignore */ }
    throw new ApiError(
      (detail as any)?.detail?.message || (detail as any)?.detail || `Request failed (${res.status})`,
      res.status,
      detail,
      parseRetryAfter(res)
    )
  }

  return res.json()
}

// =============================================================================
// Recipe Generation (streaming)
// =============================================================================

export interface StreamEvent {
  type: 'distraction' | 'status' | 'complete' | 'error'
  message?: string
  progress?: number
  recipe?: any
  violations?: unknown[]
}

export async function generateRecipeStream(
  request: RecipeGenerationRequest,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  retries = 2
): Promise<void> {
  const headers = await getAuthHeaders()

  // Enforce a hard timeout so a hung backend can't leave `generating` true forever.
  // If the caller didn't supply a signal, we create our own and abort on timeout.
  const controller = !signal ? new AbortController() : null
  const timeoutId = controller ? setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS) : null
  const effectiveSignal = signal ?? controller!.signal

  let res: Response
  try {
    res = await fetch(`${getApiBaseUrl()}/recipes/generate/stream`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: effectiveSignal,
    })
  } catch (err: any) {
    if (controller?.signal.aborted) {
      throw new ApiError('Recipe generation timed out. Please try again.', 408)
    }
    throw err
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }

  if (res.status === 429 && retries > 0) {
    const retryAfter = parseRetryAfter(res)
    const delay = retryAfter ? retryAfter * 1000 : exponentialBackoff(2 - retries)
    await sleep(delay)
    return generateRecipeStream(request, onEvent, signal, retries - 1)
  }

  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { /* ignore */ }
    throw new ApiError(
      (detail as any)?.detail?.message || `Generation failed (${res.status})`,
      res.status,
      detail,
      parseRetryAfter(res)
    )
  }

  const reader = res.body?.getReader()
  if (!reader) throw new ApiError('No response stream', 500)

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: StreamEvent = JSON.parse(line.slice(6))
          onEvent(event)
          if (event.type === 'complete' || event.type === 'error') return
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

// =============================================================================
// Recipe CRUD
// =============================================================================

export async function getRecipes(params?: { status?: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  const qs = query.toString()
  return request<any[]>(`/recipes${qs ? `?${qs}` : ''}`)
}

export async function getRecipe(recipeId: string) {
  return request<any>(`/recipes/${recipeId}`)
}

export async function deleteRecipe(recipeId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${getApiBaseUrl()}/recipes/${recipeId}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new ApiError('Delete failed', res.status)
}

// =============================================================================
// Pantry
// =============================================================================

export async function getPantryStaples() {
  return request<any[]>('/pantry/staples')
}

export async function addPantryStaple(staple: { name: string; category: string }) {
  return request<any>('/pantry/staples', {
    method: 'POST',
    body: JSON.stringify(staple),
  })
}

export async function deletePantryStaple(id: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${getApiBaseUrl()}/pantry/staples/${id}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new ApiError('Delete failed', res.status)
}

export async function updatePantryStaple(id: string, data: Record<string, unknown>) {
  return request<any>(`/pantry/staples/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// =============================================================================
// Pantry Inventory
// =============================================================================

export async function getInventory(params?: { location?: string; expiring_soon?: boolean }) {
  const query = new URLSearchParams()
  if (params?.location) query.set('location', params.location)
  if (params?.expiring_soon) query.set('expiring_soon', 'true')
  const qs = query.toString()
  return request<any[]>(`/pantry/inventory${qs ? `?${qs}` : ''}`)
}

export async function addInventoryItem(item: { name: string; category: string; quantity: number; unit: string; expires_at?: string; location?: string }) {
  return request<any>('/pantry/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export async function updateInventoryItem(id: string, data: Record<string, unknown>) {
  return request<any>(`/pantry/inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteInventoryItem(id: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${getApiBaseUrl()}/pantry/inventory/${id}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new ApiError('Delete failed', res.status)
}

// =============================================================================
// Vision / Image Upload
// =============================================================================

export class VisionError extends ApiError {
  reason: 'parse_failed' | 'no_ingredients' | 'api_error' | 'not_configured'

  constructor(message: string, status: number, reason: VisionError['reason'], detail?: unknown) {
    super(message, status, detail)
    this.name = 'VisionError'
    this.reason = reason
  }
}

export async function parseImageIngredients(file: File): Promise<{ ingredients: any[] }> {
  const headers = await getAuthHeaders()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${getApiBaseUrl()}/recipes/vision`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    let detail: any
    try { detail = await res.json() } catch { /* ignore */ }

    if (res.status === 503) {
      throw new VisionError(
        'Photo recognition is not configured yet',
        503,
        'not_configured',
        detail
      )
    }

    throw new VisionError(
      'Image parsing failed',
      res.status,
      'api_error',
      detail
    )
  }

  const data = await res.json()
  const ingredients = data.ingredients || data

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new VisionError(
      'No ingredients detected — try a clearer photo with visible food items',
      200,
      'no_ingredients'
    )
  }

  return { ingredients }
}
