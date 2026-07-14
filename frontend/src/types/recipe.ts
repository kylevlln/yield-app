export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  category: string
  is_staple: boolean
  preparation?: string
  substitution_group?: string
}

export interface RecipeStep {
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
  media_url?: string
  media_type?: 'image' | 'video'
}

export interface FoodSafetyBanner {
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

export interface SubstitutionSuggestion {
  original_ingredient: string
  substitute: string
  ratio: string
  category: string
  confidence: number
  works_in: string[]
  notes?: string
}

export interface RecipeData {
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
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  equipment: string[]
  protein_type: string
  food_safety?: FoodSafetyBanner
  substitutions?: SubstitutionSuggestion[]
  generation_metadata?: {
    generation_id: string
    model_used: string
    generation_time_ms: number
    taste_filter_passed: boolean
    taste_filter_warnings: Array<{
      type: string
      message: string
    }>
  }
}

export interface RecipeGenerationRequest {
  ingredients: Array<{
    name: string
    quantity?: number
    unit?: string
    category?: string
  }>
  servings: number
  dietary_restrictions: string[]
  meal_type?: string
  difficulty?: string
  max_prep_time?: number
  max_cook_time?: number
  available_equipment: string[]
  cuisine_preference?: string
  avoid_ingredients: string[]
  use_pantry_staples: boolean
  pantry_staples: string[]
}

export interface RecipeGenerationResponse {
  title: string
  description?: string
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  meal_type: string[]
  dietary_tags: string[]
  cuisine?: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  equipment: string[]
  protein_type: string
  food_safety?: FoodSafetyBanner
  substitutions?: SubstitutionSuggestion[]
  generation_metadata?: {
    generation_id: string
    model_used: string
    generation_time_ms: number
    taste_filter_passed: boolean
    taste_filter_warnings: Array<{ type: string; message: string }>
  }
}

export interface PantryStaple {
  id: string
  user_id: string
  name: string
  category: string
  default_unit: string
  default_quantity: number
  min_threshold: number
  is_staple: boolean
  notes?: string
  last_restocked?: string
  created_at: string
  updated_at: string
}

export interface PantryInventoryItem {
  id: string
  user_id: string
  staple_id?: string
  name: string
  category: string
  quantity: number
  unit: string
  expires_at?: string
  location?: string
  is_open: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Substitution {
  id: string
  ingredient_name: string
  substitute_name: string
  ratio: string
  category?: string
  notes?: string
  works_in: string[]
  confidence_score: number
  source: string
  upvotes: number
  downvotes: number
  created_by?: string
  created_at: string
}

export interface UserSubstitutionPreference {
  id: string
  user_id: string
  ingredient_name: string
  preferred_substitute: string
  ratio: string
  notes?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'premium' | 'admin'
  timezone: string
  locale: string
  units_measurement: 'metric' | 'imperial'
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  dietary_restrictions: string[]
  allergies: string[]
  skill_level: 'easy' | 'medium' | 'hard'
  max_prep_time_minutes: number
  max_cook_time_minutes: number
  preferred_cuisines: string[]
  disliked_ingredients: string[]
  available_equipment: string[]
  theme: 'light' | 'dark' | 'system'
  reduced_motion: boolean
  haptic_feedback: boolean
  haptic_intensity: 'light' | 'medium' | 'heavy'
  default_servings: number
  default_units: 'metric' | 'imperial'
  push_notifications: boolean
  expiry_alerts: boolean
  expiry_alert_days: number
  meal_reminders: boolean
  analytics_opt_in: boolean
  share_usage_data: boolean
  created_at: string
  updated_at: string
}