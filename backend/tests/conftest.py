"""Shared test fixtures"""

import pytest
from decimal import Decimal
from app.models.recipe import (
    ProteinType,
    RecipeIngredient,
    RecipeIngredientInput,
    RecipeStep,
    IngredientCategory,
    MeasurementUnit,
)


@pytest.fixture
def simple_ingredients():
    """Basic ingredient list for testing"""
    return [
        RecipeIngredient(name="chicken breast", quantity=Decimal("300"), unit=MeasurementUnit.GRAM, category=IngredientCategory.MEAT, is_staple=False),
        RecipeIngredient(name="broccoli", quantity=Decimal("1"), unit=MeasurementUnit.PIECES, category=IngredientCategory.PRODUCE, is_staple=False),
        RecipeIngredient(name="garlic", quantity=Decimal("3"), unit=MeasurementUnit.CLOVE, category=IngredientCategory.PRODUCE, is_staple=False),
    ]


@pytest.fixture
def simple_ingredient_inputs():
    """Basic ingredient inputs for generation requests"""
    return [
        RecipeIngredientInput(name="chicken breast", quantity=Decimal("300"), unit=MeasurementUnit.GRAM),
        RecipeIngredientInput(name="broccoli"),
        RecipeIngredientInput(name="garlic", quantity=Decimal("3"), unit=MeasurementUnit.CLOVE),
    ]
