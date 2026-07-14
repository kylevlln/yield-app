import { ForkIcon, KnifeIcon, SpoonIcon, WhiskIcon, HerbIcon, RollingPinIcon, PanIcon, PotIcon } from '@/components/CookingFloats'
import type { CookingFloatProps } from '@/components/CookingFloats'

export const COOKING_FLOATS: CookingFloatProps[] = [
  { icon: ForkIcon, size: 28, className: 'float-1', top: '18%', left: '6%', opacity: 0.07 },
  { icon: KnifeIcon, size: 26, className: 'float-2', top: '12%', right: '8%', opacity: 0.06 },
  { icon: SpoonIcon, size: 24, className: 'float-3', top: '65%', left: '4%', opacity: 0.08 },
  { icon: WhiskIcon, size: 30, className: 'float-4', top: '70%', right: '5%', opacity: 0.06 },
  { icon: HerbIcon, size: 22, className: 'float-5', top: '35%', left: '2%', opacity: 0.05 },
  { icon: RollingPinIcon, size: 26, className: 'float-6', top: '45%', right: '3%', opacity: 0.05 },
  { icon: PanIcon, size: 28, className: 'float-1', top: '80%', left: '10%', opacity: 0.04 },
  { icon: PotIcon, size: 24, className: 'float-3', top: '25%', right: '2%', opacity: 0.04 },
  { icon: ForkIcon, size: 20, className: 'float-5', top: '55%', left: '8%', opacity: 0.03 },
  { icon: HerbIcon, size: 18, className: 'float-2', top: '85%', right: '10%', opacity: 0.04 },
  { icon: KnifeIcon, size: 22, className: 'float-4', top: '5%', left: '50%', opacity: 0.03 },
  { icon: SpoonIcon, size: 20, className: 'float-6', top: '90%', left: '45%', opacity: 0.03 },
]

export const STEPS = [
  { num: '01', title: 'Drop your ingredients', desc: 'Chicken, garlic, pasta — whatever\'s in your fridge right now. Type it, snap a photo, or just say it out loud.', icon: '🔍', detail: 'Yield understands natural language. "I have half a chicken and some sad vegetables" works just as well as a neat ingredient list.' },
  { num: '02', title: 'We build a recipe', desc: 'Not a link to someone\'s blog. An actual recipe, written for exactly what you have.', icon: '🧪', detail: 'Yield uses your ingredients plus your saved pantry staples. No random substitutions. No "just go to the store." Every recipe uses what you actually own.' },
  { num: '03', title: 'Cook with confidence', desc: 'Step-by-step. Tap timers. Food safety warnings when it matters.', icon: '👨‍🍳', detail: 'Swipe through each step. Tap to start timers. See USDA temperature warnings on proteins. No guesswork, no Googling "is chicken done yet?".' },
]

export const FEATURES_LIST = [
  { num: '01', label: 'Ingredient input', desc: 'Type, photograph, or voice — however you want', icon: '⌨️' },
  { num: '02', label: 'Smart substitutions', desc: 'Dairy-free? Nut-free? Yield adapts on the fly', icon: '🔄' },
  { num: '03', label: 'Pantry staples', desc: 'Save once. Never re-enter salt, oil, or pepper again', icon: '🧂' },
  { num: '04', label: 'Recipe history', desc: 'Every meal you\'ve cooked — searchable, revisitable', icon: '📚' },
  { num: '05', label: 'USDA safety banners', desc: 'Temperature warnings on every protein, every time', icon: '🌡' },
  { num: '06', label: 'One-tap timers', desc: 'Built into each step. Nothing to set up', icon: '⏱' },
]
