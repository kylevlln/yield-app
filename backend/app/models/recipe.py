"""Pydantic Models for Recipe Data Structures"""

from __future__ import annotations
from enum import Enum
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from pydantic.types import UUID4
from datetime import datetime
from decimal import Decimal


# =============================================================================
# ENUMS
# =============================================================================

class IngredientCategory(str, Enum):
    PRODUCE = "produce"
    MEAT = "meat"
    SEAFOOD = "seafood"
    DAIRY = "dairy"
    PANTRY = "pantry"
    SPICES = "spices"
    BAKING = "baking"
    CONDIMENTS = "condiments"
    BEVERAGES = "beverages"
    FROZEN = "frozen"
    OTHER = "other"


class MeasurementUnit(str, Enum):
    GRAM = "g"
    KILOGRAM = "kg"
    MILLILITER = "ml"
    LITER = "l"
    CUP = "cup"
    TABLESPOON = "tbsp"
    TEASPOON = "tsp"
    OUNCE = "oz"
    POUND = "lb"
    PIECES = "pcs"
    PINCH = "pinch"
    DASH = "dash"
    CLOVE = "clove"
    SLICE = "slice"
    BUNCH = "bunch"
    CAN = "can"
    JAR = "jar"
    PACKAGE = "package"


class RecipeDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class RecipeMealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    DESSERT = "dessert"
    APPETIZER = "appetizer"
    DRINK = "drink"


class DietaryTag(str, Enum):
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten-free"
    DAIRY_FREE = "dairy-free"
    KETO = "keto"
    PALEO = "paleo"
    LOW_CARB = "low-carb"
    HIGH_PROTEIN = "high-protein"
    LOW_FAT = "low-fat"
    NUT_FREE = "nut-free"
    SHELLFISH_FREE = "shellfish-free"


class ProteinType(str, Enum):
    CHICKEN = "chicken"
    BEEF = "beef"
    PORK = "pork"
    FISH = "fish"
    SHELLFISH = "shellfish"
    EGGS = "eggs"
    TOFU = "tofu"
    TEMPEH = "tempeh"
    NONE = "none"


class CookingMethod(str, Enum):
    BAKE = "bake"
    BOIL = "boil"
    FRY = "fry"
    GRILL = "grill"
    ROAST = "roast"
    STEAM = "steam"
    SAUTE = "sauté"
    SLOW_COOK = "slow-cook"
    PRESSURE_COOK = "pressure-cook"
    RAW = "raw"
    MICROWAVE = "microwave"


class RecipeStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    SAVED = "saved"
    COOKED = "cooked"
    ARCHIVED = "archived"


class TasteFilterSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


# =============================================================================
# INPUT MODELS
# =============================================================================

class RecipeIngredientInput(BaseModel):
    """Simplified ingredient input from user"""
    name: str = Field(..., min_length=1, max_length=100)
    quantity: Optional[Decimal] = None
    unit: Optional[MeasurementUnit] = None
    category: Optional[IngredientCategory] = None

    @field_validator('name')
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().lower()


class RecipeGenerationRequest(BaseModel):
    """Input for recipe generation endpoint"""
    ingredients: list[RecipeIngredientInput] = Field(..., min_length=1, max_length=20)
    servings: int = Field(default=2, ge=1, le=12)
    dietary_restrictions: list[DietaryTag] = Field(default_factory=list)
    meal_type: Optional[RecipeMealType] = None
    difficulty: Optional[RecipeDifficulty] = None
    max_prep_time: Optional[int] = Field(default=None, ge=0, le=180)
    max_cook_time: Optional[int] = Field(default=None, ge=0, le=480)
    available_equipment: list[str] = Field(default_factory=list)
    cuisine_preference: Optional[str] = None
    avoid_ingredients: list[str] = Field(default_factory=list)
    use_pantry_staples: bool = Field(default=True)
    pantry_staples: list[str] = Field(default_factory=list)


# =============================================================================
# OUTPUT MODELS (Structured for Swipeable Viewer)
# =============================================================================

class RecipeIngredient(BaseModel):
    """Structured ingredient for generated recipe"""
    name: str = Field(..., min_length=1, max_length=100)
    quantity: Decimal = Field(..., ge=0)
    unit: MeasurementUnit
    category: Optional[IngredientCategory] = None
    is_staple: bool = Field(default=False, description="From user's pantry staples")
    is_optional: bool = Field(default=False)
    preparation: Optional[str] = Field(default=None, max_length=50)
    substitution_group: Optional[str] = Field(default=None)

    @field_validator('name')
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().lower()


class RecipeStep(BaseModel):
    """Individual step for swipeable step-by-step viewer"""
    step_number: int = Field(..., ge=1)
    instruction: str = Field(..., min_length=1, max_length=500)
    duration_minutes: int = Field(default=0, ge=0)
    duration_seconds: int = Field(default=0, ge=0, le=59)
    timer_enabled: bool = Field(default=False)
    timer_label: Optional[str] = Field(default=None, max_length=50)
    temperature_c: Optional[Decimal] = Field(default=None, ge=-50, le=300)
    temperature_f: Optional[Decimal] = Field(default=None, ge=-58, le=572)
    technique: Optional[str] = Field(default=None, max_length=30)
    equipment: list[str] = Field(default_factory=list)
    tips: list[str] = Field(default_factory=list)
    visual_cue: Optional[str] = Field(default=None, max_length=200)
    media_url: Optional[str] = None
    media_type: Optional[Literal["image", "video"]] = None

    @property
    def total_seconds(self) -> int:
        return self.duration_minutes * 60 + self.duration_seconds

    @property
    def has_timer(self) -> bool:
        return self.timer_enabled and self.total_seconds > 0

    @property
    def formatted_duration(self) -> str:
        if self.duration_minutes == 0:
            return f"{self.duration_seconds}s"
        if self.duration_seconds == 0:
            return f"{self.duration_minutes}m"
        return f"{self.duration_minutes}m {self.duration_seconds}s"


class FoodSafetyBanner(BaseModel):
    """MANDATORY food safety banner for protein recipes - NON-REMOVABLE"""
    protein_type: ProteinType
    min_internal_temp_c: Decimal = Field(..., ge=0, le=100)
    min_internal_temp_f: Decimal = Field(..., ge=0, le=212)
    rest_time_minutes: int = Field(default=3, ge=0)
    danger_zone_min_c: Decimal = Field(default=4.4)
    danger_zone_max_c: Decimal = Field(default=60.0)
    danger_zone_min_f: Decimal = Field(default=40.0)
    danger_zone_max_f: Decimal = Field(default=140.0)
    max_time_in_danger_zone_minutes: int = Field(default=120)
    special_instructions: str
    warning_text: str = Field(
        default="⚠️ FOOD SAFETY: Cook to safe internal temperature. Use a food thermometer.",
        description="Non-removable safety banner text"
    )
    is_mandatory: bool = Field(default=True, description="Cannot be dismissed by user")

    @classmethod
    def from_protein_type(cls, protein_type: ProteinType) -> FoodSafetyBanner:
        safety_data = {
            ProteinType.CHICKEN: (74.0, 165.0, 3, "Cook until juices run clear. No pink meat visible."),
            ProteinType.BEEF: (63.0, 145.0, 3, "Steaks/roasts: 57°C/135°F for medium-rare. Ground: 71°C/160°F."),
            ProteinType.PORK: (63.0, 145.0, 3, "Ground pork: 71°C/160°F."),
            ProteinType.FISH: (63.0, 145.0, 0, "Flesh should be opaque and flake easily."),
            ProteinType.SHELLFISH: (74.0, 165.0, 0, "Shells should open during cooking. Discard unopened."),
            ProteinType.EGGS: (71.0, 160.0, 0, "Yolks and whites should be firm."),
            ProteinType.TOFU: (0.0, 0.0, 0, "No minimum temperature. Press and cook until golden."),
            ProteinType.TEMPEH: (74.0, 165.0, 0, "Steam 10 min before cooking to remove bitterness."),
            ProteinType.NONE: (0.0, 0.0, 0, "No protein-specific temperature requirements."),
        }
        c, f, rest, instr = safety_data[protein_type]
        return cls(
            protein_type=protein_type,
            min_internal_temp_c=Decimal(str(c)),
            min_internal_temp_f=Decimal(str(f)),
            rest_time_minutes=rest,
            special_instructions=instr
        )


class SubstitutionSuggestion(BaseModel):
    """Smart substitution for missing ingredient"""
    original_ingredient: str
    substitute: str
    ratio: str = Field(..., description="e.g., '1:1', '3 tbsp : 1 tbsp'")
    category: Optional[str] = Field(default=None, description="dairy, gluten, egg, allergen, preference")
    notes: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0, le=1)
    works_in: list[str] = Field(default_factory=lambda: ["all"])


class GenerationMetadata(BaseModel):
    """Metadata about recipe generation"""
    generation_id: str
    model_used: str
    generation_time_ms: int
    taste_filter_passed: bool
    taste_filter_warnings: list[dict] = Field(default_factory=list)
    prompt_tokens: int = 0
    completion_tokens: int = 0


class RecipeGenerationResponse(BaseModel):
    """Complete generated recipe response"""
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=300)
    servings: int = Field(..., ge=1, le=12)
    prep_time_minutes: int = Field(..., ge=0, le=180)
    cook_time_minutes: int = Field(..., ge=0, le=480)
    difficulty: RecipeDifficulty
    meal_type: list[RecipeMealType]
    dietary_tags: list[DietaryTag] = Field(default_factory=list)
    cuisine: Optional[str] = None
    ingredients: list[RecipeIngredient] = Field(..., min_length=1)
    steps: list[RecipeStep] = Field(..., min_length=1)
    equipment: list[str] = Field(default_factory=list)
    protein_type: ProteinType = ProteinType.NONE
    food_safety: Optional[FoodSafetyBanner] = None
    substitutions: list[SubstitutionSuggestion] = Field(default_factory=list)
    generation_metadata: Optional[GenerationMetadata] = None
    taste_filter_violations: list[dict] = Field(default_factory=list, exclude=True)

    @property
    def total_time_minutes(self) -> int:
        return self.prep_time_minutes + self.cook_time_minutes

    @model_validator(mode='after')
    def validate_food_safety(self) -> 'RecipeGenerationResponse':
        if self.protein_type != ProteinType.NONE and self.food_safety is None:
            self.food_safety = FoodSafetyBanner.from_protein_type(self.protein_type)
        elif self.protein_type != ProteinType.NONE and self.food_safety:
            if self.food_safety.protein_type != self.protein_type:
                self.food_safety = FoodSafetyBanner.from_protein_type(self.protein_type)
        return self

    @model_validator(mode='after')
    def validate_step_numbering(self) -> 'RecipeGenerationResponse':
        for i, step in enumerate(self.steps, 1):
            if step.step_number != i:
                step.step_number = i
        return self


# =============================================================================
# ASYNC JOB TRACKING
# =============================================================================

class GenerationStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    VALIDATING = "validating"
    COMPLETE = "complete"
    FAILED = "failed"
    FILTERED = "filtered"


class RecipeGenerationJob(BaseModel):
    """Async job tracking for recipe generation"""
    job_id: UUID4
    status: GenerationStatus
    progress: int = Field(default=0, ge=0, le=100)
    status_message: str = "Initializing..."
    recipe: Optional[RecipeGenerationResponse] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


# =============================================================================
# DISTRACTION UX (Loading State)
# =============================================================================

class DistractionMessage(BaseModel):
    """Cycling messages during LLM generation"""
    messages: list[str] = Field(default_factory=lambda: [
        "Consulting the flavor spirits...",
        "Balancing sweet, salty, sour, bitter, umami...",
        "Checking your pantry's secret stash...",
        "Negotiating with the garlic gods...",
        "Calculating optimal onion-to-garlic ratio...",
        "Preheating the imagination oven...",
        "Summoning the spirit of Julia Child...",
        "Measuring with grandmother's precision...",
        "Whisking creativity into the batter...",
        "Simmering ideas to perfection...",
    ])
    interval_ms: int = 3000


# =============================================================================
# TASTE FILTER (Hard-coded constraints)
# =============================================================================

class TasteFilterViolation(BaseModel):
    """A single taste filter violation"""
    violation_type: Literal["forbidden_combo", "forbidden_single", "max_ingredient_count", "required_section"]
    message: str
    severity: TasteFilterSeverity
    offending_ingredients: list[str] = Field(default_factory=list)


class TasteFilterResult(BaseModel):
    """Result of taste filter validation"""
    passed: bool
    violations: list[TasteFilterViolation] = Field(default_factory=list)

    @property
    def has_errors(self) -> bool:
        return any(v.severity == TasteFilterSeverity.ERROR for v in self.violations)

    @property
    def has_warnings(self) -> bool:
        return any(v.severity == TasteFilterSeverity.WARNING for v in self.violations)


# Hard-coded taste filter rules (also in DB for reference)
TASTE_FILTER_RULES = [
    {
        "type": "forbidden_combo",
        "name": "chocolate_fish",
        "ingredients": ["chocolate", "cocoa", "cacao"],
        "conflicts_with": ["fish", "salmon", "tuna", "cod", "shellfish", "shrimp", "crab", "lobster"],
        "severity": TasteFilterSeverity.ERROR,
        "message": "Chocolate and fish/seafood create an inedible combination"
    },
    {
        "type": "forbidden_combo",
        "name": "citrus_milk_heat",
        "ingredients": ["lemon juice", "lime juice", "orange juice", "vinegar"],
        "conflicts_with": ["milk", "cream", "yogurt", "buttermilk"],
        "condition": "heat_applied",
        "severity": TasteFilterSeverity.WARNING,
        "message": "Acid curdles dairy when heated. Add acid at the end or use non-dairy alternative."
    },
    {
        "type": "forbidden_combo",
        "name": "pineapple_gelatin",
        "ingredients": ["fresh pineapple"],
        "conflicts_with": ["gelatin"],
        "severity": TasteFilterSeverity.ERROR,
        "message": "Fresh pineapple contains bromelain which prevents gelatin from setting. Use canned pineapple."
    },
    {
        "type": "forbidden_single",
        "name": "inedible_items",
        "ingredients": ["bleach", "soap", "detergent", "gasoline", "motor oil", "paint", "glue", "nail polish remover"],
        "severity": TasteFilterSeverity.ERROR,
        "message": "This is not a food ingredient and cannot be used in cooking"
    },
    {
        "type": "max_ingredient_count",
        "max_count": 20,
        "severity": TasteFilterSeverity.WARNING,
        "message": "Recipe has {count} ingredients. Consider simplifying for home cooking."
    },
    {
        "type": "required_section",
        "name": "food_safety_banner",
        "required_for_protein_types": ["chicken", "beef", "pork", "fish", "shellfish", "eggs"],
        "severity": TasteFilterSeverity.ERROR,
        "message": "Protein-based recipes must include a food safety temperature banner"
    }
]

# =============================================================================
# TASTE FILTER VALIDATION (Also in Python for double-check)
# =============================================================================

FORBIDDEN_COMBOS = [
    ({"chocolate", "cocoa", "cacao"}, {"fish", "salmon", "tuna", "cod", "shellfish", "shrimp", "crab", "lobster"}),
    ({"fresh pineapple"}, {"gelatin"}),
]

FORBIDDEN_SINGLES = {"bleach", "soap", "detergent", "gasoline", "motor oil", "paint", "glue", "nail polish remover"}

PROTEIN_TYPES_REQUIRING_SAFETY = {"chicken", "beef", "pork", "fish", "shellfish", "eggs"}


def validate_taste_filter(ingredient_names: list[str], protein_type: ProteinType, has_food_safety_banner: bool) -> TasteFilterResult:
    """Validate recipe against hard-coded taste filter rules"""
    violations = []
    ingredients_lower = [i.lower().strip() for i in ingredient_names]
    
    # Forbidden combos
    for group_a, group_b in FORBIDDEN_COMBOS:
        has_a = any(ing in ingredients_lower for ing in group_a)
        has_b = any(ing in ingredients_lower for ing in group_b)
        if has_a and has_b:
            violations.append(TasteFilterViolation(
                violation_type="forbidden_combo",
                message=f"Forbidden combination: {group_a} + {group_b}",
                severity=TasteFilterSeverity.ERROR,
                offending_ingredients=[i for i in ingredients_lower if i in group_a or i in group_b]
            ))
    
    # Forbidden singles
    for ing in ingredients_lower:
        if ing in FORBIDDEN_SINGLES:
            violations.append(TasteFilterViolation(
                violation_type="forbidden_single",
                message=f"'{ing}' is not a food ingredient",
                severity=TasteFilterSeverity.ERROR,
                offending_ingredients=[ing]
            ))
    
    # Max ingredient count
    if len(ingredients_lower) > 20:
        violations.append(TasteFilterViolation(
            violation_type="max_ingredient_count",
            message=f"Recipe has {len(ingredients_lower)} ingredients (max 20 recommended)",
            severity=TasteFilterSeverity.WARNING,
            offending_ingredients=[]
        ))
    
    # Protein safety banner
    if protein_type.value in PROTEIN_TYPES_REQUIRING_SAFETY and not has_food_safety_banner:
        violations.append(TasteFilterViolation(
            violation_type="required_section",
            message=f"Protein '{protein_type.value}' requires food safety temperature banner",
            severity=TasteFilterSeverity.ERROR,
            offending_ingredients=[]
        ))
    
    has_errors = any(v.severity == TasteFilterSeverity.ERROR for v in violations)
    return TasteFilterResult(passed=not has_errors, violations=violations)


# =============================================================================
# PANTRY MODELS (for API)
# =============================================================================

class PantryStaple(BaseModel):
    """User's always-on-hand ingredient"""
    id: Optional[UUID4] = None
    name: str = Field(..., min_length=1, max_length=100)
    category: IngredientCategory = IngredientCategory.PANTRY
    default_unit: MeasurementUnit = MeasurementUnit.GRAM
    default_quantity: Decimal = Decimal('0')
    min_threshold: Decimal = Decimal('0')
    is_staple: bool = True
    notes: Optional[str] = None


class PantryInventoryItem(BaseModel):
    """Current inventory item (what user actually has now)"""
    id: Optional[UUID4] = None
    staple_id: Optional[UUID4] = None
    name: str = Field(..., min_length=1, max_length=100)
    category: IngredientCategory
    quantity: Decimal = Decimal('0')
    unit: MeasurementUnit
    expires_at: Optional[datetime] = None
    location: Optional[Literal["fridge", "pantry", "freezer", "counter"]] = None


# =============================================================================
# DATABASE MODELS (for Supabase sync)
# =============================================================================

class RecipeDB(BaseModel):
    carbs_g: Optional[Decimal] = None
    fat_g: Optional[Decimal] = None
    fiber_g: Optional[Decimal] = None
    sugar_g: Optional[Decimal] = None
    sodium_mg: Optional[int] = None
    source: str = "ai-generated"
    generation_prompt: Optional[str] = None
    generation_model: Optional[str] = None
    taste_filter_passed: bool = True
    taste_filter_notes: Optional[str] = None
    food_safety_banner: Optional[dict] = None
    source_image_url: Optional[str] = None
    notes: Optional[str] = None
    cooked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PantryStapleDB(BaseModel):
    id: UUID4
    user_id: UUID4
    name: str
    category: IngredientCategory = IngredientCategory.PANTRY
    default_unit: MeasurementUnit = MeasurementUnit.GRAM
    default_quantity: Decimal = Decimal('0')
    min_threshold: Decimal = Decimal('0')
    is_staple: bool = True
    notes: Optional[str] = None
    last_restocked: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PantryInventoryDB(BaseModel):
    id: UUID4
    user_id: UUID4
    staple_id: Optional[UUID4] = None
    name: str
    category: IngredientCategory = IngredientCategory.PANTRY
    quantity: Decimal = Decimal('0')
    unit: MeasurementUnit = MeasurementUnit.GRAM
    expires_at: Optional[datetime] = None
    location: Optional[str] = None
    is_open: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# HEALTH CHECK
# =============================================================================

class HealthCheck(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: dict[str, str] = Field(default_factory=dict)