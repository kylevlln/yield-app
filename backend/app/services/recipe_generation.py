"""Recipe Generation Service - Core LLM Integration"""

from __future__ import annotations
import json
import time
import uuid
from typing import Optional
from datetime import datetime
import structlog

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.models.recipe import (
    RecipeGenerationRequest,
    RecipeGenerationResponse,
    RecipeIngredientInput,
    RecipeIngredient,
    RecipeStep,
    FoodSafetyBanner,
    SubstitutionSuggestion,
    GenerationMetadata,
    GenerationStatus,
    RecipeGenerationJob,
    ProteinType,
    RecipeDifficulty,
    RecipeMealType,
    DietaryTag,
    MeasurementUnit,
    IngredientCategory,
    TasteFilterViolation,
    TasteFilterSeverity,
)
from app.services.prompts import (
    SYSTEM_PROMPT,
    FEW_SHOT_EXAMPLES,
    check_taste_filter,
    TASTE_FILTER_RULES,
    FORBIDDEN_COMBOS,
    FORBIDDEN_SINGLES,
    PROTEIN_TYPES_REQUIRING_SAFETY,
)
from app.models.recipe import validate_taste_filter

logger = structlog.get_logger()


class RecipeGenerationService:
    """Service for generating recipes using LLMs with strict validation"""
    
    def __init__(self):
        self.openai_client: Optional[AsyncOpenAI] = None
        self.anthropic_client: Optional[AsyncAnthropic] = None
        self._init_clients()
    
    def _init_clients(self):
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def generate_recipe(
        self,
        request: RecipeGenerationRequest,
        user_id: str
    ) -> RecipeGenerationResponse:
        """Main entry point for recipe generation"""
        generation_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.info(
            "recipe_generation_started",
            generation_id=generation_id,
            user_id=user_id,
            ingredient_count=len(request.ingredients)
        )
        
        # Build prompt
        prompt = self._build_prompt(request)
        
        # Generate with LLM (with retry logic for taste filter)
        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            try:
                if settings.DEFAULT_LLM_MODEL.startswith("gpt"):
                    response_text, usage = await self._generate_openai(prompt)
                else:
                    response_text, usage = await self._generate_anthropic(prompt)
                
                # Parse and validate
                recipe = self._parse_response(response_text, request)
                
                # Grounding validation — ensure no hallucinated ingredients
                self._validate_grounding(recipe, request)
                
                # Run taste filter
                taste_result = validate_taste_filter(
                    ingredients=[ing.name for ing in recipe.ingredients],
                    protein_type=recipe.protein_type,
                    has_food_safety_banner=recipe.food_safety is not None
                )
                
                if not taste_result.passed:
                    error_violations = [v for v in taste_result.violations if v.severity == TasteFilterSeverity.ERROR]
                    if error_violations and attempt < max_retries - 1:
                        # Retry with feedback
                        logger.warning(
                            "taste_filter_failed_retrying",
                            generation_id=generation_id,
                            attempt=attempt + 1,
                            violations=[v.message for v in error_violations]
                        )
                        prompt = self._add_taste_filter_feedback(prompt, error_violations)
                        continue
                    else:
                        recipe.taste_filter_violations = [
                            {"type": v.violation_type, "message": v.message, "severity": v.severity.value}
                            for v in taste_result.violations
                        ]
                
                # Success
                generation_time = int((time.time() - start_time) * 1000)
                recipe.generation_metadata = GenerationMetadata(
                    generation_id=generation_id,
                    model_used=settings.DEFAULT_LLM_MODEL,
                    generation_time_ms=generation_time,
                    taste_filter_passed=taste_result.passed,
                    prompt_tokens=usage.get("prompt_tokens"),
                    completion_tokens=usage.get("completion_tokens"),
                    taste_filter_warnings=[
                        {"type": v.violation_type, "message": v.message}
                        for v in taste_result.violations if v.severity == TasteFilterSeverity.WARNING
                    ]
                )
                
                logger.info(
                    "recipe_generation_completed",
                    generation_id=generation_id,
                    generation_time_ms=generation_time,
                    taste_filter_passed=taste_result.passed
                )
                return recipe
                
            except Exception as e:
                last_error = e
                logger.error(
                    "recipe_generation_attempt_failed",
                    generation_id=generation_id,
                    attempt=attempt + 1,
                    error=str(e)
                )
                if attempt == max_retries - 1:
                    break
                # Add error feedback to prompt for retry
                prompt = self._add_error_feedback(prompt, str(e))
        
        # All retries failed
        raise RecipeGenerationError(f"Failed after {max_retries} attempts: {last_error}")
    
    def _build_prompt(self, request: RecipeGenerationRequest) -> str:
        """Build the user message prompt for the LLM"""
        # Format ingredients
        ingredients_text = "\n".join([
            f"- {ing.name}: {ing.quantity or '?'} {ing.unit.value if ing.unit else ''}".strip()
            for ing in request.ingredients
        ])
        
        # Format pantry staples
        staples_text = ", ".join(request.pantry_staples) if request.pantry_staples else "None provided"
        
        # Format constraints
        constraints = []
        if request.dietary_restrictions:
            constraints.append(f"Dietary: {', '.join([d.value for d in request.dietary_restrictions])}")
        if request.meal_type:
            constraints.append(f"Meal type: {request.meal_type.value}")
        if request.difficulty:
            constraints.append(f"Difficulty: {request.difficulty.value}")
        if request.max_prep_time:
            constraints.append(f"Max prep time: {request.max_prep_time} minutes")
        if request.max_cook_time:
            constraints.append(f"Max cook time: {request.max_cook_time} minutes")
        if request.cuisine_preference:
            constraints.append(f"Cuisine: {request.cuisine_preference}")
        if request.avoid_ingredients:
            constraints.append(f"Avoid: {', '.join(request.avoid_ingredients)}")
        if request.available_equipment:
            constraints.append(f"Equipment: {', '.join(request.available_equipment)}")
        
        constraints_text = "\n".join(f"- {c}" for c in constraints) if constraints else "None"
        
        # Few-shot example
        example = FEW_SHOT_EXAMPLES[0]
        example_input = json.dumps(example["user_input"], indent=2)
        example_output = json.dumps(example["expected_output"], indent=2)
        
        prompt = f"""## USER REQUEST
**Ingredients on Hand:**
{ingredients_text}

**Pantry Staples (Always Available):**
{staples_text}

**Constraints:**
{constraints_text}

**Servings:** {request.servings}

## EXAMPLE
**Input:**
{example_input}

**Output:**
{example_output}

## YOUR TASK
Generate a recipe using ONLY the ingredients listed above plus pantry staples.
Return ONLY valid JSON matching the RecipeGenerationResponse schema.
No markdown, no commentary, no extra text."""
        
        return prompt
    
    def _add_taste_filter_feedback(self, prompt: str, violations: list[TasteFilterViolation]) -> str:
        """Add taste filter violation feedback to prompt for retry"""
        feedback = "\n\n## TASTE FILTER VIOLATIONS (MUST FIX):\n"
        for v in violations:
            feedback += f"- ERROR: {v.message}\n"
            feedback += f"  Offending ingredients: {', '.join(v.offending_ingredients)}\n"
        feedback += "\nRegenerate recipe WITHOUT these violations."
        return prompt + feedback
    
    def _add_error_feedback(self, prompt: str, error: str) -> str:
        """Add error feedback to prompt for retry"""
        return prompt + f"\n\n## PREVIOUS ERROR:\n{error}\n\nFix the issue and regenerate."
    
    def _validate_grounding(self, recipe: RecipeGenerationResponse, request: RecipeGenerationRequest):
        """Ensure LLM didn't hallucinate ingredients outside user's input + staples"""
        allowed = {ing.name.lower().strip() for ing in request.ingredients}
        allowed.update(s.lower().strip() for s in (request.pantry_staples or []))
        
        # Also allow common pantry defaults
        defaults = {"salt", "pepper", "oil", "water", "sugar", "butter", "garlic", "onion"}
        allowed.update(defaults)
        
        for ing in recipe.ingredients:
            name = ing.name.lower().strip()
            if name not in allowed and not ing.is_staple:
                # Mark as hallucinated — add to violations but don't reject
                if not hasattr(recipe, 'taste_filter_violations') or recipe.taste_filter_violations is None:
                    recipe.taste_filter_violations = []
                recipe.taste_filter_violations.append({
                    "type": "grounding_warning",
                    "message": f"'{ing.name}' was not in your ingredient list — treating as pantry staple",
                    "severity": "warning"
                })
                ing.is_staple = True
    
    async def _generate_openai(self, prompt: str) -> tuple[str, dict]:
        """Generate using OpenAI. Returns (content, usage_data)."""
        if not self.openai_client:
            raise RecipeGenerationError("OpenAI client not configured")
        
        response = await self.openai_client.chat.completions.create(
            model=settings.DEFAULT_LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        usage = {}
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            }
        return response.choices[0].message.content, usage
    
    async def _generate_anthropic(self, prompt: str) -> tuple[str, dict]:
        """Generate using Anthropic Claude. Returns (content, usage_data)."""
        if not self.anthropic_client:
            raise RecipeGenerationError("Anthropic client not configured")
        
        response = await self.anthropic_client.messages.create(
            model=settings.DEFAULT_LLM_MODEL,
            max_tokens=settings.LLM_MAX_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )
        usage = {}
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.input_tokens,
                "completion_tokens": response.usage.output_tokens,
            }
        return response.content[0].text, usage
    
    def _parse_response(self, response: str, request: RecipeGenerationRequest) -> RecipeGenerationResponse:
        """Parse and validate LLM response"""
        try:
            data = json.loads(response)
        except json.JSONDecodeError as e:
            raise RecipeGenerationError(f"Invalid JSON from LLM: {e}")
        
        # Ensure required fields
        required_fields = ["title", "servings", "prep_time_minutes", "cook_time_minutes", 
                          "difficulty", "meal_type", "ingredients", "steps"]
        for field in required_fields:
            if field not in data:
                raise RecipeGenerationError(f"Missing required field: {field}")
        
        # Convert ingredients
        ingredients = []
        for ing_data in data["ingredients"]:
            if isinstance(ing_data.get("unit"), str):
                ing_data["unit"] = MeasurementUnit(ing_data["unit"])
            if ing_data.get("category"):
                ing_data["category"] = IngredientCategory(ing_data["category"])
            ingredients.append(RecipeIngredient(**ing_data))
        
        # Convert steps
        steps = []
        for step_data in data["steps"]:
            if step_data.get("media_type"):
                step_data["media_type"] = step_data["media_type"]
            steps.append(RecipeStep(**step_data))
        
        # Protein type
        protein_type = ProteinType.NONE
        if data.get("protein_type"):
            protein_type = ProteinType(data["protein_type"])
        
        # Food safety
        food_safety = None
        if data.get("food_safety"):
            food_safety = FoodSafetyBanner(**data["food_safety"])
        elif protein_type != ProteinType.NONE:
            food_safety = FoodSafetyBanner.from_protein_type(protein_type)
        
        # Substitutions
        substitutions = []
        for sub_data in data.get("substitutions", []):
            substitutions.append(SubstitutionSuggestion(**sub_data))
        
        return RecipeGenerationResponse(
            title=data["title"],
            description=data.get("description"),
            servings=data["servings"],
            prep_time_minutes=data["prep_time_minutes"],
            cook_time_minutes=data["cook_time_minutes"],
            difficulty=RecipeDifficulty(data["difficulty"]),
            meal_type=[RecipeMealType(m) for m in data["meal_type"]],
            dietary_tags=[DietaryTag(d) for d in data.get("dietary_tags", [])],
            cuisine=data.get("cuisine"),
            ingredients=ingredients,
            steps=steps,
            equipment=data.get("equipment", []),
            protein_type=protein_type,
            food_safety=food_safety,
            substitutions=substitutions
        )


class RecipeGenerationError(Exception):
    """Custom exception for recipe generation failures"""
    pass


# Singleton instance
_recipe_service: Optional[RecipeGenerationService] = None


def get_recipe_service() -> RecipeGenerationService:
    global _recipe_service
    if _recipe_service is None:
        _recipe_service = RecipeGenerationService()
    return _recipe_service