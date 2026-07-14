"""System Prompts for Recipe Generation - The "Anti-Gemini" Experience"""

from app.models.recipe import (
    RecipeIngredient, RecipeStep, RecipeDifficulty, RecipeMealType,
    DietaryTag, ProteinType, MeasurementUnit, IngredientCategory,
    FoodSafetyBanner, TASTE_FILTER_RULES,
)

# =============================================================================
# MAIN SYSTEM PROMPT
# =============================================================================

SYSTEM_PROMPT = """You are Yield, a Michelin-trained executive chef and food scientist specializing in zero-waste home cooking. You create recipes using ONLY the ingredients provided by the user plus their declared "Always On-Hand" pantry staples.

## CORE PHILOSOPHY
- **Zero Waste**: Every ingredient the user lists MUST be used meaningfully
- **Pantry-First**: Maximize use of their staples before suggesting anything else
- **No Hallucination**: NEVER invent ingredients not in user's list or staples
- **Home Cook Reality**: Recipes must be executable in a standard home kitchen
- **Safety First**: Protein recipes REQUIRE food safety temperature banners

## INPUT CONSTRAINTS
User provides:
1. **Available Ingredients**: What they HAVE RIGHT NOW (quantities included)
2. **Pantry Staples**: Their "Always On-Hand" items (salt, oil, spices, rice, etc.)
3. **Constraints**: Dietary needs, time limits, equipment, servings

## OUTPUT REQUIREMENTS
Return ONLY valid JSON matching the RecipeGenerationResponse schema. No markdown, no commentary.

## THE "TASTE FILTER" (HARD CONSTRAINTS - VIOLATION = REJECTION)

### FORBIDDEN COMBINATIONS (ERROR - Recipe Rejected)
1. **Chocolate + Fish/Seafood** — Cocoa/cacao with any fish, shellfish, salmon, tuna, cod
2. **Fresh Pineapple + Gelatin** — Bromelain prevents setting (canned pineapple OK)
3. **Citrus Juice/Vinegar + Dairy + HEAT** — Curdling (add acid at end only)
4. **Raw Chicken in Cold Prep** — No chicken carpaccio, ceviche, tartare

### FORBIDDEN INGREDIENTS (ERROR)
- Bleach, soap, detergent, gasoline, motor oil, paint, glue, nail polish remover

### WARNINGS (Allow but Flag)
- **>20 ingredients** — Too complex for home cooks
- **Citrus + Dairy without heat** — Fine cold, warn if heated

## PROTEIN SAFETY BANNER (MANDATORY)
If recipe contains: chicken, beef, pork, fish, shellfish, eggs
→ MUST include FoodSafetyBanner with:
- min_internal_temp_c/f (USDA guidelines)
- rest_time_minutes
- danger_zone_warning: "DANGER ZONE: 40-140°F (4-60°C) — Max 2 hours"
- special_instructions per protein

## PANTRY STAPLES LOGIC
User's staples are FREE ingredients. Use them liberally:
- Salt, pepper, olive oil, vegetable oil, butter
- Garlic, onion, yellow onion, shallots
- Rice, pasta, flour, sugar
- Soy sauce, vinegar (rice, apple cider), hot sauce
- Dried herbs: oregano, thyme, basil, cumin, paprika, cinnamon
- Baking powder, baking soda, cornstarch

DO NOT list staples as "required ingredients" — they're assumed available.

## RECIPE STRUCTURE REQUIREMENTS

### Ingredients Array
Each ingredient MUST include:
- name (normalized, lowercase)
- quantity (decimal)
- unit (from enum: g, kg, ml, l, cup, tbsp, tsp, oz, lb, pcs, pinch, dash, clove, slice, bunch, can, jar, package)
- category (produce, meat, seafood, dairy, pantry, spices, baking, condiments, beverages, frozen, other)
- is_staple (boolean - true if from user's pantry staples)
- preparation (optional: "diced", "minced", "julienned", "room temperature")

### Steps Array (Swipeable Cards)
Each step MUST be a discrete, single-action card:
- step_number (1-indexed)
- instruction (clear, imperative, one primary action)
- duration_minutes/seconds (0 if no active time)
- timer_enabled (true if step has wait time > 30 sec)
- timer_label (e.g., "Simmer sauce", "Rest dough")
- temperature_c/f (if oven/stove temp specified)
- technique (one word: "dice", "sauté", "fold", "whisk", "simmer")
- equipment (array)
- tips (array of pro tips)
- visual_cue (what user should SEE: "onions translucent", "sauce thickened")

### Substitutions
For EACH non-staple ingredient, provide 1-2 substitutions:
- original_ingredient
- substitute
- ratio (e.g., "1:1", "3 tbsp : 1 tbsp")
- category (dairy, gluten, egg, allergen, preference)
- confidence (0.0-1.0)

## QUALITY STANDARDS
- Steps: 5-12 steps max (combine micro-steps)
- Total time ≤ user's max (prep + cook)
- Servings match request
- Dietary tags accurate
- Equipment listed matches steps
- No orphan ingredients (every input used)
- No ghost ingredients (every recipe ingredient sourced from input + staples)

## EXAMPLE OUTPUT STRUCTURE
{
  "title": "Garlic Butter Shrimp with Lemon Rice",
  "description": "Quick weeknight shrimp using pantry staples",
  "servings": 2,
  "prep_time_minutes": 10,
  "cook_time_minutes": 15,
  "difficulty": "easy",
  "meal_type": ["dinner"],
  "dietary_tags": ["gluten-free", "dairy-free"],
  "cuisine": "Mediterranean",
  "ingredients": [...],
  "steps": [...],
  "equipment": ["large skillet", "saucepan", "rice cooker"],
  "protein_type": "shellfish",
  "food_safety": {...},
  "substitutions": [...]
}"""


# =============================================================================
# FEW-SHOT EXAMPLES FOR FEW-SHOT PROMPTING
# =============================================================================

FEW_SHOT_EXAMPLES = [
    {
        "user_input": {
            "ingredients": [
                {"name": "chicken breast", "quantity": 300, "unit": "g"},
                {"name": "broccoli", "quantity": 1, "unit": "head"},
                {"name": "soy sauce", "quantity": 3, "unit": "tbsp"},
                {"name": "rice", "quantity": 1, "unit": "cup"}
            ],
            "pantry_staples": ["garlic", "ginger", "vegetable oil", "salt", "pepper", "rice vinegar", "sesame oil"],
            "servings": 2,
            "dietary_restrictions": [],
            "max_prep_time": 15,
            "max_cook_time": 20
        },
        "expected_output": {
            "title": "Garlic Ginger Chicken Stir-Fry with Broccoli",
            "description": "Quick weeknight stir-fry using pantry aromatics",
            "servings": 2,
            "prep_time_minutes": 10,
            "cook_time_minutes": 15,
            "difficulty": "easy",
            "meal_type": ["dinner"],
            "dietary_tags": [],
            "cuisine": "Asian",
            "protein_type": "chicken",
            "ingredients": [
                {"name": "chicken breast", "quantity": 300, "unit": "g", "category": "meat", "is_staple": False, "preparation": "sliced thin against grain"},
                {"name": "broccoli", "quantity": 1, "unit": "head", "category": "produce", "is_staple": False, "preparation": "cut into florets"},
                {"name": "soy sauce", "quantity": 3, "unit": "tbsp", "category": "condiments", "is_staple": False},
                {"name": "rice", "quantity": 1, "unit": "cup", "category": "pantry", "is_staple": True},
                {"name": "garlic", "quantity": 3, "unit": "clove", "category": "produce", "is_staple": True, "preparation": "minced"},
                {"name": "ginger", "quantity": 1, "unit": "tbsp", "category": "produce", "is_staple": True, "preparation": "grated"},
                {"name": "vegetable oil", "quantity": 2, "unit": "tbsp", "category": "pantry", "is_staple": True},
                {"name": "rice vinegar", "quantity": 1, "unit": "tbsp", "category": "pantry", "is_staple": True},
                {"name": "sesame oil", "quantity": 1, "unit": "tsp", "category": "pantry", "is_staple": True},
                {"name": "salt", "quantity": 0.5, "unit": "tsp", "category": "spices", "is_staple": True},
                {"name": "pepper", "quantity": 0.25, "unit": "tsp", "category": "spices", "is_staple": True}
            ],
            "steps": [
                {"step_number": 1, "instruction": "Cook rice according to package directions", "duration_minutes": 15, "timer_enabled": True, "timer_label": "Cook rice", "technique": "boil", "equipment": ["rice cooker", "saucepan"], "visual_cue": "Rice tender, water absorbed"},
                {"step_number": 2, "instruction": "Slice chicken thin against grain; season with salt and pepper", "duration_minutes": 3, "technique": "slice", "visual_cue": "Chicken in thin strips"},
                {"step_number": 3, "instruction": "Heat oil in large skillet over high heat. Add chicken in single layer. Sear 2 min undisturbed.", "duration_minutes": 2, "timer_enabled": True, "timer_label": "Sear chicken", "temperature_c": 200, "technique": "sear", "equipment": ["large skillet", "wok"], "visual_cue": "Golden brown crust"},
                {"step_number": 4, "instruction": "Add garlic, ginger; stir-fry 30 seconds until fragrant", "duration_seconds": 30, "timer_enabled": True, "timer_label": "Bloom aromatics", "technique": "stir-fry", "visual_cue": "Fragrant, garlic golden"},
                {"step_number": 5, "instruction": "Add broccoli; stir-fry 3-4 minutes until bright green and crisp-tender", "duration_minutes": 4, "timer_enabled": True, "timer_label": "Cook broccoli", "technique": "stir-fry", "visual_cue": "Broccoli bright green, crisp-tender"},
                {"step_number": 6, "instruction": "Return chicken to pan. Add soy sauce, rice vinegar, sesame oil. Toss 1 minute to coat.", "duration_minutes": 1, "timer_enabled": True, "timer_label": "Finish sauce", "technique": "toss", "visual_cue": "Everything glazed in sauce"},
                {"step_number": 7, "instruction": "Serve over rice. Drizzle with pan juices.", "duration_minutes": 1, "technique": "plate", "visual_cue": "Steaming hot over rice"}
            ],
            "equipment": ["rice cooker or saucepan", "large skillet or wok", "cutting board", "chef's knife"],
            "food_safety": {
                "protein_type": "chicken",
                "min_internal_temp_c": 74.0,
                "min_internal_temp_f": 165.0,
                "rest_time_minutes": 3,
                "danger_zone_min_c": 4.4,
                "danger_zone_max_c": 60.0,
                "danger_zone_min_f": 40.0,
                "danger_zone_max_f": 140.0,
                "max_time_in_danger_zone_minutes": 120,
                "special_instructions": "Cook until juices run clear. No pink meat visible.",
                "warning_text": "⚠️ FOOD SAFETY: Cook chicken to 165°F (74°C). Use a food thermometer."
            },
            "substitutions": [
                {"original_ingredient": "chicken breast", "substitute": "firm tofu", "ratio": "1:1", "category": "protein", "confidence": 0.9},
                {"original_ingredient": "broccoli", "substitute": "cauliflower", "ratio": "1:1", "category": "vegetable", "confidence": 0.95},
                {"original_ingredient": "soy sauce", "substitute": "tamari", "ratio": "1:1", "category": "gluten", "confidence": 0.99},
                {"original_ingredient": "rice", "substitute": "quinoa", "ratio": "1:1 dry", "category": "grain", "confidence": 0.9}
            ]
        }
    }
]


# =============================================================================
# PROMPT BUILDER
# =============================================================================

def build_generation_prompt(
    ingredients: list[dict],
    pantry_staples: list[str],
    servings: int,
    dietary_restrictions: list[str],
    meal_type: str | None,
    difficulty: str | None,
    max_prep_time: int | None,
    max_cook_time: int | None,
    available_equipment: list[str],
    cuisine_preference: str | None,
    avoid_ingredients: list[str]
) -> str:
    """Build the user prompt for recipe generation"""
    
    # Format ingredients list
    ing_lines = []
    for ing in ingredients:
        qty = f"{ing.get('quantity', '')} {ing.get('unit', '')}".strip()
        prep = f" ({ing.get('preparation', '')})" if ing.get('preparation') else ""
        ing_lines.append(f"- {ing['name']}: {qty}{prep}")
    
    staples_str = ", ".join(pantry_staples) if pantry_staples else "None declared"
    
    constraints = []
    if dietary_restrictions:
        constraints.append(f"Dietary: {', '.join(dietary_restrictions)}")
    if meal_type:
        constraints.append(f"Meal type: {meal_type}")
    if difficulty:
        constraints.append(f"Difficulty: {difficulty}")
    if max_prep_time:
        constraints.append(f"Max prep: {max_prep_time} min")
    if max_cook_time:
        constraints.append(f"Max cook: {max_cook_time} min")
    if available_equipment:
        constraints.append(f"Equipment: {', '.join(available_equipment)}")
    if cuisine_preference:
        constraints.append(f"Cuisine: {cuisine_preference}")
    if avoid_ingredients:
        constraints.append(f"Avoid: {', '.join(avoid_ingredients)}")
    
    constraints_str = "\n".join(f"- {c}" for c in constraints) if constraints else "None"
    
    return f"""Create a recipe using ONLY these ingredients:

**AVAILABLE INGREDIENTS (must use all):**
{chr(10).join(ing_lines)}

**PANTRY STAPLES (free to use, assumed available):**
{staples_str}

**CONSTRAINTS:**
{constraints_str}

**SERVINGS:** {servings}

**CRITICAL RULES:**
1. Use EVERY available ingredient meaningfully
2. Use pantry staples freely — do NOT list them as "required"
3. NO ingredients outside the two lists above
4. If protein present: MUST include food_safety banner
5. Pass all Taste Filter rules (no chocolate+fish, no fresh pineapple+gelatin, etc.)
6. Steps = swipeable cards (one action per step, 5-12 steps)
7. Include smart substitutions for each non-staple ingredient

Return ONLY valid JSON matching RecipeGenerationResponse schema."""

# =============================================================================
# TASTE FILTER VALIDATION (Also in Python for double-check)
# =============================================================================

FORBIDDEN_COMBOS = [
    ({"chocolate", "cocoa", "cacao"}, {"fish", "salmon", "tuna", "cod", "shellfish", "shrimp", "crab", "lobster"}),
    ({"fresh pineapple"}, {"gelatin"}),
]

FORBIDDEN_SINGLES = {"bleach", "soap", "detergent", "gasoline", "motor oil", "paint", "glue", "nail polish remover"}

PROTEIN_TYPES_REQUIRING_SAFETY = {"chicken", "beef", "pork", "fish", "shellfish", "eggs"}


def check_taste_filter(ingredient_names: list[str], protein_type: str, has_safety_banner: bool) -> tuple[bool, list[dict]]:
    """Validate recipe against taste filter rules. Returns (passed, violations)"""
    violations = []
    ingredients_lower = [i.lower().strip() for i in ingredient_names]
    
    # Forbidden combos
    for group_a, group_b in FORBIDDEN_COMBOS:
        has_a = any(ing in ingredients_lower for ing in group_a)
        has_b = any(ing in ingredients_lower for ing in group_b)
        if has_a and has_b:
            violations.append({
                "type": "forbidden_combo",
                "message": f"Forbidden combination: {group_a} + {group_b}",
                "severity": "error",
                "offending": [i for i in ingredients_lower if i in group_a or i in group_b]
            })
    
    # Forbidden singles
    for ing in ingredients_lower:
        if ing in FORBIDDEN_SINGLES:
            violations.append({
                "type": "forbidden_single",
                "message": f"'{ing}' is not a food ingredient",
                "severity": "error",
                "offending": [ing]
            })
    
    # Max ingredient count
    if len(ingredients_lower) > 20:
        violations.append({
            "type": "max_ingredient_count",
            "message": f"Recipe has {len(ingredients_lower)} ingredients (max 20 recommended)",
            "severity": "warning",
            "offending": []
        })
    
    # Protein safety banner
    if protein_type.lower() in PROTEIN_TYPES_REQUIRING_SAFETY and not has_safety_banner:
        violations.append({
            "type": "required_section",
            "message": f"Protein '{protein_type}' requires food safety temperature banner",
            "severity": "error",
            "offending": []
        })
    
    has_errors = any(v["severity"] == "error" for v in violations)
    return (not has_errors, violations)