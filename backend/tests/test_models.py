"""Tests for Pydantic models"""

import pytest
from decimal import Decimal
from app.models.recipe import (
    RecipeIngredient,
    RecipeIngredientInput,
    RecipeStep,
    RecipeGenerationRequest,
    FoodSafetyBanner,
    ProteinType,
    IngredientCategory,
    MeasurementUnit,
    RecipeDifficulty,
    RecipeMealType,
    DietaryTag,
    PantryStaple,
    PantryInventoryItem,
    HealthCheck,
)


class TestRecipeIngredientInput:
    def test_create_input(self):
        ing = RecipeIngredientInput(name="chicken breast", quantity=Decimal("300"), unit=MeasurementUnit.GRAM)
        assert ing.name == "chicken breast"
        assert ing.quantity == Decimal("300")

    def test_input_minimal(self):
        ing = RecipeIngredientInput(name="salt")
        assert ing.name == "salt"
        assert ing.quantity is None
        assert ing.unit is None

    def test_name_normalized(self):
        ing = RecipeIngredientInput(name="  Garlic  ")
        assert ing.name == "garlic"


class TestRecipeIngredient:
    def test_create_ingredient(self):
        ing = RecipeIngredient(
            name="chicken breast",
            quantity=Decimal("300"),
            unit=MeasurementUnit.GRAM,
            category=IngredientCategory.MEAT,
            is_staple=False,
        )
        assert ing.name == "chicken breast"


class TestRecipeStep:
    def test_create_step(self):
        step = RecipeStep(
            step_number=1,
            instruction="Chop the garlic",
            duration_minutes=2,
            duration_seconds=0,
            timer_enabled=False,
            equipment=["knife", "cutting board"],
            tips=["Keep fingers curled"],
        )
        assert step.step_number == 1
        assert len(step.equipment) == 2


class TestFoodSafetyBanner:
    def test_chicken_banner(self):
        banner = FoodSafetyBanner.from_protein_type(ProteinType.CHICKEN)
        assert banner.min_internal_temp_f == Decimal("165.0")
        assert banner.protein_type == ProteinType.CHICKEN
        assert banner.rest_time_minutes == 3

    def test_beef_banner(self):
        banner = FoodSafetyBanner.from_protein_type(ProteinType.BEEF)
        assert banner.min_internal_temp_f == Decimal("145.0")

    def test_fish_banner(self):
        banner = FoodSafetyBanner.from_protein_type(ProteinType.FISH)
        assert banner.min_internal_temp_f == Decimal("145.0")
        assert banner.rest_time_minutes == 0

    def test_tempeh_banner(self):
        banner = FoodSafetyBanner.from_protein_type(ProteinType.TEMPEH)
        assert banner.min_internal_temp_f == Decimal("165.0")

    def test_tofu_banner(self):
        banner = FoodSafetyBanner.from_protein_type(ProteinType.TOFU)
        assert banner.min_internal_temp_f == Decimal("0.0")


class TestRecipeGenerationRequest:
    def test_create_request(self):
        req = RecipeGenerationRequest(
            ingredients=[
                RecipeIngredientInput(name="chicken breast", quantity=Decimal("300"), unit=MeasurementUnit.GRAM),
                RecipeIngredientInput(name="broccoli"),
            ],
            servings=2,
            dietary_restrictions=[DietaryTag.GLUTEN_FREE],
            meal_type=RecipeMealType.DINNER,
            difficulty=RecipeDifficulty.EASY,
            use_pantry_staples=True,
            pantry_staples=["salt", "pepper"],
        )
        assert req.servings == 2
        assert len(req.ingredients) == 2
        assert DietaryTag.GLUTEN_FREE in req.dietary_restrictions

    def test_request_minimal(self):
        req = RecipeGenerationRequest(
            ingredients=[RecipeIngredientInput(name="rice")],
            servings=1,
            dietary_restrictions=[],
            use_pantry_staples=False,
            pantry_staples=[],
        )
        assert req.servings == 1

    def test_request_empty_ingredients_fails(self):
        with pytest.raises(Exception):
            RecipeGenerationRequest(
                ingredients=[],
                servings=2,
                dietary_restrictions=[],
                use_pantry_staples=False,
                pantry_staples=[],
            )


class TestPantryStaple:
    def test_create_staple(self):
        staple = PantryStaple(
            name="garlic",
            category=IngredientCategory.PRODUCE,
            default_unit=MeasurementUnit.CLOVE,
            default_quantity=Decimal("1"),
            is_staple=True,
        )
        assert staple.name == "garlic"
        assert staple.is_staple is True

    def test_staple_name_required(self):
        with pytest.raises(Exception):
            PantryStaple(name="")


class TestPantryInventoryItem:
    def test_create_inventory_item(self):
        item = PantryInventoryItem(
            name="milk",
            category=IngredientCategory.DAIRY,
            quantity=Decimal("1"),
            unit=MeasurementUnit.LITER,
            location="fridge",
        )
        assert item.name == "milk"
        assert item.location == "fridge"


class TestHealthCheck:
    def test_create_health_check(self):
        hc = HealthCheck(
            status="healthy",
            version="0.1.0",
            services={"supabase": "up", "openai": "configured"},
        )
        assert hc.status == "healthy"
        assert hc.services["supabase"] == "up"
