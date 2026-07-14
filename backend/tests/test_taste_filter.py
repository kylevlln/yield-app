"""Tests for the taste filter validation system"""

import pytest
from app.models.recipe import (
    validate_taste_filter,
    ProteinType,
    TasteFilterSeverity,
)


class TestForbiddenCombos:
    def test_chocolate_fish_rejected(self):
        result = validate_taste_filter(
            ["chocolate", "salmon", "garlic"],
            ProteinType.FISH,
            has_food_safety_banner=True,
        )
        assert not result.passed
        assert result.has_errors
        combo_violations = [v for v in result.violations if v.violation_type == "forbidden_combo"]
        assert len(combo_violations) >= 1

    def test_cocoa_with_tuna_rejected(self):
        result = validate_taste_filter(
            ["cocoa", "tuna", "rice"],
            ProteinType.FISH,
            has_food_safety_banner=True,
        )
        assert not result.passed

    def test_pineapple_gelatin_rejected(self):
        result = validate_taste_filter(
            ["fresh pineapple", "gelatin", "sugar"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert not result.passed

    def test_chicken_and_broccoli_passes(self):
        result = validate_taste_filter(
            ["chicken breast", "broccoli", "garlic", "soy sauce"],
            ProteinType.CHICKEN,
            has_food_safety_banner=True,
        )
        assert result.passed
        assert not result.has_errors

    def test_safe_combo_passes(self):
        result = validate_taste_filter(
            ["pasta", "tomato", "basil", "garlic", "olive oil"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert result.passed


class TestForbiddenSingles:
    def test_bleach_rejected(self):
        result = validate_taste_filter(
            ["bleach"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert not result.passed
        single_violations = [v for v in result.violations if v.violation_type == "forbidden_single"]
        assert len(single_violations) == 1
        assert single_violations[0].severity == TasteFilterSeverity.ERROR

    def test_soap_rejected(self):
        result = validate_taste_filter(
            ["soap", "water"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert not result.passed

    def test_gasoline_rejected(self):
        result = validate_taste_filter(
            ["gasoline"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert not result.passed


class TestFoodSafetyBanner:
    def test_chicken_requires_banner(self):
        result = validate_taste_filter(
            ["chicken breast", "garlic"],
            ProteinType.CHICKEN,
            has_food_safety_banner=False,
        )
        assert not result.passed
        safety_violations = [v for v in result.violations if v.violation_type == "required_section"]
        assert len(safety_violations) == 1

    def test_chicken_with_banner_passes(self):
        result = validate_taste_filter(
            ["chicken breast", "garlic"],
            ProteinType.CHICKEN,
            has_food_safety_banner=True,
        )
        assert result.passed

    def test_beef_requires_banner(self):
        result = validate_taste_filter(
            ["steak"],
            ProteinType.BEEF,
            has_food_safety_banner=False,
        )
        assert not result.passed

    def test_vegetarian_no_banner_needed(self):
        result = validate_taste_filter(
            ["tofu", "broccoli", "soy sauce"],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert result.passed

    def test_fish_requires_banner(self):
        result = validate_taste_filter(
            ["salmon", "lemon"],
            ProteinType.FISH,
            has_food_safety_banner=False,
        )
        assert not result.passed


class TestMaxIngredients:
    def test_21_ingredients_warning(self):
        ingredients = [f"ingredient_{i}" for i in range(21)]
        result = validate_taste_filter(
            ingredients,
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert result.passed  # Warning, not error
        assert result.has_warnings
        count_violations = [v for v in result.violations if v.violation_type == "max_ingredient_count"]
        assert len(count_violations) == 1

    def test_20_ingredients_no_warning(self):
        ingredients = [f"ingredient_{i}" for i in range(20)]
        result = validate_taste_filter(
            ingredients,
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert result.passed
        assert not result.has_warnings


class TestEdgeCases:
    def test_empty_ingredients(self):
        result = validate_taste_filter(
            [],
            ProteinType.NONE,
            has_food_safety_banner=False,
        )
        assert result.passed

    def test_case_insensitive(self):
        result = validate_taste_filter(
            ["Chocolate", "SALMON"],
            ProteinType.FISH,
            has_food_safety_banner=True,
        )
        assert not result.passed

    def test_whitespace_handling(self):
        result = validate_taste_filter(
            ["  chocolate  ", "  salmon  "],
            ProteinType.FISH,
            has_food_safety_banner=True,
        )
        assert not result.passed
